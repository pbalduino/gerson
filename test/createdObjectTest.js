const {buildFromYAMLFile} = require("../src/index.js");
const {expect} = require("chai");
const moxios = require("moxios");

const api = buildFromYAMLFile("assets/valid.yaml", {
  timeout: 1000,
  debug: true,
});

describe("Given a valid created object", function() {
  beforeEach(function() {
    moxios.install();
  });

  afterEach(function () {
    moxios.uninstall();
  });

  describe("the showPetById method", function() {
    it("should exist", function() {
      expect(api).to.have.any.keys("showPetById");
    });
  });

  it("should have a createPets method", function() {
    expect(api).to.have.any.keys("createPets");
  });

  it("should have a listPets method", function() {
    expect(api).to.have.any.keys("listPets");
  });
});
