const Promise = require('bluebird');
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const NodeCache = require('node-cache');
const compression = require('compression');
const debug = require('debug')('server');
const albums = require('./albums');

const app = express();
app.set('view engine', 'jade');
app.set('x-powered-by', false);
app.use(compression());
app.use(express.static(__dirname + '/public'));

var cache = new NodeCache({stdTTL: 300, checkperiod: 320});

var spotifyApi = new SpotifyWebApi({
  clientId : process.env.CLIENT_ID,
  clientSecret : process.env.CLIENT_SECRET
});


function getAlbumAndUserDetails(albumID, userData) {
  return new Promise((resolve, reject)  => {
    cache.get(albumID, (err, value) => {
      if (!err) {
        if (value == undefined) {
          debug(`Adding ${albumID} to cache`);
          var result = {};
          Object.assign(result, userData);
          spotifyApi.getAlbum(albumID)
            .then((album) => {
              result['album'] = album.body;
              cache.set(albumID, result);
              resolve(result);
            }, (err) => {
              reject(err);
            });
        } else {
          debug(`Found ${albumID} in cache`);
          resolve(value);
        }
      } else {
        reject(err);
      }
    });
  });
}

/**
 * Gets Spotify credentials via the client autentication flow
 * Uses caching to prevent a lot of API calls
 * @return Promise
 */
function getCreds() {
  return new Promise((resolve, reject) => {
    cache.get('credentials', (err, value) => {
      if (!err) {
        if (value == undefined) {
          spotifyApi.clientCredentialsGrant()
            .then((data) => {
              spotifyApi.setAccessToken(data.body['access_token']);
              // Token has lifetime of 3600 so use something smaller
              cache.set('credentials', data.body['access_token'], 3500);
              resolve();
            });
        } else {
          spotifyApi.setAccessToken(value);
          resolve();
        }
      } else {
        reject(err);
      }
    });
  });
}

app.get('/api/albums', (req, res) => {
  getCreds()
    .then(() => {
      var promiseStack = [];

      Object.keys(albums).forEach((key) => {
        promiseStack.push(getAlbumAndUserDetails(key, albums[key]));
      });

      Promise.all(promiseStack)
        .then(results => res.json(results))
        .catch(err => console.log('Error: ', err));
    });
});

app.get('/', (req, res) => res.render('index'));
app.listen(3000, () => console.log('Record Store Day listening on port 3000!'));
