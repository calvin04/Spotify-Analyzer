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

function pad(n, z) {
    // Pad to 2 or 3 digits, default is 2
    z = z || 2;
    return ('00' + n).slice(-z);
}

/**
 * Converts milliseconds to time (credit: stackoverflow)
 * @return Object
 */
function msToTime(s) {
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;
  return pad(hrs) + ':' + pad(mins) + ':' + pad(secs);
}

/**
 * Converts milliseconds to m:ss (credit: stackoverflow)
 * @return Object
 */
function msToTimeAvg(s) {
  s = (s - (s % 1000)) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  return mins + ':' + pad(secs);
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
      var totaltracks = 0;
      var popularity = 0;
      var duration = 0;
      var alltracks = "";
      var playlist_data, total_duration;
      var artists = {};

      $.ajax({
        type: 'GET',
        url:'https://api.spotify.com/v1/users/' + userid + '/playlists/' +  playlistid + '/tracks?offset=' + offset,
        headers: {'Authorization': "Bearer " + access_token},
        success: function(data) {
          /* Get the first 100 items */
	  totaltracks = data.total;
	  playlist_data = JSON.parse(JSON.stringify(data.items));

	  /* Loop for >100 items */
	  while (totaltracks - offset - 100 > 0) {
		offset += 100;
                $.ajax({
		  type: 'GET',
		  url:'https://api.spotify.com/v1/users/' + userid + '/playlists/' +  playlistid + '/tracks?offset=' + offset,
		  headers: {'Authorization': "Bearer " + access_token},
		  success: function(data1) {
		    for (var track in data1.items) {
	              playlist_data.push(JSON.parse(JSON.stringify(data1.items[track])));
		    }
		  }
	        });
          }
	
 	  /* Wait for everything to show up */
	  setTimeout(function(){
	    for (var track in playlist_data) {
 	      // append name of track
	      alltracks += playlist_data[track].track.name + " " + playlist_data[track].track.popularity + '<br>';
	      popularity += playlist_data[track].track.popularity;
	      duration += playlist_data[track].track.duration_ms;
            }

	    popularity = (popularity / totaltracks).toFixed(2);
	    total_duration = msToTime(duration);
	    duration = msToTimeAvg((duration / totaltracks).toFixed(0));

	    /* Update the page with the stats */
            playlistStatsPlaceholder.innerHTML = playlistStatsTemplate({
              popularity_avg: popularity,
	      total_duration: total_duration,
	      avg_duration: duration,
	      total: totaltracks,
	      tracks: alltracks });
	  }, 500);
          
          //document.getElementById("playlist-stats").append(alltracks);
        }
      });

}

/**
 * MAIN
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

/* Getting playlist stats */
getId(function(data) {
	getPlaylistStats(data.id, playlist_id, 0);
    });

var playlistStats = document.getElementById('analyze-stats').innerHTML,
    playlistStatsTemplate = Handlebars.compile(playlistStats),
    playlistStatsPlaceholder = document.getElementById('playlist-stats');
