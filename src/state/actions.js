import {
  // user
  getUser,
  loginUser,
  logoutUser,
  registerUser,
  // species
  getSpecies,
  deleteSpecies,
  updateSpeciesGeometry,
  // reaction
  getReactions,
  deleteReaction,
  // species or reaction
  getDetails,
  postSubmission,
  // collection
  getCollections,
  postNewCollection,
  postCollectionSpecies,
  deleteCollectionSpecies,
  deleteCollection,
  // miscellaneous
  setRetypeError,
  setReactionMode,
} from "./store";

const actions = {
  // user
  getUser,
  loginUser,
  logoutUser,
  registerUser,
  // species
  getSpecies,
  deleteSpecies,
  updateSpeciesGeometry,
  // reaction
  getReactions,
  deleteReaction,
  // species or reaction
  getDetails,
  postSubmission,
  // collection
  getCollections,
  postNewCollection,
  postCollectionSpecies,
  deleteCollectionSpecies,
  deleteCollection,
  // miscellaneous
  setRetypeError,
  setReactionMode,
};

export default actions;
