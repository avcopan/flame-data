import flame_data_api
import flask
import flask_bcrypt

# Create a bcrypt instance
app = flame_data_api.start_app()
bcrypt = flask_bcrypt.Bcrypt(app)


# AUTHENTICATION ROUTES
@app.route("/api/@me", methods=["GET"])
def get_current_user():
    """@api {get} /api/@me Get user identity for the session, based on cookies

    @apiSuccess {Object} The user's information; keys `id`, `email`, `admin`
    """
    user = get_user()
    if user is None:
        return flame_data_api.response(401, error="Unauthorized")

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
    """@api {post} /api/logout Logout and end the session, clearing cookies"""
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

    # All users get a "My Data" collection to start with
    flame_data_api.query.add_user_collection(user["id"], "My Data")

    # Create a new session for the user
    flask.session["user_id"] = user["id"]

    return flame_data_api.response(201, **user)


# COLLECTION ROUTES
@app.route("/api/collections", methods=["GET"])
def get_user_collections():
    """@api {get} /api/collections Get all collections for this user

    @apiSuccess {Object[]} collections An array of objects with keys `id`, `name`
    """
    user = get_user()
    if user is None:
        return flame_data_api.response(401, error="Unauthorized")

    coll_rows = flame_data_api.query.get_user_collections(user["id"])
    for coll_row in coll_rows:
        coll_id = coll_row["id"]
        species_rows = flame_data_api.query.get_collection_species(coll_id)
        if species_rows:
            coll_row["species"] = species_rows
    return flame_data_api.response(200, collections=coll_rows)


@app.route("/api/collections", methods=["POST"])
def add_user_collection():
    """@api {post} /api/collections Post a new collection for this user

    @apiBody {String} name The name of the new collection

    @apiSuccess {Number} id The collection ID
    @apiSuccess {String} name The collection name
    """
    user = get_user()
    if user is None:
        return flame_data_api.response(401, error="Unauthorized")

    name = flask.request.json.get("name")
    print("The new collection name:", name)
    flame_data_api.query.add_user_collection(user["id"], name)

    return flame_data_api.response(201)


# SPECIES ROUTES
@app.route("/api/conn_species", methods=["GET"])
def get_species_connectivities():
    """@api {get} /api/conn_species Get all connectivity species

    @apiQuery formula {String} A formula to search for, e.g. 'CH4O'
    @apiQuery partial If present, allows for partial formula matches
    @apiSuccess {Object[]} species An array of objects with keys `conn_id`, `formula`,
        `conn_smiles`, `conn_inchi`, `conn_inchi_hash`, `conn_amchi`, `conn_amchi_hash`
    """
    fml_str = flask.request.args.get("formula")
    is_partial = flask.request.args.get("partial") is not None
    conn_species = flame_data_api.query.get_species_connectivities(fml_str, is_partial)
    return flame_data_api.response(200, species=conn_species)


@app.route("/api/conn_species", methods=["POST"])
def add_species_connectivities_batch():
    """@api {post} /api/conn_species Add new connectivity species in batch

    @apiBody {String[]} smilesList A list of SMILES strings for the species to be added
    """
    user = get_user()
    if user is None:
        return flame_data_api.response(401, error="Unauthorized")

    smis = flask.request.json.get("smilesList")
    smi_dct = {}
    for smi in smis:
        row = flame_data_api.query.get_species_connectivity_by_smiles(smi)
        if row:
            smi_dct[smi] = row["conn_id"]

    print("These were already present:", list(smi_dct.keys()))

    for smi in smis:
        if smi not in smi_dct:
            print(f"Adding {smi}, which was not already present")
            try:
                conn_id = flame_data_api.query.add_species_by_smiles(smi)
                smi_dct[smi] = conn_id
                print("It worked!")
            except Exception as exc:
                print("It failed :(", exc)

    print("IDs:", smi_dct)
    coll_row = flame_data_api.query.get_user_collection_by_name(user["id"], "My Data")
    print("coll_row:", coll_row)
    if coll_row:
        coll_id = coll_row["id"]
        for smi, conn_id in smi_dct.items():
            print(f"Adding {smi} to collection {coll_id}")
            flame_data_api.query.add_species_connectivity_to_collection(
                coll_id, conn_id
            )

    return flame_data_api.response(201)


@app.route("/api/conn_species/<conn_id>", methods=["GET"])
def get_species_with_connectivity(conn_id):
    """@api {get} /api/conn_species/:conn_id Get details for one connectivity species

    @apiparam {Number} conn_id The ID of the connectivity species
    @apiSuccess {Object[]} species An array of objects with keys `id`, `geometry`,
        `smiles`, `inchi`, `amchi`, `amchi_key`, `estate_id`, `spin_mult`, `conn_id`,
        `formula`, `svg_string`, `conn_smiles`, `conn_inchi`, `conn_inchi_hash`,
        `conn_amchi`, `conn_amchi_hash`
    """
    conn_species_details = flame_data_api.query.get_species_by_connectivity_id(conn_id)
    return flame_data_api.response(200, species=conn_species_details)


@app.route("/api/conn_species/<conn_id>", methods=["DELETE"])
def delete_species_connectivity(conn_id):
    """@api {delete} /api/conn_species/:conn_id Delete one connectivity species

    @apiparam {Number} conn_id The ID of the connectivity species
    @apiSuccess {Object[]} species An array of objects with keys `id`, `geometry`,
        `smiles`, `inchi`, `amchi`, `amchi_key`, `estate_id`, `spin_mult`, `conn_id`,
        `formula`, `svg_string`, `conn_smiles`, `conn_inchi`, `conn_inchi_hash`,
        `conn_amchi`, `conn_amchi_hash`
    """
    if get_user() is None:
        return flame_data_api.response(401, error="Unauthorized")

    status, error = flame_data_api.query.delete_species_connectivity(conn_id)
    if status >= 400:
        return flame_data_api.response(status, error=error)

    return flame_data_api.response(204)


@app.route("/api/species/<id>", methods=["PUT"])
def update_species_geometry(id):
    """@api {put} /api/species/:id Edit the geometry of one species

    @apiparam {Number} id The ID of the species
    @apiBody {String} geometry The new geometry for this species
    """
    if get_user() is None:
        return flame_data_api.response(401, error="Unauthorized")

    xyz_str = flask.request.json.get("geometry")

    status, error = flame_data_api.query.update_species_geometry(id, xyz_str)
    if status >= 400:
        return flame_data_api.response(status, error=error)

    return flame_data_api.response(204)


# Helpers
def get_user() -> dict:
    """Get information about the current user"""
    user = None
    user_id = flask.session.get("user_id", None)

    if user_id is not None:
        user = flame_data_api.query.get_user(user_id)

    return user
