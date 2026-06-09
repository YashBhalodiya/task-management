import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from threading import Thread

def send_email_async(app, recipient, subject, body):
    with app.app_context():
        smtp_host = app.config.get("SMTP_HOST")
        smtp_port = app.config.get("SMTP_PORT")
        smtp_user = app.config.get("SMTP_USER")
        smtp_pass = app.config.get("SMTP_PASSWORD")
        email_from = app.config.get("EMAIL_FROM")

        if not all([smtp_host, smtp_port, smtp_user, smtp_pass, email_from]):
            print("Email configuration is incomplete. Skipping email.")
            return

        try:
            msg = MIMEMultipart()
            msg["From"] = email_from
            msg["To"] = recipient
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "html"))

            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
        except Exception as e:
            print(f"SMTP error while sending to {recipient}: {e}")

def send_email(recipient, subject, body):
    from flask import current_app
    app = current_app._get_current_object()
    Thread(target=send_email_async, args=(app, recipient, subject, body)).start()
