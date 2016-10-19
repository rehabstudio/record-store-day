import store from '../store';
import { default as Sound } from 'components/sound';

export function nextTrack() {
  return (dispatch, getState) => {

    const state = getState();
    const track = state.app.currentTrackNumber;
    const album = state.app.currentAlbum;
    const tracks = album.album.tracks.items;

    if (track !== tracks.length - 1) {

      // play next track and set needle pos
      const nextTrack = track + 1;
      dispatch({ type: 'SET_TRACK', track: track + 1 });
      dispatch(setNormalisedNeedlePos( nextTrack / (tracks.length - 1)));
      Sound.play(album.album.tracks.items[nextTrack].preview_url);
    } else {
      Sound.playFuzz();
      dispatch({ type: 'SET_TRACK', track: null });
    }
  };
}

export function needleDrop(position, forcePlay = false) {
  return (dispatch, getState) => {
    if (position >= 0) {
      const state = getState();
      const album = state.app.currentAlbum;
      const track = state.app.currentTrackNumber;

      if (album) {
        const needleTrack = Math.floor(position * (album.album.tracks.items.length - 1));
        Sound.play(album.album.tracks.items[needleTrack].preview_url, false, true);
        dispatch({ type: 'SET_TRACK', track: needleTrack });
      } else {
        Sound.playFuzz();
      }
    } else {
      Sound.stop(true);
      dispatch({ type: 'SET_TRACK', track: null });
    }
  };
}

export function needleLift() {
  return (dispatch, getState) => {
    Sound.stop(true);
    dispatch({ type: 'SET_TRACK', track: null });
  };
}

export function setNormalisedNeedlePos(position) {
  return (dispatch, getState) => {
    dispatch({ type: 'SET_NEEDLE_POSITION', position });
  };
}

export function playAlbum(album) {
  document.body.classList.add('prompt-2');

  return (dispatch, getState) => {
    dispatch({ type: 'SET_ALBUM', album });
    dispatch(setNormalisedNeedlePos(0));
    dispatch(needleDrop(0, true));
  };
}
