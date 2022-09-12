const {ValidationError} = require("./exceptions.js");
const axios = require('axios');

const validate_structure = document => {
  if(!(document.servers &&
       document.servers[0] &&
       document.servers[0].url)) {
    throw new ValidationError("URL not found");
  }

  if(!document.paths) {
    throw new ValidationError("Paths not found in OpenAPI document");
  }
};

const MemoryStorage = function() {
  let storage = {};
  return {
    putItem: (key, value) => storage[key] = value,
    getItem: (key) => storage[key],
    clear: () => storage = {},
    removeItem: (key) => delete storage[key],
  };
};

const assemble = ({servers, paths}, user_options) => {
  const api_accessor = { };
  const api_url = servers[0].url;
  const memoryStorage = new MemoryStorage();
  const default_options = {
    debug: false,
    localStorage: memoryStorage,
    refresh: "/refresh",
    sessionStorage: memoryStorage,
    signin: "/signin",
    signout: "/signout",
  }
  const routes = Object.keys(paths);

  let options = {};
  Object.assign(options, default_options, user_options);
  console.log("Options:", options, "Default: ", default_options, "User: ", user_options);

  api_accessor["clear_tokens"] = () => {
    options.localStorage.removeItem("_r");
    options.localStorage.removeItem("_i");
    options.sessionStorage.removeItem("_a");
  };

  api_accessor["refresh_token"] = () => options.localStorage.getItem("_r");

  const refreshTokens = async() => {
    await axios(`${api_url}${options.refresh}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: api_accessor.refresh_token(),
    })
    .then(res => {
      const {AccessToken, RefreshToken, IdToken} = res.data.AuthenticationResult;

      if(options.debug) {
        console.log("Tokens: ", res.data.AuthenticationResult);
      }

      api_accessor.set_access_token(AccessToken);
      api_accessor.set_refresh_token(RefreshToken);
      api_accessor.set_id_token(IdToken);
    })
    .catch(err => {
      if(options.debug) {
        console.error("Error refreshing the token:", err);
      }

      api_accessor.clear_tokens();
    });
  };

  api_accessor["access_token"] = () => {
    console.log({a: sessionStorage.getItem("_a"), r: api_accessor.refresh_token()});
    if (!sessionStorage.getItem("_a") && api_accessor.refresh_token()) {
      console.log("Access token not found, but the refresh token is here. Refreshing.")
      refreshTokens();
    }

    return sessionStorage.getItem("_a") || "";
  };

  api_accessor["set_access_token"] = access_token => {
    sessionStorage.setItem("_a", access_token);
  }

  api_accessor["set_refresh_token"] = refresh_token => {
    localStorage.setItem("_r", refresh_token);
  }

  api_accessor["set_id_token"] = id_token => {
    localStorage.setItem("_i", id_token);
  }

  if(options.debug) {
    console.log("Options:", options);
  }

  for(const route of routes) {
    const methods = Object.keys(paths[route]);
    const url_parameters = route.match(/{[a-zA-Z0-9_]+}/g);
    let url = `${api_url}${route}`;

    for(let method of methods) {
      api_accessor[paths[route][method].operationId] = function(data) {
        const $this = api_accessor;
        if(url_parameters) {
          for(const parameter of url_parameters) {
            url = url.replace(parameter, data[parameter.replace(/[{}]+/g, "")]);
          }
        }

        const headers = {
          "Content-Type": "application/json",
        };

        if(paths[route][method].security) {
          console.log(`Using token '${$this.access_token()}' to call '${url}'`)
          headers["Authorization"] = `Bearer ${$this.access_token()}`;
        }

        method = method.toUpperCase();

        if(options.debug) {
          console.log(`Requesting [${method} ${url}] with data ${JSON.stringify(data)}`);
        }

        return axios({
          method,
          url,
          data,
          headers,
          timeout: options.timeout || 0,
        })
        .then(res => {
          if(route === options.signin || route === options.refresh) {
            const {AccessToken, RefreshToken, IdToken} = res.data.AuthenticationResult;

            if(options.debug) {
              console.log("Tokens: ", res.data.AuthenticationResult);
            }

            $this.set_access_token(AccessToken);
            $this.set_refresh_token(RefreshToken);
            $this.set_id_token(IdToken);
          }
          return res;
        });
      };
    }
  }

  return api_accessor;
};

const build = (document, options) => {
  const default_options = {
    timeout: 5000,
    debug: false,
  }

  options = Object.assign(default_options, options);

  validate_structure(document);
  return assemble(document, options);
};

module.exports = {
  build,
}
