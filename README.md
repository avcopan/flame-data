# FlameData

## Description

_Duration: 3 Week Sprint_

FlameData allows users to generate chemical data for combustion modelling.
It is specifically focused on generating and storing 3D structures for molecules (equilibrium structures) and reactions (transition state structures).


<!-- ## Video Demonstration

Include one or two screen shots of your project here (optional). Remove if unused. -->

## Prerequisites

The following software is required to run this app locally (recommended):

- [PostgreSQL](https://www.postgresql.org/)
- [Python Poetry](https://python-poetry.org/)
- [Node.js](https://nodejs.org/en/)

## Installation

1. Populate a new database using the queries in `database.sql`.
2. Define the following environment variables to enable a database connection:
```
FLASK_APP=flame_data/_app.py
SECRET_KEY=<your secret key>
DB_USER=<your postgres username>
DB_PASSWORD=<your postgres password>
DB_HOST=<use localhost if running locally>
DB_PORT=<probably 5432>
DB_NAME=<the databse name you chose in step 1>
```
3. Run `poetry install` in this directory, then `flask run`.
5. Run `npm install` in `./flame-data-frontend`, then `npm run dev` in that same directory.
6. That last command will give you a link to open the app in the browser.

## Usage

1. Register for an account.
2. Registered users automatically get a "My Data" collection, but you can create other named collections as well using the menu on the right.
3. You can search for species/reactions using their formulas.
4. Selecting species/reactions will cause a button to appear to add them to the currently selected collection.
5. Clicking on any of the species/reaction tiles will allow you to see 3D structures for it it, along with its chemical identifiers.
6. If any species/reactions are missing from your collection, you can add them by navigating to the "Submit" page using the dropdown menu.
7. Once you are happy with a collection, you can click the "Download" button to get all of the data in JSON format.


## Built With

- [Vite](https://vitejs.dev/)
- [Flask](https://flask.palletsprojects.com/)

## License
[MIT](https://choosealicense.com/licenses/mit/)

## Acknowledgement
Thanks to [Prime Digital Academy](www.primeacademy.io) who equipped and helped me to make this application a reality.
