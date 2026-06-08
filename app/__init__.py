from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    CORS(app)

    # db
    from app.utils.db import init_db
    init_db(app)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "message": "Task Management API is running"
        }), 200
        
    return app
