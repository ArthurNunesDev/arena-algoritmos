import { useMemo, useState } from 'react'

const algoritmos = [
  { id: 'bubble', nome: 'Bubble Sort', descricao: 'Simples e didático.' },
  { id: 'quick', nome: 'Quick Sort', descricao: 'Rápido e eficiente.' },
]

function gerarValores(tamanho = 24) {
  return Array.from({ length: tamanho }, () => Math.floor(Math.random() * 90) + 10)
}

export default function App() {
  const [valores, setValores] = useState(() => gerarValores())
  const [algoritmo, setAlgoritmo] = useState('bubble')
  const maior = useMemo(() => Math.max(...valores), [valores])

  return (
    <main className="arena">
      <header className="hero">
        <span className="eyebrow">⚔️ ARENA DE ALGORITMOS</span>
        <h1>Transforme algoritmos em competição.</h1>
        <p>Primeira arena: ordenação. Escolha um algoritmo e acompanhe cada movimento.</p>
      </header>
      <section className="painel">
        <div className="controles">
          {algoritmos.map((item) => (
            <button key={item.id} className={algoritmo === item.id ? 'algoritmo ativo' : 'algoritmo'} onClick={() => setAlgoritmo(item.id)}>
              <strong>{item.nome}</strong>
              <small>{item.descricao}</small>
            </button>
          ))}
          <button className="novo" onClick={() => setValores(gerarValores())}>Novo desafio</button>
        </div>
        <div className="placar">
          <div><span>Algoritmo</span><strong>{algoritmos.find((item) => item.id === algoritmo).nome}</strong></div>
          <div><span>Comparações</span><strong>0</strong></div>
          <div><span>Movimentos</span><strong>0</strong></div>
          <div><span>Tempo</span><strong>00:00.00</strong></div>
        </div>
        <div className="barras" aria-label="Visualização do array">
          {valores.map((valor, index) => (
            <div className="barra-coluna" key={index}>
              <div className="barra" style={{ height: `${(valor / maior) * 100}%` }} title={String(valor)} />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}