import flask
import flask_bcrypt
import api_utils

# Create a bcrypt instance
app = api_utils.start_app()
bcrypt = flask_bcrypt.Bcrypt(app)


@app.route("/api/@me")
def get_current_user():
    # Get the current session for this user based on cookie
    id = flask.session.get("user_id", None)
    if id is None:
        return api_utils.response(401, error="Unauthorized")

    user = api_utils.query.get_user(id)
    return api_utils.response(200, **user)


@app.route("/api/login", methods=["POST"])
def login_user():
    email = flask.request.json.get("email")
    password = flask.request.json.get("password")

    user = api_utils.query.get_user_by_email(email, return_password=True)
    # If the user doesn't exist or password doesn't match, return a 401
    if user is None or not bcrypt.check_password_hash(user["password"], password):
        return api_utils.response(401, error="Unauthorized")

    # Don't return the password
    user.pop("password")

    # Create a new session for the user
    flask.session["user_id"] = user["id"]

    return api_utils.response(200, **user)


@app.route("/api/logout", methods=["POST"])
def logout_user():
    # Remove the current session for this user based on cookie
    flask.session.pop("user_id")
    return api_utils.response(200)


@app.route("/api/register", methods=["POST"])
def register_user():
    email = flask.request.json.get("email")
    password = flask.request.json.get("password")

    if api_utils.query.get_user_by_email(email) is not None:
        return api_utils.response(409, error="A user with this email already exists")

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    user = api_utils.query.add_user(email, hashed_password)

    # Create a new session for the user
    flask.session["user_id"] = user["id"]

    return api_utils.response(201, **user)
