/**
 * DTO de resposta de cliente
 */
export interface ClienteResponse {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  dataNascimento: string;
}

/**
 * DTO de criação de cliente
 */
export interface CriarClienteRequest {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  dataNascimento: string;
}

/**
 * DTO de atualização de cliente (legado)
 */
export interface UpdateClienteRequest {
  nome?: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  dataNascimento?: string;
}

/**
 * DTO de atualização de cliente (conforme swagger.json)
 */
export interface AtualizarClienteRequest {
  nome: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
}

/**
 * DTO de filtro de cliente
 */
export interface ClienteFilter {
  nome?: string;
  email?: string;
  cpf?: string;
  dataNascimento?: string;
}

/**
 * DTO para exibição de cliente (simplificado)
 */
export interface ClienteDto {
  id: number;
  nome: string;
  email: string;
}

/**
 * DTO de perfil do cliente
 */
export interface ClienteProfile {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  dataNascimento: string;
  totalAgendamentos?: number;
  ultimoAgendamento?: string;
  preferencias?: string[];
  foto?: string;
}

/**
 * DTO de preferências do cliente
 */
export interface ClientePreferencias {
  clienteId: number;
  profissionalFavoritoId?: number;
  servicosFavoritos?: number[];
  horarioPreferido?: string;
  diaSemanaPreferido?: string;
} 