import { ClienteDto } from '../cliente/cliente.dto';
import { ProfissionalDto } from '../profissional/profissional.dto';
import { ServicoDto } from '../servico/servico.dto';

/**
 * Enum de status do agendamento
 */
export enum StatusAgendamento {
  PENDENTE = 'PENDENTE',
  CONFIRMADO = 'CONFIRMADO',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
  NAO_COMPARECEU = 'NAO_COMPARECEU'
}

/**
 * DTO de resposta de agendamento
 */
export interface AgendamentoResponse {
  id: number;
  cliente: ClienteDto;
  profissional: ProfissionalDto;
  servicos: ServicoDto[];
  horario: string;
  status: StatusAgendamento;
}

/**
 * DTO de criação de agendamento
 */
export interface CriarAgendamentoRequest {
  clienteId: number;
  profissionalId: number;
  servicoIds: number[];
  horario: string;
}

/**
 * DTO de atualização de agendamento
 */
export interface UpdateAgendamentoRequest {
  clienteId?: number;
  profissionalId?: number;
  servicoIds?: number[];
  horario?: string;
  status?: StatusAgendamento;
}

/**
 * DTO de filtro de agendamento
 */
export interface AgendamentoFilter {
  clienteId?: number;
  profissionalId?: number;
  barbeariaId?: number;
  status?: StatusAgendamento;
  dataInicio?: string;
  dataFim?: string;
  servicoId?: number;
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