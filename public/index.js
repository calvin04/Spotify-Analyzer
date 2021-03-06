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
 * Gets all playlists of the logged in user
 *
 * @return Object
 */
function getAllPlaylists(username, isOwner = false) {
    var all = "";
    var username_str = "users/" + username;
    if (isOwner) {
        username_str = "me";
    }
    $.ajax({
      type: 'GET',
      url:'https://api.spotify.com/v1/' + username_str + '/playlists',
      headers: {'Authorization': "Bearer " + access_token},
      success: function(data) {
        // Loop through playlists and add them
	    for (var key in data.items) {
		  all += '<div class="playlist-button-name">' + data.items[key].name + '</div><div class="playlist-button-click"><a class="btn" href="analyze.html?username=' + data.items[key].owner.id + '&id=' + data.items[key].id + '&token=' + access_token + '&quot;">Analyze Playlist</a></div>';
	    }
	    playlistListPlaceholder.innerHTML = playlistListTemplate({ all: all });
      }
    });
    return all;
  }
  
/**
 * Gets playlist given the id
 * Used to load playlist stats page.
 *
 * @return Object
 */
function getPlaylist(playlist) {
    var all = "";
    $.ajax({
      type: 'GET',
      url:'https://api.spotify.com/v1/playlists/' + playlist,
      headers: {'Authorization': "Bearer " + access_token},
      success: function(data) {
		var currentURL = decodeURIComponent('analyze.html%3Fid=' + playlist + '&token=' + access_token);
		location.href = currentURL;
      },
	  error: function() {
		alert("Playlist could not be found");
	  }
    });
    return all;
  }  
  
/**********
 *
 * MAIN
 *
 **********/
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
var username = getParameterByName('username');

var playlistList = document.getElementById('all-playlists').innerHTML,
    playlistListTemplate = Handlebars.compile(playlistList),
    playlistListPlaceholder = document.getElementById('all-play');

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

		// allow user to click their own name
		document.querySelector('#logged-as').addEventListener('click', function(e){
			e.preventDefault();
		 	var currentURL = new URL(window.location.href);
			currentURL.searchParams.set("username", response.id);
			window.location = currentURL;
		});
		
		// load logged in user's playlists if none given
		getId(function(data) {
		    if (!username) {
			    getAllPlaylists(data.id, true);
		    } else {
				document.getElementById("your-playlists-title").innerHTML = "<h3>" + username + "'s Playlists</h3>";
				
				// get display name for user
				$.ajax({
				  type: 'GET',
				  url: 'https://api.spotify.com/v1/users/' + username,
				  headers: {'Authorization': 'Bearer ' + access_token},
				  success: function(data) {
					document.getElementById("your-playlists-title").innerHTML = "<h3>" + data.display_name + "'s Playlists</h3>";
			        getAllPlaylists(username);
				  }
				});
		    }
		});
            }
        });
    } else {
        // render initial screen
        $('#login').show();
        $('#loggedin').hide();
    }

}

document.querySelector('#search-user-form').addEventListener('submit', function(e){
        // prevent from refreshing the page on submit
        e.preventDefault();
        // read form element
        var user = document.getElementById("playlist_text").value;
        // clean form
        document.getElementById("search-user-form").reset();
        // load user's playlists
 	var currentURL = new URL(window.location.href);
	currentURL.searchParams.set("username", user);
	window.location = currentURL;
});

document.querySelector('#get-playlist-form').addEventListener('submit', function(e){
        // prevent from refreshing the page on submit
        e.preventDefault();
        // read form element
        var playlist = document.getElementById("playlist_text_2").value;
        // clean form
        document.getElementById("get-playlist-form").reset();
        // gets playlist and takes it to stats (if playlist id exists)
		getPlaylist(playlist);
});

}());

