from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from heapq import heappush, heappop

app = FastAPI(title="Arena de Algoritmos", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OrdenacaoRequest(BaseModel):
    valores: list[int] = Field(min_length=2, max_length=100)

def passo(tipo, valores=None, **extra):
    item = {"tipo": tipo}
    if valores is not None:
        item["valores"] = valores.copy()
    item.update(extra)
    return item

def sorting_steps(values, algorithm):
    a, ids, steps = values.copy(), list(range(len(values))), []
    comp = moves = 0
    def add(tipo, line, message, indices=None, variables=None):
        steps.append(passo(tipo, a, ids=ids, linha=line, mensagem=message,
                           indices=indices or [], variaveis=variables or {},
                           comparacoes=comp, movimentos=moves))
    add("inicio", 1, f"Array pronto para {algorithm}.", variables={"n": len(a)})
    def swap(i,j):
        nonlocal moves
        a[i],a[j]=a[j],a[i]; ids[i],ids[j]=ids[j],ids[i]; moves += 1
    if algorithm == "bubble":
        for end in range(len(a)-1,0,-1):
            changed=False
            for i in range(end):
                comp += 1; add("comparacao",3,f"Comparando {a[i]} e {a[i+1]}",[i,i+1],{"i":i,"fim":end})
                if a[i] > a[i+1]:
                    swap(i,i+1); changed=True; add("troca",4,"Elementos trocados.",[i,i+1],{"i":i})
            if not changed: break
    elif algorithm == "selection":
        for i in range(len(a)-1):
            m=i
            for j in range(i+1,len(a)):
                comp += 1; add("comparacao",3,f"Comparando {a[m]} e {a[j]}",[m,j],{"i":i,"j":j,"menor":m})
                if a[j] < a[m]: m=j; add("destaque",4,f"{a[m]} é o novo menor.",[m],{"menor":m})
            if m != i: swap(i,m); add("troca",5,f"Menor elemento foi para a posição {i}.",[i,m],{"i":i,"menor":m})
    elif algorithm == "insertion":
        for i in range(1,len(a)):
            j=i
            while j:
                comp += 1; add("comparacao",3,f"Comparando {a[j-1]} e {a[j]}",[j-1,j],{"i":i,"j":j})
                if a[j-1] <= a[j]: break
                swap(j-1,j); add("troca",4,"Elemento deslocado para a esquerda.",[j-1,j],{"j":j}); j-=1
    elif algorithm == "quick":
        def part(lo,hi):
            nonlocal comp
            pivot=a[hi]; i=lo
            for j in range(lo,hi):
                comp += 1; add("comparacao",3,f"Comparando {a[j]} com pivô {pivot}",[j,hi],{"j":j,"pivo":pivot})
                if a[j] <= pivot:
                    if i != j: swap(i,j); add("troca",4,"Elemento colocado no lado correto.",[i,j],{"i":i,"j":j})
                    i += 1
            if i != hi: swap(i,hi); add("troca",4,"Pivô colocado na posição final.",[i,hi],{"pivo":pivot,"posicao":i})
            return i
        def quick(lo,hi):
            if lo<hi:
                p=part(lo,hi); quick(lo,p-1); quick(p+1,hi)
        quick(0,len(a)-1)
    elif algorithm == "merge":
        def merge(lo,mid,hi):
            nonlocal comp,moves
            left=list(zip(a[lo:mid+1],ids[lo:mid+1])); right=list(zip(a[mid+1:hi+1],ids[mid+1:]))
            i=j=0
            for k in range(lo,hi+1):
                if i==len(left): val,ident=right[j]; j+=1
                elif j==len(right): val,ident=left[i]; i+=1
                else:
                    comp+=1; add("comparacao",3,f"Comparando {left[i][0]} e {right[j][0]}",[lo+i,mid+1+j],{"destino":k})
                    if left[i][0] <= right[j][0]: val,ident=left[i]; i+=1
                    else: val,ident=right[j]; j+=1
                a[k],ids[k]=val,ident; moves+=1; add("troca",4,"Elemento colocado na mesclagem.",[k],{"destino":k})
        def merge_sort(lo,hi):
            if lo>=hi:return
            mid=(lo+hi)//2; merge_sort(lo,mid); merge_sort(mid+1,hi); merge(lo,mid,hi)
        merge_sort(0,len(a)-1)
    elif algorithm == "heap":
        def heapify(n,i):
            nonlocal comp
            largest=i; children=[2*i+1,2*i+2]
            for c in children:
                if c<n:
                    comp+=1; add("comparacao",3,f"Comparando {a[largest]} e {a[c]}",[largest,c],{"raiz":i,"tamanho":n})
                    if a[c]>a[largest]: largest=c
            if largest!=i: swap(i,largest); add("troca",4,"Maior elemento sobe no heap.",[i,largest],{"raiz":i,"maior":largest}); heapify(n,largest)
        for i in range(len(a)//2-1,-1,-1): heapify(len(a),i)
        for end in range(len(a)-1,0,-1):
            swap(0,end); add("troca",5,"Maior elemento extraído.",[0,end],{"fim":end}); heapify(end,0)
    add("fim",7,f"{algorithm.title()} Sort concluído.",variables={"comparacoes":comp,"movimentos":moves})
    return steps

SORTS = {"bubble":"Bubble Sort","selection":"Selection Sort","insertion":"Insertion Sort","quick":"Quick Sort","merge":"Merge Sort","heap":"Heap Sort"}

GRAPH = {"nodes":list(range(8)),"edges":[[0,1,1],[0,2,4],[1,3,2],[1,4,3],[2,4,1],[2,5,2],[3,6,2],[4,6,2],[4,7,5],[5,7,1],[6,7,1]]}

def graph_steps(kind):
    nodes=GRAPH["nodes"]; edges=GRAPH["edges"]; adj={n:[] for n in nodes}
    for a,b,w in edges: adj[a].append((b,w)); adj[b].append((a,w))
    steps=[]; dist={n:float("inf") for n in nodes}; prev={}; dist[0]=0
    def add(t,node=None,visited=None,**kw):
        steps.append({"tipo":t,"node":node,"visited":visited or [],"edges":kw.pop("edges",[]),"path":kw.pop("path",[]),
                      "linha":kw.pop("linha",3),"mensagem":kw.pop("mensagem",""),"variaveis":kw,"distancias":{str(k):None if v==float("inf") else v for k,v in dist.items()}})
    visited=[]; frontier=[0]; parent={}
    if kind in ("bfs","dfs"):
        stack=[0]
        while stack:
            u=stack.pop(0) if kind=="bfs" else stack.pop()
            if u in visited: continue
            visited.append(u); add("visita",u,visited.copy(),linha=3,mensagem=f"Visitando o nó {u}.",fila=stack.copy(),edges=[])
            neighbors=adj[u] if kind=="bfs" else list(reversed(adj[u]))
            for v,w in neighbors:
                if v not in visited and v not in stack:
                    stack.append(v); parent.setdefault(v,u)
                    add("fronteira",v,visited.copy(),linha=4,mensagem=f"Nó {v} entrou na fronteira.",fila=stack.copy(),edges=[[u,v]])
        target=7
    else:
        heap=[(0,0)]; closed=set()
        while heap:
            score,u=heappop(heap)
            if u in closed: continue
            closed.add(u); visited.append(u)
            add("visita",u,visited.copy(),linha=3,mensagem=f"Processando o nó {u}.",fila=[x[1] for x in heap])
            if u==7: break
            for v,w in adj[u]:
                if v in closed: continue
                nd=dist[u]+w
                if nd<dist[v]:
                    dist[v]=nd; prev[v]=u
                    h={0:7,1:6,2:3,3:3,4:3,5:1,6:1,7:0}[v] if kind=="astar" else 0
                    heappush(heap,(nd+h,v))
                    add("relaxamento",v,visited.copy(),linha=4,mensagem=f"Melhor caminho até {v}: custo {nd}.",vizinho=v,custo=nd,g=nd,h=h,f=nd+h)
        target=7
    path=[]; cur=target
    if cur in visited or target in prev:
        while cur in prev or cur==0:
            path.append(cur)
            if cur==0: break
            cur=parent.get(cur,prev.get(cur))
        path.reverse()
    final_cost = dist.get(target)\n    if final_cost == float("inf"):\n        final_cost = None\n    add("fim",target,visited.copy(),linha=6,path=path,mensagem=f"{kind.upper()} concluiu a busca.",custo=final_cost)
    return {"nodes":nodes,"edges":edges,"passos":steps}

def tree_steps(kind, values):
    source=list(dict.fromkeys(values))[:12]
    nodes={}
    steps=[]
    next_id=0
    def snapshot():
        return [{"id":n,"valor":v["valor"],"esquerda":v["esquerda"],"direita":v["direita"],"altura":v["altura"]} for n,v in nodes.items()]
    def add(tipo,node=None,linha=3,mensagem="",**variables):
        steps.append({"tipo":tipo,"node":node,"tree":snapshot(),"nodes":variables.pop("nos",None),"linha":linha,"mensagem":mensagem,"variaveis":variables})
    def height(n): return nodes[n]["altura"] if n is not None else 0
    def update(n): nodes[n]["altura"]=1+max(height(nodes[n]["esquerda"]),height(nodes[n]["direita"]))
    def new_node(value):
        nonlocal next_id
        ident=next_id; next_id+=1
        nodes[ident]={"valor":value,"esquerda":None,"direita":None,"altura":1}
        return ident
    root=None
    def bst_insert(current,value):
        nonlocal root
        if current is None: return new_node(value)
        if value < nodes[current]["valor"]:
            add("comparacao",current,3,f"Comparando {value} com {nodes[current]['valor']}.",valor=value,no=nodes[current]["valor"])
            nodes[current]["esquerda"]=bst_insert(nodes[current]["esquerda"],value)
        elif value > nodes[current]["valor"]:
            add("comparacao",current,3,f"Comparando {value} com {nodes[current]['valor']}.",valor=value,no=nodes[current]["valor"])
            nodes[current]["direita"]=bst_insert(nodes[current]["direita"],value)
        update(current)
        return current
    def rotate_right(y):
        x=nodes[y]["esquerda"]; t=nodes[x]["direita"]; nodes[x]["direita"]=y; nodes[y]["esquerda"]=t; update(y); update(x)
        add("rotacao",x,5,"Rotação à direita aplicada.",tipo_rotacao="direita")
        return x
    def rotate_left(x):
        y=nodes[x]["direita"]; t=nodes[y]["esquerda"]; nodes[y]["esquerda"]=x; nodes[x]["direita"]=t; update(x); update(y)
        add("rotacao",y,5,"Rotação à esquerda aplicada.",tipo_rotacao="esquerda")
        return y
    def avl_insert(current,value):
        if current is None: return new_node(value)
        if value < nodes[current]["valor"]: nodes[current]["esquerda"]=avl_insert(nodes[current]["esquerda"],value)
        elif value > nodes[current]["valor"]: nodes[current]["direita"]=avl_insert(nodes[current]["direita"],value)
        update(current); balance=height(nodes[current]["esquerda"])-height(nodes[current]["direita"])
        add("balanceamento",current,4,f"Fator de balanceamento de {nodes[current]['valor']}: {balance}.",fator=balance)
        if balance>1 and value<nodes[nodes[current]["esquerda"]]["valor"]: return rotate_right(current)
        if balance<-1 and value>nodes[nodes[current]["direita"]]["valor"]: return rotate_left(current)
        if balance>1:
            nodes[current]["esquerda"]=rotate_left(nodes[current]["esquerda"]); return rotate_right(current)
        if balance<-1:
            nodes[current]["direita"]=rotate_right(nodes[current]["direita"]); return rotate_left(current)
        return current
    if kind=="treeheap":
        heap=[]
        for value in source:
            heap.append(value); i=len(heap)-1
            add("insercao",i,3,f"Inserindo {value} no Max Heap.",valor=value,nos=heap.copy())
            while i>0:
                p=(i-1)//2
                if heap[p]>=heap[i]: break
                heap[p],heap[i]=heap[i],heap[p]; i=p
                add("troca",i,4,f"{value} subiu no Max Heap.",valor=value,nos=heap.copy())
        add("heap",0,4,"Max Heap construído.",tamanho=len(heap),raiz=heap[0] if heap else None,nos=heap.copy())
        return {"nodes":heap,"passos":steps}
    for value in source:
        if kind=="avl": root=avl_insert(root,value)
        else: root=bst_insert(root,value)
        add("insercao",root,3,f"Inserindo {value} na árvore.",valor=value,raiz=nodes[root]["valor"])
    def visit(n):
        if n is None:return
        add("visita",n,4,f"Visitando {nodes[n]['valor']}.",valor=nodes[n]["valor"])
        visit(nodes[n]["esquerda"]); visit(nodes[n]["direita"])
    visit(root)
    add("fim",root,6,f"{kind.upper()} concluída.",tamanho=len(nodes),altura=height(root))
    return {"nodes":snapshot(),"root":root,"passos":steps}

ALGORITHMS=[*[(k,n,"Ordenação") for k,n in SORTS.items()],
            *[("bfs","BFS","Grafos"),("dfs","DFS","Grafos"),("dijkstra","Dijkstra","Grafos"),("astar","A*","Grafos"),
              ("bst","BST","Árvores"),("avl","AVL","Árvores"),("treeheap","Heap","Árvores")]]

@app.get("/api/health")
def health(): return {"status":"ok","projeto":"arena-algoritmos","versao":"1.0.0"}

@app.get("/api/algoritmos")
def catalog(): return [{"id":i,"nome":n,"categoria":c,"disponivel":True} for i,n,c in ALGORITHMS]

@app.post("/api/ordenacao/{algorithm_id}")
def sorting(algorithm_id:str, request:OrdenacaoRequest):
    if algorithm_id not in SORTS: raise HTTPException(404,"Algoritmo não encontrado.")
    return {"algoritmo":SORTS[algorithm_id],"passos":sorting_steps(request.valores,algorithm_id)}

@app.api_route("/api/grafos/{algorithm_id}", methods=["GET","POST"])
def graphs(algorithm_id:str):
    if algorithm_id not in {"bfs","dfs","dijkstra","astar"}: raise HTTPException(404,"Grafo não encontrado.")
    result=graph_steps(algorithm_id)
    return {"algoritmo":algorithm_id.upper(),"grafo":result,"passos":result["passos"]}

@app.post("/api/arvores/{algorithm_id}")
def trees(algorithm_id:str, request:OrdenacaoRequest):
    if algorithm_id not in {"bst","avl","treeheap"}: raise HTTPException(404,"Árvore não encontrada.")
    result=tree_steps(algorithm_id,request.valores)
    return {"algoritmo":algorithm_id.upper(),"arvore":result,"passos":result["passos"]}

