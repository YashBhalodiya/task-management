from flask import request, jsonify, g
from app.tasks import tasks_bp
from app.utils.db import query_one, query_all, execute_write, execute_write_returning
from app.utils.auth_decorator import login_required

TASK_SELECT_QUERY = """
    SELECT 
        t.id, t.title, t.description, t.status, t.created_at, t.updated_at,
        c.id AS creator_id, c.name AS creator_name, c.email AS creator_email, c.avatar_url AS creator_avatar,
        a.id AS assignee_id, a.name AS assignee_name, a.email AS assignee_email, a.avatar_url AS assignee_avatar
    FROM tasks t
    JOIN users c ON t.created_by = c.id
    LEFT JOIN users a ON t.assigned_to = a.id
"""

def format_task(row):
    if not row:
        return None
    return {
        "id": row["id"],
        "title": row["title"],
        "description": row["description"],
        "status": row["status"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
        "created_by": {
            "id": row["creator_id"],
            "name": row["creator_name"],
            "email": row["creator_email"],
            "avatar_url": row["creator_avatar"]
        },
        "assigned_to": {
            "id": row["assignee_id"],
            "name": row["assignee_name"],
            "email": row["assignee_email"],
            "avatar_url": row["assignee_avatar"]
        } if row["assignee_id"] else None
    }

@tasks_bp.route("/", methods=["POST"])
@login_required
def create_task():
    data = request.get_json() or {}
    title = data.get("title")
    description = data.get("description")
    assigned_to = data.get("assigned_to")
    
    if not title or not title.strip():
        return jsonify({"error": "Title is required"}), 400
        
    if assigned_to:
        assignee = query_one("SELECT id FROM users WHERE id = %s", (assigned_to,))
        if not assignee:
            return jsonify({"error": "Assigned user does not exist"}), 400

    row = execute_write_returning(
        """
        INSERT INTO tasks (title, description, status, created_by, assigned_to)
        VALUES (%s, %s, 'pending', %s, %s)
        RETURNING id
        """,
        (title.strip(), description, g.current_user["id"], assigned_to)
    )
    
    task = query_one(f"{TASK_SELECT_QUERY} WHERE t.id = %s", (row["id"],))

    if assigned_to:
        subject = f"New Task Assigned: {task['title']}"
        body = f"""
        <h3>Hello {task['assignee_name']},</h3>
        <p>You have been assigned a new task by <b>{task['creator_name']}</b>.</p>
        <p><b>Task Title:</b> {task['title']}</p>
        <p><b>Description:</b> {task['description'] or 'No description provided.'}</p>
        <p>Please log in to review it.</p>
        """
        from app.utils.email import send_email
        send_email(task['assignee_email'], subject, body)

    return jsonify(format_task(task)), 201

@tasks_bp.route("/", methods=["GET"])
@login_required
def get_all_tasks():
    rows = query_all(f"{TASK_SELECT_QUERY} ORDER BY t.created_at DESC")
    tasks = [format_task(row) for row in rows]
    return jsonify(tasks), 200

@tasks_bp.route("/<int:task_id>", methods=["GET"])
@login_required
def get_task_by_id(task_id):
    row = query_one(f"{TASK_SELECT_QUERY} WHERE t.id = %s", (task_id,))
    if not row:
        return jsonify({"error": "Task not found"}), 404
    return jsonify(format_task(row)), 200

@tasks_bp.route("/<int:task_id>/status", methods=["PUT"])
@login_required
def update_task_status(task_id):
    data = request.get_json() or {}
    status = data.get("status")
    
    if not status or status not in ["pending", "completed"]:
        return jsonify({"error": "Invalid or missing status. Allowed values: pending, completed"}), 400
        
    task = query_one(
        """
        SELECT t.id, t.title, t.status, t.created_by, t.assigned_to,
               c.email AS creator_email, c.name AS creator_name,
               a.name AS assignee_name
        FROM tasks t
        JOIN users c ON t.created_by = c.id
        LEFT JOIN users a ON t.assigned_to = a.id
        WHERE t.id = %s
        """,
        (task_id,)
    )
    if not task:
        return jsonify({"error": "Task not found"}), 404
        
    if g.current_user["id"] not in [task["created_by"], task["assigned_to"]]:
        return jsonify({"error": "You are not authorized to update this task status"}), 403

    execute_write(
        "UPDATE tasks SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
        (status, task_id)
    )
    
    if status == "completed" and task["status"] != "completed":
        subject = f"Task Completed: {task['title']}"
        assignee_name = task['assignee_name'] or "Someone"
        body = f"""
        <h3>Hello {task['creator_name']},</h3>
        <p>Your task <b>{task['title']}</b> has been marked as <b>completed</b> by <b>{assignee_name}</b>.</p>
        """
        from app.utils.email import send_email
        send_email(task['creator_email'], subject, body)

    updated_task = query_one(f"{TASK_SELECT_QUERY} WHERE t.id = %s", (task_id,))
    return jsonify(format_task(updated_task)), 200

@tasks_bp.route("/<int:task_id>", methods=["DELETE"])
@login_required
def delete_task(task_id):
    task = query_one("SELECT id, created_by FROM tasks WHERE id = %s", (task_id,))
    if not task:
        return jsonify({"error": "Task not found"}), 404
        
    if task["created_by"] != g.current_user["id"]:
        return jsonify({"error": "Only the task creator can delete this task"}), 403
        
    execute_write("DELETE FROM tasks WHERE id = %s", (task_id,))
    return jsonify({"message": "Task deleted successfully"}), 200
