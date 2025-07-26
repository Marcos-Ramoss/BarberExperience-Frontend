import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseRepository } from './base.repository';
import {
  ClienteResponse,
  CriarClienteRequest,
  UpdateClienteRequest,
  AtualizarClienteRequest,
  ClienteFilter
} from '../dto/cliente/cliente.dto';

@Injectable({
  providedIn: 'root'
})
export class ClienteRepository extends BaseRepository<ClienteResponse, CriarClienteRequest, UpdateClienteRequest> {

  protected endpoint = 'clientes';

  constructor(protected override http: HttpClient) {
    super(http);
  }

  /**
   * Lista todos os clientes
   */
  listarClientes(): Observable<ClienteResponse[]> { 
    return this.findAllSimple(); 
  }

  /**
   * Busca cliente por ID
   */
  buscarPorId(id: number): Observable<ClienteResponse> { 
    return this.findById(id); 
  }

  /**
   * Cria um novo cliente
   */
  criarCliente(request: CriarClienteRequest): Observable<ClienteResponse> { 
    return this.create(request); 
  }

  /**
   * Exclui um cliente
   */
  excluirCliente(id: number): Observable<void> { 
    return this.delete(id); 
  }

  /**
   * Busca clientes com filtros
   */
  buscarComFiltros(filtro: ClienteFilter): Observable<ClienteResponse[]> {
    return this.findByFilters(filtro).pipe(map(response => response.content));
  }

  /**
   * Atualiza um cliente existente usando PUT real
   */
  atualizarClienteComPut(id: number, request: AtualizarClienteRequest): Observable<ClienteResponse> {
    return this.http.put<ClienteResponse>(`${this.baseUrl}/${this.endpoint}/${id}`, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Atualiza um cliente existente (legado)
   * NOTA: Endpoint PUT ainda não implementado no backend, usando mock temporário
   */
  atualizarCliente(id: number, request: UpdateClienteRequest): Observable<ClienteResponse> {
    // TODO: Implementar quando o endpoint PUT estiver disponível
    // return this.update(id, request);
    return this.atualizarClienteMock(id, request);
  }

  private atualizarClienteMock(id: number, request: UpdateClienteRequest): Observable<ClienteResponse> {
    // Mock temporário até o endpoint PUT estar disponível
    const clienteAtualizado: ClienteResponse = {
      id: id,
      nome: request.nome || '',
      cpf: request.cpf || '',
      telefone: request.telefone || '',
      email: request.email || '',
      dataNascimento: request.dataNascimento || new Date().toISOString()
    };
    
    return new Observable(observer => { 
      observer.next(clienteAtualizado); 
      observer.complete(); 
    });
  }
} 