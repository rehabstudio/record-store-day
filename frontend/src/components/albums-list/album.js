import React from 'react';
import { connect } from 'react-redux';
import { default as Sound } from 'components/sound/';
import Utils from '../../utils/index';
import { nextTrack, playAlbum } from 'state/actions/albums';

const Album = ({ album, setAlbum }) => (
  <li
    className="swiper-slide"
    onTouchStart={(event) => onDragStart(event, album, setAlbum) }
    onMouseDown={(event) => onDragStart(event, album, setAlbum) }>
    <img src={album.album.images[0].url} />
  </li>
);

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => ({
  setAlbum: (album) => dispatch(playAlbum(album))
});

var albumClone;
var albumClonePlaying;
var albumStartX;
var albumStartY;
var pressStartX;
var pressStartY;
var audioPlayer;
var audioPlayerInitialPosition;
var audioPlayerCenter;
var scrollPosition;
var dipatchSetAlbum;
var initialPlayerDistance;
var coverCurrentScale;
var selectedAlbum;
var selectedAlbumDom;
var vinylDom;
var coverFinalScale;
var isAlbumInfoOpen = false;
var touchPos;
var isTouchDevice = !!('ontouchstart' in window);
var transformPrefix = Utils.getTransformPrefix();

/*************
ALBUM COVER MOUSE/TOUCH HANDLERS
**************/
const onDragStart = function(event, album, setAlbum) {
  //Prevent the page to scroll vertically
  event.preventDefault();
  selectedAlbumDom = event.currentTarget;
  selectedAlbumDom.classList.add('selected');
  createAlbumClone(event);
  if(isTouchDevice) {
    touchPos = event.touches[0];
    window.addEventListener('touchmove', moveAlbumClone);
    window.addEventListener('touchend', onDragEnd);
  }else{
    touchPos = event;
    window.addEventListener('mousemove', moveAlbumClone);
    window.addEventListener('mouseup', onDragEnd);
  }
  audioPlayer = document.querySelector('.audio-player');
  vinylDom = document.querySelector('.vinyl');
  scrollPosition =  document.body.scrollTop || document.documentElement.scrollTop;
  //Store start positions to move the cover accordingly
  selectedAlbum = album;
  dipatchSetAlbum = setAlbum;
  coverCurrentScale = 1;
  initialPlayerDistance = selectedAlbumDom.getBoundingClientRect().top - audioPlayer.getBoundingClientRect().top;
  audioPlayerCenter = audioPlayer.getBoundingClientRect().top + audioPlayer.getBoundingClientRect().height * 0.5;
  audioPlayerInitialPosition = audioPlayer.getBoundingClientRect();
  albumStartX = touchPos.pageX - selectedAlbumDom.getBoundingClientRect().left;
  albumStartY = touchPos.pageY - selectedAlbumDom.getBoundingClientRect().top;
  pressStartX = touchPos.pageX;
  pressStartY = touchPos.pageY;
  let posX = touchPos.pageX - albumStartX;
  let posY = touchPos.pageY - albumStartY;
  coverFinalScale = (audioPlayer.getBoundingClientRect().width) / albumClone.getBoundingClientRect().width;
  //Hide and position the cover
  albumClone.style.opacity = '0';
  albumClone.style[transformPrefix] = 'translate3d(' + posX + 'px, ' + posY + 'px, 0 )';
};

const moveAlbumClone = function(event) {
  //Get positions
  if (isTouchDevice) {
    touchPos = event.touches[0];
  } else {
    touchPos = event;
  }
  let posX = touchPos.pageX - albumStartX;
  let posY = touchPos.pageY - albumStartY + scrollPosition;
  //Hide cover clone if user's just swipe through the albums
  let diffXMotion = Math.abs(touchPos.pageX - albumStartX);
  if (pressStartY < touchPos.pageY + 10 && diffXMotion < 20) {
    albumClone.style.opacity = '0';
  } else {
    albumClone.style.opacity = '1';
  }
  //Apply transform
  TweenMax.set(albumClone, {
    x: posX,
    y: posY,
    transformOrigin: '0 0',
    force3D: true
  });
  var distanceToPlayer = Math.abs(posY - scrollPosition - audioPlayer.getBoundingClientRect().top );
  distanceToPlayer = 1 - Math.abs(distanceToPlayer / initialPlayerDistance);
  coverCurrentScale = Math.max(1, coverFinalScale * distanceToPlayer);
  //Scale the cover based on it's distance to theplayer
  TweenMax.to(albumClone, 0.3, {
    scale: coverCurrentScale,
    transformOrigin: '0 0',
    force3D: true, ease: Cubic.easeOut
  });
};
const onDragEnd = function(event) {
  selectedAlbumDom.classList.remove('selected');
  scrollPosition =  document.body.scrollTop || document.documentElement.scrollTop;
  if (coverCurrentScale > coverFinalScale * 0.5) {
    console.log('Playing new track');
    dipatchSetAlbum(selectedAlbum);
    removeOldAlbumPlaying();
    moveAlbumToPlayer();
  }else{
    console.log('Not playing new track');
    moveBackAlbumToList();
  }
  //Kill the cover clone
  // document.body.removeChild( albumClone );
  //Kill all the listeners
  window.removeEventListener('touchmove', moveAlbumClone);
  window.removeEventListener('touchend', onDragEnd);
  window.removeEventListener('mousemove', moveAlbumClone);
  window.removeEventListener('mouseup', onDragEnd);
};

const createAlbumClone = function(event) {
  albumClone = event.currentTarget.cloneNode(true);
  albumClone.classList.add('drag-album');
  albumClone.classList.add('albums-list');
  albumClone.classList.remove('swiper-slide');
  albumClone.classList.remove('swiper-slide-next');
  albumClone.classList.remove('swiper-slide-prev');
  albumClone.style.width = selectedAlbumDom.getBoundingClientRect().width;
  albumClone.style.height = selectedAlbumDom.getBoundingClientRect().height;
  document.body.appendChild( albumClone );
};

/*************
ALBUM COVER REPOSITIONING AFTER USER INTERACTION
**************/
//Reposition album's cover when the user drops it somewhere on the stage
const removeOldAlbumPlaying = function() {
  //Kill previous album clone, but before, we'll nicely remove it from the screen
  if(document.body.contains(albumClonePlaying) ) {
    albumClonePlaying.removeEventListener('mouseover', currentAlbumMoreHover);
    albumClonePlaying.removeEventListener('mouseout', currentAlbumMoreHover);
    albumClonePlaying.removeEventListener('click', currentAlbumMoreInfos);
    audioPlayer.removeEventListener('click', currentAlbumMoreInfosFromPlayer);
    let pageWidth = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;
    let oldAlbumPosX = (audioPlayer.getBoundingClientRect().width * -0.5) - (selectedAlbumDom.getBoundingClientRect().width * 0.5);
    TweenMax.to(albumClonePlaying, 0.1, {
      x: oldAlbumPosX,
      scale: coverFinalScale,
      force3D: true, ease: Cubic.easeIn,
      onComplete:function(_albumClonePlaying) {
        document.body.removeChild( _albumClonePlaying );
      }, onCompleteParams: [albumClonePlaying]
    });
  }
};
const moveBackAlbumToList = function() {
  var distanceToOriginalPos = Math.abs(albumClone.getBoundingClientRect().top - selectedAlbumDom.getBoundingClientRect().top);
  TweenMax.to(albumClone, distanceToOriginalPos * 0.0028, {
    x: selectedAlbumDom.getBoundingClientRect().left,
    y: selectedAlbumDom.getBoundingClientRect().top + scrollPosition,
    scale: 1,
    transformOrigin: '0 0',
    force3D: true, ease: Cubic.easeInOut,
    onComplete: function(_albumClone) {
      document.body.removeChild( _albumClone );
    }, onCompleteParams: [albumClone]
  });
};
const moveAlbumToPlayer = function() {
  isAlbumInfoOpen = true;
  currentAlbumMoreInfos();
  albumClonePlaying = albumClone;
  albumClonePlaying.addEventListener('click', currentAlbumMoreInfos);
  audioPlayer.addEventListener('click', currentAlbumMoreInfosFromPlayer);
  var distanceToPlayer = Math.abs(albumClone.getBoundingClientRect().top - scrollPosition - audioPlayer.getBoundingClientRect().top );
  var posX = audioPlayer.getBoundingClientRect().left;
  var posY = audioPlayer.getBoundingClientRect().top + scrollPosition;
  var duration = distanceToPlayer * 0.004;
  //Move albumClone to the center of the player
  TweenMax.to(albumClone, duration, {
    x: posX,
    y: posY,
    scale: coverFinalScale + 0.1,
    transformOrigin: '0 0',
    force3D: true, ease: Cubic.easeInOut
  });
  //Scale albumClone accordingly to player's size
  TweenMax.to(albumClone, 0.3, {
    delay: duration + 0.1,
    scale: coverFinalScale,
    transformOrigin: '0 0',
    force3D: true, ease: Cubic.easeInOut,
    onComplete:function(){
      if (vinylDom.classList.contains('visible') === false) {
        vinylDom.classList.add('visible');
      }
    }
  });
  var pageWidth = window.innerWidth
      || document.documentElement.clientWidth
      || document.body.clientWidth;
  posX = (audioPlayer.getBoundingClientRect().width * -1) + 20;

  //Move album to the left hand side
  TweenMax.to(albumClone, 0.3, {
    delay: duration + 0.3,
    x: posX,
    scale: coverFinalScale,
    force3D: true, ease: Cubic.easeInOut
  });
};

/*************
CURRENT ALBUM ACTIONS
**************/
const currentAlbumMoreHover = function(event) {
  var posX = (audioPlayer.getBoundingClientRect().width * -0.5)
      - (selectedAlbumDom.getBoundingClientRect().width * 0.5) + 20;
  if (event.type === 'mouseover') {
    TweenMax.to(albumClone, 0.3, {
      x: posX + 10,
      force3D: true, ease: Cubic.easeInOut
    });
  } else if (event.type === 'mouseout') {
    TweenMax.to(albumClone, 0.26, {
      x: posX,
      force3D: true, ease: Cubic.easeInOut
    });
  }
};
const currentAlbumMoreInfosFromPlayer = function(event) {
  if (isAlbumInfoOpen) {
    currentAlbumMoreInfos(event);
  }
};
const currentAlbumMoreInfos = function(event) {
  var pageWidth = window.innerWidth
      || document.documentElement.clientWidth
      || document.body.clientWidth;
  isAlbumInfoOpen = !isAlbumInfoOpen;
  var albumPosX;
  var headerDom = document.querySelector('.header');
  var bodyDom = document.getElementsByTagName('body')[0];
  if (isAlbumInfoOpen) {
    bodyDom.classList.add('album-info-open');
    var audioPlayerDistance = Math.min(pageWidth, audioPlayerInitialPosition.width * 2) * 0.5 + audioPlayerInitialPosition.width * 0.5 - 30;
    albumPosX = pageWidth * 0.5 - (albumClone.getBoundingClientRect().width * 0.5);
    TweenMax.to(albumClone, audioPlayerDistance * 0.001, {
      delay: 0.06,
      x: albumPosX ,
      transformOrigin: '0 0',
      force3D: true, ease: Power2.easeInOut
    });
    TweenMax.to(audioPlayer, 0.1 + audioPlayerDistance * 0.001, {
      x: audioPlayerDistance,
      force3D: true, ease: Power2.easeInOut
    });
    TweenMax.to(headerDom, 0.1 +audioPlayerDistance * 0.001,{
      css:{
        'background-position': audioPlayerDistance + 'px 0px'
      },
      force3D: true, ease: Power2.easeInOut
    });
  }else{
    bodyDom.classList.remove('album-info-open');
    albumPosX = (audioPlayer.getBoundingClientRect().width * -1) + 20;
    TweenMax.to(albumClone, 0.35, {
      x: albumPosX ,
      force3D: true, ease: Power2.easeInOut
    });
    TweenMax.to(audioPlayer, 0.32, {
      delay: 0.05,
      x: 0,
      force3D: true, ease: Power2.easeInOut
    });
    TweenMax.to(headerDom, 0.38,{
      css: {
        'background-position': '0px 0px'
      },
      force3D: true, ease: Power2.easeInOut
    });
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Album);
