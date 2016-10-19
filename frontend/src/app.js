import React, { Component } from 'react';
import { connect } from 'react-redux';
import request from 'superagent';
import detectAutoplay from 'detect-audio-autoplay';

import RequestAudio from 'components/request-audio';
import AlbumTitle from './components/album-title';
import AlbumsList from './components/albums-list';
import Player from './components/player';
import Box from './components/box';
import SelectedBy from './components/selected-by';

import shuffle from 'lodash/shuffle';

import { default as Sound } from 'components/sound/';

import store from 'state/store';

import './style.css';


class App extends Component {
  constructor() {

    super();

    request
      .get('/api/albums')
      .end((err, res) => store.dispatch({
        type: 'RESET',
        albums: shuffle(res.body)
      }));

    detectAutoplay((supported) => {
      if (supported) {
        this.props.audioSupported();
        this.initSound();
      } else {
        this.props.audioRequested();
      }
    });
  }

  initSound() {
    Sound.init();
  }

  render() {
    const { deviceAudio, currentAlbum, currentTrackNumber } = this.props;

    return (
      <div className="container">
        <div className="header">
          { currentAlbum ? <SelectedBy /> : null }
          <Box size="0.65" max="450">
            { currentAlbum ? <AlbumTitle /> : null}
            <Player />
          </Box>
          <span className="tutorial-albums">
            <img src="/images/Arrow.svg" />
            <p>Drag to play albums</p>
          </span>
        </div>
        <div className="footer">
          <AlbumsList />

          <Box size="0.8" max="320">
            <div className="footer-content">
              <img src="/images/copy.png" srcSet="/images/copy.png 1x, /images/copy_2x.png 2x" alt="Spin Don't Stream" />
              <div>
                <span>Head to your nearest indie record<br /> store and hear albums as they were<br /> meant to be heard.</span>
                <a target="_blank" className="btn" href="https://www.google.co.uk/maps/search/record+store+nearby/">Find a store near you</a>
              </div>
            </div>
          </Box>

          <div className="footer-footer">
            <div className="footer-icons">
              <div>
                <span>Made by</span>
                <a href="http://www.rehabstudio.com/" target="_blank">
                  <img src="/images/logo_rehab.svg" />
                </a>
              </div>
              <div>
                <span>Presented by</span>
                <a href="http://www.mute.com/" target="_blank">
                  <img src="/images/mute_records_logo.png" />
                </a>
              </div>
              <div>
                <span>Powered By</span>
                <a href="https://www.spotify.com/" target="_blank">
                  <img src="/images/logo_spotify.svg" />
                </a>
              </div>
              <div>
                <span>Support</span>
                <a href="http://recordstoreday.co.uk" target="_blank">
                  <img src="/images/logo_RSD.png" />
                </a>
              </div>
            </div>
          </div>

          <div className="special-thanks">
              <span className="thanks">SPECIAL THANKS TO</span>
              <span className="names">Michael Mathews, Ricky Dunlop, Mickael Coelho, Olivier Ramirez, Steve Horner, Kamila Hulanicka, Charlotte Clark, Ciara Luke, Slav Vitanov, Neil Blanket &amp; Mel Young</span>
          </div>
        </div>

        <RequestAudio initSound={ this.initSound } show={deviceAudio === 1} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  deviceAudio: state.app.deviceAudio,
  currentAlbum: state.app.currentAlbum,
  currentTrackNumber: state.app.currentTrackNumber
});

const mapDispatchToProps = (dispatch) => ({
  audioSupported: () => dispatch({ type: 'AUDIO_ENABLED' }),
  audioRequested: () => dispatch({ type: 'AUDIO_REQUESTED' })
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
