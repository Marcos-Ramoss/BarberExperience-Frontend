import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseRepository } from './base.repository';
import { 
  ProfissionalResponse, 
  CriarProfissionalRequest, 
  UpdateProfissionalRequest,
  ProfissionalFilter
} from '../dto/profissional/profissional.dto';

@Injectable({
  providedIn: 'root'
})
export class ProfissionalRepository extends BaseRepository<ProfissionalResponse, CriarProfissionalRequest, UpdateProfissionalRequest> {

  protected endpoint = 'profissionais';

  constructor(protected override http: HttpClient) {
    super(http);
  }

  /**
   * Lista todos os profissionais
   */
  listarProfissionais(): Observable<ProfissionalResponse[]> {
    return this.findAllSimple();
  }

  /**
   * Busca profissional por ID
   */
  buscarPorId(id: number): Observable<ProfissionalResponse> {
    return this.findById(id);
  }

  /**
   * Cria um novo profissional
   */
  criarProfissional(request: CriarProfissionalRequest): Observable<ProfissionalResponse> {
    return this.create(request);
  }

  /**
   * Atualiza um profissional existente
   * NOTA: Endpoint PUT ainda não implementado no backend
   */
  atualizarProfissional(id: number, request: UpdateProfissionalRequest): Observable<ProfissionalResponse> {
    // TODO: Implementar quando o endpoint PUT estiver disponível
    // return this.update(id, request);
    return this.atualizarProfissionalMock(id, request);
  }

  /**
   * Exclui um profissional
   */
  excluirProfissional(id: number): Observable<void> {
    return this.delete(id);
  }

  /**
   * Busca profissionais com filtros
   */
  buscarComFiltros(filtro: ProfissionalFilter): Observable<ProfissionalResponse[]> {
    return this.findByFilters(filtro).pipe(
      map(response => response.content)
    );
  }

  /**
   * Busca profissionais por barbearia
   */
  buscarPorBarbearia(barbeariaId: number): Observable<ProfissionalResponse[]> {
    return this.http.get<ProfissionalResponse[]>(
      `${this.baseUrl}/${this.endpoint}?barbeariaId=${barbeariaId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Busca profissionais por especialidade
   */
  buscarPorEspecialidade(especialidade: string): Observable<ProfissionalResponse[]> {
    return this.http.get<ProfissionalResponse[]>(
      `${this.baseUrl}/${this.endpoint}?especialidade=${especialidade}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Mock data para desenvolvimento (quando PUT não estiver disponível)
  private mockProfissionais: ProfissionalResponse[] = [
    {
      id: 1,
      nome: 'João Silva',
      cpf: '123.456.789-00',
      telefone: '(11) 99999-9999',
      email: 'joao@barbearia.com',
      especialidades: ['CORTE_MASCULINO', 'BARBA'],
      barbeariaId: 1
    },
    {
      id: 2,
      nome: 'Maria Santos',
      cpf: '987.654.321-00',
      telefone: '(11) 88888-8888',
      email: 'maria@barbearia.com',
      especialidades: ['CORTE_FEMININO', 'COLORACAO'],
      barbeariaId: 1
    },
    {
      id: 3,
      nome: 'Pedro Costa',
      cpf: '555.444.333-00',
      telefone: '(11) 77777-7777',
      email: 'pedro@barbearia.com',
      especialidades: ['CORTE_MASCULINO', 'SOBRANCELHA'],
      barbeariaId: 2
    }
  ];

  /**
   * Mock para atualizar profissional (desenvolvimento)
   */
  private atualizarProfissionalMock(id: number, request: UpdateProfissionalRequest): Observable<ProfissionalResponse> {
    const index = this.mockProfissionais.findIndex(p => p.id === id);
    if (index !== -1) {
      this.mockProfissionais[index] = {
        ...this.mockProfissionais[index],
        ...request
      };
    }
    return new Observable(observer => {
      observer.next(this.mockProfissionais[index]);
      observer.complete();
    });
  }
} 