const clientId = '****';
// const redirectUri = `http://localhost:3000/`;
const redirectUri = `http://rbjamming.surge.sh/`;
const spotifyUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;

let userAccessToken = undefined;
let expiresIn = undefined;

const Spotify = {

  getAccessToken() {
    if (userAccessToken) {
      return userAccessToken;
    } else {
      const urlAccessToken = window.location.href.match(/access_token=([^&]*)/);
      const urlExpiresIn = window.location.href.match(/expires_in=([^&]*)/);

      if (urlAccessToken && urlExpiresIn) {
        userAccessToken = urlAccessToken[1];
        expiresIn = urlExpiresIn[1];

        window.setTimeout(() => userAccessToken = '', expiresIn * 1000);
        window.history.pushState('Access Token', null, '/');
      } else {
        window.location = spotifyUrl;
      }
    }
  },

  search(searchTerm) {
    const searchUrl = `https://api.spotify.com/v1/search?type=track&q=${searchTerm}`;

    return fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${userAccessToken}`
      }
    })
    .then(response => {
      return response.json();
    })
    .then(jsonResponse => {
      if (!jsonResponse) {
        return [];
      } else {
        return jsonResponse.tracks.items.map( track => {
          return {
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            uri: track.uri
          }
        });
      }
    });

  },

  savePlaylist(playlistName, trackURIs) {

    if (!playlistName || !trackURIs || trackURIs.length === 0) {
      return;
    } else {
      let currentUsersAccessToken = userAccessToken;
      let headers = {
          Authorization: `Bearer ${currentUsersAccessToken}`
      }

      let userId = undefined;
      let playlistId = undefined;
      const userInfoUrl = 'https://api.spotify.com/v1/me';

      fetch(userInfoUrl, {
        headers: headers
      }).
      then(response => {
        return response.json();
      })
      .then(jsonResponse => {
        console.log(jsonResponse);
        userId = jsonResponse.id;
      })
      .then( () => {
        const createPlaylistUrl = `https://api.spotify.com/v1/users/${userId}/playlists`

        fetch(createPlaylistUrl, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({name: playlistName})
        })
        .then(response => {
          return response.json();
        })
        .then(jsonResponse => {
          console.log('POST: ' + jsonResponse);
          playlistId = jsonResponse.id;
        })
        .then(() => {
          const addTracksToPlaylist = `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`;

          fetch(addTracksToPlaylist, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({uris: trackURIs})
          });
        });
      });

    }

  }

}









export default Spotify;
