import domready from 'domready';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import App from './app';
import store from './state/store';


let startTime = new Date().getTime();

// debug
window.store = store;


domready(() => {
  ReactDOM.render(
    <Provider store={ store }>
    <App />
    </Provider>,
    document.getElementById('root')
  );

  let loadTime = Math.abs( new Date().getTime() - startTime);
  let delayFadeLoaderOut = 2000 - loadTime;
  if(delayFadeLoaderOut < 0 ) delayFadeLoaderOut = 0;
  console.log(delayFadeLoaderOut);
  setTimeout(function() {
    document.getElementsByTagName('body')[0].classList.add('loaded');
  }, 200 + delayFadeLoaderOut);
  setTimeout(function() {
    document.getElementsByTagName('body')[0].removeChild( document.querySelector('.preload-overlay'));
  }, 4000 + delayFadeLoaderOut);
});
