/**
 * DTO de resposta genérica para todas as APIs
 */
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

/**
 * DTO de resposta paginada
 */
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

/**
 * DTO de erro da API
 */
export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
  path: string;
  details?: string[];
} 