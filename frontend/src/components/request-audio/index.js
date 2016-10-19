import React from 'react';
import { connect } from 'react-redux';
import { default as Sound } from '../sound/';
import classnames from 'classnames';

import './styles.css';

const RequestAudio = ({ audioEnabled, audioDisabled, initSound, deviceAudio }) => (
  <div onClick={ () => {
    initSound();
    audioEnabled();
  }} className={classnames('request-audio', {
    'active': deviceAudio === 1
  })}>
    <h2>Let there be sound!</h2>
    <button>Ok</button>
  </div>
);

const mapStateToProps = (state) => ({
  deviceAudio: state.app.deviceAudio
});

const mapDispatchToProps = (dispatch) => ({
  audioEnabled: () => dispatch({ type: 'AUDIO_ENABLED' }),
  audioDisabled: () => dispatch({ type: 'AUDIO_DISABLED' })
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RequestAudio);
