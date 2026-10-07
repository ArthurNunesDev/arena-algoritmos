import { useEffect, useMemo, useRef, useState } from 'react'

const algoritmos = [
  { id: 'bubble', nome: 'Bubble Sort', categoria: 'Ordenação', disponivel: true },
  { id: 'selection', nome: 'Selection Sort', categoria: 'Ordenação', disponivel: false },
  { id: 'insertion', nome: 'Insertion Sort', categoria: 'Ordenação', disponivel: false },
  { id: 'quick', nome: 'Quick Sort', categoria: 'Ordenação', disponivel: false },
  { id: 'merge', nome: 'Merge Sort', categoria: 'Ordenação', disponivel: false },
  { id: 'bfs', nome: 'BFS', categoria: 'Grafos', disponivel: false },
  { id: 'dfs', nome: 'DFS', categoria: 'Grafos', disponivel: false },
  { id: 'dijkstra', nome: 'Dijkstra', categoria: 'Grafos', disponivel: false },
]

function gerarValores(tamanho = 12) {
  return Array.from({ length: tamanho }, () => Math.floor(Math.random() * 90) + 10)
}

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const bubbleCode = [
  'for (let fim = n - 1; fim > 0; fim--) {',
  '  for (let i = 0; i < fim; i++) {',
  '    if (array[i] > array[i + 1]) {',
  '      trocar(array, i, i + 1)',
  '    }',
  '  }',
  '}',
]

export default function App() {
  const [valores, setValores] = useState(() => gerarValores())
  const [algoritmo, setAlgoritmo] = useState('bubble')
  const [passo, setPasso] = useState(null)
  const [indicePasso, setIndicePasso] = useState(0)
  const [passos, setPassos] = useState([])
  const [rodando, setRodando] = useState(false)
  const [finalizado, setFinalizado] = useState(false)
  const [pausado, setPausado] = useState(false)
  const [velocidade, setVelocidade] = useState(1)
  const [comparacoes, setComparacoes] = useState(0)
  const [movimentos, setMovimentos] = useState(0)
  const [tempo, setTempo] = useState(0)
  const inicioRef = useRef(null)
  const pausadoRef = useRef(false)

  const maior = useMemo(() => Math.max(...valores), [valores])

  useEffect(() => {
    if (!rodando || pausado) return
    const interval = setInterval(() => {
      setTempo(Date.now() - inicioRef.current)
    }, 10)
    return () => clearInterval(interval)
  }, [rodando, pausado])

  function aplicarPasso(evento, indice) {
    setPasso(evento)
    setIndicePasso(indice)
    if (evento.valores) setValores(evento.valores)
    setComparacoes(evento.comparacoes ?? 0)
    setMovimentos(evento.movimentos ?? 0)
  }

  async function iniciar() {
    if (rodando || finalizado || algoritmo !== 'bubble') return

    const resposta = await fetch('/api/ordenacao/bubble', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valores }),
    })
    const dados = await resposta.json()

    setPassos(dados.passos)
    setIndicePasso(0)
    setRodando(true)
    setPausado(false)
    pausadoRef.current = false
    setFinalizado(false)
    setComparacoes(0)
    setMovimentos(0)
    setTempo(0)
    inicioRef.current = Date.now()

    for (let i = 0; i < dados.passos.length; i++) {
      while (pausadoRef.current) await esperar(50)
      const evento = dados.passos[i]
      aplicarPasso(evento, i)

      if (evento.tipo === 'comparacao' || evento.tipo === 'troca') {
        await esperar((evento.tipo === 'troca' ? 520 : 300) / velocidade)
      }
    }

    const fim = dados.passos[dados.passos.length - 1]
    aplicarPasso(fim, dados.passos.length - 1)
    setRodando(false)
    setPausado(false)
    pausadoRef.current = false
    setFinalizado(true)
    setTempo(Date.now() - inicioRef.current)
  }

  function novoDesafio() {
    if (rodando) return
    setValores(gerarValores())
    setPasso(null)
    setPassos([])
    setIndicePasso(0)
    setFinalizado(false)
    setPausado(false)
    setComparacoes(0)
    setMovimentos(0)
    setTempo(0)
  }

  function togglePausa() {
    if (!rodando) return
    setPausado((estado) => {
      const novoEstado = !estado
      pausadoRef.current = novoEstado
      return novoEstado
    })
  }

  function passoAnterior() {
    if (!passos.length || indicePasso <= 0 || rodando) return
    aplicarPasso(passos[indicePasso - 1], indicePasso - 1)
    setFinalizado(false)
  }

  function proximoPasso() {
    if (!passos.length || indicePasso >= passos.length - 1 || rodando) return
    aplicarPasso(passos[indicePasso + 1], indicePasso + 1)
  }

  function inicioExecucao() {
    if (!passos.length || rodando) return
    aplicarPasso(passos[0], 0)
    setFinalizado(false)
  }

  function fimExecucao() {
    if (!passos.length || rodando) return
    const ultimo = passos.length - 1
    aplicarPasso(passos[ultimo], ultimo)
    setFinalizado(true)
  }

  const tempoFormatado = String(Math.floor(tempo / 60000)).padStart(2, '0') + ':' +
    String(Math.floor((tempo % 60000) / 1000)).padStart(2, '0') + '.' +
    String(Math.floor((tempo % 1000) / 10)).padStart(2, '0')

  const algoritmoAtual = algoritmos.find((item) => item.id === algoritmo)
  const eventoAtual = passo?.tipo === 'troca' ? 'Troca de elementos' : passo?.tipo === 'comparacao' ? 'Comparando elementos' : 'Pronto para começar'

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">⚔</span>
          <div><strong>Arena de Algoritmos</strong><small>Visualize. Entenda. Domine.</small></div>
        </div>
        <div className="topbar-actions">
          <span className="algorithm-title">{algoritmoAtual.nome}</span>
          <button className="icon-button" aria-label="Configurações">⚙</button>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-heading">Algoritmos</div>
          <div className="algorithm-groups">
            {['Ordenação', 'Grafos'].map((categoria) => (
              <div className="algorithm-group" key={categoria}>
                <span className="group-title">{categoria}</span>
                {algoritmos.filter((item) => item.categoria === categoria).map((item) => (
                  <button
                    key={item.id}
                    className={algoritmo === item.id ? 'algorithm-item active' : 'algorithm-item'}
                    disabled={!item.disponivel || rodando}
                    onClick={() => item.disponivel && setAlgoritmo(item.id)}
                  >
                    <span>{item.nome}</span>
                    {!item.disponivel && <small>Em breve</small>}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </aside>

        <section className="content">
          <div className="stage">
            <div className="stage-header">
              <div>
                <span className="section-kicker">ARENA DE ORDENAÇÃO</span>
                <h1>{algoritmoAtual.nome}</h1>
              </div>
              <button className="new-challenge" onClick={novoDesafio} disabled={rodando}>Novo desafio</button>
            </div>

            <div className="visualizer" aria-label="Visualização do algoritmo">
              <div className="visualizer-status">
                <span>{eventoAtual}</span>
                <span>Passo {passos.length ? indicePasso + 1 : 0} / {passos.length}</span>
              </div>

              <div className="array">
                {valores.map((valor, index) => {
                  const destacado = passo?.indices?.includes(index)
                  const concluido = finalizado && index <= indicePasso
                  return (
                    <div className="array-item-wrapper" key={index}>
                      <div
                        className={'array-item' + (destacado ? ' compare' : '') + (concluido ? ' done' : '')}
                        style={{ '--item-height': Math.max(46, (valor / maior) * 230) + 'px' }}
                      >
                        <span>{valor}</span>
                      </div>
                      <small>{index}</small>
                    </div>
                  )
                })}
              </div>

              <div className="operation-message">
                {passo?.tipo === 'comparacao' && 'Comparando as posições ' + passo.indices?.[0] + ' e ' + passo.indices?.[1] + '.'}
                {passo?.tipo === 'troca' && 'Os elementos foram trocados. Movimento #' + movimentos + '.'}
                {!passo && 'Execute o algoritmo para acompanhar cada etapa.'}
              </div>
            </div>

            <div className="playback">
              <button onClick={inicioExecucao} disabled={!passos.length || rodando}>⏮</button>
              <button onClick={passoAnterior} disabled={!passos.length || !indicePasso || rodando}>◀</button>
              <button className="play" onClick={rodando ? togglePausa : iniciar} disabled={finalizado && !rodando}>
                {rodando ? (pausado ? '▶' : 'Ⅱ') : '▶'}
              </button>
              <button onClick={proximoPasso} disabled={!passos.length || indicePasso >= passos.length - 1 || rodando}>▶</button>
              <button onClick={fimExecucao} disabled={!passos.length || rodando}>⏭</button>
              <label>
                Velocidade
                <select value={velocidade} onChange={(event) => setVelocidade(Number(event.target.value))} disabled={rodando}>
                  <option value="0.5">0.5x</option>
                  <option value="1">1x</option>
                  <option value="2">2x</option>
                  <option value="4">4x</option>
                </select>
              </label>
            </div>

            <div className="info-grid">
              <section className="info-panel explanation">
                <div className="panel-title">Explicação</div>
                <h2>{eventoAtual}</h2>
                <p>{passo?.tipo === 'troca'
                  ? 'Como os elementos estavam fora de ordem, o algoritmo troca suas posições para aproximar o array da ordenação final.'
                  : passo?.tipo === 'comparacao'
                    ? 'O Bubble Sort percorre elementos vizinhos e verifica se o primeiro é maior que o segundo.'
                    : 'O algoritmo será executado passo a passo para mostrar não apenas o resultado, mas como ele é construído.'}</p>
              </section>

              <section className="info-panel variables">
                <div className="panel-title">Estado</div>
                <div className="state-list">
                  <div><span>comparações</span><strong>{comparacoes}</strong></div>
                  <div><span>movimentos</span><strong>{movimentos}</strong></div>
                  <div><span>tempo</span><strong>{tempoFormatado}</strong></div>
                  <div><span>passo atual</span><strong>{passos.length ? indicePasso + 1 : 0}</strong></div>
                </div>
              </section>
            </div>
          </div>

          <aside className="code-panel">
            <div className="code-header">
              <div>
                <span className="section-kicker">IMPLEMENTAÇÃO</span>
                <h2>Bubble Sort</h2>
              </div>
              <span className="language">JavaScript</span>
            </div>
            <pre>{bubbleCode.map((linha, index) => (
              <code className={'code-line' + (passo && ((passo.tipo === 'comparacao' && index === 2) || (passo.tipo === 'troca' && index === 3)) ? ' active' : '')} key={index}>
                <span>{String(index + 1).padStart(2, '0')}</span>{linha}
              </code>
            ))}</pre>
            <div className="code-footer">O código acompanha a etapa atual da visualização.</div>
          </aside>
        </section>
      </div>
    </main>
  )
}
