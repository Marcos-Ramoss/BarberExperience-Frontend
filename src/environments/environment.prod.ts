/**
 * Configurações do ambiente de produção
 */
export const environment = {
  production: true,
  apiUrl: 'https://api.barberexperience.com',
  appName: 'Barber Experience',
  version: '1.0.0',
  defaultLanguage: 'pt-BR',
  supportedLanguages: ['pt-BR', 'en-US'],
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50, 100]
  },
  dateFormat: 'dd/MM/yyyy',
  timeFormat: 'HH:mm',
  dateTimeFormat: 'dd/MM/yyyy HH:mm'
}; 