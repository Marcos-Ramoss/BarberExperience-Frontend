import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseRepository } from './base.repository';
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
export class ServicoRepository extends BaseRepository<ServicoResponse, CriarServicoRequest, UpdateServicoRequest> {

  protected endpoint = 'servicos';

  constructor(protected override http: HttpClient) {
    super(http);
  }

  /**
   * Lista todos os serviços
   */
  listarServicos(): Observable<ServicoResponse[]> {
    return this.findAllSimple();
  }

  /**
   * Busca serviço por ID
   */
  buscarPorId(id: number): Observable<ServicoResponse> {
    return this.findById(id);
  }

  /**
   * Cria um novo serviço
   */
  criarServico(request: CriarServicoRequest): Observable<ServicoResponse> {
    return this.create(request);
  }

  /**
   * Atualiza um serviço existente
   * Usando PUT /servicos/{id} conforme swagger.json
   */
  atualizarServico(id: number, request: AtualizarServicoRequest): Observable<ServicoResponse> {
    console.log('🔧 EDITANDO SERVIÇO COM PUT:', { id, request });
    
    return this.http.put<ServicoResponse>(`${this.baseUrl}/${this.endpoint}/${id}`, request, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Exclui um serviço
   */
  excluirServico(id: number): Observable<void> {
    return this.delete(id);
  }

  /**
   * Busca serviços com filtros
   */
  buscarComFiltros(filtro: ServicoFilter): Observable<ServicoResponse[]> {
    return this.findByFilters(filtro).pipe(
      map(response => response.content)
    );
  }
} 