/**
 * DTO de erro detalhado
 */
export interface ErrorDto {
  message: string;
  status: number;
  timestamp: string;
  path: string;
  details?: string[];
  field?: string;
  value?: any;
}

/**
 * DTO de validação de erro
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * DTO de erro de negócio
 */
export interface BusinessError {
  code: string;
  message: string;
  details?: any;
} 