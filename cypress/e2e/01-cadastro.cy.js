describe('Cadastro de Usuário', () => {
  beforeEach(() => {
    cy.visit('/cadastro')
  })

  it('Deve exibir a página de cadastro corretamente', () => {
    cy.contains('cadastrar').should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[id="senha"]').should('be.visible')
    cy.get('input[id="confirmarSenha"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
  })

  it('Deve rejeitar senha fraca - menos de 8 caracteres', () => {
    cy.get('input[type="email"]').type('teste@exemplo.com')
    cy.get('input[id="senha"]').type('Abc@12')
    cy.get('input[id="confirmarSenha"]').type('Abc@12')
    cy.get('button[type="submit"]').click()
    
    cy.contains(/senha deve ter pelo menos 8 caracteres/i).should('be.visible')
  })

  it('Deve rejeitar senha sem letra maiúscula', () => {
    cy.get('input[type="email"]').type('teste@exemplo.com')
    cy.get('input[id="senha"]').type('senha@123')
    cy.get('input[id="confirmarSenha"]').type('senha@123')
    cy.get('button[type="submit"]').click()
    
    cy.contains(/maiúscula/i).should('be.visible')
  })

  it('Deve rejeitar senha sem letra minúscula', () => {
    cy.get('input[type="email"]').type('teste@exemplo.com')
    cy.get('input[id="senha"]').type('SENHA@123')
    cy.get('input[id="confirmarSenha"]').type('SENHA@123')
    cy.get('button[type="submit"]').click()
    
    cy.contains(/minúscula/i).should('be.visible')
  })

  it('Deve rejeitar senha sem número', () => {
    cy.get('input[type="email"]').type('teste@exemplo.com')
    cy.get('input[id="senha"]').type('Senha@@@')
    cy.get('input[id="confirmarSenha"]').type('Senha@@@')
    cy.get('button[type="submit"]').click()
    
    cy.contains(/número/i).should('be.visible')
  })

  it('Deve rejeitar senha sem caractere especial', () => {
    cy.get('input[type="email"]').type('teste@exemplo.com')
    cy.get('input[id="senha"]').type('Senha123')
    cy.get('input[id="confirmarSenha"]').type('Senha123')
    cy.get('button[type="submit"]').click()
    
    cy.contains(/especial/i).should('be.visible')
  })

  it('Deve rejeitar senhas que não coincidem', () => {
    cy.get('input[type="email"]').type('teste@exemplo.com')
    cy.get('input[id="senha"]').type('Senha@123')
    cy.get('input[id="confirmarSenha"]').type('Senha@456')
    cy.get('button[type="submit"]').click()
    
    cy.contains(/não coincidem/i).should('be.visible')
  })

  it('Deve aceitar senha forte válida', () => {
    const email = `teste${Date.now()}@cypress.com`
    
    cy.get('input[type="email"]').type(email)
    cy.get('input[id="senha"]').type('Senha@123')
    cy.get('input[id="confirmarSenha"]').type('Senha@123')
    cy.get('button[type="submit"]').click()
    
    // Deve mostrar popup de confirmação de email OU redirecionar
    cy.url().should('not.include', '/cadastro')
  })

  it('Deve ter link para página de login', () => {
    cy.contains(/entre aqui/i).click()
    cy.url().should('include', '/login')
  })

  it('Deve rejeitar email inválido', () => {
    cy.get('input[type="email"]').type('emailinvalido')
    cy.get('input[id="senha"]').type('Senha@123')
    cy.get('input[id="confirmarSenha"]').type('Senha@123')
    cy.get('button[type="submit"]').click()
    
    cy.contains(/email válido/i).should('be.visible')
  })
})

