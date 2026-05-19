import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

flask_app = Flask(__name__)
flask_app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
env_origins = os.getenv("CORS_ORIGINS", "")
extra_origins = [o.strip() for o in env_origins.split(",") if o.strip()]
CORS_ORIGINS = DEFAULT_ORIGINS + extra_origins

CORS(
    flask_app,
    origins=CORS_ORIGINS,
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    supports_credentials=True,
)

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
