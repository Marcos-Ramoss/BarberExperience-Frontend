import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { BarbeariaRepository } from '../repository/barbearia.repository';
import { 
  BarbeariaResponse, 
  CriarBarbeariaRequest, 
  UpdateBarbeariaRequest,
  BarbeariaFilter
} from '../dto/barbearia/barbearia.dto';

@Injectable({
  providedIn: 'root'
})
export class BarbeariaService {

  // Observables para estado da aplicação
  private barbeariasSubject = new BehaviorSubject<BarbeariaResponse[]>([]);
  private barbeariaSelecionadaSubject = new BehaviorSubject<BarbeariaResponse | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Observables públicos
  public barbearias$ = this.barbeariasSubject.asObservable();
  public barbeariaSelecionada$ = this.barbeariaSelecionadaSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private barbeariaRepository: BarbeariaRepository) {}

  /**
   * Carrega todas as barbearias
   */
  carregarBarbearias(): Observable<BarbeariaResponse[]> {
    this.setLoading(true);
    this.clearError();

    return this.barbeariaRepository.listarBarbearias().pipe(
      tap(barbearias => {
        this.barbeariasSubject.next(barbearias);
      }),
      catchError(error => {
        this.setError('Erro ao carregar barbearias: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Busca barbearia por ID
   */
  buscarPorId(id: number): Observable<BarbeariaResponse> {
    this.setLoading(true);
    this.clearError();

    return this.barbeariaRepository.buscarPorId(id).pipe(
      tap(barbearia => {
        this.barbeariaSelecionadaSubject.next(barbearia);
      }),
      catchError(error => {
        this.setError('Erro ao buscar barbearia: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Cria uma nova barbearia
   */
  criarBarbearia(request: CriarBarbeariaRequest): Observable<BarbeariaResponse> {
    this.setLoading(true);
    this.clearError();

    return this.barbeariaRepository.criarBarbearia(request).pipe(
      tap(novaBarbearia => {
        // Adiciona a nova barbearia à lista
        const barbeariasAtuais = this.barbeariasSubject.value;
        this.barbeariasSubject.next([...barbeariasAtuais, novaBarbearia]);
      }),
      catchError(error => {
        this.setError('Erro ao criar barbearia: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Atualiza uma barbearia existente
   */
  atualizarBarbearia(id: number, request: UpdateBarbeariaRequest): Observable<BarbeariaResponse> {
    this.setLoading(true);
    this.clearError();

    return this.barbeariaRepository.atualizarBarbearia(id, request).pipe(
      tap(barbeariaAtualizada => {
        // Atualiza a barbearia na lista
        const barbeariasAtuais = this.barbeariasSubject.value;
        const index = barbeariasAtuais.findIndex(b => b.id === id);
        if (index !== -1) {
          barbeariasAtuais[index] = barbeariaAtualizada;
          this.barbeariasSubject.next([...barbeariasAtuais]);
        }

        // Atualiza a barbearia selecionada se for a mesma
        const barbeariaSelecionada = this.barbeariaSelecionadaSubject.value;
        if (barbeariaSelecionada && barbeariaSelecionada.id === id) {
          this.barbeariaSelecionadaSubject.next(barbeariaAtualizada);
        }
      }),
      catchError(error => {
        this.setError('Erro ao atualizar barbearia: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Exclui uma barbearia
   */
  excluirBarbearia(id: number): Observable<void> {
    this.setLoading(true);
    this.clearError();

    return this.barbeariaRepository.excluirBarbearia(id).pipe(
      tap(() => {
        // Remove a barbearia da lista
        const barbeariasAtuais = this.barbeariasSubject.value;
        const barbeariasFiltradas = barbeariasAtuais.filter(b => b.id !== id);
        this.barbeariasSubject.next(barbeariasFiltradas);

        // Limpa a barbearia selecionada se for a mesma
        const barbeariaSelecionada = this.barbeariaSelecionadaSubject.value;
        if (barbeariaSelecionada && barbeariaSelecionada.id === id) {
          this.barbeariaSelecionadaSubject.next(null);
        }
      }),
      catchError(error => {
        this.setError('Erro ao excluir barbearia: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Busca barbearias com filtros
   */
  buscarComFiltros(filtro: BarbeariaFilter): Observable<BarbeariaResponse[]> {
    this.setLoading(true);
    this.clearError();

    return this.barbeariaRepository.buscarComFiltros(filtro).pipe(
      tap(barbearias => {
        this.barbeariasSubject.next(barbearias);
      }),
      catchError(error => {
        this.setError('Erro ao buscar barbearias: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Busca detalhes completos de uma barbearia
   */
  buscarDetalhada(id: number): Observable<BarbeariaResponse> {
    this.setLoading(true);
    this.clearError();

    return this.barbeariaRepository.buscarDetalhada(id).pipe(
      tap(barbearia => {
        this.barbeariaSelecionadaSubject.next(barbearia);
      }),
      catchError(error => {
        this.setError('Erro ao buscar detalhes da barbearia: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Atualiza configurações da barbearia
   */
  atualizarConfiguracoes(id: number, request: any): Observable<void> {
    this.setLoading(true);
    this.clearError();

    return this.barbeariaRepository.atualizarConfiguracoes(id, request).pipe(
      tap(() => {
        // Recarrega a barbearia para atualizar os dados
        this.buscarPorId(id).subscribe();
      }),
      catchError(error => {
        this.setError('Erro ao atualizar configurações: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Gera relatório da barbearia
   */
  gerarRelatorio(id: number, periodo: string, ano: number): Observable<any> {
    this.setLoading(true);
    this.clearError();

    return this.barbeariaRepository.gerarRelatorio(id, periodo, ano).pipe(
      catchError(error => {
        this.setError('Erro ao gerar relatório: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Upload de logo da barbearia
   */
  uploadLogo(id: number, file: File): Observable<{ logoUrl: string }> {
    this.setLoading(true);
    this.clearError();

    return this.barbeariaRepository.uploadLogo(id, file).pipe(
      tap(result => {
        // Atualiza a barbearia com a nova logo
        this.buscarPorId(id).subscribe();
      }),
      catchError(error => {
        this.setError('Erro ao fazer upload da logo: ' + error.message);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Seleciona uma barbearia
   */
  selecionarBarbearia(barbearia: BarbeariaResponse | null): void {
    this.barbeariaSelecionadaSubject.next(barbearia);
  }

  /**
   * Limpa a barbearia selecionada
   */
  limparSelecao(): void {
    this.barbeariaSelecionadaSubject.next(null);
  }

  /**
   * Atualiza a lista de barbearias
   */
  atualizarLista(barbearias: BarbeariaResponse[]): void {
    this.barbeariasSubject.next(barbearias);
  }

  /**
   * Obtém o valor atual das barbearias
   */
  getBarbearias(): BarbeariaResponse[] {
    return this.barbeariasSubject.value;
  }

  /**
   * Obtém a barbearia selecionada atual
   */
  getBarbeariaSelecionada(): BarbeariaResponse | null {
    return this.barbeariaSelecionadaSubject.value;
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