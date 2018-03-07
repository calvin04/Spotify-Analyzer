window.onload = (function() {

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
 * Displays the most frequent artists in the playlist.
 */
function displayFrequentArtists(artist_list) {
    var num = 20 // number of artists to display
    var sorted_artists = [];
    var table_info = "<table id='artist-count'><tr><th>Artist</th><th>Count</th></tr>";

    // sorting artists by song count
    for (var artist in artist_list) {
        sorted_artists.push([artist, artist_list[artist]]);
    }
    sorted_artists.sort(function(a, b) {
        return b[1] - a[1];
    });
    console.log(sorted_artists);
    // generate table
    var e = document.createElement('div');
    e.className = "freq_artist_table";

    for (i = 0; i < Math.min(num, sorted_artists.length); i++) {
        table_info += "<tr><td>" + sorted_artists[i][0] + "</td><td align='right' width='10%'>" + sorted_artists[i][1] + "</td></tr>";
    }

    table_info += "</table>";
    e.innerHTML = table_info;
    document.getElementById("frequent-artists").append(e);
}

/**
 * Calls API requests for playlist tracks.
 */
function getPlaylistStatsAPI(userid, playlistid, offset, playlist_data) {
    $.ajax({
        type: 'GET',
        url:'https://api.spotify.com/v1/users/' + userid + '/playlists/' +  playlistid + '/tracks?offset=' + offset,
        headers: {'Authorization': "Bearer " + access_token},
        success: function(data) {
            // get the next 100 items
	    for (var track in data.items) {
	        playlist_data.push(JSON.parse(JSON.stringify(data.items[track])));
	    }
            offset += 100;

            // loop another GET request for next 100 tracks
            if (data.total - offset > 0) {
                getPlaylistStatsAPI(userid, playlistid, offset, playlist_data);
            // analyse playlist
            } else {
	        var key;
	        var totaltracks = data.total;
                var popularity = 0;
                var duration = 0;
                var artist_list = {};
                var alltracks = "";

                for (var track in playlist_data) {
                    // append the artist names for each track
                    for (var artist in playlist_data[track].track.artists) {
                        key = playlist_data[track].track.artists[artist].name;
                        artist_list[key] = (artist_list[key] || 0) + 1;
                        alltracks += playlist_data[track].track.artists[artist].name + " ";
                    }
 	            // append name of track
	            alltracks += playlist_data[track].track.name + " " + playlist_data[track].track.popularity + '<br>';
	            popularity += playlist_data[track].track.popularity;
	            duration += playlist_data[track].track.duration_ms;
                }

                popularity = (popularity / totaltracks).toFixed(2);
	        var total_duration = msToTime(duration);
	        duration = msToTimeAvg((duration / totaltracks).toFixed(0));

                // Display artist table
		displayFrequentArtists(artist_list);		

	        /* Update the page with the stats */
                playlistStatsPlaceholder.innerHTML = playlistStatsTemplate({
                    popularity_avg: popularity,
	            total_duration: total_duration,
	            avg_duration: duration,
	            total: totaltracks});
            }
        }
    });
}


/**
 * Gets ALL playlist stats given the IDs of user and playlist
 * @return Object
 */
function getPlaylistStats(userid, playlistid, offset) {
      var playlist_data = [];
      getPlaylistStatsAPI(userid, playlistid, offset, playlist_data);
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
        //getPlaylistStats("caaakeeey", "6QAKnenuZoowNqxRzZbeRg", 0);
	getPlaylistStats(data.id, playlist_id, 0);
    });

var playlistStats = document.getElementById('analyze-stats').innerHTML,
    playlistStatsTemplate = Handlebars.compile(playlistStats),
    playlistStatsPlaceholder = document.getElementById('playlist-stats');

}());
