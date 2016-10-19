import React from 'react';
import { connect } from 'react-redux';

import './styles.css';

const SelectedBy = ({ selected_by, text, twitter, spotify_href }) => {
  const twitterUrl = `https://twitter.com/${twitter}`;
  return (
    <div className="selected-by">
      <p>{ text }</p>
      <a className="name" target="_blank" href={twitterUrl}>{ selected_by }</a><br />
      <a className="spotify" target="_blank" href={spotify_href}>Listen on spotify</a>
    </div>
  );
};

const mapStateToProps = (state) => ({
  selected_by: state.app.currentAlbum.selected_by,
  text: state.app.currentAlbum.text,
  twitter: state.app.currentAlbum.twitter,
  spotify_href: state.app.currentAlbum.album.external_urls.spotify
});

const mapDispatchToProps = () => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SelectedBy);


