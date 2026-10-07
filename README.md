# ⚔️ Arena de Algoritmos

Uma arena educativa e visual para aprender **algoritmos e estruturas de dados** através de execução passo a passo, desafios e corridas.

## 🌐 Acesse

🚀 **[Arena de Algoritmos](https://arena-algoritmos.vercel.app/)**

## 🧩 Arenas

### ⚡ Ordenação
Bubble Sort · Selection Sort · Insertion Sort · Quick Sort · Merge Sort · Heap Sort

### 🗺️ Grafos
BFS · DFS · Dijkstra · A*

### 🌳 Árvores
BST · AVL · Heap

## 🎮 Recursos

- Visualização interativa dos algoritmos
- Execução passo a passo
- Play, pausa, avanço e retrocesso
- Timeline para navegar pelas etapas
- Controle de velocidade
- Tamanho do vetor configurável
- Controle de zoom da visualização
- Dificuldades: Treino, Fácil, Médio, Difícil e Boss
- Código sincronizado com a etapa atual
- Variáveis e estado da execução
- Destaque de comparações, trocas, visitas e caminhos
- Visualização de grafos e árvores
- Race Mode entre algoritmos de ordenação
- Pontuação e multiplicadores
- Ranking e histórico local
- Atalhos de teclado
- Interface responsiva
- Microinterações e feedback visual nos controles

## 🛠️ Stack

### Frontend
- React 19
- JavaScript
- Vite
- CSS

### Backend
- Python
- FastAPI

## 📁 Estrutura

```text
arena-algoritmos/
├── frontend/              # Interface React + Vite
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/               # API e execução dos algoritmos
│   ├── main.py
│   └── requirements.txt
│
└── .github/
    └── workflows/         # CI e GitHub Pages
```

## 🚀 Desenvolvimento local

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

O frontend utiliza `/api`. Durante o desenvolvimento local, o Vite encaminha essas requisições para `localhost:8000`.

## 📦 Deploy

O frontend está preparado para:

- **Vercel**, com frontend e backend integrados.
- **GitHub Pages**, através do workflow de publicação.

## 📌 Status

**Versão 1.0 — em desenvolvimento ativo.**

A estrutura principal das três arenas está implementada. O projeto continua recebendo melhorias de visualização, animações, experiência de uso e novos desafios.

### 🔮 Próximos passos

- Novos algoritmos e estruturas de dados
- Mais desafios interativos
- Melhorias no Race Mode
- Sistema de ranking global
- Persistência de progresso
- Novas animações e visualizações
