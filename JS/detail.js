const CLIENT_ID = '5627c8dfe2ff4d7a823bd0e829db0fd7';
        const CLIENT_SECRET = 'ed48cb79aa5f403c86a9a73a92fe2af4';
        const TOKEN_URL = 'https://accounts.spotify.com/api/token';

        // Fungsi untuk mendapatkan access token menggunakan client credentials
        const getAccessToken = async () => {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials'
                })
            };
            try {
                const response = await fetch(TOKEN_URL, options);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Access Token Data:', data);
                if (data.access_token) {
                    localStorage.setItem('access_token', data.access_token);  // Simpan token tanpa JSON.stringify
                    console.log('Access token stored:', data.access_token);
                } else {
                    throw new Error('Access token not found in response');
                }
                return data.access_token;
            } catch (error) {
                console.error('Error fetching access token:', error);
            }
        };

        // Fungsi untuk mendapatkan trek album dari Spotify
        const getAlbumTracks = async (retry = false) => {
            let accessToken = localStorage.getItem('access_token');
            console.log('Access token from local storage:', accessToken); // Logging token dari local storage
            const albumId = JSON.parse(localStorage.getItem('albumId'));
            if (!accessToken) {
                accessToken = await getAccessToken();
                console.log('New access token:', accessToken); // Logging token baru
            }
            try {
                const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                if (!response.ok) {
                    if (response.status === 401 && !retry) { // Unauthorized, get new token and retry once
                        console.log('Token expired, getting new token');
                        accessToken = await getAccessToken();
                        return getAlbumTracks(true); // Retry with new token
                    } else {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                }
                const data = await response.json();  // Urai respons sebagai JSON
                console.log('Album Tracks:', data);
                displayAlbumTracks(data.items);
            } catch (error) {
                console.error('Error fetching album tracks:', error);
            }
        };

        // Fungsi untuk menampilkan trek album di halaman HTML
        const displayAlbumTracks = (tracks) => {
            const main = document.querySelector('main');
            main.innerHTML = ''; // Kosongkan konten sebelumnya

            const albumImage = JSON.parse(localStorage.getItem('albumImage'));
            const img = document.createElement('img');
            img.src = albumImage;
            const div = document.createElement('div');
            div.className = 'album-track';
            div.appendChild(img);
            main.appendChild(div);

            tracks.forEach((track) => {
                showAlbumTrack(track);
            });
        };

        // Fungsi untuk menampilkan trek individual
        const showAlbumTrack = (track) => {
            const albumTrack = document.querySelector('.album-track');
            const divTrack = document.createElement('div');
            divTrack.className = 'track';

            const trackName = document.createElement('p');
            trackName.textContent = track.name;
            divTrack.appendChild(trackName);

            if (track.preview_url) {
                const audio = document.createElement('audio');
                audio.src = track.preview_url;
                audio.setAttribute('controls', '');
                audio.addEventListener('play', () => {
                    const audios = document.querySelectorAll('audio');
                    audios.forEach((aud) => {
                        if (aud !== audio) {
                            aud.pause();
                            aud.currentTime = 0;
                        }
                    });
                });
                divTrack.appendChild(audio);
            } else {
                const noPreview = document.createElement('p');
                noPreview.textContent = 'Preview not available';
                divTrack.appendChild(noPreview);
            }

            albumTrack.appendChild(divTrack);
        };

        // Panggil fungsi untuk mendapatkan dan menampilkan trek album
        getAlbumTracks();