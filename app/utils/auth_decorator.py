import jwt
from datetime import datetime, timezone, timedelta
from functools import wraps
from flask import request, jsonify, current_app, g
from app.utils.db import query_one

def generate_jwt(user_id, email, name):
    exp_hours = current_app.config.get("JWT_EXPIRATION_HOURS", 24)
    payload = {
        "user_id": user_id,
        "email": email,
        "name": name,
        "exp": datetime.now(timezone.utc) + timedelta(hours=exp_hours)
    }
    token = jwt.encode(
        payload, 
        current_app.config["JWT_SECRET"], 
        algorithm=current_app.config["JWT_ALGORITHM"]
    )
    return token

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
        if not token:
            return jsonify({"error": "Access token is missing"}), 401
            
        try:
            payload = jwt.decode(
                token, 
                current_app.config["JWT_SECRET"], 
                algorithms=[current_app.config["JWT_ALGORITHM"]]
            )
            user = query_one("SELECT id, google_id, name, email, avatar_url FROM users WHERE id = %s", (payload["user_id"],))
            if not user:
                return jsonify({"error": "User does not exist"}), 401
            g.current_user = user
            
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
            
        return f(*args, **kwargs)
        
    return decorated_function
