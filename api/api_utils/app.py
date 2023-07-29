import os
import flask
import flask_session
import flask_cors
import flask_sqlalchemy
import sqlalchemy
import dotenv

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
            host="localhost",
            port="5432",
            database=os.getenv("DB_NAME"),
        ),
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
