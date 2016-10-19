import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import Needle from './needle';

import './styles.css';

const Player = ({ album, normalisedNeedlePos }) => (
  <div className="audio-player">
    <div className={classnames('vinyl', {
      'spining': normalisedNeedlePos >= 0,
      'visible': !!album
    })} >
      <div className={classnames('reflect', { 'spining': normalisedNeedlePos >= 0 })} >
       <img src="/images/reflection.png" />
      </div>
      <img src="/images/vinyl.png" />
      <div className="label">
        <svg width="100%" height="100%" viewBox="0 0 200 200">
          <defs>
            <clipPath id="clip4">
              <ellipse cx="100" cy="100" rx="100" ry="100"></ellipse>
            </clipPath>
          </defs>
          <image xlinkHref={album ? album.album.images[1].url : null} width="100%" height="100%" clipPath="url(#clip4)"></image>
        </svg>
        <div className={classnames('pin', { 'spining': normalisedNeedlePos >= 0 })} height="20" width="20" viewBox="0 0 20 20">
           <img src="/images/pin.png" />
        </div>
      </div>
    </div>
    <Needle />
    <div className="plate" >
       <img src="/images/plate.png" />
    </div>
  </div>
);

const mapStateToProps = (state) => ({
  album: state.app.currentAlbum,
  normalisedNeedlePos: state.app.normalisedNeedlePos
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Player);
