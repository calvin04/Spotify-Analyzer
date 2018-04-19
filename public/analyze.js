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
 *
 */
function displayFrequentArtists(artist_list) {
    var num = 20 // number of artists to display
    var sorted_artists = [];
    var table_info = `<table id='artist-count' class='table-striped table-bordered'>
                        <colgroup>
       			  <col span="1" style="width: 85%;">
       			  <col span="1" style="width: 15%;">
                        </colgroup>
                        <thead>
                          <tr>
                            <th>Artist</th>
                            <th>Count</th>
                          </tr>
                        </thead>
                      <tbody>`;

    // sorting artists by song count
    for (var artist in artist_list) {
        sorted_artists.push([artist, artist_list[artist]]);
    }
    sorted_artists.sort(function(a, b) {
        return b[1] - a[1];
    });

    // generate table
    var e = document.createElement('div');
    e.className = "freq_artist_table";

    for (i = 0; i < Math.min(num, sorted_artists.length); i++) {
        table_info += "<tr><td align='left'>" + sorted_artists[i][0] + "</td><td align='right'>" + sorted_artists[i][1] + "</td></tr>";
    }

    table_info += "</tbody></table>";
    e.innerHTML = table_info;

    var h = document.createElement('h2');
    h.innerHTML = "Frequent Artists";
    document.getElementById("frequent-artists").append(h);
    document.getElementById("frequent-artists").append(e);
}

/**
 * Displays the most frequent albums in the playlist.
 *
 */
function displayFrequentAlbums(album_list, album_artists) {
    var num = 20 // number of albums to display
    var sorted_albums = [];
    var table_info = `<table id='album-count' class='table-striped table-bordered'>
                        <colgroup>
       			  <col span="1" style="width: 55%;">
                          <col span="1" style="width: 38%;">
       			  <col span="1" style="width: 7%;">
                        </colgroup>
                        <thead>
                          <tr>
                            <th>Album</th>
                            <th>Artist</th>
                            <th>Count</th>
                          </tr>
                        </thead>
                      <tbody>`;

    // sorting albums by song count
    for (var album in album_list) {
        sorted_albums.push([album, album_list[album]]);
    }
    sorted_albums.sort(function(a, b) {
        return b[1] - a[1];
    });

    // generate table
    var e = document.createElement('div');
    e.className = "freq_album_table";

    for (i = 0; i < Math.min(num, sorted_albums.length); i++) {
        table_info += "<tr><td align='left'>" + sorted_albums[i][0] + "</td><td align='left'>" + album_artists[sorted_albums[i][0]] + "</td><td align='right'>" + sorted_albums[i][1] + "</td></tr>";
    }

    table_info += "</table>";
    e.innerHTML = table_info;

    var h = document.createElement('h2');
    h.innerHTML = "Frequent Albums";
    document.getElementById("frequent-albums").append(h);
    document.getElementById("frequent-albums").append(e);
}

/**
 * Display most/least popular songs in playlist.
 *
 */
function displayPopularity(popularity_list, song_artist) {
    var num = 5;
    var pop_list = [];
    var table_info = `<table class='pop-count table-striped table-bordered'>
                        <colgroup>
       			  <col span="1" style="width: 55%;">
			  <col span="1" style="width: 35%;">
       			  <col span="1" style="width: 10%;">
                        </colgroup>
                        <thead>
                          <tr>
                            <th>Song Name</th>
			    <th>Artist</th>
                            <th>Popularity</th>
                          </tr>
                        </thead>
                      <tbody>`;

    for (var song in popularity_list) {
        pop_list.push([song, popularity_list[song]]);
    }

    pop_list.sort(function(a, b) {
        return b[1] - a[1];
    });

    // generate table for high
    var e = document.createElement('div');
    e.className = "pop_table";

    for (i = 0; i < Math.min(num, pop_list.length); i++) {
        table_info += "<tr><td align='left'>" + pop_list[i][0] + "</td><td align='left'>" + song_artist[pop_list[i][0]] + "</td><td align='right'>" + pop_list[i][1] + "</td></tr>";
    }

    table_info += "</table>";
    e.innerHTML = table_info;

    var h = document.createElement('h2');
    h.innerHTML = "Popular Tracks";
    document.getElementById("popularity-high").append(h);
    document.getElementById("popularity-high").append(e);
}

/**
 * Gets average year of songs in the playlist.
 *
 * @return average year of songs
 */
function getAverageYear(album_list, album_year) {
    var total_years = 0;
    var song_count = 0;
    for (var album in album_year) {
        total_years += album_year[album] * album_list[album];
        song_count += album_list[album];
    }
    return Math.round(total_years / song_count);
}

/**
 * Generates a graph of song counts per year.
 */
function generateYearGraph(years, year_count) {
    Chart.defaults.global.defaultFontFamily = 'Open Sans';
    Chart.defaults.global.defaultFontColor = 'black';
    new Chart(document.getElementById("bar-chart"), {
	type: 'bar',
	data: {
	    labels: years,
	    datasets: [{
		label: "Song count",
		backgroundColor: "#1ED760",
		data: year_count
		}
	    ]
	},
	options: {
	    legend: { display: false },
	    title: {
		display: true,
		text: 'Song Count By Year',
		fontSize: 24
	    },
	    scales : {
		yAxes: [{
		  ticks: { callback : function(value) { 
		    if (!(value % 1)) {
		      return Number(value).toFixed(0);
		    }},
 		    beginAtZero: true
		  }
		}]
	    }
	}
    });
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
	        var key, year, song_name, song_popularity;
	        var totaltracks = data.total;
                var popularity = 0;
                var duration = 0;
		// artist/album : count
                var artist_list = {};
		var album_list = {};
		var album_artists = {};
	        var album_year = {};
                var year_list = {};
                var song_artist = {};
                //
                var popularity_list = {}

                for (var track in playlist_data) {
	            song_name = playlist_data[track].track.name;
		    song_popularity = playlist_data[track].track.popularity;

                    // append the artist names and count for each track
                    for (var artist in playlist_data[track].track.artists) {
                        key = playlist_data[track].track.artists[artist].name;
                        artist_list[key] = (artist_list[key] || 0) + 1;
                    }

                    // append the album for each track
                    key = playlist_data[track].track.album.name;
                    year = playlist_data[track].track.album.release_date;
                    album_list[key] = (album_list[key] || 0) + 1;

                    // append the year for each track
		    if (year != null) {
                        year_list[year.substring(0, 4)] = (year_list[year.substring(0, 4)] || 0) + 1;
		        album_year[key] = year.substring(0, 4);
                    }

		    // append the artist names for each album
                    for (var i = 0; i < playlist_data[track].track.album.artists.length; i++) {
                        if (i == 0) {
		            album_artists[key] = playlist_data[track].track.album.artists[i].name;
                        } else {
                            album_artists[key] += ", " + playlist_data[track].track.album.artists[i].name;
                        }
                    }
		    // append the artist names for each song
                    for (var i = 0; i < playlist_data[track].track.artists.length; i++) {
                        // append the artist names for each album
                        if (i == 0) {
		            song_artist[song_name] = playlist_data[track].track.artists[i].name;
                        } else {
                            song_artist[song_name] += ", " + playlist_data[track].track.artists[i].name;
                        }
                    }

 	            // append name of track
		    popularity_list[song_name] = song_popularity; 

	            popularity += song_popularity;
	            duration += playlist_data[track].track.duration_ms;
                }

                popularity = (popularity / totaltracks).toFixed(2);
	        var total_duration = msToTime(duration);
	        duration = msToTimeAvg((duration / totaltracks).toFixed(0));

                // Display artist, album table, popularity list
		displayFrequentArtists(artist_list);
                displayFrequentAlbums(album_list, album_artists);
                displayPopularity(popularity_list, song_artist);
		var avg_year = getAverageYear(album_list, album_year);	

		// generate list of years and song count
		var years = [];
		var year_count = [];
		for (var i = parseInt(Object.keys(year_list)[0]); i < 2019; i++) {
                    years.push(String(i));
		    if (year_list[String(i)]) {
		        year_count.push(year_list[String(i)]);
                    } else {
			year_count.push(0);
                    }
                }	
		generateYearGraph(years, year_count);

	        // Update the page with the stats
                playlistStatsPlaceholder.innerHTML = playlistStatsTemplate({
                    popularity_avg: popularity,
                    unique_artists: Object.keys(artist_list).length,
                    unique_albums: Object.keys(album_list).length,
	            total_duration: total_duration,
	            avg_duration: duration,
	            total: totaltracks,
                    avg_year: avg_year});
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

/************
 * MAIN
 ************/
var access_token = getParameterByName('token');
var playlist_id = getParameterByName('id');
var username_id = getParameterByName('username');
var playlistList = document.getElementById('analyze-title').innerHTML,
    playlistListTemplate = Handlebars.compile(playlistList),
    playlistListPlaceholder = document.getElementById('playlist-name');

// Shows title of playlist
getPlaylistName(username_id, playlist_id);

// Getting playlist stats
getPlaylistStats(username_id, playlist_id, 0);

var playlistStats = document.getElementById('analyze-stats').innerHTML,
    playlistStatsTemplate = Handlebars.compile(playlistStats),
    playlistStatsPlaceholder = document.getElementById('playlist-stats');

(function(){console.log(document.getElementById('playlist-name'));}())
}());
