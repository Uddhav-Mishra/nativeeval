from flask import Blueprint, jsonify
from db import get_client
from routes.auth import require_auth
from limiter import limiter

submissions_bp = Blueprint('submissions', __name__)


@submissions_bp.route('/api/submissions', methods=['GET'])
@limiter.limit("10 per minute")
def list_submissions():
    err = require_auth()
    if err:
        return err

    db = get_client()
    result = db.table('submissions').select(
        'id,candidate_name,status,created_at,scorecard,transcript_type,submitter_email'
    ).order('created_at', desc=True).execute()
    return jsonify(result.data)
