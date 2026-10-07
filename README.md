# ⚔️ Arena de Algoritmos

Uma arena educativa e visual para aprender algoritmos e estruturas de dados através de execução passo a passo, desafios e corridas.

## 🌐 Acesse

🚀 **[Arena de Algoritmos](https://arena-algoritmos.vercel.app/)**

## 🧩 Arenas

### ⚡ Ordenação
Bubble Sort · Selection Sort · Insertion Sort · Quick Sort · Merge Sort · Heap Sort

### 🗺️ Grafos
BFS · DFS · Dijkstra · A*

### 🌳 Árvores
BST · AVL · Heap

### 🧠 Lógica
Recursão · Backtracking · Greedy · Programação Dinâmica

## 🎮 Recursos

- Visualização passo a passo
- Play, pausa, avanço e retrocesso
- Timeline navegável
- Controle de velocidade
- Tamanho de array configurável
- Dificuldades: Treino, Fácil, Médio, Difícil e Boss
- Código sincronizado com a etapa atual
- Variáveis e estado da execução
- Animações de comparação, troca, visita e caminho
- Race Mode entre algoritmos de ordenação
- Pontuação e multiplicadores
- Ranking e histórico local
- Atalhos de teclado
- Layout responsivo

## 🛠️ Stack

- React 19
- JavaScript
- Vite
- Python
- FastAPI
- CSS

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

O frontend usa `/api` e, no desenvolvimento local, o Vite encaminha as requisições para `localhost:8000`.

## 📌 Status

**Versão 1.0 em desenvolvimento ativo.**

A base das quatro arenas está implementada. As próximas evoluções podem adicionar novos algoritmos, desafios, autenticação e ranking global.
