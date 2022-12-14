// frontend/src/store/session.js
import { csrfFetch } from './csrf';

// list of actions here
const START_SESSION = 'session/start';
const STOP_SESSION = 'session/stop';

// ------ SESSION ACTION CREATORS ------ //
const setUser = (user) => {
  // console.log("This is user being passed in to action creator: ", user)
  return {
    type: START_SESSION,
    payload: user
  };
};

const removeUser = () => {
  return {
    type: STOP_SESSION,
  };
};

// ------ SESSION THUNK CREATORS ------ //

// Login Thunk
export const login = (user) => async (dispatch) => {
  const { credential, password } = user;
  // console.log("Credentials being sent: ", credential, password)
  const response = await csrfFetch('/api/session', {
    method: 'POST',
    body: JSON.stringify({
      credential,
      password
    }),
  });

  // if no errors, return user data and dispatch login action
  if (response.ok) {
    const data = await response.json();
    dispatch(setUser(data));
    return data
  // otherwise, return error message from backend
  } else {
    const errorData = await response.json();
    return errorData
  };
}

// restore session thunk
export const restoreUser = () => async dispatch => {
  const response = await csrfFetch('/api/session');

  const data = await response.json();
  dispatch(setUser(data));
  return response;
}

// signup thunk
export const signup = (user) => async dispatch => {
  const { username, email, password, firstName, lastName } = user;
  const response = await csrfFetch('/api/users', {
    method: "POST",
    body: JSON.stringify({
      username,
      email,
      password,
      firstName,
      lastName
    })
  })

  const data = await response.json();
  dispatch(setUser(data))
  return response;
}

// LOGOUT thunk
export const logout = () => async dispatch => {
  const response = await csrfFetch('/api/session', {
    method: "DELETE",
  });

  dispatch(removeUser());
  return response;
}

const initialState = { user: null };

// ------ SESSION REDUCER ------ //
const sessionReducer = (state = initialState, action) => {
  let newState;
  switch (action.type) {

    case START_SESSION:
      newState = Object.assign({}, state);
      newState.user = action.payload;
      return newState;

    case STOP_SESSION:
      newState = Object.assign({}, state);
      newState.user = null;
      return newState;

    default:
      return state;
  }
};

export default sessionReducer;
