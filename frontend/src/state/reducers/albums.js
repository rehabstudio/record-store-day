const initialState = [];

export default (state = initialState, action) => {
  switch(action.type) {
  case 'RESET':
    return action.albums;
  case 'ADD':
    return [action.album, ...state];
  default:
    return state;
  }
};
