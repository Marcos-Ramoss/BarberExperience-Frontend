/**
 * DTO de paginação para requisições
 */
export interface PaginationRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

/**
 * DTO de filtros genéricos
 */
export interface FilterRequest {
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

/**
 * DTO de ordenação
 */
export interface SortRequest {
  field: string;
  direction: 'ASC' | 'DESC';
} 