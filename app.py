from flask import Flask, render_template, request, redirect, url_for
import spotipy
import openai
from flask import request, redirect, url_for, session
from flask import Flask, request, jsonify
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
openai_api_key = os.getenv("OPENAI_API_KEY")
openai_api_base_url = os.getenv("OPENAI_API_BASE_URL")

# Set the OpenAI API key and base URL
openai.api_key = openai_api_key
openai.api_base = openai_api_base_url


# Create a Spotify OAuth object
sp_oauth = SpotifyOAuth(
    client_id=client_id,
    client_secret=client_secret,
    redirect_uri=redirect_uri,
    scope="playlist-modify-public",
    username=username,
)

"""
Generate song suggestions based on a seed song.

:param seed_song: The seed song to generate suggestions from.
:type seed_song: str
:param num_suggestions: The number of song suggestions to generate, defaults to 10.
:type num_suggestions: int
:return: A list of song suggestions based on the seed song.
:rtype: List[str]
"""
def generate_song_suggestions(seed_song, num_suggestions=10):
    prompt = f"Based on the song '{seed_song}', please suggest {num_suggestions} similar songs."

    response = openai.ChatCompletion.create(
    model='gpt-4',
    messages=[
        {'role': 'user', 'content': prompt},
    ]
)
    
    print("response: ", response)

    return response

    #suggestions = response.choices[0].text.strip().split("\n")
    #return suggestions[:num_suggestions]


"""
Defines a POST endpoint that generates song suggestions based on a given seed song.

Returns:
 A JSON object containing a list of suggested songs based on the seed song.
"""
@app.route('/generate_suggestions', methods=['POST'])
def generate_suggestions():
    data = request.get_json()
    seed_song = data.get('song')
    suggestions = generate_song_suggestions(seed_song)
    return jsonify(suggestions)

"""
This function is the callback endpoint for the application's OAuth2 authentication flow. 
It receives an authorization code from the user's grant, exchanges it for an access token, and stores the token in the user's session. 
If successful, the user is redirected to the application's index page. 
If the user does not provide a code or the token cannot be obtained, an error message is returned.
If successful, redirects the user to the application's index page. If unsuccessful, returns an error message string.
"""
@app.route("/callback")
def callback():
    code = request.args.get("code")
    if code:
        token_info = sp_oauth.get_access_token(code, as_dict=False)
        if token_info:
            session["token_info"] = token_info
            return redirect(url_for("index"))
    return "Error: No code provided or token not obtained."



@app.route("/", methods=["GET"])
def index():
    return render_template(
        "index.html",
        client_id=client_id,
        client_secret=client_secret,
        redirect_uri=redirect_uri,
    )


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

"""
Renders the success.html template with the playlist_name parameter if it exists in the current request arguments.
"""
@app.route("/success")
def success():
    playlist_name = request.args.get("playlist_name", "")
    return render_template("success.html", playlist_name=playlist_name)

if __name__ == "__main__":
    app.run(debug=True)
