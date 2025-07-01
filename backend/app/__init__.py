from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_bcrypt import Bcrypt  # Importa o Bcrypt
from config import Config

db = SQLAlchemy()
migrate = Migrate()
cors = CORS()
bcrypt = Bcrypt()  # Cria a instância do Bcrypt

# A função @login_manager.user_loader foi removida pois não é mais necessária

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)  # Inicializa o Bcrypt com o app

    # Importa o blueprint das rotas
    from app.routes import api as api_blueprint

    # Aplica o CORS diretamente ao blueprint
    CORS(api_blueprint, 
         supports_credentials=True, 
         origins=[
            "http://localhost:5173", 
            "https://organizador-cha-de-bebe.vercel.app"
         ]
    )
    
    app.register_blueprint(api_blueprint, url_prefix='/api')

    with app.app_context():
        db.create_all()

    return app

from app import models