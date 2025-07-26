/**
 * Enum de especialidades do profissional
 */
export enum Especialidade {
  CORTE_MASCULINO = 'CORTE_MASCULINO',
  CORTE_FEMININO = 'CORTE_FEMININO',
  BARBA = 'BARBA',
  COLORACAO = 'COLORACAO',
  SOBRANCELHA = 'SOBRANCELHA'
}

/**
 * DTO de resposta de profissional
 */
export interface ProfissionalResponse {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  especialidades: Especialidade[];
  barbeariaId: number;
}

/**
 * DTO de criação de profissional
 */
export interface CriarProfissionalRequest {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  especialidades: Especialidade[];
  barbeariaId: number;
}

/**
 * DTO de atualização de profissional
 */
export interface UpdateProfissionalRequest {
  nome?: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  especialidades?: Especialidade[];
  barbeariaId?: number;
}

/**
 * DTO de profissional simplificado (usado em agendamentos)
 */
export interface ProfissionalDto {
  id: number;
  nome: string;
}

/**
 * DTO de filtro de profissional
 */
export interface ProfissionalFilter {
  nome?: string;
  especialidade?: Especialidade;
  barbeariaId?: number;
  ativo?: boolean;
}

/**
 * DTO de perfil profissional
 */
export interface ProfissionalProfile {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  especialidades: Especialidade[];
  barbeariaId: number;
  avaliacaoMedia?: number;
  totalAvaliacoes?: number;
  totalAgendamentos?: number;
  foto?: string;
  biografia?: string;
} 