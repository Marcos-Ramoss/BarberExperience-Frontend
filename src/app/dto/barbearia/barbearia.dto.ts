/**
 * DTO de endereço
 */
export interface EnderecoDto {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

/**
 * DTO de horário de funcionamento
 */
export interface HorarioFuncionamentoDto {
  abertura: string;
  fechamento: string;
}

/**
 * DTO de resposta de barbearia
 */
export interface BarbeariaResponse {
  id: number;
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: EnderecoDto;
  horarioFuncionamento: HorarioFuncionamentoDto;
}

/**
 * DTO de criação de barbearia
 */
export interface CriarBarbeariaRequest {
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  horaAbertura: string;
  horaFechamento: string;
}

/**
 * DTO de atualização de barbearia
 */
export interface UpdateBarbeariaRequest {
  nome?: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  horaAbertura?: string;
  horaFechamento?: string;
}

/**
 * DTO de atualização de barbearia (conforme swagger.json)
 */
export interface AtualizarBarbeariaRequest {
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  abertura: string;
  fechamento: string;
}

/**
 * DTO de filtro de barbearia
 */
export interface BarbeariaFilter {
  nome?: string;
  cidade?: string;
  estado?: string;
  ativa?: boolean;
} 