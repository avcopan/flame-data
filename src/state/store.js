import axios from "axios";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { select, put, takeLatest, takeEvery } from "redux-saga/effects";

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

// 3. species slice/reducer
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

// 4. new species slice/reducer
const newSpeciesSlice = createSlice({
  name: "newSpecies",
  initialState: [],
  reducers: {
    addNewSpecies: (state, action) => {
      return [...state, action.payload];
    },
    clearNewSpecies: () => {
      return [];
    },
  },
});

export const addNewSpecies = newSpeciesSlice.actions.addNewSpecies;
export const clearNewSpecies = newSpeciesSlice.actions.clearNewSpecies;
const newSpeciesReducer = newSpeciesSlice.reducer;

// 5. species details cache slice/reducer (serves as a cache of details requested)
// Format:
// {
//   16: [
//     {...stereoisomer 1},
//     {...stereoisomer 2},
//     ...
//   ],
//   32: [
//     {...stereoisomer 1},
//     {...stereoisomer 2},
//     ...
//   ],
// }
const speciesDetailsSlice = createSlice({
  name: "speciesDetails",
  initialState: {},
  reducers: {
    updateSpeciesDetails: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

const updateSpeciesDetails = speciesDetailsSlice.actions.updateSpeciesDetails;
const speciesDetailsReducer = speciesDetailsSlice.reducer;

// WIRING: create saga middleware
const sagaMiddleware = createSagaMiddleware();

// WIRING: create store
const store = configureStore({
  reducer: {
    user: userReducer,
    error: errorReducer,
    species: speciesReducer,
    newSpecies: newSpeciesReducer,
    speciesDetails: speciesDetailsReducer,
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
    const user = yield res.data;
    yield put(setUser(user));
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

// 2. species saga
const GET_SPECIES = "GET_SPECIES";

function* getSpeciesSaga(action) {
  try {
    let requestUrl = "/api/conn_species";
    if (action.payload && action.payload.formula) {
      const formula = action.payload.formula;
      const partial = action.payload.partial ? "partial" : "";
      requestUrl += `?formula=${formula}&${partial}`;
      console.log(requestUrl);
    }
    const res = yield axios.get(requestUrl);
    const data = yield res.data;
    yield put(setSpecies(data["species"]));
  } catch (error) {
    console.error(error);
  }
}

export const getSpecies = (payload) => {
  return { type: GET_SPECIES, payload };
};

// 3. new species saga
const POST_NEW_SPECIES = "POST_NEW_SPECIES";

function* postNewSpeciesSaga() {
  try {
    const smilesList = yield select((store) => store.newSpecies);
    yield put(clearNewSpecies());
    const requestBody = { smilesList };
    const res = yield axios.post("/api/conn_species", requestBody);
  } catch (error) {
    console.error(error);
  }
}

export const postNewSpecies = () => {
  return { type: POST_NEW_SPECIES };
};

// 4. species details saga
const GET_SPECIES_DETAILS = "GET_SPECIES_DETAILS";

function* getSpeciesDetailsSaga(action) {
  try {
    const connId = action.payload;
    const res = yield axios.get(`/api/conn_species/${connId}`);
    const data = yield res.data;
    yield put(updateSpeciesDetails({ [connId]: data.species }));
  } catch (error) {
    console.error(error);
  }
}

export const getSpeciesDetails = (payload) => {
  return { type: GET_SPECIES_DETAILS, payload };
};

// WIRING: create watcher saga
function* watcherSaga() {
  yield takeLatest(GET_USER, getUserSaga);
  yield takeLatest(LOGIN_USER, loginUserSaga);
  yield takeLatest(LOGOUT_USER, logoutUserSaga);
  yield takeLatest(REGISTER_USER, registerUserSaga);
  yield takeLatest(GET_SPECIES, getSpeciesSaga);
  yield takeEvery(POST_NEW_SPECIES, postNewSpeciesSaga);
  yield takeEvery(GET_SPECIES_DETAILS, getSpeciesDetailsSaga);
}

// WIRING: run watcher saga
sagaMiddleware.run(watcherSaga);

export default store;
