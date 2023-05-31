<div align="center">
  <img src="https://user-images.githubusercontent.com/45217974/242154724-956f96ec-1e65-4b1f-86da-fdcc4845f787.png" alt="Screenshot of project">
</div>

# Spotify Playlist Creator

A simple web application that allows users to create Spotify playlists with song recommendations.

## Features

- Load Spotify developer data from a `.env` file
- Create a Spotify playlist with a name and description
- Add song recommendations to the playlist

## Installation

To set up the project, follow these steps:

1. Clone the repository:

   ````
   git clone https://github.com/w3bdesign/spotify-import.git
   cd spotify-playlist-creator
   ```

   Replace `YOUR_USERNAME` with your actual GitHub username.

   ````

2. Install the required packages:

   ````
   pip install -r requirements.txt
   ```

   ````

3. Create a `.env` file in the project root directory with the following variables:

   ````
   SPOTIPY_CLIENT_ID=your_spotify_client_id
   SPOTIPY_CLIENT_SECRET=your_spotify_client_secret
   SPOTIPY_REDIRECT_URI=your_redirect_uri
   SPOTIPY_USER_NAME=your_spotify_username
   ```
   ````

Replace the placeholders with your actual Spotify developer credentials and desired redirect URI. You can obtain your Spotify developer credentials from the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications).

## Usage

To run the application, execute the following command:

```
python app.py
```

The application will start running on `http://127.0.0.1:5000/`.

Open this URL in your web browser to access the Spotify Playlist Creator.
