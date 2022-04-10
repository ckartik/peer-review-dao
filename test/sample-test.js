const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();

    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});

describe("DAO", function () {
  it("Should successfully create dao", async function () {
    const DAO = await ethers.getContractFactory("PeerReviewDAO");
    const dao = await DAO.deploy(2);
    await dao.deployed();
    
    const purposePaperTx = await dao.proposePaper("Kartik")
    const purposePaperTx2 = await dao.proposePaper("Kartik 2")

    console.log("DAO deployed to:", dao.address);
    // wait until the transaction is mined
    await purposePaperTx.wait();
    await purposePaperTx2.wait();
    np = await dao.getTotalProposals();

    expect(await dao.getTotalProposals()).to.equal(2);

  });
});