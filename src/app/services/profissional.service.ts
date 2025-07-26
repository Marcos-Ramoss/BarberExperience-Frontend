import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { ProfissionalRepository } from '../repository/profissional.repository';
import { 
  ProfissionalResponse, 
  CriarProfissionalRequest, 
  UpdateProfissionalRequest,
  ProfissionalFilter
} from '../dto/profissional/profissional.dto';

@Injectable({
  providedIn: 'root'
})
export class ProfissionalService {

  // Observables para estado da aplicação
  private profissionaisSubject = new BehaviorSubject<ProfissionalResponse[]>([]);
  private profissionalSelecionadoSubject = new BehaviorSubject<ProfissionalResponse | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Observables públicos
  public profissionais$ = this.profissionaisSubject.asObservable();
  public profissionalSelecionado$ = this.profissionalSelecionadoSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private profissionalRepository: ProfissionalRepository) {}

  /**
   * Carrega todos os profissionais
   */
  carregarProfissionais(): Observable<ProfissionalResponse[]> {
    this.setLoading(true);
    this.clearError();

    return this.profissionalRepository.listarProfissionais().pipe(
      tap(profissionais => {
        this.profissionaisSubject.next(profissionais);
      }),
      catchError(error => {
        this.setError('Erro ao carregar profissionais: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Busca profissional por ID
   */
  buscarPorId(id: number): Observable<ProfissionalResponse> {
    this.setLoading(true);
    this.clearError();

    return this.profissionalRepository.buscarPorId(id).pipe(
      tap(profissional => {
        this.profissionalSelecionadoSubject.next(profissional);
      }),
      catchError(error => {
        this.setError('Erro ao buscar profissional: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Cria um novo profissional
   */
  criarProfissional(request: CriarProfissionalRequest): Observable<ProfissionalResponse> {
    this.setLoading(true);
    this.clearError();

    return this.profissionalRepository.criarProfissional(request).pipe(
      tap(novoProfissional => {
        // Adiciona o novo profissional à lista
        const profissionaisAtuais = this.profissionaisSubject.value;
        this.profissionaisSubject.next([...profissionaisAtuais, novoProfissional]);
      }),
      catchError(error => {
        this.setError('Erro ao criar profissional: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Atualiza um profissional existente
   */
  atualizarProfissional(id: number, request: UpdateProfissionalRequest): Observable<ProfissionalResponse> {
    this.setLoading(true);
    this.clearError();

    return this.profissionalRepository.atualizarProfissional(id, request).pipe(
      tap(profissionalAtualizado => {
        // Atualiza o profissional na lista
        const profissionaisAtuais = this.profissionaisSubject.value;
        const index = profissionaisAtuais.findIndex(p => p.id === id);
        if (index !== -1) {
          profissionaisAtuais[index] = profissionalAtualizado;
          this.profissionaisSubject.next([...profissionaisAtuais]);
        }

        // Atualiza o profissional selecionado se for o mesmo
        const profissionalSelecionado = this.profissionalSelecionadoSubject.value;
        if (profissionalSelecionado && profissionalSelecionado.id === id) {
          this.profissionalSelecionadoSubject.next(profissionalAtualizado);
        }
      }),
      catchError(error => {
        this.setError('Erro ao atualizar profissional: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Exclui um profissional
   */
  excluirProfissional(id: number): Observable<void> {
    this.setLoading(true);
    this.clearError();

    return this.profissionalRepository.excluirProfissional(id).pipe(
      tap(() => {
        // Remove o profissional da lista
        const profissionaisAtuais = this.profissionaisSubject.value;
        const profissionaisFiltrados = profissionaisAtuais.filter(p => p.id !== id);
        this.profissionaisSubject.next(profissionaisFiltrados);

        // Limpa o profissional selecionado se for o mesmo
        const profissionalSelecionado = this.profissionalSelecionadoSubject.value;
        if (profissionalSelecionado && profissionalSelecionado.id === id) {
          this.profissionalSelecionadoSubject.next(null);
        }
      }),
      catchError(error => {
        this.setError('Erro ao excluir profissional: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Busca profissionais com filtros
   */
  buscarComFiltros(filtro: ProfissionalFilter): Observable<ProfissionalResponse[]> {
    this.setLoading(true);
    this.clearError();

    return this.profissionalRepository.buscarComFiltros(filtro).pipe(
      tap(profissionais => {
        this.profissionaisSubject.next(profissionais);
      }),
      catchError(error => {
        this.setError('Erro ao buscar profissionais: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Busca profissionais por barbearia
   */
  buscarPorBarbearia(barbeariaId: number): Observable<ProfissionalResponse[]> {
    this.setLoading(true);
    this.clearError();

    return this.profissionalRepository.buscarPorBarbearia(barbeariaId).pipe(
      tap(profissionais => {
        this.profissionaisSubject.next(profissionais);
      }),
      catchError(error => {
        this.setError('Erro ao buscar profissionais da barbearia: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Busca profissionais por especialidade
   */
  buscarPorEspecialidade(especialidade: string): Observable<ProfissionalResponse[]> {
    this.setLoading(true);
    this.clearError();

    return this.profissionalRepository.buscarPorEspecialidade(especialidade).pipe(
      tap(profissionais => {
        this.profissionaisSubject.next(profissionais);
      }),
      catchError(error => {
        this.setError('Erro ao buscar profissionais por especialidade: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Seleciona um profissional
   */
  selecionarProfissional(profissional: ProfissionalResponse | null): void {
    this.profissionalSelecionadoSubject.next(profissional);
  }

  /**
   * Limpa o profissional selecionado
   */
  limparSelecao(): void {
    this.profissionalSelecionadoSubject.next(null);
  }

  /**
   * Atualiza a lista de profissionais
   */
  atualizarLista(profissionais: ProfissionalResponse[]): void {
    this.profissionaisSubject.next(profissionais);
  }

  /**
   * Obtém o valor atual dos profissionais
   */
  getProfissionais(): ProfissionalResponse[] {
    return this.profissionaisSubject.value;
  }

  /**
   * Obtém o profissional selecionado atual
   */
  getProfissionalSelecionado(): ProfissionalResponse | null {
    return this.profissionalSelecionadoSubject.value;
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

  // Métodos privados para gerenciar estado
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