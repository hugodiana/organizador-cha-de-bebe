from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from datetime import datetime
from sqlalchemy import func

from app import db
# Importação de TODOS os modelos necessários, incluindo EnxovalItem
from app.models import Usuario, Bebe, Gasto, Convidado, ChecklistItem, EnxovalItem

api = Blueprint('api', __name__)

# --- ROTAS DE AUTENTICAÇÃO ---

@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not all(key in data for key in ['username', 'password', 'nome_completo']):
        return jsonify({'message': 'Nome completo, de usuário e senha são obrigatórios.'}), 400
    if Usuario.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Este nome de usuário já está em uso.'}), 409
    
    novo_usuario = Usuario(
        username=data['username'],
        nome_completo=data['nome_completo'],
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
            'user': { 'id': user.id, 'username': user.username, 'nome_completo': user.nome_completo, 'setup_completo': user.setup_completo }
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
            'user': { 'id': current_user.id, 'username': current_user.username, 'nome_completo': current_user.nome_completo, 'setup_completo': current_user.setup_completo }
        })
    return jsonify({'is_logged_in': False})

# --- ROTA DE PERSONALIZAÇÃO ---

@api.route('/personalizar', methods=['POST'])
@login_required
def personalizar_cha():
    data = request.get_json()
    user = current_user
    if not data or 'bebes' not in data or not data['bebes']:
        return jsonify({'message': 'Os dados do bebê são obrigatórios.'}), 400
    if data.get('data_cha'):
        user.data_cha = datetime.strptime(data['data_cha'], '%Y-%m-%d')
    if data.get('local_cha'):
        user.local_cha = data['local_cha']

    Bebe.query.filter_by(user_id=user.id).delete()
    for bebe_data in data['bebes']:
        if bebe_data.get('nome'):
            novo_bebe = Bebe(nome=bebe_data['nome'], sexo=bebe_data['sexo'], organizador=user)
            db.session.add(novo_bebe)
            
    user.setup_completo = True
    db.session.commit()
    return jsonify({'message': 'Personalização salva com sucesso!'})

# --- ROTA PÚBLICA DO CONVITE ---

@api.route('/convite/<int:user_id>', methods=['GET'])
def get_dados_convite(user_id):
    user = db.session.get(Usuario, user_id)
    if not user or not user.setup_completo:
        return jsonify({'message': 'Convite não encontrado.'}), 404
    bebes = user.bebes.all()
    bebes_data = [{'nome': b.nome} for b in bebes]
    data_cha = user.data_cha.isoformat() if user.data_cha else None
    return jsonify({'bebes': bebes_data, 'data_cha': data_cha, 'local_cha': user.local_cha})

# --- ROTAS PROTEGIDAS DA APLICAÇÃO ---

@api.route('/dashboard', methods=['GET'])
@login_required
def get_dashboard_data():
    user = current_user
    bebes = user.bebes.all()
    bebes_data = [{'nome': b.nome, 'sexo': b.sexo} for b in bebes]
    data_cha = user.data_cha.isoformat() if user.data_cha else None
    total_gasto = db.session.query(func.sum(Gasto.valor)).filter(Gasto.user_id == user.id).scalar() or 0.0
    convidados_principais = Convidado.query.filter_by(user_id=user.id, convidado_principal_id=None).all()
    total_convidados = sum(1 + len(p.familia) for p in convidados_principais)
    total_tarefas = ChecklistItem.query.filter_by(user_id=user.id).count() or 0
    tarefas_concluidas = ChecklistItem.query.filter_by(user_id=user.id, concluido=True).count() or 0
    
    return jsonify({
        'nome_organizador': user.nome_completo,
        'bebes': bebes_data,
        'data_cha': data_cha,
        'resumo_gastos': { 'total': total_gasto },
        'resumo_convidados': { 'total': total_convidados },
        'resumo_checklist': { 'total': total_tarefas, 'concluidas': tarefas_concluidas }
    })

@api.route('/configuracoes', methods=['GET'])
@login_required
def get_configuracoes():
    user = current_user
    bebes = user.bebes.all()
    bebes_data = [{'id': b.id, 'nome': b.nome, 'sexo': b.sexo} for b in bebes]
    data_cha = user.data_cha.isoformat().split('T')[0] if user.data_cha else ''
    return jsonify({'bebes': bebes_data, 'data_cha': data_cha, 'local_cha': user.local_cha or ''})

@api.route('/configuracoes', methods=['PUT'])
@login_required
def update_configuracoes():
    user = current_user
    data = request.get_json()
    if 'data_cha' in data:
        user.data_cha = datetime.strptime(data['data_cha'], '%Y-%m-%d') if data['data_cha'] else None
    if 'local_cha' in data:
        user.local_cha = data['local_cha']
    if 'bebes' in data:
        Bebe.query.filter_by(user_id=user.id).delete()
        for bebe_data in data['bebes']:
            if bebe_data.get('nome'):
                novo_bebe = Bebe(nome=bebe_data['nome'], sexo=bebe_data['sexo'], organizador=user)
                db.session.add(novo_bebe)
    db.session.commit()
    return jsonify({'message': 'Configurações atualizadas com sucesso!'})

@api.route('/bebes/<int:bebe_id>', methods=['DELETE'])
@login_required
def delete_bebe(bebe_id):
    bebe = db.session.get(Bebe, bebe_id)
    if not bebe or bebe.user_id != current_user.id:
        return jsonify({'message': 'Acesso não autorizado.'}), 403
    db.session.delete(bebe)
    db.session.commit()
    return jsonify({'message': 'Bebê removido com sucesso.'})

# --- ROTAS DE GASTOS ---

@api.route('/gastos', methods=['GET'])
@login_required
def get_gastos():
    gastos = Gasto.query.filter_by(organizador=current_user).order_by(Gasto.data_gasto.desc()).all()
    return jsonify([{'id': g.id, 'descricao': g.descricao, 'fornecedor': g.fornecedor, 'valor': g.valor, 'metodo_pagamento': g.metodo_pagamento} for g in gastos])

@api.route('/gastos', methods=['POST'])
@login_required
def add_gasto():
    data = request.get_json()
    novo_gasto = Gasto(
        descricao=data['descricao'],
        fornecedor=data.get('fornecedor'),
        valor=float(data['valor']),
        metodo_pagamento=data.get('metodo_pagamento', 'Outro'),
        organizador=current_user
    )
    db.session.add(novo_gasto)
    db.session.commit()
    return jsonify({'id': novo_gasto.id, 'descricao': novo_gasto.descricao, 'fornecedor': novo_gasto.fornecedor, 'valor': novo_gasto.valor, 'metodo_pagamento': novo_gasto.metodo_pagamento}), 201

@api.route('/gastos/<int:gasto_id>', methods=['DELETE'])
@login_required
def delete_gasto(gasto_id):
    gasto = db.session.get(Gasto, gasto_id)
    if not gasto or gasto.user_id != current_user.id:
        return jsonify({'message': 'Acesso não autorizado.'}), 403
    db.session.delete(gasto)
    db.session.commit()
    return jsonify({'message': 'Gasto removido.'})

# --- ROTAS DE CONVIDADOS ---

@api.route('/convidados', methods=['GET'])
@login_required
def get_convidados():
    convidados_principais = Convidado.query.filter_by(organizador=current_user, convidado_principal_id=None).order_by(Convidado.nome).all()
    lista_completa = []
    for principal in convidados_principais:
        familiares = [{'id': familiar.id, 'nome': familiar.nome, 'confirmado': familiar.confirmado} for familiar in principal.familia]
        lista_completa.append({'id': principal.id, 'nome': principal.nome, 'confirmado': principal.confirmado, 'familia': familiares})
    return jsonify(lista_completa)

@api.route('/convidados', methods=['POST'])
@login_required
def add_convidado():
    data = request.get_json()
    novo_convidado = Convidado(
        nome=data['nome'],
        convidado_principal_id=data.get('convidado_principal_id'),
        organizador=current_user
    )
    db.session.add(novo_convidado)
    db.session.commit()
    return jsonify({'id': novo_convidado.id, 'nome': novo_convidado.nome, 'confirmado': novo_convidado.confirmado}), 201

@api.route('/convidados/<int:convidado_id>', methods=['DELETE'])
@login_required
def delete_convidado(convidado_id):
    convidado = db.session.get(Convidado, convidado_id)
    if not convidado or convidado.user_id != current_user.id:
        return jsonify({'message': 'Acesso não autorizado.'}), 403
    db.session.delete(convidado)
    db.session.commit()
    return jsonify({'message': 'Convidado(s) removido(s).'})

@api.route('/convidados/<int:convidado_id>/confirmar', methods=['PUT'])
@login_required
def confirmar_convidado(convidado_id):
    convidado = db.session.get(Convidado, convidado_id)
    if not convidado or convidado.user_id != current_user.id:
        return jsonify({'message': 'Acesso não autorizado.'}), 403
    data = request.get_json()
    if 'confirmado' in data:
        convidado.confirmado = data['confirmado']
        db.session.commit()
    return jsonify({'message': 'Status do convidado atualizado.'})

# --- ROTAS DE CHECKLIST DE ORGANIZAÇÃO ---

@api.route('/checklist', methods=['GET'])
@login_required
def get_checklist():
    items = ChecklistItem.query.filter_by(user_id=current_user.id).order_by(ChecklistItem.id).all()
    return jsonify([{'id': item.id, 'tarefa': item.tarefa, 'concluido': item.concluido} for item in items])

@api.route('/checklist', methods=['POST'])
@login_required
def add_checklist_item():
    data = request.get_json()
    if not data or not data.get('tarefa'):
        return jsonify({'message': 'O nome da tarefa é obrigatório.'}), 400
    novo_item = ChecklistItem(tarefa=data['tarefa'], user_id=current_user.id)
    db.session.add(novo_item)
    db.session.commit()
    return jsonify({'id': novo_item.id, 'tarefa': novo_item.tarefa, 'concluido': novo_item.concluido}), 201

@api.route('/checklist/<int:item_id>', methods=['PUT'])
@login_required
def update_checklist_item(item_id):
    item = db.session.get(ChecklistItem, item_id)
    if not item or item.user_id != current_user.id:
        return jsonify({'message': 'Acesso não autorizado.'}), 404
    data = request.get_json()
    if 'concluido' in data:
        item.concluido = data['concluido']
    db.session.commit()
    return jsonify({'message': 'Item atualizado.'})

@api.route('/checklist/<int:item_id>', methods=['DELETE'])
@login_required
def delete_checklist_item(item_id):
    item = db.session.get(ChecklistItem, item_id)
    if not item or item.user_id != current_user.id:
        return jsonify({'message': 'Acesso não autorizado.'}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Item removido.'})

# --- ROTAS DO CHECKLIST DE ENXOVAL ---

TEMPLATE_ENXOVAL = {
    "Roupas": ["Body manga curta (6)", "Body manga longa (6)", "Mijão (culote) (6)", "Macacão (6)", "Meias (6 pares)"],
    "Higiene": ["Fraldas RN ou P", "Lenços umedecidos", "Pomada para assaduras", "Sabonete líquido", "Toalha de banho com capuz (2)"],
    "Quarto": ["Berço", "Colchão", "Jogo de lençol para berço (3)", "Protetor de colchão"],
    "Passeio": ["Bebê conforto para o carro", "Carrinho de bebê", "Bolsa de maternidade"]
}

@api.route('/enxoval', methods=['GET'])
@login_required
def get_enxoval_items():
    user = current_user
    items = EnxovalItem.query.filter_by(user_id=user.id).all()
    if not items:
        for categoria, lista_itens in TEMPLATE_ENXOVAL.items():
            for nome_item in lista_itens:
                novo_item = EnxovalItem(item=nome_item, categoria=categoria, user_id=user.id)
                db.session.add(novo_item)
        db.session.commit()
        items = EnxovalItem.query.filter_by(user_id=user.id).all()
    return jsonify([{'id': i.id, 'item': i.item, 'categoria': i.categoria, 'concluido': i.concluido} for i in items])

@api.route('/enxoval/<int:item_id>', methods=['PUT'])
@login_required
def update_enxoval_item(item_id):
    item = db.session.get(EnxovalItem, item_id)
    if not item or item.user_id != current_user.id:
        return jsonify({'message': 'Item não encontrado ou não autorizado.'}), 404
    data = request.get_json()
    if 'concluido' in data:
        item.concluido = data['concluido']
    db.session.commit()
    return jsonify({'message': 'Item do enxoval atualizado.'})