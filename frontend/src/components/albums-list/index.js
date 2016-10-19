import React, { Component } from 'react';
import { connect } from 'react-redux';
import DragAlbum from './album';

import './styles.css';
import '../../vendors/swiper/swiper.css';



class AlbumList extends Component {
  constructor() {
    super();

    // replaces getInitialState()
    this.state = {};
  }

  componentDidUpdate() {
    this.swiper = new Swiper ('.swiper-container', {
      // Optional parameters
      direction: 'horizontal',
      slidesPerView: 'auto',
      freeMode: true
    });
  }

  render() {
    const { albums } = this.props;

    return (
      <div className="albums-list-wrapper">
        {albums.length ?
        <div className="swiper-container">
          <ul className="albums-list swiper-wrapper">
            {albums.map((album, index) => <DragAlbum key={index} album={album}></DragAlbum>)}
          </ul>
          </div> :

          <marquee>Loading albums...</marquee>}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  albums: state.albums
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AlbumList);
