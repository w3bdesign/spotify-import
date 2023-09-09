from flask import Flask, render_template, request, redirect
import os
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from flask_session import Session

app = Flask(__name__)
app.config["SECRET_KEY"] = os.urandom(64)
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_FILE_DIR"] = "./.flask_session/"
Session(app)

@app.route("/")
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
        auth_url=auth_url,
        signed_in=signed_in,
    )

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

if __name__ == "__main__":
    app.run(debug=True)
