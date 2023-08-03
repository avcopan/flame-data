export API_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
. $API_DIR/.venv/bin/activate
export PYTHONPATH=$API_DIR:$PYTHONPATH
conda deactivate
