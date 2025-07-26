import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { ClienteRepository } from '../repository/cliente.repository';
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
export class ClienteService {
  private clientesSubject = new BehaviorSubject<ClienteResponse[]>([]);
  private clienteSelecionadoSubject = new BehaviorSubject<ClienteResponse | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  public clientes$ = this.clientesSubject.asObservable();
  public clienteSelecionado$ = this.clienteSelecionadoSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private clienteRepository: ClienteRepository) {}

  /**
   * Carrega todos os clientes
   */
  carregarClientes(): Observable<ClienteResponse[]> {
    this.setLoading(true);
    this.clearError();

    return this.clienteRepository.listarClientes().pipe(
      tap(clientes => {
        this.clientesSubject.next(clientes);
      }),
      catchError(error => {
        this.setError('Erro ao carregar clientes: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Busca cliente por ID
   */
  buscarPorId(id: number): Observable<ClienteResponse> {
    this.setLoading(true);
    this.clearError();

    return this.clienteRepository.buscarPorId(id).pipe(
      tap(cliente => {
        this.clienteSelecionadoSubject.next(cliente);
      }),
      catchError(error => {
        this.setError('Erro ao buscar cliente: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Cria um novo cliente
   */
  criarCliente(request: CriarClienteRequest): Observable<ClienteResponse> {
    this.setLoading(true);
    this.clearError();

    return this.clienteRepository.criarCliente(request).pipe(
      tap(novoCliente => {
        // Adiciona o novo cliente à lista
        const clientesAtuais = this.clientesSubject.value;
        this.clientesSubject.next([...clientesAtuais, novoCliente]);
      }),
      catchError(error => {
        this.setError('Erro ao criar cliente: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Atualiza um cliente existente usando PUT real
   */
  atualizarClienteComPut(id: number, request: AtualizarClienteRequest): Observable<ClienteResponse> {
    this.setLoading(true);
    this.clearError();

    return this.clienteRepository.atualizarClienteComPut(id, request).pipe(
      tap(clienteAtualizado => {
        // Atualiza o cliente na lista
        const clientesAtuais = this.clientesSubject.value;
        const index = clientesAtuais.findIndex(c => c.id === id);
        if (index !== -1) {
          clientesAtuais[index] = clienteAtualizado;
          this.clientesSubject.next([...clientesAtuais]);
        }

        // Atualiza o cliente selecionado se for o mesmo
        const clienteSelecionado = this.clienteSelecionadoSubject.value;
        if (clienteSelecionado && clienteSelecionado.id === id) {
          this.clienteSelecionadoSubject.next(clienteAtualizado);
        }
      }),
      catchError(error => {
        this.setError('Erro ao atualizar cliente: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Atualiza um cliente existente (legado)
   */
  atualizarCliente(id: number, request: UpdateClienteRequest): Observable<ClienteResponse> {
    this.setLoading(true);
    this.clearError();

    return this.clienteRepository.atualizarCliente(id, request).pipe(
      tap(clienteAtualizado => {
        // Atualiza o cliente na lista
        const clientesAtuais = this.clientesSubject.value;
        const index = clientesAtuais.findIndex(c => c.id === id);
        if (index !== -1) {
          clientesAtuais[index] = clienteAtualizado;
          this.clientesSubject.next([...clientesAtuais]);
        }

        // Atualiza o cliente selecionado se for o mesmo
        const clienteSelecionado = this.clienteSelecionadoSubject.value;
        if (clienteSelecionado && clienteSelecionado.id === id) {
          this.clienteSelecionadoSubject.next(clienteAtualizado);
        }
      }),
      catchError(error => {
        this.setError('Erro ao atualizar cliente: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Exclui um cliente
   */
  excluirCliente(id: number): Observable<void> {
    this.setLoading(true);
    this.clearError();

    return this.clienteRepository.excluirCliente(id).pipe(
      tap(() => {
        // Remove o cliente da lista
        const clientesAtuais = this.clientesSubject.value;
        const clientesFiltrados = clientesAtuais.filter(c => c.id !== id);
        this.clientesSubject.next(clientesFiltrados);

        // Limpa o cliente selecionado se for o mesmo
        const clienteSelecionado = this.clienteSelecionadoSubject.value;
        if (clienteSelecionado && clienteSelecionado.id === id) {
          this.clienteSelecionadoSubject.next(null);
        }
      }),
      catchError(error => {
        this.setError('Erro ao excluir cliente: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Busca clientes com filtros
   */
  buscarComFiltros(filtro: ClienteFilter): Observable<ClienteResponse[]> {
    this.setLoading(true);
    this.clearError();

    return this.clienteRepository.buscarComFiltros(filtro).pipe(
      tap(clientes => {
        this.clientesSubject.next(clientes);
      }),
      catchError(error => {
        this.setError('Erro ao buscar clientes com filtros: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Seleciona um cliente
   */
  selecionarCliente(cliente: ClienteResponse | null): void {
    this.clienteSelecionadoSubject.next(cliente);
  }

  /**
   * Limpa a seleção
   */
  limparSelecao(): void {
    this.clienteSelecionadoSubject.next(null);
  }

  /**
   * Atualiza a lista de clientes
   */
  atualizarLista(clientes: ClienteResponse[]): void {
    this.clientesSubject.next(clientes);
  }

  /**
   * Obtém a lista atual de clientes
   */
  getClientes(): ClienteResponse[] {
    return this.clientesSubject.value;
  }

  /**
   * Obtém o cliente selecionado
   */
  getClienteSelecionado(): ClienteResponse | null {
    return this.clienteSelecionadoSubject.value;
  }

  /**
   * Verifica se está carregando
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Obtém o erro atual
   */
  getError(): string | null {
    return this.errorSubject.value;
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private setError(error: string): void {
    this.errorSubject.next(error);
  }

  private clearError(): void {
    this.errorSubject.next(null);
  }
} 