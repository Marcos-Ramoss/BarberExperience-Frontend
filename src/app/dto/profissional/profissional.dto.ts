/**
 * Enum de especialidades profissionais
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
  especialidades: string[];
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
  especialidades: string[];
  barbeariaId: number;
  senha: string;
  confirmarSenha: string;
}

/**
 * DTO de atualização de profissional
 */
export interface UpdateProfissionalRequest {
  nome?: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  especialidades?: string[];
  barbeariaId?: number;
}

/**
 * DTO de filtro de profissional
 */
export interface ProfissionalFilter {
  nome?: string;
  especialidade?: string;
  barbeariaId?: number;
  ativo?: boolean;
}

/**
 * DTO para exibição de especialidades
 */
export interface EspecialidadeDisplay {
  value: string;
  label: string;
  icon?: string;
} 