from flask import Flask, render_template, request, redirect, url_for
import os
import spotipy
import spotipy.util as util
from flask_session import Session

app = Flask(__name__)
app.config["SECRET_KEY"] = os.urandom(64)
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_FILE_DIR"] = "./.flask_session/"
Session(app)

@app.route("/")
def index():
    username = "your_spotify_username"
    scope = "playlist-modify-public playlist-read-private playlist-modify-private"
    token = util.prompt_for_user_token(username, scope)

    if token:
        sp = spotipy.Spotify(auth=token)
        return "Logged in successfully"
    else:
        return "Can't get token for", username

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

if __name__ == "__main__":
    app.run(debug=True)
