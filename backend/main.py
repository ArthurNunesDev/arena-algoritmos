from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Arena de Algoritmos", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class OrdenacaoRequest(BaseModel):
    valores: list[int] = Field(min_length=2, max_length=100)


def bubble_sort_passos(valores: list[int]):
    array = valores.copy()
    ids = list(range(len(array)))
    passos = [{
        "tipo": "inicio",
        "valores": array.copy(),
        "ids": ids.copy(),
        "linha": 1,
        "mensagem": "O array está pronto. Vamos iniciar o Bubble Sort.",
        "variaveis": {"fim": len(array) - 1, "i": 0},
    }]
    comparacoes = 0
    movimentos = 0

    for fim in range(len(array) - 1, 0, -1):
        trocou = False
        for i in range(fim):
            comparacoes += 1
            passos.append({
                "tipo": "comparacao",
                "indices": [i, i + 1],
                "valores": array.copy(),
                "ids": ids.copy(),
                "comparacoes": comparacoes,
                "movimentos": movimentos,
                "linha": 3,
                "mensagem": f"Comparando {array[i]} e {array[i + 1]}.",
                "variaveis": {"fim": fim, "i": i, "esquerda": array[i], "direita": array[i + 1]},
            })

            if array[i] > array[i + 1]:
                array[i], array[i + 1] = array[i + 1], array[i]
                ids[i], ids[i + 1] = ids[i + 1], ids[i]
                movimentos += 1
                trocou = True
                passos.append({
                    "tipo": "troca",
                    "indices": [i, i + 1],
                    "valores": array.copy(),
                    "ids": ids.copy(),
                    "comparacoes": comparacoes,
                    "movimentos": movimentos,
                    "linha": 4,
                    "mensagem": f"Os elementos foram trocados porque {array[i]} era maior que {array[i + 1]}.",
                    "variaveis": {"fim": fim, "i": i, "esquerda": array[i], "direita": array[i + 1]},
                })

        if not trocou:
            break

    passos.append({
        "tipo": "fim",
        "valores": array.copy(),
        "ids": ids.copy(),
        "comparacoes": comparacoes,
        "movimentos": movimentos,
        "linha": 7,
        "mensagem": "Ordenação concluída. O array está em ordem crescente.",
        "variaveis": {"fim": 0, "i": 0},
    })
    return passos


@app.get("/api/health")
def health():
    return {"status": "ok", "projeto": "arena-algoritmos"}


@app.get("/api/algoritmos")
def algoritmos():
    return [
        {"id": "bubble", "nome": "Bubble Sort", "disponivel": True},
        {"id": "quick", "nome": "Quick Sort", "disponivel": False},
    ]


@app.post("/api/ordenacao/bubble")
def bubble_sort(request: OrdenacaoRequest):
    return {"algoritmo": "Bubble Sort", "passos": bubble_sort_passos(request.valores)}
