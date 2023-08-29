import os

import dotenv
import flask
import flask_cors
import flask_session
import flask_sqlalchemy
import sqlalchemy

dotenv.load_dotenv()


def start_app():
    app = flask.Flask(__name__)
    app.config.update(
        SECRET_KEY=os.getenv("SECRET_KEY"),
        SESSION_TYPE="sqlalchemy",
        SESSION_USE_SIGNER=True,
        SQLALCHEMY_DATABASE_URI=sqlalchemy.engine.URL.create(
            "postgresql+psycopg",
            username=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            database=os.getenv("DB_NAME"),
        ),
        SQLALCHEMY_ENGINE_OPTIONS={"pool_pre_ping": True},
    )

    # Create the database instance
    db = flask_sqlalchemy.SQLAlchemy(app)
    app.config["SESSION_SQLALCHEMY"] = db
    # Start the session
    flask_session.Session(app)
    # Create the `sessions` table in the database
    with app.app_context():
        db.create_all()

    # Allow credentials in CORS
    flask_cors.CORS(app, supports_credentials=True)

    return app
