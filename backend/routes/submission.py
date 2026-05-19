from flask import Blueprint, jsonify
from db import get_client

submission_bp = Blueprint('submission', __name__)


@submission_bp.route('/api/submissions/<submission_id>', methods=['GET'])
def get_submission(submission_id):
    db = get_client()
    result = db.table('submissions').select('*').eq('id', submission_id).execute()
    if not result.data:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(result.data[0])


@submission_bp.route('/api/results', methods=['GET'])
def list_results():
    db = get_client()
    result = db.table('submissions').select(
        'id,candidate_name,transcript_type,scorecard,created_at'
    ).eq('status', 'scored').order('created_at', desc=True).execute()
    return jsonify(result.data)
