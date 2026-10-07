import { useEffect, useMemo, useRef, useState } from 'react'

const algoritmos = [
  { id: 'bubble', nome: 'Bubble Sort', categoria: 'Ordenação' },
  { id: 'selection', nome: 'Selection Sort', categoria: 'Ordenação' },
  { id: 'insertion', nome: 'Insertion Sort', categoria: 'Ordenação' },
  { id: 'quick', nome: 'Quick Sort', categoria: 'Ordenação' },
  { id: 'merge', nome: 'Merge Sort', categoria: 'Ordenação' },
  { id: 'heap', nome: 'Heap Sort', categoria: 'Ordenação' },
  { id: 'bfs', nome: 'BFS', categoria: 'Grafos' },
  { id: 'dfs', nome: 'DFS', categoria: 'Grafos' },
  { id: 'dijkstra', nome: 'Dijkstra', categoria: 'Grafos' },
  { id: 'astar', nome: 'A*', categoria: 'Grafos' },
]

const dificuldades = {
  treino: { nome: 'Treino', multiplicador: 1, descricao: 'Sem pressão' },
  facil: { nome: 'Fácil', multiplicador: 1.2, descricao: 'Ritmo confortável' },
  medio: { nome: 'Médio', multiplicador: 1.6, descricao: 'Desafio equilibrado' },
  dificil: { nome: 'Difícil', multiplicador: 2.2, descricao: 'Pouco tempo para pensar' },
  boss: { nome: 'Boss', multiplicador: 3, descricao: 'Caos máximo' },
}

function gerarValores(tamanho = 12, dificuldade = 'treino') {
  const base = Array.from({ length: tamanho }, () => Math.floor(Math.random() * 90) + 10)
  if (dificuldade === 'boss') return base.sort(() => Math.random() - 0.5)
  return base
}

const codigo = {
  bubble: ['for (let fim = n - 1; fim > 0; fim--) {', '  for (let i = 0; i < fim; i++) {', '    if (array[i] > array[i + 1]) {', '      trocar(array, i, i + 1)', '    }', '  }', '}'],
  selection: ['for (let i = 0; i < n - 1; i++) {', '  let menor = i', '  for (let j = i + 1; j < n; j++) {', '    if (array[j] < array[menor]) menor = j', '    trocar(array, i, menor)', '  }', '}'],
  insertion: ['for (let i = 1; i < n; i++) {', '  let j = i', '  while (j > 0) {', '    if (array[j - 1] <= array[j]) break', '    trocar(array, j - 1, j)', '  }', '}'],
  quick: ['function quickSort(esquerda, direita) {', '  const pivo = array[direita]', '  for (let j = esquerda; j < direita; j++) {', '    if (array[j] <= pivo) trocar(array, i, j)', '  }', '  quickSort(esquerda, pivo - 1)', '}'],
  merge: ['function merge(esquerda, direita) {', '  const meio = dividir(esquerda, direita)', '  while (i < esquerda && j < direita) {', '    comparar(esquerda[i], direita[j])', '    array[k++] = menor', '  }', '}'],
  heap: ['function heapify(n, i) {', '  let maior = i', '  comparar(filhoEsquerdo)', '  comparar(filhoDireito)', '  if (maior !== i) trocar(i, maior)', '}', 'heapSort(array)'],
  bfs: ['fila = [inicio]', 'while (fila.length) {', '  atual = fila.shift()', '  visitar(atual)', '  adicionarVizinhos(atual)', '}'],
  dfs: ['pilha = [inicio]', 'while (pilha.length) {', '  atual = pilha.pop()', '  visitar(atual)', '  adicionarVizinhos(atual)', '}'],
  dijkstra: ['dist[inicio] = 0', 'while (fila.length) {', '  atual = menorDistancia()', '  visitar(atual)', '  relaxarVizinhos(atual)', '}'],
  astar: ['f[inicio] = heuristica(inicio)', 'while (abertos.length) {', '  atual = menorF()', '  visitar(atual)', '  atualizarVizinhos(atual)', '}'],
}

const codigoNome = (id) => algoritmos.find((item) => item.id === id)?.nome || id

export default function App() {
  const [algoritmo, setAlgoritmo] = useState('bubble')
  const [valores, setValores] = useState(() => gerarValores())
  const [passos, setPassos] = useState([])
  const [passo, setPasso] = useState(null)
  const [indice, setIndice] = useState(0)
  const [rodando, setRodando] = useState(false)
  const [pausado, setPausado] = useState(false)
  const [finalizado, setFinalizado] = useState(false)
  const [velocidade, setVelocidade] = useState(1)
  const [tamanho, setTamanho] = useState(12)
  const [dificuldade, setDificuldade] = useState('treino')
  const [modo, setModo] = useState('visualizador')
  const [comparacoes, setComparacoes] = useState(0)
  const [movimentos, setMovimentos] = useState(0)
  const [tempo, setTempo] = useState(0)
  const [pontuacao, setPontuacao] = useState(0)
  const [historico, setHistorico] = useState(() => JSON.parse(localStorage.getItem('arena-historico') || '[]'))
  const [ranking, setRanking] = useState(() => JSON.parse(localStorage.getItem('arena-ranking') || '[]'))
  const [rival, setRival] = useState('quick')
  const [raceInfo, setRaceInfo] = useState(null)
  const inicioRef = useRef(null)
  const valoresIniciaisRef = useRef([...valores])
  const execucaoRef = useRef(0)
  const refs = useRef(new Map())
  const previousRects = useRef(new Map())

  const atual = algoritmos.find((item) => item.id === algoritmo)
  const eGrafo = atual?.categoria === 'Grafos'
  const maior = useMemo(() => Math.max(...valores, 1), [valores])
  const linhaAtiva = passo?.linha ?? 0
  const duracaoBase = passo?.tipo === 'troca' ? 520 : passo?.tipo === 'comparacao' ? 300 : 180
  const dificuldadeAtual = dificuldades[dificuldade]
  const rivalInfo = algoritmos.find((item) => item.id === rival)
  const raceProgresso = raceInfo ? Math.min(100, Math.round((tempo / Math.max(raceInfo.tempoEstimado, 1)) * 100)) : 0
  const tempoFormatado = String(Math.floor(tempo / 60000)).padStart(2, '0') + ':' + String(Math.floor((tempo % 60000) / 1000)).padStart(2, '0') + '.' + String(Math.floor((tempo % 1000) / 10)).padStart(2, '0')

  function aplicarPasso(evento, novoIndice) {
    if (!evento) return
    setPasso(evento)
    setIndice(novoIndice)
    if (evento.valores) setValores(evento.valores)
    setComparacoes(evento.comparacoes ?? comparacoes)
    setMovimentos(evento.movimentos ?? movimentos)
  }

  function salvarResultado(tempoFinal) {
    const base = Math.max(100, 10000 - tempoFinal / 10)
    const bonus = (comparacoes + movimentos * 2) > 0 ? Math.round(500 / (comparacoes + movimentos * 2)) : 0
    const pontos = Math.round((base + bonus) * dificuldadeAtual.multiplicador)
    setPontuacao(pontos)
    const registro = { algoritmo, nome: codigoNome(algoritmo), dificuldade, pontos, tempo: tempoFinal, data: new Date().toISOString() }
    const novoHistorico = [registro, ...historico].slice(0, 20)
    const novoRanking = [registro, ...ranking].sort((a, b) => b.pontos - a.pontos).slice(0, 10)
    setHistorico(novoHistorico)
    setRanking(novoRanking)
    localStorage.setItem('arena-historico', JSON.stringify(novoHistorico))
    localStorage.setItem('arena-ranking', JSON.stringify(novoRanking))
  }

  async function iniciar(reiniciar = false) {
    if (rodando && !reiniciar) return

    const execucaoAtual = ++execucaoRef.current
    const valoresExecucao = reiniciar ? [...valoresIniciaisRef.current] : valores

    if (reiniciar) {
      setValores([...valoresIniciaisRef.current])
      setPassos([])
      setPasso(null)
      setIndice(0)
      setFinalizado(false)
      setPausado(false)
      setComparacoes(0)
      setMovimentos(0)
      setTempo(0)
      setPontuacao(0)
    }

    if (modo === 'race' && !eGrafo) {
      const rivalResposta = await fetch('/api/ordenacao/' + rival, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ valores: valoresExecucao }) })
      if (!rivalResposta.ok || execucaoAtual !== execucaoRef.current) return
      const rivalDados = await rivalResposta.json()
      if (execucaoAtual !== execucaoRef.current) return
      const tempoEstimado = rivalDados.passos.reduce((total, item) => total + (item.tipo === 'troca' ? 520 : item.tipo === 'comparacao' ? 300 : 180) / dificuldadeAtual.multiplicador, 0) / velocidade
      setRaceInfo({ rivalPassos: rivalDados.passos.length, tempoEstimado, rivalNome: rivalDados.algoritmo })
    } else {
      setRaceInfo(null)
    }
    if (rodando && !reiniciar) return
    if (eGrafo) {
      const resposta = await fetch('/api/grafos/' + algoritmo, { method: 'POST' })
      if (!resposta.ok || execucaoAtual !== execucaoRef.current) return
      const dados = await resposta.json()
      if (execucaoAtual !== execucaoRef.current) return
      const lista = dados.grafo.passos
      setPassos(lista)
      setPasso(lista[0])
      setIndice(0)
      setFinalizado(false)
      setPausado(false)
      setTempo(0)
      setPontuacao(0)
      inicioRef.current = Date.now()
      setRodando(true)
      return
    }
    const resposta = await fetch('/api/ordenacao/' + algoritmo, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valores: valoresExecucao }),
    })
    if (!resposta.ok || execucaoAtual !== execucaoRef.current) return
    const dados = await resposta.json()
    if (execucaoAtual !== execucaoRef.current) return
    setPassos(dados.passos)
    setPasso(dados.passos[0])
    setIndice(0)
    setFinalizado(false)
    setPausado(false)
    setComparacoes(0)
    setMovimentos(0)
    setTempo(0)
    setPontuacao(0)
    inicioRef.current = Date.now()
    setRodando(true)
  }

  function encerrarExecucao() {
    const tempoFinal = Date.now() - inicioRef.current
    setRodando(false)
    setPausado(false)
    setFinalizado(true)
    setTempo(tempoFinal)
    if (modo !== 'visualizador') salvarResultado(tempoFinal)
  }

  useEffect(() => {
    if (!rodando || pausado || !passos.length) return undefined
    const timer = window.setTimeout(() => {
      if (indice >= passos.length - 1) {
        encerrarExecucao()
        return
      }
      aplicarPasso(passos[indice + 1], indice + 1)
    }, duracaoBase / velocidade / dificuldadeAtual.multiplicador)
    return () => window.clearTimeout(timer)
  }, [rodando, pausado, passos, indice, velocidade, dificuldade, duracaoBase])

  useEffect(() => {
    if (!rodando || pausado || !inicioRef.current) return undefined
    const timer = window.setInterval(() => setTempo(Date.now() - inicioRef.current), 10)
    return () => window.clearInterval(timer)
  }, [rodando, pausado])

  useEffect(() => {
    const atuais = new Map()
    refs.current.forEach((node, id) => node && atuais.set(id, node.getBoundingClientRect()))
    atuais.forEach((current, id) => {
      const previous = previousRects.current.get(id)
      const node = refs.current.get(id)
      if (!previous || !node) return
      const dx = previous.left - current.left
      const dy = previous.top - current.top
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return
      node.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }], {
        duration: passo?.tipo === 'troca' ? 520 / velocidade : 260 / velocidade,
        easing: 'cubic-bezier(.22,1,.36,1)',
      })
    })
    previousRects.current = atuais
  }, [valores, passo?.ids, velocidade])

  useEffect(() => {
    function teclado(evento) {
      if (evento.target instanceof HTMLInputElement || evento.target instanceof HTMLSelectElement) return
      if (evento.code === 'Space') {
        evento.preventDefault()
        if (rodando) setPausado((valor) => !valor)
        else iniciar(finalizado)
      }
      if (evento.key === 'ArrowLeft') passoAnterior()
      if (evento.key === 'ArrowRight') proximoPasso()
      if (evento.key.toLowerCase() === 'n' && !rodando) novoDesafio()
    }
    window.addEventListener('keydown', teclado)
    return () => window.removeEventListener('keydown', teclado)
  })

  function passoAnterior() {
    if (!passos.length || indice <= 0 || rodando && !pausado) return
    aplicarPasso(passos[indice - 1], indice - 1)
    setFinalizado(false)
  }

  function proximoPasso() {
    if (!passos.length || indice >= passos.length - 1 || rodando && !pausado) return
    const novoIndice = indice + 1
    aplicarPasso(passos[novoIndice], novoIndice)
    if (novoIndice === passos.length - 1) {
      setFinalizado(true)
      setRodando(false)
      setPausado(false)
    }
  }

  function novoDesafio() {
    ++execucaoRef.current
    const novos = gerarValores(tamanho, dificuldade)
    valoresIniciaisRef.current = [...novos]
    setValores(novos)
    setPassos([])
    setPasso(null)
    setIndice(0)
    setFinalizado(false)
    setPausado(false)
    setComparacoes(0)
    setMovimentos(0)
    setTempo(0)
    setPontuacao(0)
  }

  function alterarTamanho(novoTamanho) {
    if (rodando) return
    ++execucaoRef.current
    const novos = gerarValores(novoTamanho, dificuldade)
    valoresIniciaisRef.current = [...novos]
    setTamanho(novoTamanho)
    setValores(novos)
    setPassos([])
    setPasso(null)
    setIndice(0)
    setFinalizado(false)
    setPausado(false)
    setComparacoes(0)
    setMovimentos(0)
    setTempo(0)
    setPontuacao(0)
    setRaceInfo(null)
  }

  function selecionarAlgoritmo(id) {
    ++execucaoRef.current
    setRodando(false)
    setPausado(false)
    setTempo(0)
    setComparacoes(0)
    setMovimentos(0)
    setPasso(null)
    setIndice(0)
    setFinalizado(false)
    setAlgoritmo(id)
    setPassos([])
    setPasso(null)
    setIndice(0)
    setFinalizado(false)
    setPontuacao(0)
    if (algoritmos.find((item) => item.id === id)?.categoria === 'Ordenação') {
      const novos = gerarValores(tamanho, dificuldade)
      valoresIniciaisRef.current = [...novos]
      setValores(novos)
    }
  }

  function trocarModo(novoModo) {
    if (rodando) return
    setModo(novoModo)
    if (novoModo === 'race') setRival(algoritmo === 'bubble' ? 'quick' : 'bubble')
  }

  function renderArray() {
    return <div className="array">{valores.map((valor, index) => {
      const id = passo?.ids?.[index] ?? index
      const destaque = passo?.indices?.includes(index)
      return <div className="array-item-wrapper" key={id} ref={(node) => node ? refs.current.set(id, node) : refs.current.delete(id)}>
        <div className={'array-item' + (destaque ? ' compare' : '') + (finalizado ? ' done' : '') + (passo?.tipo === 'troca' && destaque ? ' swapping' : '')} style={{ '--item-height': Math.max(46, (valor / maior) * 230) + 'px' }}>
          <span>{valor}</span>
        </div>
        <small>{index}</small>
      </div>
    })}</div>
  }

  function renderGraph() {
    const visited = new Set(passo?.visited || [])
    const active = passo?.node
    const positions = [[10,50],[28,22],[28,78],[47,18],[47,50],[47,82],[70,28],[70,72]]
    return <div className="graph">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">{[[0,1],[0,2],[1,3],[1,4],[2,4],[2,5],[3,6],[4,6],[4,7],[5,7],[6,7]].map(([a,b]) => <line key={a+'-'+b} x1={positions[a][0]} y1={positions[a][1]} x2={positions[b][0]} y2={positions[b][1]} />)}</svg>
      {positions.map(([x,y], node) => <div key={node} className={'graph-node' + (visited.has(node) ? ' visited' : '') + (active === node ? ' active' : '')} style={{ left: x + '%', top: y + '%' }}>{node}</div>)}
    </div>
  }

  const estadoTexto = passo?.mensagem || 'Execute o algoritmo para acompanhar cada etapa.'
  const passosAtuais = passos.length ? indice + 1 + ' / ' + passos.length : 'Aguardando execução'
  const listaRanking = ranking.length ? ranking : historico

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">⚔</span><div><strong>Arena de Algoritmos</strong><small>Visualize. Entenda. Domine.</small></div></div>
      <div className="topbar-actions">
        <div className="mode-switch">
          {['visualizador','race'].map(item => <button key={item} className={modo === item ? 'active' : ''} onClick={() => trocarModo(item)}>{item === 'race' ? '🏁 Race' : 'Visualizador'}</button>)}
        </div>
        <select value={dificuldade} onChange={(e) => setDificuldade(e.target.value)} disabled={rodando}>{Object.entries(dificuldades).map(([id,item]) => <option key={id} value={id}>{item.nome}</option>)}</select>
      </div>
    </header>

    <div className="workspace">
      <aside className="sidebar">
        <div className="sidebar-heading">Algoritmos</div>
        {['Ordenação','Grafos'].map(categoria => <div className="algorithm-group" key={categoria}>
          <span className="group-title">{categoria}</span>
          {algoritmos.filter(item => item.categoria === categoria).map(item => <button key={item.id} className={'algorithm-item' + (algoritmo === item.id ? ' active' : '')} onClick={() => selecionarAlgoritmo(item.id)}><span>{item.nome}</span></button>)}
        </div>)}
        <div className="sidebar-section"><span className="group-title">Arena</span><div className="arena-note">🔥 Multiplicador {dificuldadeAtual.multiplicador}x<br />{dificuldadeAtual.descricao}</div></div>
      </aside>

      <section className="content">
        <div className="stage">
          <div className="stage-header">
            <div><span className="section-kicker">{modo === 'race' ? '🏁 CORRIDA DE ALGORITMOS' : eGrafo ? 'ARENA DE GRAFOS' : 'ARENA DE ORDENAÇÃO'}</span><h1>{atual.nome}</h1></div>
            <div className="header-actions"><button className="new-challenge" onClick={novoDesafio} disabled={rodando}>Novo desafio</button>{modo === 'race' && <select value={rival} onChange={(e) => setRival(e.target.value)} disabled={rodando}><option value="bubble">Bubble Sort</option><option value="selection">Selection Sort</option><option value="insertion">Insertion Sort</option><option value="quick">Quick Sort</option><option value="merge">Merge Sort</option><option value="heap">Heap Sort</option></select>}</div>
          </div>

          <div className="arena-stats"><div><span>Pontuação</span><strong>{pontuacao}</strong></div><div><span>Tempo</span><strong>{tempoFormatado}</strong></div><div><span>Comparações</span><strong>{comparacoes}</strong></div><div><span>Movimentos</span><strong>{movimentos}</strong></div></div>

          <div className="visualizer">
            <div className="visualizer-status"><span>{estadoTexto}</span><span>Passo {passosAtuais}</span></div>
            {eGrafo ? renderGraph() : renderArray()}
            <div className="operation-message">{passo?.tipo === 'comparacao' ? 'Comparando elementos.' : passo?.tipo === 'troca' ? 'Movimento realizado.' : dificuldadeAtual.descricao}</div>
          </div>

          <div className="timeline"><div className="timeline-meta"><span>Timeline</span><span>{passosAtuais}</span></div><input type="range" min="0" max={Math.max(passos.length - 1,0)} value={passos.length ? indice : 0} onChange={(e) => { if (!passos.length) return; const i=Number(e.target.value); aplicarPasso(passos[i],i); const fim=i===passos.length-1; setFinalizado(fim); if(fim){setRodando(false);setPausado(false)} }} disabled={!passos.length || rodando && !pausado} /></div>

          {!eGrafo && <div className="array-settings"><label>Tamanho do array <input type="range" min="6" max="20" value={tamanho} onChange={(e) => alterarTamanho(Number(e.target.value))} disabled={rodando} /><strong>{tamanho}</strong></label></div>}

          <div className="playback">
            <button onClick={() => { if(passos.length && !rodando) aplicarPasso(passos[0],0) }} disabled={!passos.length || rodando}>⏮</button>
            <button onClick={passoAnterior} disabled={!passos.length || indice===0 || rodando && !pausado}>◀</button>
            <button className="play" onClick={() => {
              if (rodando) {
                setPausado((valor) => !valor)
                return
              }
              iniciar(finalizado)
            }}>{rodando ? (pausado ? '▶' : 'Ⅱ') : '▶'}</button>
            <button onClick={proximoPasso} disabled={!passos.length || indice>=passos.length-1 || rodando && !pausado}>▶</button>
            <button onClick={() => { if(passos.length && !rodando){ aplicarPasso(passos[passos.length-1],passos.length-1); setFinalizado(true) } }} disabled={!passos.length || rodando}>⏭</button>
            <label>Velocidade <select value={velocidade} onChange={(e)=>setVelocidade(Number(e.target.value))} disabled={rodando && !pausado}><option value="0.5">0.5x</option><option value="1">1x</option><option value="2">2x</option><option value="4">4x</option></select></label>
          </div>

          <div className="shortcut-hint"><span><kbd>Space</kbd> play/pause</span><span><kbd>←</kbd><kbd>→</kbd> navegar mesmo pausado</span><span><kbd>N</kbd> novo desafio</span></div>

          <div className="info-grid">
            <section className="info-panel"><div className="panel-title">Explicação</div><h2>{passo?.tipo || 'Execução'}</h2><p>{estadoTexto}</p></section>
            <section className="info-panel"><div className="panel-title">Estado</div><div className="state-list">{Object.entries(passo?.variaveis || {}).slice(0,6).map(([chave,valor])=><div key={chave}><span>{chave}</span><strong>{String(valor)}</strong></div>)}<div><span>pontuação</span><strong>{pontuacao}</strong></div><div><span>dificuldade</span><strong>{dificuldadeAtual.nome}</strong></div></div></section>
          </div>

          {modo === 'race' && <section className="race-panel"><div><span className="section-kicker">RIVAL</span><h2>{rivalInfo?.nome}</h2><p>Mesmo desafio, com progresso estimado a partir dos passos reais do algoritmo rival.</p><div className="race-progress"><span style={{width: raceProgresso + '%'}} /></div><small>{raceInfo ? raceProgresso + '% concluído' : 'Aguardando corrida'}</small></div><div className="race-badge">⚔ VS ⚔</div></section>}

          <section className="history-panel"><div className="history-header"><div><span className="section-kicker">PROGRESSO</span><h2>Ranking & histórico</h2></div><span>{listaRanking.length}/10 melhores</span></div>{listaRanking.length ? <div className="ranking-list">{listaRanking.slice(0,10).map((item,index)=><div key={item.data+item.algoritmo+index}><b>#{index+1}</b><span>{item.nome}</span><span>{dificuldades[item.dificuldade]?.nome}</span><strong>{item.pontos} pts</strong></div>)}</div> : <p className="empty-state">Complete uma corrida para registrar sua pontuação.</p>}</section>
        </div>

        <aside className="code-panel">
          <div className="code-header"><div><span className="section-kicker">IMPLEMENTAÇÃO</span><h2>{atual.nome}</h2></div><span className="language">{eGrafo ? 'Busca em grafo' : 'JavaScript'}</span></div>
          <pre>{(codigo[algoritmo] || []).map((linha,index)=><code className={'code-line'+(linhaAtiva===index+1?' active':'')} key={index}><span>{String(index+1).padStart(2,'0')}</span>{linha}</code>)}</pre>
          <div className="code-footer">A linha destacada acompanha a etapa atual da visualização.</div>
        </aside>
      </section>
    </div>
  </main>
}
