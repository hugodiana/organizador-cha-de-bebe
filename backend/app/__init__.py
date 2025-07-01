# Arquivo: backend/app/__init__.py (Versão Final e Robusta)

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_login import LoginManager
from config import Config

db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
# Não precisamos mais do 'cors = CORS()' aqui

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

    # Importa o blueprint das rotas
    from app.routes import api as api_blueprint

    # --- CORREÇÃO ESTÁ AQUI ---
    # Aplicamos o CORS diretamente ao blueprint antes de registrá-lo.
    # Isso garante que todas as rotas em /api recebam as regras de CORS.
    CORS(api_blueprint, 
         supports_credentials=True, 
         origins=[
            "http://localhost:5173", 
            "https://organizador-cha-de-bebe.vercel.app"
         ]
    )

    app.register_blueprint(api_blueprint, url_prefix='/api')
    # -------------------------

    with app.app_context():
        db.create_all()

    return app

from app import models