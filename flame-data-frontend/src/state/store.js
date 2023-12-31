import axios from "axios";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { select, put, takeLatest, takeEvery } from "redux-saga/effects";
import { handleErrorForProtectedEndpoint } from "../utils/utils";

// SLICES/REDUCERS
// 1. user slice/reducer
const userSlice = createSlice({
  name: "user",
  initialState: null,
  reducers: {
    setUser: (_, action) => {
      return action.payload;
    },
    unsetUser: () => {
      return null;
    },
  },
});

const setUser = userSlice.actions.setUser;
const unsetUser = userSlice.actions.unsetUser;
const userReducer = userSlice.reducer;

// 2. error slice/reducer
const errorSlice = createSlice({
  name: "error",
  initialState: "",
  reducers: {
    setLoginError: () => {
      return "Your credentials were not accepted. Please try again.";
    },
    setRegistrationError: () => {
      return "This email is already registered. Please log in instead.";
    },
    setRetypeError: () => {
      return "The re-typed password does not match. Please try again.";
    },
    setCodelessError: () => {
      return "Something isn't right on the server...";
    },
    clearError: () => {
      return "";
    },
  },
});

const setLoginError = errorSlice.actions.setLoginError;
const setRegistrationError = errorSlice.actions.setRegistrationError;
export const setRetypeError = errorSlice.actions.setRetypeError;
const setCodelessError = errorSlice.actions.setCodelessError;
const setClearError = errorSlice.actions.clearError;
const errorReducer = errorSlice.reducer;

// 3. species slice/reducer(s)
const speciesSlice = createSlice({
  name: "species",
  initialState: [],
  reducers: {
    setSpecies: (_, action) => {
      return action.payload;
    },
  },
});

const setSpecies = speciesSlice.actions.setSpecies;
const speciesReducer = speciesSlice.reducer;

// 4. species details cache slice/reducer
const speciesDetailsSlice = createSlice({
  name: "speciesDetails",
  initialState: {},
  reducers: {
    addSpeciesDetails: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

const addSpeciesDetails = speciesDetailsSlice.actions.addSpeciesDetails;
const speciesDetailsReducer = speciesDetailsSlice.reducer;

// 5. reactions slice/reducer(s)
const reactionsSlice = createSlice({
  name: "reactions",
  initialState: [],
  reducers: {
    setReactions: (_, action) => {
      return action.payload;
    },
  },
});

const setReactions = reactionsSlice.actions.setReactions;
const reactionsReducer = reactionsSlice.reducer;

// 6. reaction details cache slice/reducer
const reactionDetailsSlice = createSlice({
  name: "reactionDetails",
  initialState: {},
  reducers: {
    addReactionDetails: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

const addReactionDetails = reactionDetailsSlice.actions.addReactionDetails;
const reactionDetailsReducer = reactionDetailsSlice.reducer;

// 7. reactionMode slice/reducer(s)
const reactionModeSlice = createSlice({
  name: "reactionMode",
  initialState: false,
  reducers: {
    setReactionMode: (_, action) => {
      return action.payload;
    },
  },
});

export const setReactionMode = reactionModeSlice.actions.setReactionMode;
const reactionModeReducer = reactionModeSlice.reducer;

// 8. submission slice/reducer
const submissionsSlice = createSlice({
  name: "submissions",
  initialState: [],
  reducers: {
    addSubmission: (state, action) => {
      return [...state, action.payload];
    },
    updateSubmission: (state, action) => {
      const { index, update } = action.payload;
      return state.map((submission, i) =>
        i === index ? { ...submission, ...update } : submission
      );
    },
  },
});

const addSubmission = submissionsSlice.actions.addSubmission;
const updateSubmission = submissionsSlice.actions.updateSubmission;
const submissionsReducer = submissionsSlice.reducer;

// 9. collections slice/reducer
const collectionsSlice = createSlice({
  name: "collections",
  initialState: [],
  reducers: {
    setCollections: (_, action) => {
      return action.payload;
    },
  },
});

const setCollections = collectionsSlice.actions.setCollections;
const collectionsReducer = collectionsSlice.reducer;

// WIRING: create saga middleware
const sagaMiddleware = createSagaMiddleware();

// WIRING: create store
const store = configureStore({
  reducer: {
    user: userReducer,
    error: errorReducer,
    species: speciesReducer,
    speciesDetails: speciesDetailsReducer,
    reactions: reactionsReducer,
    reactionDetails: reactionDetailsReducer,
    reactionMode: reactionModeReducer,
    submissions: submissionsReducer,
    collections: collectionsReducer,
  },
  middleware: (defaultMiddleware) => defaultMiddleware().concat(sagaMiddleware),
});

// SAGAS
// 1. user saga
//    a. get the user
const GET_USER = "GET_USER";

function* getUserSaga() {
  try {
    const res = yield axios.get("/api/@me");
    const data = yield res.data;
    yield put(setUser(data.contents));
  } catch (error) {
    console.error(error);
  }
}

export const getUser = () => {
  return { type: GET_USER };
};

//    b. login the user
const LOGIN_USER = "LOGIN_USER";

function* loginUserSaga(action) {
  try {
    yield put(setClearError());
    const res = yield axios.post("/api/login", action.payload);
    yield put(getUser());
  } catch (error) {
    console.error(error);
    if (error.response.status === 401) {
      yield put(setLoginError());
    } else {
      yield put(setCodelessError());
    }
  }
}

export const loginUser = (payload) => {
  return { type: LOGIN_USER, payload };
};

//    c. logout the user
const LOGOUT_USER = "LOGOUT_USER";

function* logoutUserSaga() {
  try {
    const res = yield axios.post("/api/logout");
    yield put(unsetUser());
  } catch (error) {
    console.error(error);
  }
}

export const logoutUser = () => {
  return { type: LOGOUT_USER };
};

//    b. register the user
const REGISTER_USER = "REGISTER_USER";

function* registerUserSaga(action) {
  try {
    yield put(setClearError());
    const res = yield axios.post("/api/register", action.payload);
    yield put(getUser());
  } catch (error) {
    console.error(error);
    if (error.response.status === 409) {
      yield put(setRegistrationError());
    } else {
      yield put(setCodelessError());
    }
  }
}

export const registerUser = (payload) => {
  return { type: REGISTER_USER, payload };
};

// 2. species sagas
//  a. get all species
const GET_SPECIES = "GET_SPECIES";

function* getSpeciesSaga(action) {
  try {
    let requestUrl = "/api/species/connectivity";
    if (action.payload && action.payload.formula) {
      const formula = action.payload.formula;
      const partial = action.payload.partial ? "partial" : "";
      requestUrl += `?formula=${formula}&${partial}`;
    }
    const res = yield axios.get(requestUrl);
    const data = yield res.data;
    yield put(setSpecies(data.contents));
  } catch (error) {
    console.error(error);
  }
}

export const getSpecies = (payload) => {
  return { type: GET_SPECIES, payload };
};

// 3. reactions sagas
//  a. get all reactions
const GET_REACTIONS = "GET_REACTIONS";

function* getReactionsSaga(action) {
  try {
    let requestUrl = "/api/reaction/connectivity";
    if (action.payload && action.payload.formula) {
      const formula = action.payload.formula;
      const partial = action.payload.partial ? "partial" : "";
      requestUrl += `?formula=${formula}&${partial}`;
    }
    const res = yield axios.get(requestUrl);
    const data = yield res.data;
    yield put(setReactions(data.contents));
  } catch (error) {
    console.error(error);
  }
}

export const getReactions = (payload) => {
  return { type: GET_REACTIONS, payload };
};

// 4. generic "item" (species or reaction)
//  a. get details for an item
const GET_DETAILS = "GET_DETAILS";

function* getDetailsSaga(action) {
  try {
    const reactionMode = yield select((store) => store.reactionMode);
    const type = reactionMode ? "reaction" : "species";

    const connId = action.payload;
    const res = yield axios.get(`/api/${type}/connectivity/${connId}`);
    const data = yield res.data;
    if (reactionMode) {
      yield put(addReactionDetails({ [connId]: data.contents }));
    } else {
      yield put(addSpeciesDetails({ [connId]: data.contents }));
    }
  } catch (error) {
    console.error(error);
  }
}

export const getDetails = (payload) => {
  return { type: GET_DETAILS, payload };
};

//  b. delete an item
const DELETE_ITEM = "DELETE_ITEM";

function* deleteItemSaga(action) {
  const reactionMode = yield select((store) => store.reactionMode);
  const type = reactionMode ? "reaction" : "species";
  try {
    const connId = action.payload;
    yield axios.delete(`/api/${type}/connectivity/${connId}`);
    yield put(reactionMode ? getReactions() : getSpecies());
  } catch (error) {
    handleErrorForProtectedEndpoint(error);
  }
}

export const deleteItem = (payload) => {
  return { type: DELETE_ITEM, payload };
};

//  c. update the geometry for an item
const UPDATE_ITEM_GEOMETRY = "UPDATE_ITEM_GEOMETRY";

function* updateItemGeometrySaga(action) {
  const reactionMode = yield select((store) => store.reactionMode);
  const type = reactionMode ? "reaction/ts" : "species";
  try {
    const connId = action.payload.connId;
    const id = action.payload.id;
    yield axios.put(`/api/${type}/${id}`, action.payload);
    yield put(getDetails(connId));
  } catch (error) {
    handleErrorForProtectedEndpoint(error);
  }
}

export const updateItemGeometry = (payload) => {
  return { type: UPDATE_ITEM_GEOMETRY, payload };
};

//  d. post an item for submission to the database
const POST_SUBMISSION = "POST_SUBMISSION";

function* postSubmissionSaga(action) {
  // 1. Determine the index of the new submission
  const submissions = yield select((store) => store.submissions);
  const index = submissions.length;
  // 2. Add it to the submissions store
  let { smiles, isReaction } = action.payload;
  let submission = { smiles, isReaction, status: "Submitted" };
  yield put(addSubmission(submission));
  try {
    // 3. Submit the POST request
    const url = `/api/${isReaction ? "reaction" : "species"}/connectivity`;
    smiles = smiles.replace(/\s+\+\s+/g, ".").replace(/\s+/g, "");
    const res = yield axios.post(url, { smiles });
    console.log("response:", res);
    submission = { ...submission, status: "Complete" };
    yield put(updateSubmission({ index, update: submission }));
    yield put(isReaction ? getReactions() : getSpecies());
  } catch (error) {
    handleErrorForProtectedEndpoint(error);
    submission = {
      ...submission,
      status: "Error",
      message: error.response.data.error,
    };
    console.log(error);
    yield put(updateSubmission({ index, update: submission }));
  }
}

export const postSubmission = (payload) => {
  return { type: POST_SUBMISSION, payload };
};

// 6. collections sagas
//  a. get all collections
const GET_COLLECTIONS = "GET_COLLECTIONS";

function* getCollectionsSaga() {
  try {
    const res = yield axios.get("/api/collection");
    const data = yield res.data;
    yield put(setCollections(data.contents));
  } catch (error) {
    handleErrorForProtectedEndpoint(error);
  }
}

export const getCollections = () => {
  return { type: GET_COLLECTIONS };
};

//  b. post a new collection
const POST_NEW_COLLECTION = "POST_NEW_COLLECTION";

function* postNewCollectionSaga(action) {
  try {
    yield axios.post("/api/collection", action.payload);
    yield put(getCollections());
  } catch (error) {
    handleErrorForProtectedEndpoint(error);
  }
}

export const postNewCollection = (payload) => {
  return { type: POST_NEW_COLLECTION, payload };
};

// c. post items to a collection
const POST_COLLECTION_ITEMS = "POST_COLLECTION_ITEMS";

function* postCollectionItemsSaga(action) {
  const reactionMode = yield select((store) => store.reactionMode);
  const type = reactionMode ? "reaction" : "species";
  try {
    const coll_id = action.payload.coll_id;
    console.log(
      `Posting to /api/collection/${type}/${coll_id} with payload`,
      action.payload
    );
    yield axios.post(`/api/collection/${type}/${coll_id}`, action.payload);
    yield put(getCollections());
  } catch (error) {
    handleErrorForProtectedEndpoint(error);
  }
}

export const postCollectionItems = (payload) => {
  return { type: POST_COLLECTION_ITEMS, payload };
};

// d. delete items from a collection
const DELETE_COLLECTION_ITEMS = "DELETE_COLLECTION_ITEMS";

function* deleteCollectionItemsSaga(action) {
  const reactionMode = yield select((store) => store.reactionMode);
  const type = reactionMode ? "reaction" : "species";
  try {
    const coll_id = action.payload.coll_id;
    console.log(
      `Deleting from /api/collection/${type}/${coll_id} with payload`,
      action.payload
    );
    yield axios.delete(`/api/collection/${type}/${coll_id}`, {
      data: action.payload,
    });
    yield put(getCollections());
  } catch (error) {
    handleErrorForProtectedEndpoint(error);
  }
}

export const deleteCollectionItems = (payload) => {
  return { type: DELETE_COLLECTION_ITEMS, payload };
};

//  e. delete a collection
const DELETE_COLLECTION = "DELETE_COLLECTION";

function* deleteCollectionSaga(action) {
  try {
    const coll_id = action.payload.coll_id;
    yield axios.delete(`/api/collection/${coll_id}`);
    yield put(getCollections());
  } catch (error) {
    handleErrorForProtectedEndpoint(error);
  }
}

export const deleteCollection = (payload) => {
  return { type: DELETE_COLLECTION, payload };
};

// WIRING: create watcher saga
function* watcherSaga() {
  // user
  yield takeLatest(GET_USER, getUserSaga);
  yield takeLatest(LOGIN_USER, loginUserSaga);
  yield takeLatest(LOGOUT_USER, logoutUserSaga);
  yield takeLatest(REGISTER_USER, registerUserSaga);
  // species
  yield takeLatest(GET_SPECIES, getSpeciesSaga);
  // reaction
  yield takeLatest(GET_REACTIONS, getReactionsSaga);
  // generic "item" (species or reaction)
  yield takeEvery(GET_DETAILS, getDetailsSaga);
  yield takeEvery(DELETE_ITEM, deleteItemSaga);
  yield takeEvery(UPDATE_ITEM_GEOMETRY, updateItemGeometrySaga);
  yield takeEvery(POST_SUBMISSION, postSubmissionSaga);
  // collection
  yield takeLatest(GET_COLLECTIONS, getCollectionsSaga);
  yield takeEvery(POST_NEW_COLLECTION, postNewCollectionSaga);
  yield takeEvery(POST_COLLECTION_ITEMS, postCollectionItemsSaga);
  yield takeEvery(DELETE_COLLECTION_ITEMS, deleteCollectionItemsSaga);
  yield takeEvery(DELETE_COLLECTION, deleteCollectionSaga);
}

// WIRING: run watcher saga
sagaMiddleware.run(watcherSaga);

export default store;
