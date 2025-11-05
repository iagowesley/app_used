// ***********************************************************
// Este arquivo é processado e carregado automaticamente
// antes dos arquivos de teste
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Ocultar requisições fetch/XHR no log de comandos (opcional)
const app = window.top;

if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML =
    '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Evitar falhas por erros não capturados
Cypress.on('uncaught:exception', (err, runnable) => {
  // Retorne false para prevenir que o Cypress falhe o teste
  // em alguns casos específicos
  if (err.message.includes('ResizeObserver')) {
    return false
  }
  // Se quiser ignorar todos os erros não capturados:
  // return false
  return true
})

