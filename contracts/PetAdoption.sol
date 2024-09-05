// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "hardhat/console.sol";

contract PetAdoption {
    address public owner;
    uint public petIndex = 0;
    uint[] public allAdoptedPets;

    mapping(uint => address) public petIdxToOwnerAddress;
    mapping(address => uint[]) public ownerAddressToPetList;

    constructor(uint initialPetIndex) {
        owner = msg.sender;
        petIndex = initialPetIndex;
    }

    // 根据地址获取对应的所有领养的宠物
    function getAllAdoptedPetsByOwner() public view returns (uint[] memory) {
        return ownerAddressToPetList[msg.sender];
    }

    // 获取所有已经被领养的宠物
    function getAllAdoptedPets() public view returns (uint[] memory) {
        return allAdoptedPets;
    }

    // 领养宠物
    function adoptPet(uint adoptIdx) public {
        require(adoptIdx < petIndex, "Pet index out of bounds!");
        require(
            petIdxToOwnerAddress[adoptIdx] == address(0),
            "Pet has already been adopted!"
        );
        petIdxToOwnerAddress[adoptIdx] = msg.sender;

        ownerAddressToPetList[msg.sender].push(adoptIdx);
        allAdoptedPets.push(adoptIdx);
    }

    // 添加宠物
    function addPet() public {
        require(msg.sender == owner, "Only a contract owner can add a pet!");
        petIndex++;
    }

    function getOwner() public view returns (address) {
        return owner;
    }
}
