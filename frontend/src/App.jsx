import { useEffect, useMemo, useRef, useState } from 'react'

const algoritmos = [
  { id: 'bubble', nome: 'Bubble Sort', descricao: 'Simples e didático.', disponivel: true },
  { id: 'quick', nome: 'Quick Sort', descricao: 'Em breve.', disponivel: false },
]

function gerarValores(tamanho = 24) {
  return Array.from({ length: tamanho }, () => Math.floor(Math.random() * 90) + 10)
}

export default function App() {
  const [valores, setValores] = useState(() => gerarValores())
  const [algoritmo, setAlgoritmo] = useState('bubble')
  const [passo, setPasso] = useState(null)
  const [rodando, setRodando] = useState(false)
  const [finalizado, setFinalizado] = useState(false)
  const [comparacoes, setComparacoes] = useState(0)
  const [movimentos, setMovimentos] = useState(0)
  const [tempo, setTempo] = useState(0)
  const inicioRef = useRef(null)

  const maior = useMemo(() => Math.max(...valores), [valores])

  useEffect(() => {
    if (!rodando) return
    const interval = setInterval(() => {
      setTempo(Date.now() - inicioRef.current)
    }, 10)
    return () => clearInterval(interval)
  }, [rodando])

  async function iniciar() {
    if (rodando || algoritmo !== 'bubble') return

    const resposta = await fetch('/api/ordenacao/bubble', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valores }),
    })
    const dados = await resposta.json()

    setRodando(true)
    setFinalizado(false)
    setComparacoes(0)
    setMovimentos(0)
    setTempo(0)
    inicioRef.current = Date.now()

    for (const evento of dados.passos) {
      if (evento.tipo === 'comparacao' || evento.tipo === 'troca') {
        setPasso(evento)
        setValores(evento.valores)
        setComparacoes(evento.comparacoes)
        setMovimentos(evento.movimentos)
        await new Promise((resolve) => setTimeout(resolve, evento.tipo === 'troca' ? 180 : 90))
      }
    }

    const fim = dados.passos[dados.passos.length - 1]
    setValores(fim.valores)
    setComparacoes(fim.comparacoes)
    setMovimentos(fim.movimentos)
    setPasso(null)
    setRodando(false)
    setFinalizado(true)
    setTempo(Date.now() - inicioRef.current)
  }

  function novoDesafio() {
    if (rodando) return
    setValores(gerarValores())
    setPasso(null)
    setFinalizado(false)
    setComparacoes(0)
    setMovimentos(0)
    setTempo(0)
  }

  const tempoFormatado = `${String(Math.floor(tempo / 60000)).padStart(2, '0')}:${String(Math.floor((tempo % 60000) / 1000)).padStart(2, '0')}.${String(Math.floor(tempo % 1000 / 10)).padStart(2, '0')}`

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
            <button
              key={item.id}
              className={algoritmo === item.id ? 'algoritmo ativo' : 'algoritmo'}
              disabled={!item.disponivel || rodando}
              onClick={() => item.disponivel && setAlgoritmo(item.id)}
            >
              <strong>{item.nome}</strong>
              <small>{item.descricao}</small>
            </button>
          ))}
          <button className="novo" onClick={novoDesafio} disabled={rodando}>Novo desafio</button>
        </div>

        <div className="placar">
          <div><span>Algoritmo</span><strong>Bubble Sort</strong></div>
          <div><span>Comparações</span><strong>{comparacoes}</strong></div>
          <div><span>Movimentos</span><strong>{movimentos}</strong></div>
          <div><span>Tempo</span><strong>{tempoFormatado}</strong></div>
        </div>

        <div className="barras" aria-label="Visualização do array">
          {valores.map((valor, index) => {
            const destacado = passo?.indices?.includes(index)
            return (
              <div className="barra-coluna" key={index}>
                <div
                  className={destacado ? 'barra destaque' : 'barra'}
                  style={{ height: `${(valor / maior) * 100}%` }}
                  title={String(valor)}
                />
              </div>
            )
          })}
        </div>

        <div className="acoes">
          <span className="status">{finalizado ? '✓ Ordenação concluída' : rodando ? 'Comparando elementos...' : 'Pronto para começar'}</span>
          <button className="iniciar" onClick={iniciar} disabled={rodando || finalizado}>
            {rodando ? 'Executando...' : finalizado ? 'Concluído' : '▶ Iniciar algoritmo'}
          </button>
        </div>
      </section>
    </main>
  )
}
