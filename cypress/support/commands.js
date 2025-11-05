// ***********************************************
// Comandos customizados do Cypress
// ***********************************************

/**
 * Comando para fazer login
 * @example cy.login('usuario@teste.com', 'Senha@123')
 */
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.get('input[type="email"]').type(email)
    cy.get('input[type="password"]').type(password)
    cy.get('button[type="submit"]').click()
    cy.url().should('not.include', '/login')
    cy.wait(1000) // Aguardar autenticação
  })
})

/**
 * Comando para fazer logout
 */
Cypress.Commands.add('logout', () => {
  cy.visit('/perfil')
  cy.contains('sair da conta').click()
  cy.url().should('eq', Cypress.config().baseUrl + '/')
})

/**
 * Comando para criar uma conta
 * @example cy.cadastrar('novo@teste.com', 'Senha@123')
 */
Cypress.Commands.add('cadastrar', (email, password) => {
  cy.visit('/cadastro')
  cy.get('input[type="email"]').type(email)
  cy.get('input[id="senha"]').type(password)
  cy.get('input[id="confirmarSenha"]').type(password)
  cy.get('button[type="submit"]').click()
})

/**
 * Comando para verificar se está logado
 */
Cypress.Commands.add('verificarLogado', () => {
  cy.visit('/')
  cy.contains('anunciar').should('be.visible')
})

/**
 * Comando para verificar se NÃO está logado
 */
Cypress.Commands.add('verificarDeslogado', () => {
  cy.visit('/')
  cy.contains('entrar').should('be.visible')
})

