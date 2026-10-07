import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

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
  const [tamanhoArray, setTamanhoArray] = useState(12)
  const [valores, setValores] = useState(() => gerarValores(12))
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
  const itemRefs = useRef(new Map())
  const previousRectsRef = useRef(new Map())

  const maior = useMemo(() => Math.max(...valores), [valores])

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

    if (!resposta.ok) {
      setPasso({ tipo: 'erro', mensagem: 'Não foi possível carregar a execução.' })
      return
    }

    const dados = await resposta.json()
    setPassos(dados.passos)
    setFinalizado(false)
    setPausado(false)
    setComparacoes(0)
    setMovimentos(0)
    setTempo(0)
    inicioRef.current = Date.now()
    aplicarPasso(dados.passos[0], 0)
    setRodando(true)
  }

  useEffect(() => {
    if (!rodando || pausado || !passos.length) return undefined

    const atual = passos[indicePasso]
    const duracao = atual?.tipo === 'troca' ? 520 / velocidade : atual?.tipo === 'comparacao' ? 300 / velocidade : 140 / velocidade

    const timer = window.setTimeout(() => {
      if (indicePasso >= passos.length - 1) {
        setRodando(false)
        setPausado(false)
        setFinalizado(true)
        setTempo(Date.now() - inicioRef.current)
        return
      }
      aplicarPasso(passos[indicePasso + 1], indicePasso + 1)
    }, duracao)

    return () => window.clearTimeout(timer)
  }, [rodando, pausado, passos, indicePasso, velocidade])
  useEffect(() => {
    if (!rodando || pausado || !inicioRef.current) return undefined
    const interval = window.setInterval(() => setTempo(Date.now() - inicioRef.current), 10)
    return () => window.clearInterval(interval)
  }, [rodando, pausado])

  useLayoutEffect(() => {
    const currentRects = new Map()
    itemRefs.current.forEach((node, id) => {
      if (!node) return
      currentRects.set(id, node.getBoundingClientRect())
    })

    currentRects.forEach((current, id) => {
      const previous = previousRectsRef.current.get(id)
      const node = itemRefs.current.get(id)
      if (!previous || !node) return

      const dx = previous.left - current.left
      const dy = previous.top - current.top
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return

      node.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: 'translate(0, 0)' },
        ],
        {
          duration: passo?.tipo === 'troca' ? 520 / velocidade : 260 / velocidade,
          easing: 'cubic-bezier(.22,1,.36,1)',
        },
      )
    })

    previousRectsRef.current = currentRects
  }, [valores, passo?.ids, velocidade])

  useEffect(() => {
    function tratarTeclado(evento) {
      if (evento.target instanceof HTMLInputElement || evento.target instanceof HTMLSelectElement) return
      if (evento.code === 'Space') {
        evento.preventDefault()
        if (rodando) setPausado((estado) => !estado)
        else if (!finalizado) iniciar()
      }
      if (evento.key === 'ArrowLeft' && !rodando) passoAnterior()
      if (evento.key === 'ArrowRight' && !rodando) proximoPasso()
    }
    window.addEventListener('keydown', tratarTeclado)
    return () => window.removeEventListener('keydown', tratarTeclado)
  })

  function novoDesafio() {
    if (rodando) return
    setValores(gerarValores(tamanhoArray))
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
    setPausado((estado) => !estado)
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
  const linhaAtiva = passo?.linha ?? 0
  const eventoAtual = passo?.mensagem || 'Execute o algoritmo para acompanhar cada etapa.'

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
                  const id = passo?.ids?.[index] ?? index
                  const destacado = passo?.indices?.includes(index)
                  const concluido = finalizado
                  const trocando = passo?.tipo === 'troca' && passo.indices?.includes(index)
                  return (
                    <div
                      className="array-item-wrapper"
                      key={id}
                      ref={(node) => {
                        if (node) itemRefs.current.set(id, node)
                        else itemRefs.current.delete(id)
                      }}
                    >
                      <div
                        className={'array-item' + (destacado ? ' compare' : '') + (concluido ? ' done' : '') + (trocando ? ' swapping' : '')}
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

            <div className="timeline">
              <div className="timeline-meta">
                <span>Timeline</span>
                <span>{passos.length ? (indicePasso + 1) + ' / ' + passos.length : 'Aguardando execução'}</span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(passos.length - 1, 0)}
                value={passos.length ? indicePasso : 0}
                onChange={(evento) => {
                  if (!passos.length || rodando) return
                  const novoIndice = Number(evento.target.value)
                  aplicarPasso(passos[novoIndice], novoIndice)
                  setFinalizado(novoIndice === passos.length - 1)
                }}
                disabled={!passos.length || rodando}
                aria-label="Navegar pelos passos da execução"
              />
            </div>

            <div className="array-settings">
              <label>
                Tamanho do array
                <input
                  type="range"
                  min="6"
                  max="20"
                  value={tamanhoArray}
                  onChange={(evento) => setTamanhoArray(Number(evento.target.value))}
                  disabled={rodando}
                />
                <strong>{tamanhoArray}</strong>
              </label>
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

            <div className="shortcut-hint">
              <span><kbd>Space</kbd> play/pause</span>
              <span><kbd>←</kbd><kbd>→</kbd> navegar</span>
            </div>

            <div className="info-grid">
              <section className="info-panel explanation">
                <div className="panel-title">Explicação</div>
                <h2>{passo?.tipo === 'troca' ? 'Troca' : passo?.tipo === 'comparacao' ? 'Comparação' : 'Execução'}</h2>
                <p>{eventoAtual}</p>
              </section>

              <section className="info-panel variables">
                <div className="panel-title">Estado</div>
                <div className="state-list">
                  <div><span>fim</span><strong>{passo?.variaveis?.fim ?? '-'}</strong></div>
                  <div><span>i</span><strong>{passo?.variaveis?.i ?? '-'}</strong></div>
                  <div><span>esquerda</span><strong>{passo?.variaveis?.esquerda ?? '-'}</strong></div>
                  <div><span>direita</span><strong>{passo?.variaveis?.direita ?? '-'}</strong></div>
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
              <code className={'code-line' + (linhaAtiva === index + 1 ? ' active' : '')} key={index}>
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
