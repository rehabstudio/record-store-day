import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import angleBetweenPoints from 'angle-between-points';
import debounce from 'lodash/debounce';
import clamp from 'clamp';
import classnames from 'classnames';

import { setNormalisedNeedlePos, needleLift, needleDrop } from 'state/actions/albums';

class Needle extends Component {
  constructor() {
    super();
    this.state = {
      rotate: 0,
      dragging: false,
      lift:false
    };
    this.pivot = null;
    this.lastRotation = null;
    this.needleRange = [-4.74, 15.8];
  }

  componentDidMount() {
    // this.hammer = new Hammer(this.refs.handle);
    // this.hammer.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
    // this.hammer.on('panstart panmove', this.onPan.bind(this));
    // this.hammer.on('panend', this.onPanEnd.bind(this));
    window.addEventListener('resize', debounce(this.onResize.bind(this), 150));
  }

  calculatePivot() {
    const rects = this.refs.needle.getBoundingClientRect();
    const { width, height, top, left } = rects;

    // transform-origin: 77% 9%;
    const pivotX = left + width * 0.77;
    const pivotY = top + height * 0.09;

    return {
      x: pivotX,
      y: pivotY
    };
  }

  calculatePercentage(value, min, max) {
    return (value - min) / (max - min);
  }

  onResize() {
    this.pivot = this.calculatePivot();
  }

  onPanEnd() {
    this.currentRotation = null;
    this.startAngle = null;

    this.setState({
      lift: false
    });

    // Trigger actions
    this.props.needleDrop(this.lastRotation);
    this.props.setNormalisedNeedlePos(this.lastRotation, true);
    this.lastRotation = false;
    this.setState({
      dragging: false
    });
  }

  onPan(ev) {
    if (!this.pivot) {
      this.pivot = this.calculatePivot();
    }
    const panAngle = angleBetweenPoints(this.pivot, ev.center);
    const [min, max] = this.needleRange;

    this.setState({
      lift: true
    });

    if (!this.startAngle) {

      // hack to hide the tool tip
      document.body.classList.add('needle-panned');

      this.props.needleLift();
      this.startAngle = panAngle;
      this.setState({
        dragging: true
      });
      this.currentRotation = this.props.normalisedNeedlePos * max;
    }

    const newRotation = clamp(
      this.currentRotation + ((this.startAngle - panAngle) * -1),
      ...this.needleRange);

    this.lastRotation = newRotation / max;
    this.props.setNormalisedNeedlePos(this.lastRotation);
  }

  render() {
    const { normalisedNeedlePos } = this.props;
    const { dragging } = this.state;
    const { lift } = this.state;
    const needleRotation = normalisedNeedlePos * this.needleRange[1];
    const baseRotation = needleRotation * -1;

    return (
      <div class="needle-container">
        <div className="arm-base"><img src="/images/arm_base.png" /></div>
        <div ref="needle" className={classnames('needle', {
          dragging: dragging
        })} style={{
          transform: `rotate(${ needleRotation }deg)`
        }}>
          <img className={classnames('arm', { lift: lift })} src="/images/arm.png" />
          <span ref="handle" className="drag-handle"></span>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  normalisedNeedlePos: state.app.normalisedNeedlePos
});

const mapDispatchToProps = (dispatch) => ({
  setNormalisedNeedlePos: (pos) => dispatch(setNormalisedNeedlePos(pos)),
  needleLift: () => dispatch(needleLift()),
  needleDrop: (pos) => dispatch(needleDrop(pos))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Needle);
