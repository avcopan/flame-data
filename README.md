Steps used to create this repository:
```
npm create vite@latest react-flask-authentication-starter
cd react-flask-authentication-starter
npm install
mkdir api
cd api
python3 -m venv env
vi activate.sh
    ~ export API_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
    ~ . $API_DIR/env/bin/activate
    ~ export PYTHONPATH=$API_DIR:$PYTHONPATH
. activate.sh
vi requirements.txt
    ~ flask
    ~ python-dotenv
    ~ psycopg
    ~ flask-pg-session
    ~ flask-bcrypt
    ~ flask-cors
pip install -r requirements.txt
# Created database as described in api/database.sql
# For the server proxy, updated vite.config.js as follows:
    ~ export default defineConfig({
    ~   plugins: [react()],
    ~   server: {
    ~     proxy: {
    ~       "/api": {
    ~         target: "http://localhost:5000",
    ~         changeOrigin: true,
    ~         secure: false,
    ~         ws: true,
    ~       },
    ~     },
    ~   },
    ~ });
```
