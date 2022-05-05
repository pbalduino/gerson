const assert = require('assert');

const {
  expect
} = require('chai');

const {
  buildFromYAMLFile,
} = require("../src/index.js");

const mockFetch = (parameters) => {
  return new Promise();
}

describe("Given a valid created object", function() {
  const api = buildFromYAMLFile("assets/valid.yaml", {
    fetcher: mockFetch,
  });

  it("it should have a showPetById method", async function() {
    expect(api).to.have.any.keys("showPetById");
    await api.showPetById({petId: 1234});
  })

  it("it should have a createPets method", async function() {
    expect(api).to.have.any.keys("createPets");
  })

  it("it should have a listPets method", async function() {
    expect(api).to.have.any.keys("listPets");
  })
});
