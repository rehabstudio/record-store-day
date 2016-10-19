import React, { Component } from 'react';
import debounce from 'lodash/debounce';

import './styles.css';

class Box extends Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    this.setState(this.calculateSide());
    window.addEventListener('resize', debounce(this.onResize.bind(this), 150));
  }

  onResize() {
    this.setState(this.calculateSide());
  }

  calculateSide() {
    const rects = this.refs.box.getBoundingClientRect();
    const { width, height } = rects;
    const side = Math.min(
      this.props.max,
      Math.min(width * this.props.size, height * this.props.size));
    return { side };
  }

  render() {
    return (
      <div ref="box" className="box">
        <div className="box-content" style={{
          width: this.state.side,
          height: this.state.side
        }}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default Box;
