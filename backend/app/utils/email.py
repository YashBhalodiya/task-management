import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from threading import Thread
import datetime
import traceback

def log_email_status(message):
    log_file_path = "email_debug.log"
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_line = f"[{timestamp}] {message}\n"
    try:
        with open(log_file_path, "a") as f:
            f.write(log_line)
    except Exception as e:
        print(f"Failed to write to email_debug.log: {e}")

def send_email_async(app, recipient, subject, body):
    with app.app_context():
        smtp_host = app.config.get("SMTP_HOST")
        smtp_port = app.config.get("SMTP_PORT")
        smtp_user = app.config.get("SMTP_USER")
        smtp_pass = app.config.get("SMTP_PASSWORD")
        email_from = app.config.get("EMAIL_FROM")

        log_email_status(f"Starting email send to {recipient} with subject '{subject}'...")

        if not all([smtp_host, smtp_port, smtp_user, smtp_pass, email_from]):
            log_email_status(
                f"ERROR: Email configuration is incomplete. Missing fields: "
                f"host={bool(smtp_host)}, port={bool(smtp_port)}, user={bool(smtp_user)}, pass={bool(smtp_pass)}, from={bool(email_from)}"
            )
            return

        try:
            msg = MIMEMultipart()
            msg["From"] = email_from
            msg["To"] = recipient
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "html"))

            log_email_status(f"Connecting to SMTP server {smtp_host}:{smtp_port}...")
            with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
                log_email_status("Starting TLS...")
                server.starttls()
                log_email_status("Logging in...")
                server.login(smtp_user, smtp_pass)
                log_email_status("Sending message...")
                server.send_message(msg)
                log_email_status(f"SUCCESS: Email sent successfully to {recipient}!")
        except Exception as e:
            err_msg = f"SMTP error while sending to {recipient}: {type(e).__name__} - {e}\n{traceback.format_exc()}"
            log_email_status(err_msg)

def send_email(recipient, subject, body):
    from flask import current_app
    app = current_app._get_current_object()
    Thread(target=send_email_async, args=(app, recipient, subject, body)).start()
