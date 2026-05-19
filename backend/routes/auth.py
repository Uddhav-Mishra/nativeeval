import base64
import config
from flask import request, jsonify


def check_basic_auth():
    header = request.headers.get('Authorization', '')
    if not header.startswith('Basic '):
        return False
    try:
        user, pw = base64.b64decode(header[6:]).decode().split(':', 1)
    except Exception:
        return False
    return user == config.DASHBOARD_USERNAME and pw == config.DASHBOARD_PASSWORD


def require_auth():
    if not check_basic_auth():
        return jsonify({'error': 'Unauthorized'}), 401
    return None
