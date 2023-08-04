import automol
import flame_data_api
import flask
import flask_bcrypt

# Create a bcrypt instance
app = flame_data_api.start_app()
bcrypt = flask_bcrypt.Bcrypt(app)


# AUTHENTICATION ROUTES
@app.route("/api/@me", methods=["GET"])
def get_current_user():
    """@api {get} /api/@me Get user identity for this session, based on cookies

    @apiSuccess {Object} The user's information; keys `id`, `email`, `admin`
    """
    id = flask.session.get("user_id", None)
    if id is None:
        return flame_data_api.response(401, error="Unauthorized")

    user = flame_data_api.query.get_user(id)
    return flame_data_api.response(200, **user)


@app.route("/api/login", methods=["POST"])
def login_user():
    """@api {post} /api/login Login and start a new session with cookies

    @apiBody {String} email Email for authentication
    @apiBody {String} password Password for authentication
    @apiSuccess {Object} The user's information; keys `id`, `email`, `admin`
    """
    email = flask.request.json.get("email")
    password = flask.request.json.get("password")

    user = flame_data_api.query.get_user_by_email(email, return_password=True)
    # If the user doesn't exist or password doesn't match, return a 401
    if user is None or not bcrypt.check_password_hash(user["password"], password):
        return flame_data_api.response(401, error="Unauthorized")

    # Don't return the password
    user.pop("password")

    # Create a new session for the user
    flask.session["user_id"] = user["id"]

    return flame_data_api.response(200, **user)


@app.route("/api/logout", methods=["POST"])
def logout_user():
    """@api {post} /api/logout Logout and end this session, clearing cookies"""
    flask.session.pop("user_id")
    return flame_data_api.response(200)


@app.route("/api/register", methods=["POST"])
def register_user():
    """@api {post} /api/register Register as a new user and start a new session
    with cookies

    @apiBody {String} email Email for authentication
    @apiBody {String} password Password for authentication
    @apiSuccess {Object} The user's information; keys `id`, `email`, `admin`
    """
    email = flask.request.json.get("email")
    password = flask.request.json.get("password")

    if flame_data_api.query.get_user_by_email(email) is not None:
        return flame_data_api.response(
            409, error="A user with this email already exists"
        )

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    user = flame_data_api.query.add_user(email, hashed_password)

    # Create a new session for the user
    flask.session["user_id"] = user["id"]

    return flame_data_api.response(201, **user)


# SPECIES ROUTES
@app.route("/api/conn_species", methods=["GET"])
def get_connectivity_species():
    """@api {get} /api/conn_species Get all connectivity species

    @apiQuery formula {String} A formula to search for, e.g. 'CH4O'
    @apiQuery partial If present, allows for partial formula matches
    @apiSuccess {Object[]} species An array of objects with keys `conn_id`, `formula`,
        `conn_smiles`, `conn_inchi`, `conn_inchi_hash`, `conn_amchi`, `conn_amchi_hash`
    """
    fml_str = flask.request.args.get("formula")
    is_partial = flask.request.args.get("partial") is not None
    conn_species = flame_data_api.query.get_connectivity_species_grouped_by_formula(fml_str, is_partial)
    return flame_data_api.response(200, species=conn_species)


@app.route("/api/conn_species", methods=["POST"])
def add_connectivity_species_batch():
    """@api {post} /api/conn_species Add new connectivity species in batch

    @apiBody {String[]} smilesList A list of SMILES strings for the species to be added
    """
    smis = flask.request.json.get("smilesList")
    new_smis = flame_data_api.query.identify_missing_species_by_smiles(smis)
    print("Ignoring these species which are already present:", set(smis) - set(new_smis))
    for smi in new_smis:
        print(f"Attempting to add species {smi}")
        try:
            flame_data_api.query.add_species_by_smiles(smi)
            print("It worked!")
        except Exception as exc:
            print("It failed with this exception:", exc)

    return flame_data_api.response(201)
