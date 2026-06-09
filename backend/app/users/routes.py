from flask import jsonify
from app.users import users_bp
from app.utils.db import query_all
from app.utils.auth_decorator import login_required

@users_bp.route("/", methods=["GET"])
@login_required
def get_all_users():
    users = query_all("SELECT id, name, email, avatar_url, created_at FROM users ORDER BY name ASC")
    return jsonify(users), 200
