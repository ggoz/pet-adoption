import React from "react";

const PetItem = ({ pet, adoptPet, disabled, inProgress }) => {
  return (
    <div className='item'>
      <div className='image'>
        <img src={pet.picture} alt=''></img>
      </div>
      <div className='info-holder'>
        <div>
          <b>Name:</b> {pet.name}
        </div>
        <div>
          <b>Age:</b> {pet.age}
        </div>
        <div>
          <b>Breed:</b> {pet.breed}
        </div>
        <div>
          <b>Location:</b> {pet.location}
        </div>
        <div>
          <b>Description:</b> {pet.description}
        </div>
      </div>
      <div className='action-menu'>
        <button className='action-button' disabled={disabled || inProgress} onClick={adoptPet}>
          {disabled ? "Happily Adopted" : "Adopt"}
        </button>
      </div>
    </div>
  );
};

export default PetItem;
