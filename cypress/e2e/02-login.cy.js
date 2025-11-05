describe('Login de Usuário', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('Deve exibir a página de login corretamente', () => {
    cy.contains(/entrar/i).should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
  })

  it('Deve rejeitar campos vazios', () => {
    cy.get('button[type="submit"]').click()
    
    // Validação HTML5 deve prevenir submit
    cy.url().should('include', '/login')
  })

  it('Deve rejeitar credenciais inválidas', () => {
    cy.get('input[type="email"]').type('usuario@inexistente.com')
    cy.get('input[type="password"]').type('SenhaErrada@123')
    cy.get('button[type="submit"]').click()
    
    // Aguardar resposta
    cy.wait(2000)
    cy.contains(/erro/i, { timeout: 5000 }).should('be.visible')
  })

  it('Deve ter link para página de cadastro', () => {
    cy.contains(/cadastre-se aqui/i).click()
    cy.url().should('include', '/cadastro')
  })

  it('Deve mostrar loading durante o login', () => {
    cy.get('input[type="email"]').type('teste@exemplo.com')
    cy.get('input[type="password"]').type('Senha@123')
    cy.get('button[type="submit"]').click()
    
    // Deve mostrar loading ou texto de carregando
    cy.contains(/entrando/i).should('be.visible')
  })

  it('Deve redirecionar para home após login bem-sucedido', () => {
    // Use credenciais válidas de teste
    cy.get('input[type="email"]').type(Cypress.env('TEST_EMAIL'))
    cy.get('input[type="password"]').type(Cypress.env('TEST_PASSWORD'))
    cy.get('button[type="submit"]').click()
    
    cy.url({ timeout: 10000 }).should('eq', Cypress.config().baseUrl + '/')
    cy.contains('anunciar').should('be.visible') // Botão só aparece logado
  })
})

