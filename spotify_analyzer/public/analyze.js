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
function getPlaylistStats(userid, playlistid, offset) {
      var items, next, total;
      var alltracks = "";
      var real;
      var results;

      $.ajax({
        type: 'GET',
        url:'https://api.spotify.com/v1/users/' + userid + '/playlists/' +  playlistid + '/tracks?offset=' + offset,
        headers: {'Authorization': "Bearer " + access_token},
        success: function(data) {
          /* Get the first 100 items */
          items = data.items;
	  total = data.total;

	  for (var track in data.items) {
	  }
	  real = JSON.parse(JSON.stringify(data.items));

	  /* Loop for >100 items */
	  while (data.total - offset - 100 > 0) {
		offset += 100;
                $.ajax({
		  type: 'GET',
		  url:'https://api.spotify.com/v1/users/' + userid + '/playlists/' +  playlistid + '/tracks?offset=' + offset,
		  headers: {'Authorization': "Bearer " + access_token},
		  success: function(data1) {
		    for (var track in data1.items) {
	              real.push(JSON.parse(JSON.stringify(data1.items[track])));
		    }
		  }
	        });
          }
	
 	  /* Wait for everything to show up! */
	  setTimeout(function(){
	    for (var track in real) {
	      alltracks += real[track].track.name + '<br>';
            }
            playlistStatsPlaceholder.innerHTML = playlistStatsTemplate({ tracks: alltracks });
	  }, 300);
          
          //document.getElementById("playlist-stats").append(alltracks);
        }
      });

}

/**
 * Main
 */
var access_token = getParameterByName('token');
var playlist_id = getParameterByName('id');
var playlistList = document.getElementById('analyze-title').innerHTML,
    playlistListTemplate = Handlebars.compile(playlistList),
    playlistListPlaceholder = document.getElementById('playlist-name');

/* Shows title of playlist */
getId(function(data) {
	getPlaylistName(data.id, playlist_id);
    });

var all_tracks;

/* Getting playlist stats */
getId(function(data) {
	getPlaylistStats(data.id, playlist_id, 0);
    });

var playlistStats = document.getElementById('analyze-stats').innerHTML,
    playlistStatsTemplate = Handlebars.compile(playlistStats),
    playlistStatsPlaceholder = document.getElementById('playlist-stats');
