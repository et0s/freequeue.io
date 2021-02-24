'use strict';

const fs = require('fs');
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const app = express();

app.locals.ipv4         = 'freequeueio-env.eba-s4vk8zkt.us-west-1.elasticbeanstalk.com';
app.locals.port         = 80;
app.locals.title        = 'freequeue.io';
app.locals.email        = 'etas1337@gmail.com';
app.locals.clientId     = '6c0929ae3d99478581e117d18635ed1e';
app.locals.clientSecret = fs.readFileSync('secret.key', 'utf-8');

app.disable('trust proxy');
app.set('view engine', 'pug');
var userRooms = [];

app.use(express.static('views'));
app.get('/', (req, res) => {
  res.render('index', {
    title: 'freequeue.io',
    message: 'freequeue.io',
    roomInfo: 'Host or join a room on spotify',
    buttonScript: 'js/buttons.js'
  }, function (err, html){
    if(err) console.error(req.ip + ' error rendering index.pug');
    res.send(html);
    res.end(); //serving index
  });
});

/**
 * Faulty Request Security
 * @Case /host or /host?code=
*/
app.use(function(req, res, next) {
  if((req.query.error != undefined) && (req.query.error == 'access_denied')) {
    res.render('index', {
      title: 'freequeue.io',
      message: 'freequeue.io',
      roomInfo: 'You have denied access to freequeue.io',
      buttonScript: 'js/buttons.js'
    }, function (err, html){
      if(err) console.error('error rendering denied access response');
      res.send(html);
      res.end(); //serve denied access response
    });
  }else{
    next();
  }
});

app.get('/join', (req, res) => {
  var room = hostExists(req.ip);
  if(room){
    var spotifyApi = new SpotifyWebApi({
      clientId: app.locals.clientId,
      clientSecret: app.locals.clientSecret,
      redirectUri: app.locals.ipv4 + '/join'
    });
    spotifyApi.authorizationCodeGrant(req.query.code)
    .then(data => {
      var access_token = data.body['access_token'];
      var refresh_token = data.body['refresh_token'];
      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);
      var spotifyApiScript  = '<script src="https://sdk.scdn.co/spotify-player.js"></script>'
      var tokenData         = '<script type="application/json" id="joinKey">' + JSON.stringify(data.body) + '</script>';
      var hostToken         = '<script type="application/json" id="hostKey">' + JSON.stringify(room) + '</script>';
      var clientSidePlayer  = '<script type="text/javascript" src="js/client.js"></script>';
      res.render('index', {
        title: 'freequeue.io', 
        message: 'freequeue.io',
        roomInfo: 'Joined freequeue.io room on ' + req.ip,
        buttonScript: 'js/buttons.js'
      }, function (err, html){
        if(err) console.error(req.ip + ' error rendering all client scripts');
        res.send(spotifyApiScript + tokenData + hostToken + clientSidePlayer + html);
        res.end(); //serve all client scripts
      });
    })
    .catch(error => {
      res.render('index', {
        title: 'freequeue.io', 
        message: 'freequeue.io',
        roomInfo: 'Something went wrong. Please click "join" again',
        buttonScript: 'js/buttons.js'
      }, function (err, html){
        if(err) console.error(req.ip + ' error rendering invalid spotifyApiClient response');
        res.send(html);
        res.end(); //serve invalid spotifyApiClient response
      });
    });
  }else{
    res.render('index', {
      title: 'freequeue.io', 
      message: 'freequeue.io',
      roomInfo: 'No host on this network. Click "host" to start one',
      buttonScript: 'js/buttons.js'
    }, function (err, html){
      if(err) console.error(req.ip + ' error rendering no rooms avaliable response');
      res.send(html);
      res.end(); //serve no host avaliable response
    });
  }
});

app.get('/host', (req, res) => {
  if(!hostExists(req.ip)){
    var spotifyApi = new SpotifyWebApi({
      clientId: app.locals.clientId,
      clientSecret: app.locals.clientSecret,
      redirectUri: app.locals.ipv4 + '/host'
    });
    spotifyApi.authorizationCodeGrant(req.query.code)
    .then(data => {
      var access_token = data.body['access_token'];
      var refresh_token = data.body['refresh_token'];
      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);
      let room = {
        ip: req.ip,
        host_token: access_token
      };
      userRooms.push(room);
      console.log(userRooms); //debugging
      res.render('disc', {
        title : 'freequeue.io', 
        message : 'freequeue.io',
        roomInfo : 'Hosting freequeue.io room on ' + req.ip,
        buttonScript : 'js/disc.js',
        freeServerConfig : 'json/config.json',
      }, function (err, html){
        if(err) console.error('error rendering disconnect response');
        res.send(html);
        res.end(); //serve disconnect response
      });
    })
    .catch(error => {
      res.render('index', {
        title: 'freequeue.io', 
        message: 'freequeue.io',
        roomInfo: 'Something went wrong. Please click "host" again',
        buttonScript: 'js/buttons.js'
      }, function (err, html){
        if(err) console.error(req.ip + ' error rendering invalid spotifyApiClient response');
        res.send(html);
        res.end(); //serve invalid spotifyApiClient response
      });
    });
  }else{
    res.render('index', {
      title : 'freequeue.io', 
      message : 'freequeue.io',
      roomInfo : 'Someone else is hosting on your network',
      buttonScript : 'js/buttons.js',
      freeServerConfig : 'json/config.json',
    }, function (err, html){
      if(err) console.error('error rendering one host per network');
      res.send(html);
      res.end(); //serve one host per network
    });
  }
});

app.post('/host', (req, res) => {
  for(var i = 0; i < userRooms.length; i++){
    if(userRooms[i].ip == req.ip){
      userRooms.splice(i, 1);
      console.log(userRooms); //debugging
      res.status(200);
      res.end(); //serve successful delete
    }
  }
});

app.listen(app.locals.port);

function hostExists(ip){
  for(var i = 0; i < userRooms.length; i++){
    if(userRooms[i].ip == ip){
      return userRooms[i];
    }
  }
  return undefined;
}