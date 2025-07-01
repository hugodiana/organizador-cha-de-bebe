# Arquivo: backend/app/__init__.py (Versão Corrigida Final)

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_login import LoginManager
from config import Config

db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
# A instância do CORS é criada aqui, mas será configurada depois
cors = CORS() 

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
    app.register_blueprint(api_blueprint, url_prefix='/api')

    # --- CORREÇÃO ESTÁ AQUI ---
    # Aplicamos a configuração do CORS diretamente no 'api_blueprint'
    # depois que ele foi criado e registrado. Isso é mais robusto.
    cors.init_app(
        app, 
        resources={r"/api/*": {
            "origins": [
                "http://localhost:5173", 
                "https://organizador-cha-de-bebe.vercel.app"
            ]
        }}, 
        supports_credentials=True
    )
    # -------------------------

    with app.app_context():
        db.create_all()

    return app

from app import models