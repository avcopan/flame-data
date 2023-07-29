export API_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
. $API_DIR/env/bin/activate
export PYTHONPATH=$API_DIR:$PYTHONPATH
conda deactivate
