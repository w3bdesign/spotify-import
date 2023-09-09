# Screenshot

![Screenshot 1 of project](https://user-images.githubusercontent.com/45217974/266754191-83d88be5-74ad-40f4-b24a-362caa311510.png)

![Screenshot 2 of project](https://user-images.githubusercontent.com/45217974/242784809-c34a2a64-9629-4c5c-ab99-c0a0218820d5.png)

# Spotify Playlist Creator

A Flask web application that allows users to use chatGPT to generate song recommendations, then create a new Spotify playlist or import to an existing one.

## Features

- GPT-4 based song recommendations
- Play button to listen to each song
- Create a new Spotify playlist
- Import to an existing playlist

## Installation

To set up the project, follow these steps:

1. Clone the repository:

   ```
   git clone https://github.com/w3bdesign/spotify-import.git
   cd spotify-playlist-creator
   ```

Replace `YOUR_USERNAME` with your actual GitHub username.


2. Install the required packages:

   ```
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the project root directory with the following variables:

   ```
   SPOTIPY_CLIENT_ID=your_spotify_client_id
   SPOTIPY_CLIENT_SECRET=your_spotify_client_secret
   SPOTIPY_REDIRECT_URI=your_redirect_uri
   SPOTIPY_USER_NAME=your_spotify_username
   ```

Replace the placeholders with your actual Spotify developer credentials and desired redirect URI. 

You can obtain your Spotify developer credentials from the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications).

## Usage

To run the application, execute the following command:

```
python app.py
```

The application will start running on `http://127.0.0.1:5000/`.

Open this URL in your web browser to access the Spotify Playlist Creator.
