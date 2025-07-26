/**
 * DTOs para o módulo Agendamento
 */

// Enums
export enum StatusAgendamento {
  PENDENTE = 'PENDENTE',
  CONFIRMADO = 'CONFIRMADO',
  CANCELADO = 'CANCELADO',
  REALIZADO = 'REALIZADO',
  AUSENTE = 'AUSENTE'
}

// DTOs de Request
export interface CriarAgendamentoRequest {
  clienteId: number;
  profissionalId: number;
  barbeariaId: number;
  servicoIds: number[];
  horario: string; // formato: yyyy-MM-ddTHH:mm:ss
}

export interface AtualizarAgendamentoRequest {
  dataHora: string; // formato: yyyy-MM-ddTHH:mm:ss
  clienteId: number;
  profissionalId: number;
  servicoId: number;
  barbeariaId: number;
  status: string;
}

// DTOs de Response
export interface ClienteDto {
  id: number;
  nome: string;
  email: string;
}

export interface ProfissionalDto {
  id: number;
  nome: string;
}

export interface ServicoDto {
  id: number;
  nome: string;
  preco: string;
  duracaoMinutos: number;
}

export interface AgendamentoResponse {
  id: number;
  cliente: ClienteDto;
  profissional: ProfissionalDto;
  servicos: ServicoDto[];
  horario: string; // formato: date-time
  status: string;
}

// DTOs de Filtro
export interface AgendamentoFilter {
  clienteId?: number;
  profissionalId?: number;
  barbeariaId?: number;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
}

/**
 * DTO de agendamento detalhado
 */
export interface AgendamentoDetalhado extends AgendamentoResponse {
  observacoes?: string;
  valorTotal: number;
  duracaoTotal: number;
  dataCriacao: string;
  dataAtualizacao: string;
  confirmadoPor?: string;
  canceladoPor?: string;
  motivoCancelamento?: string;
}

/**
 * DTO de horário disponível
 */
export interface HorarioDisponivel {
  horario: string;
  disponivel: boolean;
  profissionalId?: number;
}

/**
 * DTO de confirmação de agendamento
 */
export interface ConfirmarAgendamentoRequest {
  agendamentoId: number;
  confirmadoPor: string;
  observacoes?: string;
}

/**
 * DTO de cancelamento de agendamento
 */
export interface CancelarAgendamentoRequest {
  agendamentoId: number;
  canceladoPor: string;
  motivo: string;
}

/**
 * DTO de reagendamento
 */
export interface ReagendarAgendamentoRequest {
  agendamentoId: number;
  novoHorario: string;
  novoProfissionalId?: number;
  motivo: string;
} 