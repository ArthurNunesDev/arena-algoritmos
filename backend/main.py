from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Arena de Algoritmos", version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class OrdenacaoRequest(BaseModel):
    valores: list[int] = Field(min_length=2, max_length=100)


def novo_passo(tipo, array, ids, linha, mensagem, variaveis=None, indices=None, comparacoes=0, movimentos=0):
    passo = {
        "tipo": tipo,
        "valores": array.copy(),
        "ids": ids.copy(),
        "linha": linha,
        "mensagem": mensagem,
        "variaveis": variaveis or {},
        "comparacoes": comparacoes,
        "movimentos": movimentos,
    }
    if indices is not None:
        passo["indices"] = indices
    return passo


def bubble_sort_passos(valores):
    array, ids, passos = valores.copy(), list(range(len(valores))), []
    comparacoes = movimentos = 0
    passos.append(novo_passo("inicio", array, ids, 1, "O array está pronto. Vamos iniciar o Bubble Sort.", {"fim": len(array) - 1, "i": 0}))
    for fim in range(len(array) - 1, 0, -1):
        trocou = False
        for i in range(fim):
            comparacoes += 1
            passos.append(novo_passo("comparacao", array, ids, 3, f"Comparando {array[i]} e {array[i + 1]}.", {"fim": fim, "i": i, "esquerda": array[i], "direita": array[i + 1]}, [i, i + 1], comparacoes, movimentos))
            if array[i] > array[i + 1]:
                array[i], array[i + 1] = array[i + 1], array[i]
                ids[i], ids[i + 1] = ids[i + 1], ids[i]
                movimentos += 1
                trocou = True
                passos.append(novo_passo("troca", array, ids, 4, f"Troca realizada: {array[i]} ficou antes de {array[i + 1]}.", {"fim": fim, "i": i, "esquerda": array[i], "direita": array[i + 1]}, [i, i + 1], comparacoes, movimentos))
        if not trocou:
            break
    passos.append(novo_passo("fim", array, ids, 7, "Ordenação concluída. O array está em ordem crescente.", {"fim": 0, "i": 0}, None, comparacoes, movimentos))
    return passos


def selection_sort_passos(valores):
    array, ids, passos = valores.copy(), list(range(len(valores))), []
    comparacoes = movimentos = 0
    passos.append(novo_passo("inicio", array, ids, 1, "Vamos procurar o menor elemento de cada posição.", {"i": 0, "menor": 0}))
    n = len(array)
    for i in range(n - 1):
        menor = i
        for j in range(i + 1, n):
            comparacoes += 1
            passos.append(novo_passo("comparacao", array, ids, 3, f"Comparando o candidato {array[menor]} com {array[j]}.", {"i": i, "j": j, "menor": menor}, [menor, j], comparacoes, movimentos))
            if array[j] < array[menor]:
                menor = j
                passos.append(novo_passo("destaque", array, ids, 4, f"{array[menor]} é o novo menor elemento.", {"i": i, "j": j, "menor": menor}, [menor], comparacoes, movimentos))
        if menor != i:
            array[i], array[menor] = array[menor], array[i]
            ids[i], ids[menor] = ids[menor], ids[i]
            movimentos += 1
            passos.append(novo_passo("troca", array, ids, 5, f"O menor elemento foi colocado na posição {i}.", {"i": i, "menor": menor}, [i, menor], comparacoes, movimentos))
    passos.append(novo_passo("fim", array, ids, 7, "Selection Sort concluído.", {"i": n - 1}, None, comparacoes, movimentos))
    return passos


def insertion_sort_passos(valores):
    array, ids, passos = valores.copy(), list(range(len(valores))), []
    comparacoes = movimentos = 0
    passos.append(novo_passo("inicio", array, ids, 1, "Vamos inserir cada elemento na parte já ordenada.", {"i": 1}))
    for i in range(1, len(array)):
        j = i
        while j > 0:
            comparacoes += 1
            passos.append(novo_passo("comparacao", array, ids, 3, f"Comparando {array[j - 1]} e {array[j]}.", {"i": i, "j": j}, [j - 1, j], comparacoes, movimentos))
            if array[j - 1] <= array[j]:
                break
            array[j - 1], array[j] = array[j], array[j - 1]
            ids[j - 1], ids[j] = ids[j], ids[j - 1]
            movimentos += 1
            passos.append(novo_passo("troca", array, ids, 4, "O elemento foi deslocado para a posição correta.", {"i": i, "j": j}, [j - 1, j], comparacoes, movimentos))
            j -= 1
    passos.append(novo_passo("fim", array, ids, 6, "Insertion Sort concluído.", {}, None, comparacoes, movimentos))
    return passos


def quick_sort_passos(valores):
    array, ids, passos = valores.copy(), list(range(len(valores))), []
    comparacoes = movimentos = 0
    passos.append(novo_passo("inicio", array, ids, 1, "Vamos particionar o array usando pivôs.", {"esquerda": 0, "direita": len(array) - 1}))
    def particao(esquerda, direita):
        nonlocal comparacoes, movimentos
        pivo = array[direita]
        i = esquerda
        for j in range(esquerda, direita):
            comparacoes += 1
            passos.append(novo_passo("comparacao", array, ids, 3, f"Comparando {array[j]} com o pivô {pivo}.", {"esquerda": esquerda, "direita": direita, "j": j, "pivo": pivo}, [j, direita], comparacoes, movimentos))
            if array[j] <= pivo:
                if i != j:
                    array[i], array[j] = array[j], array[i]
                    ids[i], ids[j] = ids[j], ids[i]
                    movimentos += 1
                    passos.append(novo_passo("troca", array, ids, 4, "Elemento movido para o lado correto do pivô.", {"i": i, "j": j, "pivo": pivo}, [i, j], comparacoes, movimentos))
                i += 1
        if i != direita:
            array[i], array[direita] = array[direita], array[i]
            ids[i], ids[direita] = ids[direita], ids[i]
            movimentos += 1
            passos.append(novo_passo("troca", array, ids, 4, "Pivô colocado em sua posição final.", {"i": i, "pivo": pivo}, [i, direita], comparacoes, movimentos))
        return i
    def ordenar(esquerda, direita):
        if esquerda < direita:
            p = particao(esquerda, direita)
            ordenar(esquerda, p - 1)
            ordenar(p + 1, direita)
    ordenar(0, len(array) - 1)
    passos.append(novo_passo("fim", array, ids, 7, "Quick Sort concluído.", {}, None, comparacoes, movimentos))
    return passos


def merge_sort_passos(valores):
    array, ids, passos = valores.copy(), list(range(len(valores))), []
    comparacoes = movimentos = 0
    passos.append(novo_passo("inicio", array, ids, 1, "Vamos dividir o array em partes menores e depois mesclá-las.", {"esquerda": 0, "direita": len(array) - 1}))
    def merge(esquerda, meio, direita):
        nonlocal comparacoes, movimentos
        left = array[esquerda:meio + 1]
        right = array[meio + 1:direita + 1]
        left_ids = ids[esquerda:meio + 1]
        right_ids = ids[meio + 1:direita + 1]
        i = j = 0
        destino = esquerda
        while i < len(left) and j < len(right):
            comparacoes += 1
            passos.append(novo_passo("comparacao", array, ids, 3, f"Comparando {left[i]} e {right[j]} durante a mesclagem.", {"esquerda": esquerda, "direita": direita, "destino": destino}, [esquerda + i, meio + 1 + j], comparacoes, movimentos))
            if left[i] <= right[j]:
                array[destino], ids[destino] = left[i], left_ids[i]
                i += 1
            else:
                array[destino], ids[destino] = right[j], right_ids[j]
                j += 1
            movimentos += 1
            passos.append(novo_passo("troca", array, ids, 4, "Elemento escolhido e colocado na área mesclada.", {"destino": destino}, [destino], comparacoes, movimentos))
            destino += 1
        while i < len(left):
            array[destino], ids[destino] = left[i], left_ids[i]
            i += 1
            destino += 1
            movimentos += 1
        while j < len(right):
            array[destino], ids[destino] = right[j], right_ids[j]
            j += 1
            destino += 1
            movimentos += 1
    def ordenar(esquerda, direita):
        if esquerda >= direita:
            return
        meio = (esquerda + direita) // 2
        ordenar(esquerda, meio)
        ordenar(meio + 1, direita)
        merge(esquerda, meio, direita)
    ordenar(0, len(array) - 1)
    passos.append(novo_passo("fim", array, ids, 7, "Merge Sort concluído.", {}, None, comparacoes, movimentos))
    return passos


def heap_sort_passos(valores):
    array, ids, passos = valores.copy(), list(range(len(valores))), []
    comparacoes = movimentos = 0
    passos.append(novo_passo("inicio", array, ids, 1, "Vamos construir um Max Heap e extrair o maior elemento.", {"tamanho": len(array)}))
    def heapify(n, i):
        nonlocal comparacoes, movimentos
        maior = i
        esquerda, direita = 2 * i + 1, 2 * i + 2
        if esquerda < n:
            comparacoes += 1
            passos.append(novo_passo("comparacao", array, ids, 3, f"Comparando raiz {array[maior]} com filho {array[esquerda]}.", {"raiz": i, "tamanho": n}, [maior, esquerda], comparacoes, movimentos))
            if array[esquerda] > array[maior]:
                maior = esquerda
        if direita < n:
            comparacoes += 1
            passos.append(novo_passo("comparacao", array, ids, 3, f"Comparando candidato {array[maior]} com filho {array[direita]}.", {"raiz": i, "tamanho": n}, [maior, direita], comparacoes, movimentos))
            if array[direita] > array[maior]:
                maior = direita
        if maior != i:
            array[i], array[maior] = array[maior], array[i]
            ids[i], ids[maior] = ids[maior], ids[i]
            movimentos += 1
            passos.append(novo_passo("troca", array, ids, 4, "O maior elemento sobe no heap.", {"raiz": i, "maior": maior}, [i, maior], comparacoes, movimentos))
            heapify(n, maior)
    for i in range(len(array) // 2 - 1, -1, -1):
        heapify(len(array), i)
    for fim in range(len(array) - 1, 0, -1):
        array[0], array[fim] = array[fim], array[0]
        ids[0], ids[fim] = ids[fim], ids[0]
        movimentos += 1
        passos.append(novo_passo("troca", array, ids, 5, "Maior elemento extraído para sua posição final.", {"fim": fim}, [0, fim], comparacoes, movimentos))
        heapify(fim, 0)
    passos.append(novo_passo("fim", array, ids, 7, "Heap Sort concluído.", {}, None, comparacoes, movimentos))
    return passos


ALGORITMOS = {
    "bubble": ("Bubble Sort", bubble_sort_passos),
    "selection": ("Selection Sort", selection_sort_passos),
    "insertion": ("Insertion Sort", insertion_sort_passos),
    "quick": ("Quick Sort", quick_sort_passos),
    "merge": ("Merge Sort", merge_sort_passos),
    "heap": ("Heap Sort", heap_sort_passos),
}


@app.get("/api/health")
def health():
    return {"status": "ok", "projeto": "arena-algoritmos"}


@app.get("/api/algoritmos")
def algoritmos():
    return [{"id": key, "nome": nome, "categoria": "Ordenação", "disponivel": True} for key, (nome, _) in ALGORITMOS.items()]


@app.post("/api/ordenacao/{algoritmo_id}")
def ordenar(algoritmo_id: str, request: OrdenacaoRequest):
    if algoritmo_id not in ALGORITMOS:
        return {"erro": "Algoritmo não encontrado."}
    nome, funcao = ALGORITMOS[algoritmo_id]
    return {"algoritmo": nome, "passos": funcao(request.valores)}
