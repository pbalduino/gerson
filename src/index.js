const {build} = require("./builder.js");
const {ValidationError} = require("./exceptions.js");
const fs   = require("fs");
const yaml = require("js-yaml");

const buildFromYAML = (document, options) => {
  options = options || {};

  return build(yaml.load(document), options);
}

const buildFromYAMLFile = (file, options) => {
  options = options || {};

  return buildFromYAML(fs.readFileSync(file, "UTF-8"), options);
}

console.log("0.0.5");

module.exports = {
  build,
  buildFromYAML,
  buildFromYAMLFile,
  ValidationError,
}
