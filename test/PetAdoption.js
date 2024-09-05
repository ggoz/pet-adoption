const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("PetAdoption", function () {
  describe("Deployment", function () {
    async function deployContractFixture() {
      const PETS_COUNT = 5;
      const ADOPTED_PET_IDX = 0;
      const [owner, account2, account3] = await ethers.getSigners();

      const PetAdoption = await ethers.getContractFactory("PetAdoption");
      const contract = await PetAdoption.deploy(PETS_COUNT);

      await contract.connect(account3).adoptPet(ADOPTED_PET_IDX);

      return {
        owner,
        account2,
        account3,
        contract,
        account2,
        petsAddedCount: PETS_COUNT,
        ADOPTED_PET_IDX
      };
    }

    it("Should set the right owner", async function () {
      const { owner, contract } = await loadFixture(deployContractFixture);
      const contractOwnewr = await contract.owner();

      expect(contractOwnewr).to.equal(owner.address);
    });

    it("Should return the right owner", async function () {
      const { owner, contract } = await loadFixture(deployContractFixture);
      const contractOwnewr = await contract.getOwner();

      expect(contractOwnewr).to.equal(owner.address);
    });

    describe("Add Pet", async function () {
      it("Should revert with the right error in case of other account", async function () {
        const { contract, account2 } = await loadFixture(deployContractFixture);
        await expect(contract.connect(account2).addPet()).to.be.revertedWith("Only a contract owner can add a pet!");
      });

      it("Should crease pet index", async function () {
        const { contract, petsAddedCount } = await loadFixture(deployContractFixture);
        await contract.addPet();
        expect(await contract.petIndex()).to.equal(petsAddedCount + 1);
      });
    });

    describe("Adopt Pet", async function () {
      it("Should revert with index out of bounds", async function () {
        const { contract, account2 } = await loadFixture(deployContractFixture);
        await expect(contract.adoptPet(5)).to.be.revertedWith("Pet index out of bounds!");
        await expect(contract.adoptPet(-1)).to.be.rejectedWith("value out-of-bounds");
      });

      it("Should revert with pet has already been adopted", async function () {
        const { contract, ADOPTED_PET_IDX } = await loadFixture(deployContractFixture);
        await expect(contract.adoptPet(ADOPTED_PET_IDX)).to.be.revertedWith("Pet has already been adopted!");
      });

      it("Should adopt pet successfully", async function () {
        const { contract, account2 } = await loadFixture(deployContractFixture);
        const firstPetIdx = 1;
        const secondPetIdx = 4;

        await expect(contract.connect(account2).adoptPet(firstPetIdx)).not.to.be.reverted;

        await contract.connect(account2).adoptPet(secondPetIdx);

        const petOwnerAddress = await contract.petIdxToOwnerAddress(firstPetIdx);
        expect(petOwnerAddress).to.equal(account2.address);

        const zeroAddress = await contract.petIdxToOwnerAddress(100);
        expect(zeroAddress).to.equal("0x0000000000000000000000000000000000000000");

        const petsByOwner = await contract.connect(account2).getAllAdoptedPetsByOwner();
        const allAdoptedPets = await contract.getAllAdoptedPets();

        expect(petsByOwner.length).to.equal(2);
        expect(allAdoptedPets.length).to.equal(3);

        expect(await contract.ownerAddressToPetList(account2.address, 0)).to.equal(firstPetIdx);
        expect(await contract.allAdoptedPets(2)).to.equal(secondPetIdx);
      });
    });
  });
});
