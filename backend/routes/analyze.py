import uuid
import mimetypes
import requests as http_requests
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import config
from db import get_client
from parser import detect_type, parse_jsonl, parse_markdown, truncate
from scorer import score_transcript

analyze_bp = Blueprint('analyze', __name__)

BUCKET = 'transcripts'


def _check_bucket(bucket_id):
    url = f"{config.SUPABASE_URL}/storage/v1/bucket/{bucket_id}"
    r = http_requests.get(url, headers={"Authorization": f"Bearer {config.SUPABASE_SERVICE_KEY}"})
    return r.status_code == 200


def _ensure_bucket(bucket_id):
    if _check_bucket(bucket_id):
        return True
    url = f"{config.SUPABASE_URL}/storage/v1/bucket"
    headers = {"Authorization": f"Bearer {config.SUPABASE_SERVICE_KEY}", "Content-Type": "application/json"}
    r = http_requests.post(url, headers=headers, json={"id": bucket_id, "name": bucket_id, "public": False})
    return r.status_code in (200, 201)


def _upload(file_data, file_name, content_type):
    if not _ensure_bucket(BUCKET):
        return None
    url = f"{config.SUPABASE_URL}/storage/v1/object/{BUCKET}/{file_name}"
    headers = {"Authorization": f"Bearer {config.SUPABASE_SERVICE_KEY}", "Content-Type": content_type}
    r = http_requests.post(url, headers=headers, data=file_data)
    if r.status_code == 200:
        return f"{config.SUPABASE_URL}/storage/v1/object/{BUCKET}/{file_name}"
    return None


@analyze_bp.route('/api/analyze', methods=['POST'])
def analyze():
    candidate_name = request.form.get('candidate_name', '').strip()
    if not candidate_name:
        return jsonify({'error': 'candidate_name is required'}), 400

    email = request.form.get('email', '').strip() or None

    uploaded_file = request.files.get('file')
    pasted_text = request.form.get('text', '').strip()

    raw_text = None
    ext = None
    file_data = None
    unique_filename = None
    content_type = None

    if uploaded_file and uploaded_file.filename:
        original_filename = secure_filename(uploaded_file.filename)
        ext = original_filename.rsplit('.', 1)[-1].lower() if '.' in original_filename else 'txt'
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        content_type = mimetypes.guess_type(original_filename)[0] or 'text/plain'
        file_data = uploaded_file.read()
        raw_text = file_data.decode('utf-8', errors='replace')
    elif pasted_text:
        raw_text = pasted_text
    else:
        return jsonify({'error': 'Provide a file or text'}), 400

    transcript_type = detect_type(raw_text, ext)
    if transcript_type == 'jsonl':
        parsed = parse_jsonl(raw_text)
    else:
        parsed = parse_markdown(raw_text)
    parsed = truncate(parsed)

    db = get_client()
    row = db.table('submissions').insert({
        'candidate_name': candidate_name,
        'transcript_text': raw_text[:50000],
        'transcript_type': transcript_type,
        'submitter_email': email,
        'status': 'scoring',
    }).execute()

    submission_id = row.data[0]['id']
    transcript_url = None

    if file_data and unique_filename:
        transcript_url = _upload(file_data, unique_filename, content_type)

    try:
        scorecard = score_transcript(parsed)
        db.table('submissions').update({
            'scorecard': scorecard,
            'transcript_url': transcript_url,
            'status': 'scored',
        }).eq('id', submission_id).execute()
    except Exception as e:
        db.table('submissions').update({
            'status': 'error',
            'scorecard': {'error': str(e)},
        }).eq('id', submission_id).execute()
        return jsonify({'error': 'Scoring failed', 'details': str(e)}), 500

    return jsonify({'submission_id': submission_id, 'scorecard': scorecard})
