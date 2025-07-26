// DTOs para o módulo de Serviços
// Baseado no Swagger: /servicos

export interface CriarServicoRequest {
  nome: string;
  descricao: string;
  preco: number;
  duracaoMinutos: number;
  barbeariaId: number;
}

export interface UpdateServicoRequest {
  nome: string;
  descricao: string;
  preco: number;
  duracaoMinutos: number;
  barbeariaId: number;
}

export interface AtualizarServicoRequest {
  nome: string;
  descricao: string;
  preco: number;
  duracaoMinutos: number;
  barbeariaId: number;
}

export interface ServicoResponse {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  duracaoMinutos: number;
  barbeariaId: number;
}

export interface ServicoFilter {
  nome?: string;
  barbeariaId?: number;
  precoMin?: number;
  precoMax?: number;
}

/**
 * DTO de serviço simplificado (usado em agendamentos)
 */
export interface ServicoDto {
  id: number;
  nome: string;
  preco: string;
  duracaoMinutos: number;
}

/**
 * DTO de categoria de serviço
 */
export interface CategoriaServico {
  id: number;
  nome: string;
  descricao?: string;
  icone?: string;
}

/**
 * DTO de serviço com categoria
 */
export interface ServicoComCategoria extends ServicoResponse {
  categoria?: CategoriaServico;
  ativo: boolean;
  destaque: boolean;
  imagem?: string;
} 