import os
from flask import Flask, jsonify, request
from dotenv import load_dotenv

load_dotenv()

flask_app = Flask(__name__)
flask_app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
env_origins = os.getenv("CORS_ORIGINS", "")
ALLOWED_ORIGINS += [o.strip() for o in env_origins.split(",") if o.strip()]


@flask_app.before_request
def handle_preflight():
    if request.method == 'OPTIONS':
        origin = request.headers.get('Origin', '')
        res = flask_app.make_default_options_response()
        if origin in ALLOWED_ORIGINS:
            res.headers['Access-Control-Allow-Origin'] = origin
            res.headers['Access-Control-Allow-Credentials'] = 'true'
            res.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            res.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        return res


@flask_app.after_request
def add_cors(response):
    origin = request.headers.get('Origin', '')
    if origin in ALLOWED_ORIGINS:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response


from limiter import limiter
limiter.init_app(flask_app)

from routes.analyze import analyze_bp
from routes.submissions import submissions_bp
from routes.submission import submission_bp

flask_app.register_blueprint(analyze_bp)
flask_app.register_blueprint(submissions_bp)
flask_app.register_blueprint(submission_bp)


@flask_app.route('/health')
def health():
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    flask_app.run(debug=True, port=5000)
