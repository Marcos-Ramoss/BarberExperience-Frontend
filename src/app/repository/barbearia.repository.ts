import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { BaseRepository } from './base.repository';
import { 
  BarbeariaResponse, 
  CriarBarbeariaRequest, 
  UpdateBarbeariaRequest,
  BarbeariaFilter
} from '../dto/barbearia/barbearia.dto';


@Injectable({
  providedIn: 'root'
})
export class BarbeariaRepository extends BaseRepository<BarbeariaResponse, CriarBarbeariaRequest, UpdateBarbeariaRequest> {

  protected endpoint = 'barbearias';

  constructor(protected override http: HttpClient) {
    super(http);
  }

  /**
   * Lista todas as barbearias
   */
  listarBarbearias(): Observable<BarbeariaResponse[]> {
    return this.findAllSimple();
  }

  /**
   * Busca barbearia por ID
   */
  buscarPorId(id: number): Observable<BarbeariaResponse> {
    return this.findById(id);
  }

  /**
   * Cria uma nova barbearia
   */
  criarBarbearia(request: CriarBarbeariaRequest): Observable<BarbeariaResponse> {
    return this.create(request);
  }

  /**
   * Atualiza uma barbearia existente
   * NOTA: Endpoint PUT ainda não implementado no backend
   */
  atualizarBarbearia(id: number, request: UpdateBarbeariaRequest): Observable<BarbeariaResponse> {
    // TODO: Implementar quando o endpoint PUT estiver disponível
    // return this.update(id, request);
    return this.atualizarBarbeariaMock(id, request);
  }

  /**
   * Exclui uma barbearia
   */
  excluirBarbearia(id: number): Observable<void> {
    return this.delete(id);
  }

  /**
   * Busca barbearias com filtros
   */
  buscarComFiltros(filtro: BarbeariaFilter): Observable<BarbeariaResponse[]> {
    return this.findByFilters(filtro).pipe(
      map(response => response.content)
    );
  }

  /**
   * Busca detalhes completos de uma barbearia
   */
  buscarDetalhada(id: number): Observable<BarbeariaResponse> {
    return this.findById(id);
  }

  /**
   * Atualiza configurações da barbearia
   */
  atualizarConfiguracoes(id: number, request: any): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/${this.endpoint}/${id}/configuracoes`, 
      request,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Gera relatório da barbearia
   */
  gerarRelatorio(id: number, periodo: string, ano: number): Observable<any> {
    const params = { periodo, ano: ano.toString() };
    return this.http.get<any>(
      `${this.baseUrl}/${this.endpoint}/${id}/relatorios`, 
      { 
        params,
        headers: this.getAuthHeaders()
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Upload de logo da barbearia
   */
  uploadLogo(id: number, file: File): Observable<{ logoUrl: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    
    return this.http.post<{ logoUrl: string }>(
      `${this.baseUrl}/${this.endpoint}/${id}/upload-logo`, 
      formData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Mock data para desenvolvimento
  private mockBarbearias: BarbeariaResponse[] = [
    {
      id: 1,
      nome: 'Barbearia do João',
      cnpj: '12.345.678/0001-90',
      telefone: '(11) 99999-9999',
      email: 'contato@barbeariajoao.com',
      endereco: {
        rua: 'Rua das Flores',
        numero: '123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567'
      },
      horarioFuncionamento: {
        abertura: '08:00',
        fechamento: '18:00'
      }
    },
    {
      id: 2,
      nome: 'Barbearia Moderna',
      cnpj: '98.765.432/0001-10',
      telefone: '(11) 88888-8888',
      email: 'contato@barbeariamoderna.com',
      endereco: {
        rua: 'Avenida Paulista',
        numero: '456',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310-000'
      },
      horarioFuncionamento: {
        abertura: '09:00',
        fechamento: '19:00'
      }
    },
    {
      id: 3,
      nome: 'Barbearia Clássica',
      cnpj: '55.444.333/0001-22',
      telefone: '(11) 77777-7777',
      email: 'contato@barbeariaclassica.com',
      endereco: {
        rua: 'Rua Augusta',
        numero: '789',
        bairro: 'Consolação',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01212-000'
      },
      horarioFuncionamento: {
        abertura: '07:00',
        fechamento: '17:00'
      }
    }
  ];

  /**
   * Mock para listar barbearias (desenvolvimento)
   */
  listarBarbeariasMock(): Observable<BarbeariaResponse[]> {
    return of(this.mockBarbearias).pipe(delay(500));
  }

  /**
   * Mock para buscar barbearia por ID (desenvolvimento)
   */
  buscarPorIdMock(id: number): Observable<BarbeariaResponse> {
    const barbearia = this.mockBarbearias.find(b => b.id === id);
    return of(barbearia!).pipe(delay(300));
  }

  /**
   * Mock para criar barbearia (desenvolvimento)
   */
  criarBarbeariaMock(request: CriarBarbeariaRequest): Observable<BarbeariaResponse> {
    const novaBarbearia: BarbeariaResponse = {
      id: this.mockBarbearias.length + 1,
      nome: request.nome,
      cnpj: request.cnpj,
      telefone: request.telefone,
      email: request.email,
      endereco: {
        rua: request.rua,
        numero: request.numero,
        bairro: request.bairro,
        cidade: request.cidade,
        estado: request.estado,
        cep: request.cep
      },
      horarioFuncionamento: {
        abertura: request.horaAbertura,
        fechamento: request.horaFechamento
      }
    };
    
    this.mockBarbearias.push(novaBarbearia);
    return of(novaBarbearia).pipe(delay(800));
  }

  /**
   * Mock para atualizar barbearia (desenvolvimento)
   */
  atualizarBarbeariaMock(id: number, request: UpdateBarbeariaRequest): Observable<BarbeariaResponse> {
    const index = this.mockBarbearias.findIndex(b => b.id === id);
    if (index !== -1) {
      this.mockBarbearias[index] = {
        ...this.mockBarbearias[index],
        ...request
      };
    }
    return of(this.mockBarbearias[index]).pipe(delay(600));
  }

  /**
   * Mock para excluir barbearia (desenvolvimento)
   */
  excluirBarbeariaMock(id: number): Observable<void> {
    const index = this.mockBarbearias.findIndex(b => b.id === id);
    if (index !== -1) {
      this.mockBarbearias.splice(index, 1);
    }
    return of(void 0).pipe(delay(400));
  }
} 