from flask import Flask, render_template, request, redirect, url_for
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
    auth_manager = spotipy.oauth2.SpotifyOAuth(
        scope="playlist-modify-public playlist-read-private playlist-modify-private",
    )

    auth_url = auth_manager.get_authorize_url()
    return render_template("index.html", auth_url=auth_url)

@app.route("/callback")
def callback():
    code = request.args.get("code")
    auth_manager = spotipy.oauth2.SpotifyOAuth()
    token_info = auth_manager.get_access_token(code)
    return redirect(url_for("index"))

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

if __name__ == "__main__":
    app.run(debug=True)
