var webPlaybackTokens = JSON.parse(document.getElementById('joinKey').textContent);
var hostToken         = JSON.parse(document.getElementById('hostKey').textContent);
const access_token    = webPlaybackTokens['access_token'];
const host_token      = hostToken['host_token'];

window.onSpotifyWebPlaybackSDKReady = () => {
  if (window.isSecureContext) {
    // Page is a secure context so service workers are now available
    var player = new Spotify.Player({
      name: 'freequeue.io',
      getOAuthToken: callback => {
        // Run code to get a fresh access token
        callback(access_token);
      },
    });
    player.connect().then(success => {
      if (success) {
      console.log('The Web Playback SDK successfully connected to Spotify!');
      }
    });
    let currentTrack = '';
    player.addListener('player_state_changed', (state) => {
      try{
        if(state.track_window.current_track.uri != currentTrack){
          currentTrack = state.track_window.current_track.uri;
          var xhr = new XMLHttpRequest();
          xhr.addEventListener("readystatechange", function() {
            if(this.readyState === 4) {
              console.log(this.responseText);
            }
          });
          xhr.open('PUT', "https://api.spotify.com/v1/me/player/play");
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.setRequestHeader('Authorization', 'Bearer ' + host_token);
          xhr.send(JSON.stringify({
            'uris': [currentTrack],
          }));
        }
      }catch(e){
        if(e instanceof TypeError){
          console.error('TypError sending a player_state_changed request');
        }
      }
    });
  }else{
    console.error(error, 'Insecure Connection');
  }
};