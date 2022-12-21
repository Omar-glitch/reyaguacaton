from dotenv import load_dotenv
from os import getenv

load_dotenv()

class Config():
    SECRET_KEY = getenv("SECRET_KEY")
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_SSL = False
    MAIL_USE_TLS = True
    MAIL_USERNAME = getenv("MAIL_USERNAME")
    MAIL_PASSWORD = getenv("MAIL_PASSWORD")
    UPLOAD_FOLDER = f'./static/imgR'
    ALLOWED_EXTENSIONS = {'png', 'jpg'}
    MONGO_URI = getenv("MONGO_URI")
    MAX_CONTENT_LENGHT = 16 * 1024 * 1024
    RECAPTCHA_PUBLIC_KEY = getenv("RECAPTCHA_PUBLIC_KEY")
    RECAPTCHA_PRIVATE_KEY = getenv("RECAPTCHA_PRIVATE_KEY")
    RECAPTCHA_DATA_ATTRS = {"size": "invisible", "bind": "enviar", "callback": "onSubmit", "badge": "bottomright"}
    RECAPTCHA_PARAMETERS = {"onload": "onSubmit", "render": "onload"}

class DevelopmentConfig(Config):
    DEBUG = True