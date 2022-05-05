const {ValidationError} = require("./exceptions.js");
const axios = require('axios');

const validate_structure = document => {
  if(!(document.servers &&
       document.servers[0] &&
       document.servers[0].url)) {
    throw new ValidationError("URL not found");
  }

  if(!document.paths) {
    throw new ValidationError("Paths not found");
  }
};

const assemble = ({servers, paths}, user_options) => {
  const api_accessor = { };
  const routes = Object.keys(paths);
  const api_url = servers[0].url;
  let options = {}
  Object.assign(options, {}, user_options);

  console.log("options:", user_options);

  for(const route of routes) {
    const methods = Object.keys(paths[route]);
    const url_parameters = route.match(/{[a-zA-Z0-9_]+}/g);
    let url = `${api_url}${route}`;

    for(const method of methods) {
      console.log("method:", method, paths[route][method]);

      api_accessor[paths[route][method].operationId] = function(data) {
        // translate
        if(url_parameters) {
          for(parameter of url_parameters) {
            url = url.replace(parameter, data[parameter.replace(/[{}]+/g, "")]);
          }
        }

        return axios({
          method,
          url,
          data,
          headers: {
            "Content-Type": "application/json",
          },
        });
      };
    }
  }

  return api_accessor;
};

const build = (document, options) => {
  console.log(document);
  validate_structure(document);
  return assemble(document, options);
};

module.exports = {
  build,
}
