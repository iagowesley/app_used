describe('Navegação da Aplicação', () => {
  it('Deve navegar entre páginas principais', () => {
    // Home
    cy.visit('/')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    
    // Login
    cy.contains(/entrar/i).click()
    cy.url().should('include', '/login')
    
    // Voltar para home clicando no logo
    cy.get('header img[alt*="used"]').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    
    // Cadastro
    cy.contains(/cadastrar/i).click()
    cy.url().should('include', '/cadastro')
    
    // Link para login
    cy.contains(/entre aqui/i).click()
    cy.url().should('include', '/login')
    
    // Link para cadastro
    cy.contains(/cadastre-se aqui/i).click()
    cy.url().should('include', '/cadastro')
  })

  it('Deve redirecionar para login ao tentar acessar novo anúncio sem login', () => {
    cy.visit('/novo-anuncio')
    cy.url({ timeout: 5000 }).should('include', '/login')
  })

  it('Deve redirecionar para login ao tentar acessar perfil sem login', () => {
    cy.visit('/perfil')
    cy.url({ timeout: 5000 }).should('include', '/login')
  })

  it('Deve ter botão voltar funcionando na página de detalhes', () => {
    cy.visit('/')
    cy.get('.products-grid', { timeout: 10000 }).should('be.visible')
    cy.get('.products-grid').find('a').first().click()
    
    cy.contains(/voltar/i).click()
    cy.url().should('not.include', '/produto/')
  })
})

