const initialState = {
  currentAlbum: null,
  currentTrackNumber: null,

  normalisedNeedlePos: -0.3,

  // [0: disabled |1: requested |2: enabled]
  deviceAudio: -1
};

export default (state = initialState, action) => {
  switch(action.type) {
  case 'AUDIO_ENABLED':
    return Object.assign({}, state, { deviceAudio: 2 });
  case 'AUDIO_REQUESTED':
    return Object.assign({}, state, { deviceAudio: 1 });
  case 'AUDIO_DISABLED':
    return Object.assign({}, state, { deviceAudio: 0 });

  case 'SET_ALBUM':
    return Object.assign({}, state, { currentAlbum: action.album});
  case 'SET_TRACK':
    return Object.assign({}, state, { currentTrackNumber: action.track});

  case 'SET_NEEDLE_POSITION':
    return Object.assign({}, state, { normalisedNeedlePos: action.position});
  default:
    return state;
  }
};
