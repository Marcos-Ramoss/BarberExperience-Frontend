import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseRepository } from './base.repository';
import {
  AgendamentoResponse,
  CriarAgendamentoRequest,
  AtualizarAgendamentoRequest,
  AgendamentoFilter
} from '../dto/agendamento/agendamento.dto';

@Injectable({
  providedIn: 'root'
})
export class AgendamentoRepository extends BaseRepository<AgendamentoResponse, CriarAgendamentoRequest, AtualizarAgendamentoRequest> {

  protected endpoint = 'agendamentos';

  constructor(protected override http: HttpClient) {
    super(http);
  }

  /**
   * Lista todos os agendamentos
   */
  listarAgendamentos(): Observable<AgendamentoResponse[]> {
    return this.findAllSimple();
  }

  /**
   * Busca agendamento por ID
   */
  buscarPorId(id: number): Observable<AgendamentoResponse> {
    return this.findById(id);
  }

  /**
   * Cria um novo agendamento
   */
  criarAgendamento(request: CriarAgendamentoRequest): Observable<AgendamentoResponse> {
    return this.create(request);
  }

  /**
   * Atualiza um agendamento existente
   */
  atualizarAgendamento(id: number, request: AtualizarAgendamentoRequest): Observable<AgendamentoResponse> {
    return this.http.put<AgendamentoResponse>(`${this.baseUrl}/${this.endpoint}/${id}`, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Exclui um agendamento
   */
  excluirAgendamento(id: number): Observable<void> {
    return this.delete(id);
  }

  /**
   * Busca agendamentos com filtros
   */
  buscarComFiltros(filtro: AgendamentoFilter): Observable<AgendamentoResponse[]> {
    const params = this.buildQueryParams(filtro);
    return this.http.get<AgendamentoResponse[]>(`${this.baseUrl}/${this.endpoint}`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      map(response => Array.isArray(response) ? response : []),
      catchError(this.handleError)
    );
  }

  /**
   * Constrói parâmetros de query para filtros
   */
  private buildQueryParams(filtro: AgendamentoFilter): any {
    const params: any = {};
    
    if (filtro.clienteId) params.clienteId = filtro.clienteId;
    if (filtro.profissionalId) params.profissionalId = filtro.profissionalId;
    if (filtro.barbeariaId) params.barbeariaId = filtro.barbeariaId;
    if (filtro.status) params.status = filtro.status;
    if (filtro.dataInicio) params.dataInicio = filtro.dataInicio;
    if (filtro.dataFim) params.dataFim = filtro.dataFim;
    
    return params;
  }
} 