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

    return flame_data_api.response(200, contents=user)


@app.route("/api/login", methods=["POST"])
def login_user():
    """@api {post} /api/login Login and start a new session with cookies

    @apiBody {String} email Email for authentication
    @apiBody {String} password Password for authentication
    @apiSuccess {Object} The user's information; keys `id`, `email`, `admin`
    """
    email = flask.request.json.get("email")
    password = flask.request.json.get("password")

    user = flame_data_api.query.lookup_user(email, return_password=True)
    # If the user doesn't exist or password doesn't match, return a 401
    if user is None or not bcrypt.check_password_hash(user["password"], password):
        return flame_data_api.response(401, error="Unauthorized")

    # Don't return the password
    user.pop("password")

    # Create a new session for the user
    flask.session["user_id"] = user["id"]

    return flame_data_api.response(200, contents=user)


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

    if flame_data_api.query.lookup_user(email) is not None:
        return flame_data_api.response(
            409, error="A user with this email already exists"
        )

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    user = flame_data_api.query.add_user(email, hashed_password)

    # All users get a "My Data" collection to start with
    flame_data_api.query.add_user_collection(user["id"], "My Data")

    # Create a new session for the user
    flask.session["user_id"] = user["id"]

    return flame_data_api.response(201, contents=user)


# SPECIES/REACTION ROUTES
@app.route("/api/species/connectivity", methods=["GET"])
def get_species_connectivities():
    """@api {get} /api/species/connectivity Get all connectivity species

    @apiQuery formula {String} A formula to search for, e.g. 'CH4O'
    @apiQuery partial If present, allows for partial formula matches
    @apiSuccess {Object[]} species An array of objects with keys `conn_id`, `formula`,
        `conn_smiles`, `conn_inchi`, `conn_inchi_hash`, `conn_amchi`, `conn_amchi_hash`
    """
    fml_str = flask.request.args.get("formula")
    is_partial = flask.request.args.get("partial") is not None
    species_conns = flame_data_api.query.search_species_connectivities(fml_str, is_partial)
    return flame_data_api.response(200, contents=species_conns)


@app.route("/api/species/connectivity", methods=["POST"])
def add_species_connectivity():
    """@api {post} /api/species/connectivity Add a new species connectivity

    @apiBody {String[]} smiles A SMILES string for the species to be added
    """
    user = get_user()
    if user is None:
        return flame_data_api.response(401, error="Unauthorized")

    # 1. Check for already-existing species
    smi = flask.request.json.get("smiles")
    print(f"Adding connectivity {smi}")
    row = flame_data_api.query.lookup_species_connectivity(smi)
    if row:
        id = row["id"]
        print("This species already exists!")
    else:
        try:
            id = flame_data_api.query.add_species_by_smiles(smi)
            print("It worked!")
        except Exception as exc:
            error = f"Adding {smi} to database failed with this exception:\n{exc}"
            return flame_data_api.response(201, error=error)

    print("The ID for this connectivity is", id)

    # 3. Add these species to the user's "My Data" collection
    coll_row = flame_data_api.query.get_user_collection_by_name(user["id"], "My Data")
    if coll_row:
        coll_id = coll_row["id"]
        print(f"Adding the species to collection {coll_id}")
        flame_data_api.query.add_species_connectivity_to_collection(coll_id, id)

    return flame_data_api.response(201)


@app.route("/api/reaction/connectivity", methods=["POST"])
def add_reaction_connectivity():
    """@api {post} /api/reaction/connectivity Add a new reaction connectivity

    @apiBody {String[]} smiles A SMILES string for the reaction to be added, using
        the standard reaction SMILES format, e.g. 'CC.[OH]>>C[CH2].O'
    """
    user = get_user()
    if user is None:
        return flame_data_api.response(401, error="Unauthorized")

    # 1. Check for already-existing reaction
    smi = flask.request.json.get("smiles")
    print(f"Adding connectivity {smi}")
    row = flame_data_api.query.get_reaction_connectivity_by_smiles(smi)
    if row:
        id = row["id"]
        print("This reaction already exists!")
    else:
        try:
            id = flame_data_api.query.add_reaction_by_smiles(smi)
            print("It worked!")
        except Exception as exc:
            error = f"Adding {smi} to database failed with this exception:\n{exc}"
            return flame_data_api.response(201, error=error)

    print("The ID for this connectivity is", id)

    # 3. Add these reaction to the user's "My Data" collection
    coll_row = flame_data_api.query.get_user_collection_by_name(user["id"], "My Data")
    if coll_row:
        coll_id = coll_row["id"]
        print(f"Adding the reaction to collection {coll_id}")
        flame_data_api.query.add_reaction_connectivity_to_collection(coll_id, id)

    return flame_data_api.response(201)


@app.route("/api/species/connectivity/batch", methods=["POST"])
def add_species_connectivities():
    """@api {post} /api/species/connectivity Add new connectivity species in batch

    @apiBody {String[]} smilesList A list of SMILES strings for the species to be added
    """
    user = get_user()
    if user is None:
        return flame_data_api.response(401, error="Unauthorized")

    # 1. Check for already-existing species
    smis = flask.request.json.get("smilesList")
    id_dct = {}
    for smi in smis:
        print(f"Adding connectivity {smi}")
        row = flame_data_api.query.lookup_species_connectivity(smi)
        if row:
            print("This species already exists!")
            id_dct[smi] = row["id"]
        else:
            try:
                id = flame_data_api.query.add_species_by_smiles(smi)
                id_dct[smi] = id
                print("It worked!")
            except Exception as exc:
                print("It failed.", exc)

    print("IDs:", id_dct)

    # 3. Add these species to the user's "My Data" collection
    coll_row = flame_data_api.query.get_user_collection_by_name(user["id"], "My Data")
    print("coll_row:", coll_row)
    if coll_row:
        coll_id = coll_row["id"]
        for smi, id in id_dct.items():
            print(f"Adding {smi} to collection {coll_id}")
            flame_data_api.query.add_species_connectivity_to_collection(coll_id, id)

    return flame_data_api.response(201)


@app.route("/api/species/connectivity/<id>", methods=["GET"])
def get_species_data_for_connectivity(id):
    """@api {get} /api/species/connectivity/:id Get details for one connectivity species

    @apiparam {Number} id The ID of the connectivity species
    @apiSuccess {Object[]} species An array of objects with keys `id`, `geometry`,
        `smiles`, `inchi`, `amchi`, `amchi_key`, `estate_id`, `spin_mult`, `conn_id`,
        `formula`, `svg_string`, `conn_smiles`, `conn_inchi`, `conn_inchi_hash`,
        `conn_amchi`, `conn_amchi_hash`
    """
    species_data = flame_data_api.query.get_species_by_connectivity_id(id)
    return flame_data_api.response(200, contents=species_data)


@app.route("/api/species/connectivity/<id>", methods=["DELETE"])
def delete_species_connectivity(id):
    """@api {delete} /api/species/connectivity/:id Delete one connectivity species

    @apiparam {Number} id The ID of the connectivity species
    """
    if get_user() is None:
        return flame_data_api.response(401, error="Unauthorized")

    status, error = flame_data_api.query.delete_species_connectivity(id)
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


# COLLECTION ROUTES
@app.route("/api/collection", methods=["GET"])
def get_user_collections():
    """@api {get} /api/collection Get all collections for this user

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

    return flame_data_api.response(200, contents=coll_rows)


@app.route("/api/collection", methods=["POST"])
def add_user_collection():
    """@api {post} /api/collection Post a new collection for this user

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


@app.route("/api/collection/species/<id>", methods=["POST"])
def add_species_connectivities_to_user_collection(id):
    """@api {post} /api/collection/species/:id Add species to a collection

    @apiParam {Number} id The ID of the collection
    @apiBody {Number[]} conn_ids The IDs of the connectivities to be added
    """
    user = get_user()
    if user is None:
        return flame_data_api.response(401, error="Unauthorized")

    conn_ids = flask.request.json.get("conn_ids")

    for conn_id in conn_ids:
        print(f"Adding connectivity {conn_id} to collection {id}")
        flame_data_api.query.add_species_connectivity_to_collection(id, conn_id)

    return flame_data_api.response(201)


@app.route("/api/collection/species/<id>", methods=["DELETE"])
def remove_species_connectivities_from_user_collection(id):
    """@api {delete} /api/collection/species/:id Remove species from a collection

    @apiParam {Number} id The ID of the collection
    @apiBody {Number[]} conn_ids The IDs of the connectivities to be removed
    """
    user = get_user()
    if user is None:
        return flame_data_api.response(401, error="Unauthorized")

    print("HERE")
    conn_ids = flask.request.json.get("conn_ids")
    print(flask.request.json)

    for conn_id in conn_ids:
        print(f"Adding connectivity {conn_id} to collection {id}")
        flame_data_api.query.remove_species_connectivity_from_collection(id, conn_id)

    return flame_data_api.response(204)


@app.route("/api/collection/<id>", methods=["GET"])
def get_user_collection_data(id):
    """@api {get} /api/collection Get the data from a collection

    @apiParam {Number} id The ID of the collection

    @apiSuccess {Object} collection The data in the collection
    """
    user = get_user()
    if user is None:
        return flame_data_api.response(401, error="Unauthorized")

    name = flame_data_api.query.get_collection_name(id)
    species_data = flame_data_api.query.get_collection_species_data(id)

    coll_data = {"name": name, "species": species_data}
    return flame_data_api.response(200, contents=coll_data)


@app.route("/api/collection/<id>", methods=["DELETE"])
def delete_user_collection(id):
    """@api {get} /api/collection Get the data from a collection

    @apiParam {Number} id The ID of the collection

    @apiSuccess {Object} collection The data in the collection
    """
    user = get_user()
    if user is None:
        return flame_data_api.response(401, error="Unauthorized")

    status, error = flame_data_api.query.delete_collection(id)
    if status >= 400:
        return flame_data_api.response(status, error=error)

    return flame_data_api.response(204)
