import { useEffect, useMemo, useRef, useState } from 'react'

const algorithms = [
  ['bubble','Bubble Sort','Ordenação'],['selection','Selection Sort','Ordenação'],['insertion','Insertion Sort','Ordenação'],
  ['quick','Quick Sort','Ordenação'],['merge','Merge Sort','Ordenação'],['heap','Heap Sort','Ordenação'],
  ['bfs','BFS','Grafos'],['dfs','DFS','Grafos'],['dijkstra','Dijkstra','Grafos'],['astar','A*','Grafos'],
  ['bst','BST','Árvores'],['avl','AVL','Árvores'],['treeheap','Heap','Árvores'],

]
const difficulties={treino:['Treino',1,'Sem pressão'],facil:['Fácil',1.2,'Ritmo confortável'],medio:['Médio',1.6,'Desafio equilibrado'],dificil:['Difícil',2.2,'Pouco tempo para pensar'],boss:['Boss',3,'Caos máximo']}
const code={
 bubble:['for (let fim = n - 1; fim > 0; fim--) {','  for (let i = 0; i < fim; i++) {','    if (array[i] > array[i + 1]) {','      trocar(array, i, i + 1)','    }','  }','}'],
 selection:['for (let i = 0; i < n - 1; i++) {','  let menor = i','  for (let j = i + 1; j < n; j++) {','    if (array[j] < array[menor]) menor = j','    trocar(array, i, menor)','  }','}'],
 insertion:['for (let i = 1; i < n; i++) {','  let j = i','  while (j > 0) {','    if (array[j - 1] <= array[j]) break','    trocar(array, j - 1, j)','  }','}'],
 quick:['function quickSort(esquerda, direita) {','  const pivo = array[direita]','  for (let j = esquerda; j < direita; j++) {','    if (array[j] <= pivo) trocar(array, i, j)','  }','  quickSort(esquerda, pivo - 1)','}'],
 merge:['function merge(esquerda, direita) {','  const meio = dividir(esquerda, direita)','  while (i < esquerda && j < direita) {','    comparar(esquerda[i], direita[j])','    array[k++] = menor','  }','}'],
 heap:['function heapify(n, i) {','  let maior = i','  comparar(filhoEsquerdo)','  comparar(filhoDireito)','  if (maior !== i) trocar(i, maior)','}','heapSort(array)'],
 bfs:['fila = [inicio]','while (fila.length) {','  atual = fila.shift()','  visitar(atual)','  adicionarVizinhos(atual)','}'],
 dfs:['pilha = [inicio]','while (pilha.length) {','  atual = pilha.pop()','  visitar(atual)','  adicionarVizinhos(atual)','}'],
 dijkstra:['dist[inicio] = 0','while (fila.length) {','  atual = menorDistancia()','  visitar(atual)','  relaxarVizinhos(atual)','}'],
 astar:['f[inicio] = heuristica(inicio)','while (abertos.length) {','  atual = menorF()','  visitar(atual)','  atualizarVizinhos(atual)','}'],
 bst:['inserir(raiz, valor)','comparar(valor, no)','escolherEsquerdaOuDireita()','inserir(filho, valor)','visitar(no)','retornar(raiz)'],
 avl:['inserir(no, valor)','atualizarAltura(no)','calcularBalanceamento(no)','rotacionar(no)','retornar(no)'],
 treeheap:['heap.push(valor)','subirEnquantoMaior()','trocar(pai, filho)','heapify()','extrairMaior()']
}

function values(size=12){return Array.from({length:size},()=>Math.floor(Math.random()*90)+10)}
function apiFor(id){if(['bfs','dfs','dijkstra','astar'].includes(id))return '/api/grafos/'+id;if(['bst','avl','treeheap'].includes(id))return '/api/arvores/'+id;return '/api/ordenacao/'+id}
function isSort(id){return ['bubble','selection','insertion','quick','merge','heap'].includes(id)}
function isGraph(id){return ['bfs','dfs','dijkstra','astar'].includes(id)}
function isTree(id){return ['bst','avl','treeheap'].includes(id)}

export default function App(){
 const [algorithm,setAlgorithm]=useState('bubble'), [array,setArray]=useState(()=>values()), [initial,setInitial]=useState(()=>array)
 const [steps,setSteps]=useState([]), [step,setStep]=useState(null), [index,setIndex]=useState(0), [running,setRunning]=useState(false), [paused,setPaused]=useState(false), [finished,setFinished]=useState(false)
 const [speed,setSpeed]=useState(1), [size,setSize]=useState(12), [zoom,setZoom]=useState(100), [difficulty,setDifficulty]=useState('treino'), [mode,setMode]=useState('visualizador')
 const [comparisons,setComparisons]=useState(0), [moves,setMoves]=useState(0), [time,setTime]=useState(0), [score,setScore]=useState(0)
 const [rival,setRival]=useState('quick'), [rivalSteps,setRivalSteps]=useState([]), [rivalIndex,setRivalIndex]=useState(0), [history,setHistory]=useState(()=>JSON.parse(localStorage.getItem('arena-historico')||'[]'))
 const [ranking,setRanking]=useState(()=>JSON.parse(localStorage.getItem('arena-ranking')||'[]')), [error,setError]=useState('')
 const execution=useRef(0), started=useRef(null)

 const meta=algorithms.find(x=>x[0]===algorithm), category=meta[2], difficultyInfo=difficulties[difficulty]
 const currentArray=step?.valores||array, max=Math.max(...currentArray,1)
 const progress=steps.length?Math.round(index/(steps.length-1)*100):0
 const rivalProgress=rivalSteps.length?Math.round(rivalIndex/(rivalSteps.length-1)*100):0
 const timeText=String(Math.floor(time/60000)).padStart(2,'0')+':'+String(Math.floor(time%60000/1000)).padStart(2,'0')+'.'+String(Math.floor(time%1000/10)).padStart(2,'0')
 const eventMessage=step?.mensagem||'Execute o desafio para acompanhar cada etapa.'

 function apply(s,i){if(!s)return;setStep(s);setIndex(i);if(s.valores)setArray(s.valores);setComparisons(s.comparacoes??0);setMoves(s.movimentos??0)}
 function reset(newValues=array){setArray([...newValues]);setInitial([...newValues]);setSteps([]);setStep(null);setIndex(0);setRunning(false);setPaused(false);setFinished(false);setComparisons(0);setMoves(0);setTime(0);setScore(0);setRivalSteps([]);setRivalIndex(0)}
 function newChallenge(){++execution.current;reset(values(size));}
 function changeSize(n){if(running)return;const v=values(n);setSize(n);reset(v)}
 async function selectAlgorithm(id){
   ++execution.current;
   setAlgorithm(id);
   if(isSort(id)){
     const v=values(size);
     reset(v);
     return;
   }
   reset(array);
   if(isTree(id)){
     try{
       const res=await fetch('/api/arvores/'+id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({valores:array})});
       if(!res.ok)return;
       const data=await res.json();
       const list=Array.isArray(data.passos)?data.passos:[];
       if(list.length){setSteps(list);apply(list[0],0);}
     }catch{}
   }
 }
 function saveResult(ms){const points=Math.max(100,Math.round((10000-ms/10+500/Math.max(comparisons+moves*2,1))*difficultyInfo[1]));setScore(points);const r={algoritmo:algorithm,nome:meta[1],dificuldade,nomeDificuldade:difficultyInfo[0],pontos:points,tempo:ms,data:new Date().toISOString()};const h=[r,...history].slice(0,20),rank=[...h].sort((a,b)=>b.pontos-a.pontos).slice(0,10);setHistory(h);setRanking(rank);localStorage.setItem('arena-historico',JSON.stringify(h));localStorage.setItem('arena-ranking',JSON.stringify(rank))}
 async function start(restart=false){
   if(running&&!restart)return;
   const token=++execution.current;
   const source=restart?[...initial]:[...array];
   setError('');
   if(restart)reset(source);
   try{
    const needsBody=isSort(algorithm)||isTree(algorithm);
    const mainRes=await fetch(apiFor(algorithm),{
      method:'POST',
      headers:needsBody?{'Content-Type':'application/json'}:undefined,
      body:needsBody?JSON.stringify({valores:source}):undefined
    });
    if(!mainRes.ok||token!==execution.current)throw new Error('request');
    const data=await mainRes.json();
    if(token!==execution.current)return;
    const list=Array.isArray(data.passos)?data.passos:[];
    if(!list.length)throw new Error('steps');
    setSteps(list);
    apply(list[0],0);
    setFinished(false);
    setPaused(false);
    setTime(0);
    setScore(0);
    if(mode==='race'&&isSort(algorithm)){
      const rr=await fetch('/api/ordenacao/'+rival,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({valores:source})});
      if(rr.ok&&token===execution.current){
        const rd=await rr.json();
        setRivalSteps(Array.isArray(rd.passos)?rd.passos:[]);
        setRivalIndex(0);
      }
    }else{
      setRivalSteps([]);
      setRivalIndex(0);
    }
    started.current=Date.now();
    setRunning(true);
   }catch(e){
    if(token===execution.current){
      setRunning(false);
      setError('Não foi possível carregar a arena. Verifique o backend.');
    }
   }
 }
 function finish(){const ms=Date.now()-started.current;setRunning(false);setPaused(false);setFinished(true);setTime(ms);if(mode==='race')saveResult(ms)}
 function next(){if(!steps.length||index>=steps.length-1)return;apply(steps[index+1],index+1)}
 function prev(){if(!steps.length||index<=0)return;apply(steps[index-1],index-1);setFinished(false)}
 function togglePlay(){if(running){setPaused(x=>!x);return}start(finished)}
 function changeMode(m){if(running)return;setMode(m);if(m==='race')setRival(algorithm==='bubble'?'quick':'bubble')}
 useEffect(()=>{if(!running||paused||!steps.length)return;const t=setTimeout(()=>{if(index>=steps.length-1)finish();else next()},180/difficultyInfo[1]/speed);return()=>clearTimeout(t)},[running,paused,index,steps,speed,difficulty])
 useEffect(()=>{if(!running||paused||!started.current)return;const t=setInterval(()=>setTime(Date.now()-started.current),10);return()=>clearInterval(t)},[running,paused])
 useEffect(()=>{if(!running||paused||!rivalSteps.length)return;const t=setInterval(()=>setRivalIndex(i=>Math.min(i+1,rivalSteps.length-1)),180/difficultyInfo[1]/speed);return()=>clearInterval(t)},[running,paused,rivalSteps,speed,difficulty])
 useEffect(()=>{const key=e=>{if(e.target.matches('input,select,button'))return;if(e.code==='Space'){e.preventDefault();togglePlay()}if(e.key==='ArrowLeft'&&!running)prev();if(e.key==='ArrowRight'&&!running)next();if(e.key.toLowerCase()==='n'&&!running)newChallenge()};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)})
 const visualArray=useMemo(()=>currentArray,[currentArray])
 function renderArray(){return <div className="array">{visualArray.map((v,i)=><div className="array-item-wrap" key={(step?.ids?.[i]??i)+'-'+i}><div className={'array-item '+(step?.indices?.includes(i)?'active ':'')+(finished?'done':'')} style={{height:Math.max(42,v/max*220)}}><span>{v}</span></div><small>{i}</small></div>)}</div>}
 function renderGraph(){const pos=[[9,50],[28,20],[28,80],[47,16],[47,50],[47,84],[70,27],[70,73]], visited=new Set(step?.visited||[]), path=new Set(step?.path||[]);return <div className="graph">{<svg viewBox="0 0 100 100" preserveAspectRatio="none">{[[0,1,1],[0,2,4],[1,3,2],[1,4,3],[2,4,1],[2,5,2],[3,6,2],[4,6,2],[4,7,5],[5,7,1],[6,7,1]].map(([a,b,w])=><g key={a+'-'+b}><line className={path.has(a)&&path.has(b)?'path':''} x1={pos[a][0]} y1={pos[a][1]} x2={pos[b][0]} y2={pos[b][1]}/><text x={(pos[a][0]+pos[b][0])/2} y={(pos[a][1]+pos[b][1])/2}>{w}</text></g>)}</svg>}{pos.map(([x,y],n)=><div key={n} className={'graph-node '+(visited.has(n)?'visited ':'')+(step?.node===n?'active ':'')+(path.has(n)?'path':'')} style={{left:x+'%',top:y+'%'}}>{n}</div>)}</div>}
 function renderTree(){
  const finalStep=steps[steps.length-1];
  if(algorithm==='treeheap'){
    const heap=finalStep?.nodes||[];
    const heapNode=(i)=>{
      if(i>=heap.length)return null;
      return <div className="tree-branch" key={i}>
        <div className={'tree-node '+(i===step?.node?'active':'')}>{heap[i]}</div>
        {(2*i+1<heap.length||2*i+2<heap.length)&&<div className="tree-children">
          {heapNode(2*i+1)}{heapNode(2*i+2)}
        </div>}
      </div>;
    };
    return <div className="tree-canvas">{heapNode(0)}</div>;
  }
  const tree=finalStep?.tree||[];
  const byId=new Map(tree.map(n=>[n.id,n]));
  const parentIds=new Set();
  tree.forEach(n=>{if(n.esquerda!=null)parentIds.add(n.esquerda);if(n.direita!=null)parentIds.add(n.direita)});
  const root=tree.find(n=>!parentIds.has(n.id))?.id;
  const treeNode=(id)=>{
    if(id==null)return null;
    const n=byId.get(id);if(!n)return null;
    return <div className="tree-branch" key={id}>
      <div className={'tree-node '+(id===step?.node?'active':'')}>{n.valor}</div>
      {(n.esquerda!=null||n.direita!=null)&&<div className="tree-children">
        {treeNode(n.esquerda)}{treeNode(n.direita)}
      </div>}
    </div>;
  };
  return <div className="tree-canvas">{treeNode(root)}</div>;
 }
 function renderVisual(){if(isGraph(algorithm))return renderGraph();if(isTree(algorithm))return renderTree();return renderArray()}
 const lines=code[algorithm]||[]
 return <main className="app-shell">
  <header className="topbar"><div className="brand"><span>⚔</span><div><strong>Arena de Algoritmos</strong><small>Visualize. Entenda. Domine.</small></div></div><div className="top-actions"><div className="mode-switch"><button className={mode==='visualizador'?'active':''} onClick={()=>changeMode('visualizador')}>Visualizador</button><button className={mode==='race'?'active':''} onClick={()=>changeMode('race')}>🏁 Race</button></div><select value={difficulty} onChange={e=>setDifficulty(e.target.value)} disabled={running}>{Object.entries(difficulties).map(([k,v])=><option key={k} value={k}>{v[0]}</option>)}</select></div></header>
  <div className="workspace"><aside className="sidebar"><div className="sidebar-title">Algoritmos</div>{['Ordenação','Grafos','Árvores'].map(cat=><section key={cat}><span>{cat}</span>{algorithms.filter(a=>a[2]===cat).map(a=><button key={a[0]} className={algorithm===a[0]?'selected':''} onClick={()=>selectAlgorithm(a[0])}>{a[1]}</button>)}</section>)}<div className="arena-note">🔥 {difficultyInfo[1]}x<br/><small>{difficultyInfo[2]}</small></div></aside>
  <section className="content"><div className="stage"><div className="stage-head"><div><small>{mode==='race'?'CORRIDA':category.toUpperCase()}</small><h1>{meta[1]}</h1></div><div className="stage-actions"><button onClick={newChallenge} disabled={running}>Novo desafio</button>{mode==='race'&&isSort(algorithm)&&<select value={rival} onChange={e=>setRival(e.target.value)} disabled={running}>{algorithms.filter(a=>isSort(a[0])&&a[0]!==algorithm).map(a=><option key={a[0]} value={a[0]}>{a[1]}</option>)}</select>}</div></div>
   {error&&<div className="error">{error}</div>}<div className="stats"><div><small>Pontuação</small><b>{score}</b></div><div><small>Tempo</small><b>{timeText}</b></div><div><small>Comparações</small><b>{comparisons}</b></div><div><small>Movimentos</small><b>{moves}</b></div></div>
   <div className="visualizer"><div className="visualizer-head"><span>{eventMessage}</span><span>{steps.length?index+1+' / '+steps.length:'Aguardando execução'}</span></div><div className="visual-scale" style={{transform:`scale(${zoom/100})`}}>{renderVisual()}</div><div className="operation">{step?.tipo||'pronto'} · {difficultyInfo[2]}</div></div>
   {mode==='race'&&isSort(algorithm)&&<div className="race-board"><div><b>VOCÊ</b><span>{progress}%</span><div><i style={{width:progress+'%'}}/></div></div><div><b>{rival.toUpperCase()}</b><span>{rivalProgress}%</span><div><i style={{width:rivalProgress+'%'}}/></div></div></div>}
   <div className="timeline"><label>Timeline <span>{progress}%</span></label><input type="range" min="0" max={Math.max(steps.length-1,0)} value={steps.length?index:0} onChange={e=>{const i=+e.target.value;apply(steps[i],i);setFinished(i===steps.length-1)}} disabled={!steps.length||running&&!paused}/></div>
   <div className="control-row"><div className="array-size">{isSort(algorithm)&&<label>Tamanho do vetor <input type="range" min="6" max="20" value={size} onChange={e=>changeSize(+e.target.value)} disabled={running}/><b>{size}</b></label>}</div>
   <div className="controls"><button onClick={()=>steps.length&&apply(steps[0],0)} disabled={!steps.length||running}>⏮</button><button onClick={prev} disabled={!steps.length||index===0||running&&!paused}>◀</button><button className="play" onClick={togglePlay}>{running?(paused?'▶':'Ⅱ'):'▶'}</button><button onClick={next} disabled={!steps.length||index>=steps.length-1||running&&!paused}>▶</button><button onClick={()=>steps.length&&apply(steps[steps.length-1],steps.length-1)} disabled={!steps.length||running}>⏭</button><label>Velocidade <select value={speed} onChange={e=>setSpeed(Number(e.target.value))} disabled={running&&!paused}><option value="0.5">0.5x</option><option value="1">1x</option><option value="2">2x</option><option value="4">4x</option></select></label></div><div className="zoom-control"><label>Zoom <input type="range" min="70" max="130" step="5" value={zoom} onChange={e=>setZoom(Number(e.target.value))}/><b>{zoom}%</b></label></div></div>
   <div className="info-grid"><article><small>ETAPA ATUAL</small><h2>{eventMessage}</h2><p>{step?.variaveis?Object.entries(step.variaveis).map(([k,v])=>k+': '+v).join(' · '):'Cada etapa sincroniza visualização, estado e código.'}</p></article><article><small>ESTADO</small><div className="state">{[['Passo',steps.length?index+1:0],['Total',steps.length],['Dificuldade',difficultyInfo[0]],['Pontuação',score]].map(x=><div key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></div>)}</div></article></div>
   <div className="history"><div><small>RANKING LOCAL · TOP 10</small><button onClick={()=>{localStorage.removeItem('arena-ranking');setRanking([])}}>Limpar</button></div>{(ranking.length?ranking:history).length?<ol>{(ranking.length?ranking:history).map((r,i)=><li key={r.data+i}><span>#{i+1}</span><b>{r.nome}</b><small>{r.nomeDificuldade}</small><strong>{r.pontos}</strong></li>)}</ol>:<p>Nenhuma partida registrada ainda.</p>}</div>
  </div><aside className="code"><div><small>CÓDIGO</small><h2>{meta[1]}</h2></div><pre>{lines.map((line,i)=><code className={step?.linha===i+1?'active':''} key={i}><span>{String(i+1).padStart(2,' ')}</span>{line}</code>)}</pre><footer>Espaço: play/pausa · ← →: navegar · N: novo desafio</footer></aside></section></div></main>
}