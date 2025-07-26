import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { ServicoRepository } from '../repository/servico.repository';
import { 
  ServicoResponse, 
  CriarServicoRequest, 
  UpdateServicoRequest,
  AtualizarServicoRequest,
  ServicoFilter
} from '../dto/servico/servico.dto';

@Injectable({
  providedIn: 'root'
})
export class ServicoService {

  // Observables para estado da aplicação
  private servicosSubject = new BehaviorSubject<ServicoResponse[]>([]);
  private servicoSelecionadoSubject = new BehaviorSubject<ServicoResponse | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Observables públicos
  public servicos$ = this.servicosSubject.asObservable();
  public servicoSelecionado$ = this.servicoSelecionadoSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private servicoRepository: ServicoRepository) {}

  /**
   * Carrega todos os serviços
   */
  carregarServicos(): Observable<ServicoResponse[]> {
    this.setLoading(true);
    this.clearError();

    return this.servicoRepository.listarServicos().pipe(
      tap(servicos => {
        this.servicosSubject.next(servicos);
      }),
      catchError(error => {
        this.setError('Erro ao carregar serviços: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Busca serviço por ID
   */
  buscarPorId(id: number): Observable<ServicoResponse> {
    this.setLoading(true);
    this.clearError();

    return this.servicoRepository.buscarPorId(id).pipe(
      tap(servico => {
        this.servicoSelecionadoSubject.next(servico);
      }),
      catchError(error => {
        this.setError('Erro ao buscar serviço: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Cria um novo serviço
   */
  criarServico(request: CriarServicoRequest): Observable<ServicoResponse> {
    this.setLoading(true);
    this.clearError();

    return this.servicoRepository.criarServico(request).pipe(
      tap(novoServico => {
        // Adiciona o novo serviço à lista
        const servicosAtuais = this.servicosSubject.value;
        this.servicosSubject.next([...servicosAtuais, novoServico]);
      }),
      catchError(error => {
        this.setError('Erro ao criar serviço: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Atualiza um serviço existente
   */
  atualizarServico(id: number, request: AtualizarServicoRequest): Observable<ServicoResponse> {
    this.setLoading(true);
    this.clearError();

    return this.servicoRepository.atualizarServico(id, request).pipe(
      tap(servicoAtualizado => {
        // Atualiza o serviço na lista
        const servicosAtuais = this.servicosSubject.value;
        const index = servicosAtuais.findIndex(s => s.id === id);
        if (index !== -1) {
          servicosAtuais[index] = servicoAtualizado;
          this.servicosSubject.next([...servicosAtuais]);
        }
      }),
      catchError(error => {
        this.setError('Erro ao atualizar serviço: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Exclui um serviço
   */
  excluirServico(id: number): Observable<void> {
    this.setLoading(true);
    this.clearError();

    return this.servicoRepository.excluirServico(id).pipe(
      tap(() => {
        // Remove o serviço da lista
        const servicosAtuais = this.servicosSubject.value;
        const servicosFiltrados = servicosAtuais.filter(s => s.id !== id);
        this.servicosSubject.next(servicosFiltrados);
      }),
      catchError(error => {
        this.setError('Erro ao excluir serviço: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Busca serviços com filtros
   */
  buscarComFiltros(filtro: ServicoFilter): Observable<ServicoResponse[]> {
    this.setLoading(true);
    this.clearError();

    return this.servicoRepository.buscarComFiltros(filtro).pipe(
      tap(servicos => {
        this.servicosSubject.next(servicos);
      }),
      catchError(error => {
        this.setError('Erro ao buscar serviços: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Seleciona um serviço
   */
  selecionarServico(servico: ServicoResponse | null): void {
    this.servicoSelecionadoSubject.next(servico);
  }

  /**
   * Limpa a seleção
   */
  limparSelecao(): void {
    this.servicoSelecionadoSubject.next(null);
  }

  /**
   * Atualiza a lista de serviços
   */
  atualizarLista(servicos: ServicoResponse[]): void {
    this.servicosSubject.next(servicos);
  }

  /**
   * Obtém a lista atual de serviços
   */
  getServicos(): ServicoResponse[] {
    return this.servicosSubject.value;
  }

  /**
   * Obtém o serviço selecionado
   */
  getServicoSelecionado(): ServicoResponse | null {
    return this.servicoSelecionadoSubject.value;
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