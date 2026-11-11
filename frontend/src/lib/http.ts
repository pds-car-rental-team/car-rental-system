/**
 * Cliente HTTP único da aplicação. Toda chamada à API passa por aqui, para que
 * o tratamento de erro (Problem Details, RFC 9457) fique em um só lugar.
 */

const BASE_URL = '/api/v1'

export interface ErroDeCampo {
  campo: string
  mensagem: string
}

export class ApiError extends Error {
  readonly status: number
  readonly errosDeCampo: ErroDeCampo[]

  constructor(status: number, mensagem: string, errosDeCampo: ErroDeCampo[] = []) {
    super(mensagem)
    this.name = 'ApiError'
    this.status = status
    this.errosDeCampo = errosDeCampo
  }
}

const MENSAGEM_PADRAO = 'Não foi possível concluir a operação. Tente novamente.'

type Parametros = Record<string, string | number | undefined>

interface Opcoes {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  params?: Parametros
  body?: unknown
  signal?: AbortSignal
}

function montarUrl(caminho: string, params?: Parametros) {
  const query = new URLSearchParams()
  for (const [chave, valor] of Object.entries(params ?? {})) {
    if (valor !== undefined && valor !== '') query.set(chave, String(valor))
  }
  const sufixo = query.size > 0 ? `?${query}` : ''
  return `${BASE_URL}${caminho}${sufixo}`
}

export async function http<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  let resposta: Response
  try {
    resposta = await fetch(montarUrl(caminho, opcoes.params), {
      method: opcoes.method ?? 'GET',
      headers: opcoes.body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: opcoes.body === undefined ? undefined : JSON.stringify(opcoes.body),
      signal: opcoes.signal,
    })
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === 'AbortError') throw erro
    throw new ApiError(0, 'Sem conexão com o servidor. Verifique se a API está no ar.')
  }

  if (!resposta.ok) {
    const problema = await resposta.json().catch(() => null)
    throw new ApiError(resposta.status, problema?.detail ?? MENSAGEM_PADRAO, problema?.erros ?? [])
  }

  if (resposta.status === 204) return undefined as T
  return (await resposta.json()) as T
}

/** Mensagem segura para exibir ao usuário a partir de qualquer erro. */
export function mensagemDeErro(erro: unknown) {
  return erro instanceof ApiError ? erro.message : MENSAGEM_PADRAO
}
