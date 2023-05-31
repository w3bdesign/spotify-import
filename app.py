from flask import Flask, render_template, request, redirect, url_for
import spotipy
from flask import request, redirect, url_for, session
from dotenv import load_dotenv
from spotipy.oauth2 import SpotifyOAuth
import os

app = Flask(__name__)

load_dotenv()

# Load the environment variables
client_id = os.getenv("SPOTIPY_CLIENT_ID")
client_secret = os.getenv("SPOTIPY_CLIENT_SECRET")
redirect_uri = os.getenv("SPOTIPY_REDIRECT_URI")
username = os.getenv("SPOTIPY_USER_NAME")

# Create a Spotify OAuth object
sp_oauth = SpotifyOAuth(
    client_id=client_id,
    client_secret=client_secret,
    redirect_uri=redirect_uri,
    scope="playlist-modify-public",
    username=username,
)


@app.route("/callback")
def callback():
    code = request.args.get("code")
    if code:
        token_info = sp_oauth.get_access_token(code, as_dict=False)
        if token_info:
            session["token_info"] = token_info
            return redirect(url_for("index"))
    return "Error: No code provided or token not obtained."


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        playlist_name = request.form["playlist_name"]
        playlist_description = request.form["playlist_description"]
        song_recommendations = request.form["song_recommendations"].splitlines()

        sp = spotipy.Spotify(
            auth_manager=SpotifyOAuth(
                client_id=client_id,
                client_secret=client_secret,
                redirect_uri=redirect_uri,
                scope="playlist-modify-public",
                username=username,
            )
        )

        playlist = sp.user_playlist_create(
            user=username, name=playlist_name, description=playlist_description
        )

        track_ids = []
        for song in song_recommendations:
            search_result = sp.search(q=song, type="track", limit=1)
            if search_result["tracks"]["items"]:
                track_id = search_result["tracks"]["items"][0]["id"]
                track_ids.append(track_id)

        if track_ids:
            sp.playlist_add_items(playlist_id=playlist["id"], items=track_ids)

        return redirect(url_for("success", playlist_name=playlist_name))

    return render_template(
        "index.html",
        client_id=client_id,
        client_secret=client_secret,
        redirect_uri=redirect_uri,
    )

@app.route("/success")
def success():
    playlist_name = request.args.get("playlist_name", "")
    return render_template("success.html", playlist_name=playlist_name)

if __name__ == "__main__":
    app.run(debug=True)
