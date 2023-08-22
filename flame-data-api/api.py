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
    """@api {get} /api/species/connectivity Get all species connectivities

    @apiQuery formula {String} A formula to search for, e.g. 'CH4O'
    @apiQuery partial If present, allows for partial formula matches
    @apiSuccess {Object[]} species An array of objects with keys `conn_id`, `formula`,
        `conn_smiles`, `conn_inchi`, `conn_inchi_hash`, `conn_amchi`, `conn_amchi_hash`
    """
    fml_str = flask.request.args.get("formula")
    is_partial = flask.request.args.get("partial") is not None
    species_conns = flame_data_api.query.search_species_connectivities(
        fml_str, is_partial
    )
    return flame_data_api.response(200, contents=species_conns)


@app.route("/api/reaction/connectivity", methods=["GET"])
def get_reaction_connectivities():
    """@api {get} /api/reaction/connectivity Get all reaction connectivities

    @apiQuery formula {String} A formula to search for, e.g. 'CH4O'
    @apiQuery partial If present, allows for partial formula matches
    @apiSuccess {Object[]} reaction An array of objects with keys `conn_id`, `formula`,
        `conn_smiles`, `conn_inchi`, `conn_inchi_hash`, `conn_amchi`, `conn_amchi_hash`
    """
    fml_str = flask.request.args.get("formula")
    is_partial = flask.request.args.get("partial") is not None
    reaction_conns = flame_data_api.query.search_reaction_connectivities(
        fml_str, is_partial
    )
    return flame_data_api.response(200, contents=reaction_conns)


@app.route("/api/species/connectivity", methods=["POST"])
def add_species_connectivity():
    """@api {post} /api/species/connectivity Add a new species connectivity

    @apiBody {String[]} smiles A SMILES string for the species to be added
    """
    user = get_user()
    if user is None:
        return flame_data_api.response(401, error="Unauthorized")
    coll_id = flame_data_api.query.lookup_user_collection(
        user["id"], "My Data", id_only=True
    )

    smi = flask.request.json.get("smiles")

    # 1. Add the species
    status, error = flame_data_api.query.add_species_by_smiles_connectivity(smi)
    if status >= 400:
        return flame_data_api.response(status, error=error)

    # 2. Look up the connectivity ID
    id = flame_data_api.query.lookup_species_connectivity(smi, id_only=True)
    print("The ID for this connectivity is", id)

    # 3. Add these species to the user's "My Data" collection
    print(f"Adding the species to collection {coll_id}")
    flame_data_api.query.add_species_connectivity_to_collection(coll_id, id)

    return flame_data_api.response(201)


@app.route("/api/reaction/connectivity", methods=["POST"])
def add_reaction_connectivity():
    """@api {post} /api/reaction/connectivity Add a new reaction connectivity

    @apiBody {String[]} smiles A SMILES string for the reaction to be added
    """
    user = get_user()
    if user is None:
        return flame_data_api.response(401, error="Unauthorized")

    smi = flask.request.json.get("smiles")
    status, error = flame_data_api.query.add_reaction_by_smiles_connectivity(smi)
    if status >= 400:
        return flame_data_api.response(status, error=error)

    id = flame_data_api.query.lookup_reaction_connectivity(smi, id_only=True)
    print("The ID for this connectivity is", id)

    # 3. Add these reaction to the user's "My Data" collection
    coll_id = flame_data_api.query.lookup_user_collection(
        user["id"], "My Data", id_only=True
    )
    if coll_id is not None:
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
    coll_id = flame_data_api.query.lookup_user_collection(
        user["id"], "My Data", id_only=True
    )

    smis = flask.request.json.get("smilesList")
    for smi in smis:
        # 1. Add the species
        status, error = flame_data_api.query.add_species_by_smiles_connectivity(smi)
        if status >= 400:
            return flame_data_api.response(status, error=error)

        # 2. Look up the connectivity ID
        id = flame_data_api.query.lookup_species_connectivity(smi, id_only=True)
        print("The ID for this connectivity is", id)

        # 3. Add these species to the user's "My Data" collection
        print(f"Adding the species to collection {coll_id}")
        flame_data_api.query.add_species_connectivity_to_collection(coll_id, id)

    return flame_data_api.response(201)


@app.route("/api/species/connectivity/<id>", methods=["GET"])
def get_species_details_by_connectivity(id):
    """@api {get} /api/species/connectivity/:id Get details for one connectivity species

    @apiparam {Number} id The ID of the connectivity species
    @apiSuccess {Object[]} species An array of objects with keys `id`, `geometry`,
        `smiles`, `inchi`, `amchi`, `amchi_key`, `estate_id`, `spin_mult`, `conn_id`,
        `formula`, `svg_string`, `conn_smiles`, `conn_inchi`, `conn_inchi_hash`,
        `conn_amchi`, `conn_amchi_hash`
    """
    species_data = flame_data_api.query.get_species_by_connectivity(id)
    return flame_data_api.response(200, contents=species_data)


@app.route("/api/reaction/connectivity/<id>", methods=["GET"])
def get_reaction_details_by_connectivity(id):
    """@api {get} /api/reaction/connectivity/:id Get details for one connectivity reaction

    @apiparam {Number} id The ID of the connectivity reaction
    @apiSuccess {Object[]} reaction An array of objects with keys `id`, `geometry`,
        `smiles`, `inchi`, `amchi`, `amchi_key`, `estate_id`, `spin_mult`, `conn_id`,
        `formula`, `svg_string`, `conn_smiles`, `conn_inchi`, `conn_inchi_hash`,
        `conn_amchi`, `conn_amchi_hash`
    """
    reaction_data = flame_data_api.query.get_reactions_by_connectivity(id)
    return flame_data_api.response(200, contents=reaction_data)


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


@app.route("/api/reaction/connectivity/<id>", methods=["DELETE"])
def delete_reaction_connectivity(id):
    """@api {delete} /api/reaction/connectivity/:id Delete one connectivity reaction

    @apiparam {Number} id The ID of the connectivity reaction
    """
    if get_user() is None:
        return flame_data_api.response(401, error="Unauthorized")

    status, error = flame_data_api.query.delete_reaction_connectivity(id)
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


@app.route("/api/reaction/ts/<id>", methods=["PUT"])
def update_reaction_geometry(id):
    """@api {put} /api/reaction/ts/:id Edit a TS geometry of one reaction

    @apiparam {Number} id The ID of the reaction
    @apiBody {String} geometry The new geometry for this TS
    """
    if get_user() is None:
        return flame_data_api.response(401, error="Unauthorized")

    xyz_str = flask.request.json.get("geometry")

    status, error = flame_data_api.query.update_reaction_ts_geometry(id, xyz_str)
    if status >= 400:
        return flame_data_api.response(status, error=error)

    return flame_data_api.response(204)


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
        reaction_rows = flame_data_api.query.get_collection_reactions(coll_id)
        if species_rows:
            coll_row["species"] = species_rows
            coll_row["reactions"] = reaction_rows

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
    @apiBody {Number[]} conn_ids The IDs of the species connectivities to be added
    """
    user = get_user()
    if user is None:
        return flame_data_api.response(401, error="Unauthorized")

    conn_ids = flask.request.json.get("conn_ids")

    for conn_id in conn_ids:
        print(f"Adding species connectivity {conn_id} to collection {id}")
        flame_data_api.query.add_species_connectivity_to_collection(id, conn_id)

    return flame_data_api.response(201)


@app.route("/api/collection/reaction/<id>", methods=["POST"])
def add_reaction_connectivities_to_user_collection(id):
    """@api {post} /api/collection/reaction/:id Add reaction to a collection

    @apiParam {Number} id The ID of the collection
    @apiBody {Number[]} conn_ids The IDs of the reaction connectivities to be added
    """
    user = get_user()
    if user is None:
        return flame_data_api.response(401, error="Unauthorized")

    conn_ids = flask.request.json.get("conn_ids")

    for conn_id in conn_ids:
        print(f"Adding reaction connectivity {conn_id} to collection {id}")
        flame_data_api.query.add_reaction_connectivity_to_collection(id, conn_id)

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

    conn_ids = flask.request.json.get("conn_ids")

    for conn_id in conn_ids:
        print(f"Adding connectivity {conn_id} to collection {id}")
        flame_data_api.query.remove_species_connectivity_from_collection(id, conn_id)

    return flame_data_api.response(204)


@app.route("/api/collection/reaction/<id>", methods=["DELETE"])
def remove_reaction_connectivities_from_user_collection(id):
    """@api {delete} /api/collection/reaction/:id Remove reaction from a collection

    @apiParam {Number} id The ID of the collection
    @apiBody {Number[]} conn_ids The IDs of the connectivities to be removed
    """
    user = get_user()
    if user is None:
        return flame_data_api.response(401, error="Unauthorized")

    conn_ids = flask.request.json.get("conn_ids")

    for conn_id in conn_ids:
        print(f"Adding connectivity {conn_id} to collection {id}")
        flame_data_api.query.remove_reaction_connectivity_from_collection(id, conn_id)

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


# Helpers
def get_user() -> dict:
    """Get information about the current user"""
    user = None
    user_id = flask.session.get("user_id", None)

    if user_id is not None:
        user = flame_data_api.query.get_user(user_id)

    return user
