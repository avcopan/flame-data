import {
  // user
  getUser,
  loginUser,
  logoutUser,
  registerUser,
  // species
  getSpecies,
  // reaction
  getReactions,
  // generic "item" (species or reaction)
  getDetails,
  deleteItem,
  updateItemGeometry,
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
  // reaction
  getReactions,
  // generic "item" (species or reaction)
  getDetails,
  deleteItem,
  updateItemGeometry,
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
