from flask import Flask, render_template, request, redirect, url_for
import spotipy
import openai
from flask import request, redirect, url_for, session
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from spotipy.oauth2 import SpotifyOAuth
import os
from flask_session import Session

app = Flask(__name__)
app.config["SECRET_KEY"] = os.urandom(64)
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_FILE_DIR"] = "./.flask_session/"
Session(app)

load_dotenv()

# Load the environment variables
# client_id = os.getenv("SPOTIPY_CLIENT_ID")
# client_secret = os.getenv("SPOTIPY_CLIENT_SECRET")
redirect_uri = os.getenv("SPOTIPY_REDIRECT_URI")

openai_api_key = os.getenv("OPENAI_API_KEY")
openai_api_base_url = os.getenv("OPENAI_API_BASE_URL")

# Set the OpenAI API key and base URL
openai.api_key = openai_api_key
openai.api_base = openai_api_base_url


"""
Generate song suggestions based on a seed song.

:param seed_song: The seed song to generate suggestions from.
:type seed_song: str
:param num_suggestions: The number of song suggestions to generate, defaults to 10.
:type num_suggestions: int
:return: A list of song suggestions based on the seed song.
:rtype: List[str]

Available models: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-poe', 'gpt-3.5-turbo-poe', 'sage', 'dragonfly', 'claude-instant', 'claude+', 'claude-instant-100k']
"""


def generate_song_suggestions(seed_song, num_suggestions=20):
    prompt = f"Based on the song '{seed_song}', please suggest {num_suggestions} similar songs. I do not want any links, Youtube videos or other data. Just the artist name and song name. Please try to suggest songs that are as close to the song '{seed_song}' as possible."

    response = openai.ChatCompletion.create(
        model="gpt-4",      
        messages=[
            {"role": "user", "content": prompt},
        ],
        #temperature=0.7,
    )

    return response


"""
Route that searches for a song given the song name passed as a query parameter.
If the song name is not provided, returns a JSON error message with status code 400.
If the song is found, returns the preview URL of the first matching track as a JSON response.
If the song is not found, returns a JSON error message with status code 404.
:return: A JSON response with the preview URL of the song or an error message.
"""


@app.route("/search_song", methods=["GET"])
def search_song():
    song_name = request.args.get("song_name")
    cache_handler = spotipy.cache_handler.FlaskSessionCacheHandler(session)
    auth_manager = spotipy.oauth2.SpotifyOAuth(cache_handler=cache_handler)
    if not auth_manager.validate_token(cache_handler.get_cached_token()):
        return redirect("/")

    sp = spotipy.Spotify(auth_manager=auth_manager)
    if not song_name:
        return jsonify({"error": "No song name provided"}), 400

    results = sp.search(q=song_name, type="track", limit=1)
    if results and results["tracks"]["items"]:
        track = results["tracks"]["items"][0]
        song_url = track["preview_url"]
        return jsonify({"song_url": song_url})
    else:
        return jsonify({"error": "Song not found"}), 404


@app.route("/search_songs", methods=["GET"])
def search_songs():
    song_name = request.args.get("song_name")

    cache_handler = spotipy.cache_handler.FlaskSessionCacheHandler(session)
    auth_manager = spotipy.oauth2.SpotifyOAuth(cache_handler=cache_handler)
    if not auth_manager.validate_token(cache_handler.get_cached_token()):
        return redirect("/")

    sp = spotipy.Spotify(auth_manager=auth_manager)

    if not song_name:
        return jsonify({"error": "No song name provided"}), 400

    results = sp.search(
        q=song_name, type="track", limit=10
    )  # Change limit to the desired number of results

    if results and results["tracks"]["items"]:
        tracks = results["tracks"]["items"]
        track_data = [
            {
                "song_url": track["preview_url"],
                "song_name": track["name"],
                "artist_name": track["artists"][0]["name"],
                "album_image_url": track["album"]["images"][0]["url"],
            }
            for track in tracks
        ]
    return jsonify({"results": track_data})


"""
Defines a POST endpoint that generates song suggestions based on a given seed song.

Returns:
 A JSON object containing a list of suggested songs based on the seed song.
"""


@app.route("/generate_suggestions", methods=["POST"])
def generate_suggestions():
    data = request.get_json()
    seed_song = data.get("song")
    num_suggestions = int(data.get("numSuggestions", 20))
    suggestions = generate_song_suggestions(seed_song, num_suggestions)
    return jsonify(suggestions)


@app.route("/", methods=["GET"])
def index():
    cache_handler = spotipy.cache_handler.FlaskSessionCacheHandler(session)
    auth_manager = spotipy.oauth2.SpotifyOAuth(
        scope="playlist-modify-public playlist-read-private playlist-modify-private",
        cache_handler=cache_handler,
    )

    if request.args.get("code"):
        # Step 2. Being redirected from Spotify auth page
        auth_manager.get_access_token(request.args.get("code"))
        return redirect("/")

    signed_in = auth_manager.validate_token(cache_handler.get_cached_token())
    auth_url = auth_manager.get_authorize_url() if not signed_in else None

    return render_template(
        "index.html",
        redirect_uri=redirect_uri,
        auth_url=auth_url,
        signed_in=signed_in,
    )


"""
Endpoint that returns all playlists of the authenticated user.

:return: A JSON object containing a list of the current user's playlists.
:rtype: flask.Response
"""


@app.route("/playlists", methods=["GET"])
def playlists():
    cache_handler = spotipy.cache_handler.FlaskSessionCacheHandler(session)
    auth_manager = spotipy.oauth2.SpotifyOAuth(cache_handler=cache_handler)
    if not auth_manager.validate_token(cache_handler.get_cached_token()):
        return redirect("/")

    spotify = spotipy.Spotify(auth_manager=auth_manager)
    return spotify.current_user_playlists()


"""
Defines the index route for the web application. Handles GET and POST requests.
On a POST request, creates a Spotify playlist based on user input and adds recommended songs.
Returns a redirect to the success page on a successful POST request.
On a GET request, renders the index.html template with the necessary Spotify credentials.
:return: A redirect to the success page on a successful POST request. Otherwise, renders the index.html template.
"""


@app.route("/generate_playlist", methods=["POST"])
def create_playlist():
    if request.method == "POST":
        playlist_name = request.form["playlist_name"]
        playlist_description = request.form["playlist_description"]
        song_recommendations = request.form["song_recommendations"].splitlines()

        cache_handler = spotipy.cache_handler.FlaskSessionCacheHandler(session)
        auth_manager = spotipy.oauth2.SpotifyOAuth(cache_handler=cache_handler)

        sp = spotipy.Spotify(auth_manager=auth_manager)

        playlist = sp.user_playlist_create(
            name=playlist_name, description=playlist_description
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
        redirect_uri=redirect_uri,
    )


"""
Route decorator for importing song recommendations to an existing Spotify playlist.
Accepts POST requests with form data containing the playlist name and song recommendations.
Returns a redirect to the success page if the playlist is successfully updated, 
else returns the index page with an error message.
"""


@app.route("/import_to_existing_playlist", methods=["POST"])
def import_to_existing_playlist():
    if request.method == "POST":
        playlist_name = request.form["playlist_name"]
        song_recommendations = request.form["song_recommendations"].splitlines()

        if not playlist_name:
            return render_template(
                "index.html",
                redirect_uri=redirect_uri,
                error_message="Please select an existing playlist.",
            )

        cache_handler = spotipy.cache_handler.FlaskSessionCacheHandler(session)
        auth_manager = spotipy.oauth2.SpotifyOAuth(cache_handler=cache_handler)
        if not auth_manager.validate_token(cache_handler.get_cached_token()):
            return redirect("/")

        sp = spotipy.Spotify(auth_manager=auth_manager)

        track_ids = []
        for song in song_recommendations:
            search_result = sp.search(q=song, type="track", limit=1)
            if search_result["tracks"]["items"]:
                track_id = search_result["tracks"]["items"][0]["id"]
                track_ids.append(track_id)

        if track_ids:
            sp.playlist_add_items(playlist_id=playlist_name, items=track_ids)

        playlist = sp.playlist(playlist_id=playlist_name)
        playlist_name = playlist["name"]
        return redirect(url_for("success", playlist_name=playlist_name))

    return render_template(
        "index.html",
        redirect_uri=redirect_uri,
    )


"""
Renders the success.html template with the playlist_name parameter if it exists in the current request arguments.
"""


@app.route("/success")
def success():
    playlist_name = request.args.get("playlist_name", "")
    return render_template("success.html", playlist_name=playlist_name)


if __name__ == "__main__":
    app.run(debug=True)
