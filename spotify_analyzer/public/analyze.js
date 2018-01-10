/**
 * Obtains parameters from the hash of the URL
 * @return Object
 */
function getHashParams() {
  var hashParams = {};
  var e, r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
  while ( e = r.exec(q)) {
     hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}

/**
 * Return parameters in a URL
 * @return Object
 */
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/**
 * Gets ID of current user
 * @return Object
 */
function getId(callback) {
    $.ajax({
        type: 'GET',
        url: 'https://api.spotify.com/v1/me/',
        headers: {'Authorization': 'Bearer ' + access_token},
        success: function(data) {
          callback(data);
        }
    });
}

/**
 * Gets name of playlist given the IDs of user and playlist
 * @return Object
 */
function getPlaylistName(userid, playlistid) {
    $.ajax({
      type: 'GET',
      url:'https://api.spotify.com/v1/users/' + userid + '/playlists/' +  playlistid,
      headers: {'Authorization': "Bearer " + access_token},
      success: function(data) {
        playlistListPlaceholder.innerHTML = playlistListTemplate({ playlistname: data.name });
       }
    });
}

/**
 * Gets ALL playlist stats! given the IDs of user and playlist
 * @return Object
 */
function getPlaylistStats(userid, playlistid) {
    $.ajax({
      type: 'GET',
      url:'https://api.spotify.com/v1/users/' + userid + '/playlists/' +  playlistid + '/tracks',
      headers: {'Authorization': "Bearer " + access_token},
      success: function(data) {
	alert(testing());
       }
    });
}

function testing() {
	return "test"
}

/**
 * Main
 */
var access_token = getParameterByName('token');
var playlist_id = getParameterByName('id');
var playlistList = document.getElementById('playlist-template').innerHTML,
    playlistListTemplate = Handlebars.compile(playlistList),
    playlistListPlaceholder = document.getElementById('playlist-stats');

/* Shows title of playlist */
getId(function(data) {
	getPlaylistName(data.id, playlist_id);
    });
/* Getting playlist stats */
getId(function(data) {
	getPlaylistStats(data.id, playlist_id);
    });
