import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { AgendamentoRepository } from '../repository/agendamento.repository';
import {
  AgendamentoResponse,
  CriarAgendamentoRequest,
  AtualizarAgendamentoRequest,
  AgendamentoFilter
} from '../dto/agendamento/agendamento.dto';

@Injectable({
  providedIn: 'root'
})
export class AgendamentoService {
  // Observables para estado
  private agendamentosSubject = new BehaviorSubject<AgendamentoResponse[]>([]);
  private agendamentoSelecionadoSubject = new BehaviorSubject<AgendamentoResponse | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Getters para os observables
  agendamentos$ = this.agendamentosSubject.asObservable();
  agendamentoSelecionado$ = this.agendamentoSelecionadoSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  constructor(private agendamentoRepository: AgendamentoRepository) {}

  /**
   * Carrega todos os agendamentos
   */
  carregarAgendamentos(): Observable<AgendamentoResponse[]> {
    this.setLoading(true);
    this.clearError();

    return this.agendamentoRepository.listarAgendamentos().pipe(
      tap(agendamentos => {
        this.agendamentosSubject.next(agendamentos);
      }),
      catchError(error => {
        this.setError('Erro ao carregar agendamentos: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Busca agendamento por ID
   */
  buscarPorId(id: number): Observable<AgendamentoResponse> {
    this.setLoading(true);
    this.clearError();

    return this.agendamentoRepository.buscarPorId(id).pipe(
      tap(agendamento => {
        this.agendamentoSelecionadoSubject.next(agendamento);
      }),
      catchError(error => {
        this.setError('Erro ao buscar agendamento: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Cria um novo agendamento
   */
  criarAgendamento(request: CriarAgendamentoRequest): Observable<AgendamentoResponse> {
    this.setLoading(true);
    this.clearError();

    return this.agendamentoRepository.criarAgendamento(request).pipe(
      tap(novoAgendamento => {
        const agendamentosAtuais = this.agendamentosSubject.value;
        this.agendamentosSubject.next([...agendamentosAtuais, novoAgendamento]);
      }),
      catchError(error => {
        this.setError('Erro ao criar agendamento: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Atualiza um agendamento existente
   */
  atualizarAgendamento(id: number, request: AtualizarAgendamentoRequest): Observable<AgendamentoResponse> {
    this.setLoading(true);
    this.clearError();

    return this.agendamentoRepository.atualizarAgendamento(id, request).pipe(
      tap(agendamentoAtualizado => {
        // Atualiza o agendamento na lista
        const agendamentosAtuais = this.agendamentosSubject.value;
        const index = agendamentosAtuais.findIndex(a => a.id === id);
        if (index !== -1) {
          agendamentosAtuais[index] = agendamentoAtualizado;
          this.agendamentosSubject.next([...agendamentosAtuais]);
        }

        // Atualiza o agendamento selecionado se for o mesmo
        const agendamentoSelecionado = this.agendamentoSelecionadoSubject.value;
        if (agendamentoSelecionado && agendamentoSelecionado.id === id) {
          this.agendamentoSelecionadoSubject.next(agendamentoAtualizado);
        }
      }),
      catchError(error => {
        this.setError('Erro ao atualizar agendamento: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Exclui um agendamento
   */
  excluirAgendamento(id: number): Observable<void> {
    this.setLoading(true);
    this.clearError();

    return this.agendamentoRepository.excluirAgendamento(id).pipe(
      tap(() => {
        // Remove o agendamento da lista
        const agendamentosAtuais = this.agendamentosSubject.value;
        const agendamentosFiltrados = agendamentosAtuais.filter(a => a.id !== id);
        this.agendamentosSubject.next(agendamentosFiltrados);

        // Limpa o agendamento selecionado se for o mesmo
        const agendamentoSelecionado = this.agendamentoSelecionadoSubject.value;
        if (agendamentoSelecionado && agendamentoSelecionado.id === id) {
          this.agendamentoSelecionadoSubject.next(null);
        }
      }),
      catchError(error => {
        this.setError('Erro ao excluir agendamento: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Busca agendamentos com filtros
   */
  buscarComFiltros(filtro: AgendamentoFilter): Observable<AgendamentoResponse[]> {
    this.setLoading(true);
    this.clearError();

    return this.agendamentoRepository.buscarComFiltros(filtro).pipe(
      tap(agendamentos => {
        this.agendamentosSubject.next(agendamentos);
      }),
      catchError(error => {
        this.setError('Erro ao buscar agendamentos: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Obtém o valor atual dos agendamentos
   */
  getAgendamentos(): AgendamentoResponse[] {
    return this.agendamentosSubject.value;
  }

  /**
   * Obtém o agendamento selecionado
   */
  getAgendamentoSelecionado(): AgendamentoResponse | null {
    return this.agendamentoSelecionadoSubject.value;
  }

  /**
   * Define o agendamento selecionado
   */
  setAgendamentoSelecionado(agendamento: AgendamentoResponse | null): void {
    this.agendamentoSelecionadoSubject.next(agendamento);
  }

  /**
   * Define o estado de loading
   */
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * Define o erro
   */
  private setError(error: string): void {
    this.errorSubject.next(error);
  }

  /**
   * Limpa o erro
   */
  private clearError(): void {
    this.errorSubject.next(null);
  }
} 