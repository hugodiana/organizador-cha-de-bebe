from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_login import LoginManager
from config import Config

db = SQLAlchemy()
migrate = Migrate()
cors = CORS()
login_manager = LoginManager()

@login_manager.user_loader
def load_user(user_id):
    from app.models import Usuario
    return db.session.get(Usuario, int(user_id))

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    cors.init_app(
        app, 
        resources={r"/api/*": {"origins": "http://localhost:5173"}}, 
        supports_credentials=True
    )

    # Vamos registrar as rotas aqui em breve
    from app.routes import api as api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api')

    with app.app_context():
        db.create_all()

    return app

from app import models