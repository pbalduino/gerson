const assert = require('assert');

const {
  expect
} = require('chai');

const {
  buildFromYAMLFile,
  ValidationError,
} = require("../src/index.js");

const {
  YAMLException
} = require('js-yaml');

describe("When testing the descriptor loading", function() {
  describe("Building from a valid YAML file", function() {
    it("with all included", function()  {
      expect(buildFromYAMLFile("assets/valid.yaml")).to.be.a('object');
    });

    it("missing the server URL", function()  {
      expect(() => buildFromYAMLFile("assets/valid_no_server.yaml")).to.throw(Error);
    });

    it("missing paths", function()  {
      expect(() => buildFromYAMLFile("assets/valid_no_paths.yaml")).to.throw(ValidationError);
    });


  });

  describe("Building with invalid options", function() {
    it("with a non existent file", function() {
      expect(() => buildFromYAMLFile("assets/nothere.yaml")).to.throw(Error);
    });
    it("with a missing filename", function() {
      expect(() => buildFromYAMLFile()).to.throw(TypeError);
    });
    it("with a malformed file", function() {
      expect(() => buildFromYAMLFile("assets/malformed.yaml")).to.throw(YAMLException);
    });
  });
});
