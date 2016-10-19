import bezier from 'bezier-curve';
import createAudioContext from 'ios-safe-audio-context';
import createPlayer from  'web-audio-player';
import store from 'state/store';

import { nextTrack } from 'state/actions/albums';

export default {
  inited: false,

  init() {
    if (this.inited) {
      return;
    }

    this.context = createAudioContext();
    this.currentTrack = null;
    this.sounds = [];

    this.distortion = this.context.createWaveShaper();
    this.distortion.curve = this.makeDistortionCurve();
    this.distortion.connect(this.context.destination);

    this.inited = true;
  },

  playFuzz() {
    this.play('/sound/crackle.mp3', true);
  },

  play(url, loop = false, overlayFuzz = false) {
    if (!this.inited) {
      this.init();
    }

    this.sounds.forEach(sound => {
      sound.removeAllListeners();
      sound.stop();
    });
    this.sounds = [];

    if (overlayFuzz) {
      const fuzz = createPlayer('/sound/crackle.mp3', {
        crossOrigin: 'anonymous',
        context: this.context,
        loop
      });

      fuzz.once('load', () => {
        fuzz.play();
        fuzz.node.connect(this.distortion);
      });
      fuzz.node.gain.value = 0.8;
      this.sounds.push(fuzz);
    }

    const audio = createPlayer(url, {
      crossOrigin: 'anonymous',
      context: this.context,
      loop,
      buffer: true
    });

    audio.node.gain.value = 0;

    // audio.on('error', () => console.log('load error'));
    // audio.on('progress', () => console.log('progress'));
    // audio.on('decoding', () => console.log('decoding'));

    audio.once('load', () => {
      audio.play();
      TweenLite.to(audio.node.gain, 3, {value: 0.9});
      audio.node.connect(this.distortion);
    });

    audio.once('end', () => {
      store.dispatch(nextTrack());
    });

    this.sounds.push(audio);
  },

  stop(muteEndEvent = false) {
    this.sounds.forEach(sound => {
      if (muteEndEvent) {
        sound.removeAllListeners();
        sound.stop();
      } else {
        sound.stop();
        sound.removeAllListeners();
      }
    });
    this.sounds = [];
  },

  makeDistortionCurve(amount = 1, samples = 44100) {
    const curve = new Float32Array(samples);

    /**
     * Control points of an n-order bezier curve defining the shape of the
     * distortion curve.
     *
     * The identity curve (the curve that produces no distortion) is a
     * linear `f(x) = x` curve, with the control points in a line:
     *
     *    1|        x     [0, 0],
     *     |      x       [0.25, 0.25],
     *     |    x         [0.5, 0.5],
     *     |  x           [0.75, 0.75],
     *    0|x________     [1, 1]
     *      0       1
     *
     * Control points warping this line would produce distortion.
     *
     * @see To see the curve produced by your n control points, see http://yavkata.co.uk/weblog/actionscript_3/bezier-curve-interactive-visualization-with-actionscript-3/
     */
    // EDIT THESE TO TWEAK THE DISTORTION
    const controlPoints = [
      [0, 0],
      [0.25, 0],
      [0.5, 0.5],
      [0.75, 0.75],
      [1, 0.75]
    ]
    // Lerp between no distortion (linear `f(x) = x` curve) and full
    // distortion.
    .map((point) => [point[0], (point[0]*(1-amount))+(point[1]*amount)]);

    for (let i = 0; i < samples; ++i) {
      curve[i] = bezier(i/samples, controlPoints)[1];
    }

    return curve;
  }
};
