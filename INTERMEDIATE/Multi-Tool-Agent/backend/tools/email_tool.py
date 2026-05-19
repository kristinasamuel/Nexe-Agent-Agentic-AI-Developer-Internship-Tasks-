import os
import smtplib
from email.message import EmailMessage
from agents import function_tool
from dotenv import load_dotenv

load_dotenv()

# Configuration from environment variables
EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD") # This should be a Gmail App Password
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))

@function_tool
def send_email(recipient: str, subject: str, body: str):
    """
    Sends an email using SMTP.
    
    Args:
        recipient (str): The email address of the receiver.
        subject (str): The subject line of the email.
        body (str): The main content/body of the email.
    """
    if not EMAIL_SENDER or not EMAIL_PASSWORD:
        return {
            "status": "error", 
            "message": "Email credentials (EMAIL_SENDER/EMAIL_PASSWORD) not found in .env. Please add them."
        }

    msg = EmailMessage()
    msg.set_content(body)
    msg["Subject"] = subject
    msg["From"] = EMAIL_SENDER
    msg["To"] = recipient

    try:
        # Using a more robust SMTP connection pattern
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=15)
        server.set_debuglevel(1) # Enable debug output in console
        server.starttls()
        server.login(EMAIL_SENDER, EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        return {"status": "success", "message": f"Email sent successfully to {recipient}."}
    except smtplib.SMTPAuthenticationError:
        return {
            "status": "error", 
            "message": "SMTP Authentication failed. Check your EMAIL_SENDER and EMAIL_PASSWORD (use an App Password for Gmail)."
        }
    except Exception as e:
        print(f"SMTP Error: {e}")
        return {"status": "error", "message": f"Failed to send email: {str(e)}"}
