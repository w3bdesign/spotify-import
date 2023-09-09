# Screenshots

![Screenshot 1 of project](https://user-images.githubusercontent.com/45217974/266754191-83d88be5-74ad-40f4-b24a-362caa311510.png)

![Screenshot 2 of project](https://user-images.githubusercontent.com/45217974/242784809-c34a2a64-9629-4c5c-ab99-c0a0218820d5.png)

# Spotify Playlist Creator

A Flask web application that allows users to use GPT-4 to generate song recommendations, then create a new Spotify playlist or import to an existing one.

## Features

- GPT-4 based song recommendations
- Play button to listen to each song
- Create a new Spotify playlist
- Import to an existing playlist
- Custom toast design with Toastify
- Deployment is possible via Docker

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

3. Rename .env.example to .env and modify the values accordingly.

Replace the placeholders with your actual Spotify developer credentials and desired redirect URI.

You can obtain your Spotify developer credentials from the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications).

## Deployment

Deployment is possible via Docker:

```
docker build -t spotify-import .
```

Start Docker like this:

```
docker run -p 5000:5000 \
  -e SPOTIPY_CLIENT_ID=changeme \
  -e SPOTIPY_CLIENT_SECRET=changeme \
  -e SPOTIPY_REDIRECT_URI=changeme \
  -e OPENAI_API_KEY=changeme \
  -e OPENAI_API_BASE_URL=changeme \
  spotify-import
```

## Usage

To run the application, execute the following command:

```
cd app
python main.py
```

The application will start running on `http://127.0.0.1:5000/`.

Open this URL in your web browser to access the Spotify Playlist Creator.
