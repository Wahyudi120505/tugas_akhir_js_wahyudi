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
        console.log('Access Token:', data);
        return data.access_token;
    } catch (error) {
        console.error('Error fetching access token:', error);
    }
};

// Fungsi untuk mendapatkan album baru dari Spotify
const getAlbums = async () => {
    try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('Failed to get access token');
        }
        const response = await fetch('https://api.spotify.com/v1/browse/new-releases', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Albums Data:', data);
        displayAlbums(data.albums.items);
    } catch (error) {
        console.error('Error fetching albums:', error);
    }
};

// Fungsi untuk menampilkan album di halaman HTML
const displayAlbums = (albums) => {
    const albumsDiv = document.getElementById('albums');
    albumsDiv.innerHTML = ''; // Kosongkan konten sebelumnya

    albums.forEach(album => {
        // Buat elemen div untuk album
        const figure = document.createElement('figure');        
        // Buat elemen img untuk gambar album
        const albumImage = document.createElement('img');
        albumImage.src = album.images[0].url;
        albumImage.alt = album.name;
        const a = document.createElement('a');
        a.setAttribute('href', './detail.html');
        // Buat elemen figcaption
        const figcaption = document.createElement('figcaption');
        // Buat elemen h3 untuk nama album
        const albumName = document.createElement('h3');
        albumName.textContent = album.name;
        // Buat elemen p untuk artis
        const albumArtists = document.createElement('p');
        albumArtists.textContent = `Artist: ${album.artists.map(artist => artist.name).join(', ')}`;
        
        // Masukkan elemen ke dalam figure
        figcaption.appendChild(albumArtists);
        figcaption.appendChild(albumName);
        a.appendChild(albumImage);
        figure.appendChild(a);
        figure.appendChild(figcaption);
        // Tambahkan elemen album ke dalam albumsDiv
        albumsDiv.appendChild(figure);

        a.addEventListener('click', (event) => {
            event.preventDefault();
            // Simpan id album ke local storage
            localStorage.setItem('albumId', JSON.stringify(album.id));
            localStorage.setItem('albumImage', JSON.stringify(album.images[0].url));
            // Pindah ke halaman detail.html
            window.location.href = './detail.html';
        });
    });
};

// Panggil fungsi untuk mendapatkan dan menampilkan album
getAlbums();