#  Meu Chá Organizador ✨

Um aplicativo web completo e pessoal para o planejamento e organização de chá de bebê, construído com Python (Flask) no backend e React no frontend.

![Preview do Dashboard do Aplicativo](https://i.imgur.com/g88xYj1.png) 
---

## 🚀 Sobre o Projeto

Este projeto foi desenvolvido como uma ferramenta completa para futuros pais organizarem todas as facetas de seu chá de bebê. Em vez de ser um portal público, ele funciona como um SaaS (Software as a Service) pessoal, onde cada usuário tem sua própria conta protegida por login para gerenciar suas informações de forma privada.

A aplicação cobre desde a personalização do evento até o gerenciamento detalhado de despesas, convidados e tarefas.

### 🔗 Links do Projeto
* **Aplicação Online:** [https://organizador-cha-de-bebe.vercel.app/](https://organizador-cha-de-bebe.vercel.app/)
* **API (Backend):** [https://meu-cha-api.onrender.com/](https://meu-cha-api.onrender.com/)

---

## 🛠️ Funcionalidades Principais

* **Autenticação Segura:** Sistema de registro e login com senhas criptografadas (`Bcrypt`) e autenticação baseada em Token JWT, garantindo que os dados de cada usuário sejam privados.
* **Fluxo de Personalização:** Uma etapa de onboarding para novos usuários configurarem detalhes essenciais como nome(s) do(s) bebê(s), data e local do evento.
* **Dashboard Dinâmico:** Um painel de controle que resume visualmente as informações mais importantes:
    * Contagem regressiva para o dia do chá.
    * Resumo de gastos com um gráfico de pizza por categoria.
    * Total de convidados e progresso de confirmações.
    * Progresso do checklist de organização.
* **Gestão de Gastos:** Ferramenta para adicionar, visualizar, e apagar despesas, com campos para fornecedor, valor, método de pagamento e categoria.
* **Lista de Convidados Avançada:** Permite adicionar convidados e agrupar seus familiares (acompanhantes), além de marcar o status de confirmação de presença para cada pessoa.
* **Checklists Duplos:**
    * **Checklist de Organização:** Para gerenciar as tarefas da festa.
    * **Checklist de Enxoval:** Pré-populado com um template de itens comuns para ajudar os pais.
* **Gerador de Convite Digital:** Cria uma página de convite pública e estilizada com os dados do evento e permite baixar o convite como uma imagem PNG.
* **Design Responsivo:** A interface se adapta para uma experiência de uso agradável tanto em desktops quanto em celulares.

---

## 💻 Tecnologias Utilizadas

Este é um projeto full-stack que utiliza tecnologias modernas e populares no mercado.

* **Backend:**
    * **Python 3.12**
    * **Flask:** Micro-framework web para a construção da API.
    * **SQLAlchemy:** ORM para interação com o banco de dados.
    * **Flask-Bcrypt:** Para criptografia de senhas.
    * **PyJWT:** Para geração e validação de JSON Web Tokens.
    * **Gunicorn:** Servidor web para produção.
* **Frontend:**
    * **React 18** (com Vite)
    * **React Router DOM:** Para o roteamento entre as páginas.
    * **Axios:** Para as requisições à API.
    * **Recharts:** Para a criação de gráficos no dashboard.
    * **React Hot Toast:** Para notificações elegantes.
    * **html-to-image:** Para a funcionalidade de baixar o convite como imagem.
* **Banco de Dados:**
    * **SQLite 3** (em desenvolvimento).
* **Deploy (Publicação):**
    * Backend hospedado na **Render**.
    * Frontend hospedado na **Vercel**.
    * Controle de versão com **Git** e **GitHub**.

---

## ⚙️ Como Rodar o Projeto Localmente

Siga os passos abaixo para executar o projeto na sua máquina.

### Pré-requisitos
* [Python 3.10+](https://www.python.org/downloads/)
* [Node.js (LTS)](https://nodejs.org/en/)
* [Git](https://git-scm.com/)

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/hugodiana/organizador-cha-de-bebe.git](https://github.com/hugodiana/organizador-cha-de-bebe.git)
    cd organizador-cha-de-bebe
    ```
2.  **Configure o Backend:**
    ```bash
    cd backend
    python -m venv venv
    .\venv\Scripts\activate
    pip install -r requirements.txt
    ```
3.  **Configure o Frontend:**
    (Em um novo terminal)
    ```bash
    cd frontend
    npm install
    ```
### Execução
1.  **Inicie o servidor do Backend:**
    (No terminal do backend, com o venv ativo)
    ```bash
    python run.py
    ```
    *O backend estará rodando em `http://127.0.0.1:5000`.*

2.  **Inicie o servidor do Frontend:**
    (No terminal do frontend)
    ```bash
    npm run dev
    ```
    *Acesse `http://localhost:5173` no seu navegador.*

---

## 👨‍💻 Autor

* **Hugo Diana**
* GitHub: [@hugodiana](https://github.com/hugodiana)
* ```

---

### **Passo Final: Enviar a Documentação para o GitHub**

1.  **Personalize o arquivo:** Abra o `README.md` que você acabou de criar e edite as informações entre colchetes, como seu nome e links. **É altamente recomendado que você tire um print da tela do seu dashboard e substitua o link da imagem no topo!** (Você pode arrastar uma imagem para a caixa de texto de um "Issue" no GitHub para gerar um link para ela).
2.  Salve o arquivo.
3.  **Envie para o GitHub:**
    ```bash
    git add README.md
    git commit -m "Adiciona documentação completa do projeto"
    git push
    ```

Ao atualizar a página do seu repositório no GitHub, você verá esta documentação profissional como a página inicial.

**Parabéns!** Você não apenas construiu um aplicativo incrível, mas agora também o apresentou da melhor forma possível. Este é um projeto finalizado do qual você pode se orgulhar muito. Foi um prazer construir isso com você!