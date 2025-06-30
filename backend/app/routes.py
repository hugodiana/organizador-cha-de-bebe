from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from datetime import datetime

from app import db
from app.models import Usuario, Bebe, Gasto, Convidado 

api = Blueprint('api', __name__)

# --- ROTAS DE AUTENTICAÇÃO ---

@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not all(key in data for key in ['username', 'password', 'nome_completo', 'email']):
        return jsonify({'message': 'Dados faltando. Todos os campos são obrigatórios.'}), 400
    if Usuario.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Este nome de usuário já está em uso.'}), 409
    if Usuario.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Este email já está cadastrado.'}), 409
    novo_usuario = Usuario(
        username=data['username'],
        nome_completo=data['nome_completo'],
        email=data['email'],
        telefone=data.get('telefone')
    )
    novo_usuario.set_password(data['password'])
    db.session.add(novo_usuario)
    db.session.commit()
    return jsonify({'message': 'Usuário registrado com sucesso!'}), 201

@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = Usuario.query.filter_by(username=data.get('username')).first()
    if user and user.check_password(data.get('password')):
        login_user(user)
        return jsonify({
            'message': 'Login realizado com sucesso!',
            'user': { 'username': user.username, 'nome_completo': user.nome_completo, 'setup_completo': user.setup_completo }
        })
    return jsonify({'message': 'Credenciais inválidas.'}), 401

@api.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logout realizado com sucesso!'})

@api.route('/status', methods=['GET'])
def status():
    if current_user.is_authenticated:
        return jsonify({
            'is_logged_in': True,
            'user': { 'username': current_user.username, 'nome_completo': current_user.nome_completo, 'setup_completo': current_user.setup_completo }
        })
    else:
        return jsonify({'is_logged_in': False})


# --- ROTA DE PERSONALIZAÇÃO (PÓS-CADASTRO) ---
# A ROTA QUE FALTAVA ESTÁ AQUI:
# ----------------------------------------------------------------
@api.route('/personalizar', methods=['POST'])
@login_required # Garante que apenas um usuário logado pode personalizar
def personalizar_cha():
    data = request.get_json()
    user = current_user # Pega o usuário da sessão atual

    if not data or 'bebes' not in data or not data['bebes']:
        return jsonify({'message': 'Os dados do bebê são obrigatórios.'}), 400

    # Salva a data do chá (se foi informada)
    if data.get('data_cha'):
        user.data_cha = datetime.strptime(data['data_cha'], '%Y-%m-%d')

    # Salva os dados de cada bebê
    for bebe_data in data['bebes']:
        if bebe_data.get('nome'): # Garante que não salve um bebê sem nome
            novo_bebe = Bebe(
                nome=bebe_data['nome'],
                sexo=bebe_data['sexo'],
                organizador=user # Associa o bebê ao usuário logado
            )
            db.session.add(novo_bebe)

    # Marca o setup como completo para não pedir novamente
    user.setup_completo = True
    db.session.commit()

    return jsonify({'message': 'Personalização salva com sucesso!'})
# ----------------------------------------------------------------

# --- ROTAS PROTEGIDAS (SÓ ACESSÍVEIS APÓS LOGIN) ---

@api.route('/dashboard', methods=['GET'])
@login_required
def get_dashboard_data():
    user = current_user # Pega o usuário logado da sessão

    # Pega os bebês associados a este usuário
    bebes = user.bebes.all()
    bebes_data = [{'nome': b.nome, 'sexo': b.sexo} for b in bebes]

    # Pega os outros dados
    data_cha = user.data_cha.isoformat() if user.data_cha else None

    # Monta o objeto de resposta com os dados personalizados
    dashboard_data = {
        'nome_organizador': user.nome_completo,
        'bebes': bebes_data,
        'data_cha': data_cha
        # Futuramente, adicionaremos resumos de gastos e convidados aqui
    }

    return jsonify(dashboard_data)

# --- ROTAS PROTEGIDAS DA APLICAÇÃO ---

@api.route('/dashboard', methods=['GET'])
@login_required # Garante que só um usuário logado pode ver seu dashboard
def dashboard_data():
    user = current_user # Pega o usuário da sessão atual

    # Busca os bebês associados a este usuário
    bebes = user.bebes.all()
    bebes_data = [{'nome': b.nome, 'sexo': b.sexo} for b in bebes]

    # Formata a data do chá para enviar ao frontend
    data_cha_formatada = user.data_cha.isoformat() if user.data_cha else None

    # Monta o objeto de resposta com os dados personalizados
    dashboard_info = {
        'nome_organizador': user.nome_completo,
        'bebes': bebes_data,
        'data_cha': data_cha_formatada
        # No futuro, podemos adicionar totais de gastos e convidados aqui
    }

    return jsonify(dashboard_info)
# Adicione outras rotas (dashboard, checklist, etc.) aqui no futuro