# Arquivo: backend/app/models.py (Versão Corrigida)

from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

class Usuario(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    nome_completo = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    telefone = db.Column(db.String(20), nullable=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    data_cha = db.Column(db.DateTime, nullable=True)
    local_cha = db.Column(db.String(200), nullable=True)
    setup_completo = db.Column(db.Boolean, default=False, nullable=False)

    bebes = db.relationship('Bebe', backref='organizador', lazy='dynamic', cascade="all, delete-orphan")
    convidados = db.relationship('Convidado', backref='organizador', lazy='dynamic', cascade="all, delete-orphan")
    gastos = db.relationship('Gasto', backref='organizador', lazy='dynamic', cascade="all, delete-orphan")
    checklist_items = db.relationship('ChecklistItem', backref='organizador', lazy='dynamic', cascade="all, delete-orphan") # Relacionamento para o checklist

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Bebe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    sexo = db.Column(db.String(50))
    user_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)

class Gasto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    descricao = db.Column(db.String(200), nullable=False)
    fornecedor = db.Column(db.String(150))
    valor = db.Column(db.Float, nullable=False)
    metodo_pagamento = db.Column(db.String(50), nullable=False)
    data_gasto = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)

class Convidado(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(150), nullable=False)
    convidado_principal_id = db.Column(db.Integer, db.ForeignKey('convidado.id'), nullable=True)
    familia = db.relationship('Convidado', backref=db.backref('principal', remote_side=[id]))
    user_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)

# --- CLASSE QUE FALTAVA ---
class ChecklistItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tarefa = db.Column(db.String(300), nullable=False)
    concluido = db.Column(db.Boolean, default=False, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)