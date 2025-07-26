/**
 * DTO de resposta de serviço
 */
export interface ServicoResponse {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  duracaoMinutos: number;
  barbeariaId: number;
}

/**
 * DTO de criação de serviço
 */
export interface CriarServicoRequest {
  nome: string;
  descricao: string;
  preco: number;
  duracaoMinutos: number;
  barbeariaId: number;
}

/**
 * DTO de atualização de serviço
 */
export interface UpdateServicoRequest {
  nome?: string;
  descricao?: string;
  preco?: number;
  duracaoMinutos?: number;
  barbeariaId?: number;
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
 * DTO de filtro de serviço
 */
export interface ServicoFilter {
  nome?: string;
  barbeariaId?: number;
  precoMin?: number;
  precoMax?: number;
  ativo?: boolean;
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