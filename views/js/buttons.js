/**
 * @see https://stackoverflow.com/a/58743412/6929317
 */
document.addEventListener("DOMContentLoaded", function(event) { 
    var scrollpos = localStorage.getItem('scrollpos');
    if (scrollpos) window.scrollTo(0, scrollpos);
});
window.onbeforeunload = function(e) {
    localStorage.setItem('scrollpos', window.scrollY);
};

function sendHostRequest(){
    let _scopes = 'user-modify-playback-state';
    appRequestAuthentication(_scopes, 'host');
    /* Browser Object Model (BOM) API throws a GET request to the URL */
}

function sendJoinRequest(){
    let _scopes = 'user-modify-playback-state user-read-private user-read-email streaming';
    appRequestAuthentication(_scopes, 'join');
    /* I chose window.location.assign over window.location.replace because
        I want the browser to maintain the routing history */
}

function appRequestAuthentication(scopes, callback){
    const client_id = 'client_id=' + '6c0929ae3d99478581e117d18635ed1e';
    const response_type = '&response_type=code&';
    const redirect_uri = '&redirect_uri=' + 'http%3A%2F%2Flocalhost%3A80%2F' + callback;
    const scope = '&scope=' + encodeURIComponent(scopes);
    var accessTokenRequest = 'https://accounts.spotify.com/authorize?' + client_id + response_type + redirect_uri + scope;
    document.location.assign(accessTokenRequest);
}