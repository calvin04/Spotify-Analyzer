
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
 * Gets all playlists of the logged in user
 * @return Object
 */
function getAllPlaylists() {
    var all = "";
    $.ajax({
      type: 'GET',
      url:'https://api.spotify.com/v1/me/playlists',
      headers: {'Authorization': "Bearer " + access_token},
      success: function(data) {
        /* Loop through playlists and add them */
	for (var key in data.items) {
	  all += data.items[key].name + '<button class="playlist-analyze" onclick="window.location.href=&quot;analyze.html?id=' + data.items[key].id + '&token=' + access_token + '&quot;">Analyze Playlist</button><br>';
	}
	playlistListPlaceholder.innerHTML = playlistListTemplate({ all: all });
      }
    });
    return all;
  }

var userProfileSource = document.getElementById('user-profile-template').innerHTML,
    userProfileTemplate = Handlebars.compile(userProfileSource),
    userProfilePlaceholder = document.getElementById('user-profile');

var oauthSource = document.getElementById('oauth-template').innerHTML,
    oauthTemplate = Handlebars.compile(oauthSource),
    oauthPlaceholder = document.getElementById('oauth');
var params = getHashParams();
var access_token = params.access_token,
    refresh_token = params.refresh_token,
    error = params.error;

var playlistList = document.getElementById('all-playlists').innerHTML,
    playlistListTemplate = Handlebars.compile(playlistList),
    playlistListPlaceholder = document.getElementById('all-play');
var all = getAllPlaylists();

if (error) {
  alert('There was an error during the authentication');
} else {
  if (access_token) {
    $.ajax({
        url: 'https://api.spotify.com/v1/me',
        headers: {
          'Authorization': 'Bearer ' + access_token
        },
        success: function(response) {
          userProfilePlaceholder.innerHTML = userProfileTemplate(response);
          $('#login').hide();
          $('#loggedin').show();
        }
    });
  } else {
      // render initial screen
      $('#login').show();
      $('#loggedin').hide();
  }

  /* GETS NEW TOKEN */
  document.getElementById('obtain-new-token').addEventListener('click', function() {
    $.ajax({
      url: '/refresh_token',
      data: {
        'refresh_token': refresh_token
      }
    }).done(function(data) {
      access_token = data.access_token;
      oauthPlaceholder.innerHTML = oauthTemplate({
        access_token: access_token,
        refresh_token: refresh_token
      });
    });
  }, false);

}



