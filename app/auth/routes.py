from flask import request, jsonify, current_app
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.auth import auth_bp
from app.utils.db import query_one, execute_write, execute_write_returning
from app.utils.auth_decorator import generate_jwt, login_required

@auth_bp.route("/google", methods=["POST"])
def google_login():
    data = request.get_json() or {}
    token = data.get("id_token")
    
    if not token:
        return jsonify({"error": "Google ID token is required"}), 400
        
    google_client_id = current_app.config.get("GOOGLE_CLIENT_ID")
    if not google_client_id:
        return jsonify({"error": "Google Client ID is not configured on the server"}), 500
        
    try:
        id_info = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            google_client_id
        )
        
        if id_info.get("iss") not in ["accounts.google.com", "https://accounts.google.com"]:
            return jsonify({"error": "Invalid token issuer"}), 400
            
        google_id = id_info.get("sub")
        email = id_info.get("email")
        name = id_info.get("name")
        avatar_url = id_info.get("picture")
        
    except ValueError as e:
        return jsonify({"error": f"Invalid Google token: {str(e)}"}), 401
    except Exception as e:
        return jsonify({"error": "Google token verification failed"}), 500

    user = query_one("SELECT id, google_id, name, email, avatar_url FROM users WHERE google_id = %s", (google_id,))
    
    if not user:
        existing_user = query_one("SELECT id, google_id, name, email, avatar_url FROM users WHERE email = %s", (email,))
        if existing_user:
            execute_write(
                "UPDATE users SET google_id = %s, avatar_url = %s, name = %s WHERE id = %s",
                (google_id, avatar_url, name, existing_user["id"])
            )
            user = query_one("SELECT id, google_id, name, email, avatar_url FROM users WHERE id = %s", (existing_user["id"],))
        else:
            user = execute_write_returning(
                "INSERT INTO users (google_id, name, email, avatar_url) VALUES (%s, %s, %s, %s) RETURNING id, google_id, name, email, avatar_url",
                (google_id, name, email, avatar_url)
            )
    jwt_token = generate_jwt(user["id"], user["email"], user["name"])
    
    return jsonify({
        "token": jwt_token,
        "user": user
    }), 200
