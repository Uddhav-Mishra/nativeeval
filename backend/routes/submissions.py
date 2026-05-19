import base64
from flask import Blueprint, request, jsonify
import config
from db import get_client

submissions_bp = Blueprint('submissions', __name__)


def check_basic_auth():
    header = request.headers.get('Authorization', '')
    if not header.startswith('Basic '):
        return False
    try:
        user, pw = base64.b64decode(header[6:]).decode().split(':', 1)
    except Exception:
        return False
    return user == config.DASHBOARD_USERNAME and pw == config.DASHBOARD_PASSWORD


@submissions_bp.route('/api/submissions', methods=['GET'])
def list_submissions():
    if not check_basic_auth():
        resp = jsonify({'error': 'Unauthorized'})
        resp.headers['WWW-Authenticate'] = 'Basic realm="dashboard"'
        return resp, 401

    db = get_client()
    result = db.table('submissions').select(
        'id,candidate_name,status,created_at,scorecard,transcript_type,submitter_email'
    ).order('created_at', desc=True).execute()
    return jsonify(result.data)
