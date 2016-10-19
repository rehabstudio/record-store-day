import React from 'react';
import { connect } from 'react-redux';

import './styles.css';

// takes an album and hover position and returns a track name.
const getHoveredTrack = (album, hoverPosition) => {
  const tracks = album.album.tracks.items;
  if(!tracks.length || hoverPosition < 0) {
    return null;
  }
  return tracks[Math.floor(hoverPosition * (tracks.length -1))].name;
};

/**
 * Stateless react component that renders
 * album title info/no playing.
 */
const AlbumTitle = ({ album, normalisedNeedlePos, currentTrackNumber }) => {
  const hoveredTrack = getHoveredTrack(album, normalisedNeedlePos);
  return (
    <div className="album-title">
      <h1>{hoveredTrack}</h1>
      <span>{album.album.name}</span>
    </div>
  );
};

const mapStateToProps = (state) => ({
  album: state.app.currentAlbum,
  currentTrackNumber: state.app.currentTrackNumber,
  normalisedNeedlePos: state.app.normalisedNeedlePos
});

const mapDispatchToProps = () => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AlbumTitle);
