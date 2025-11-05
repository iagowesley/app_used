describe('Acessibilidade Básica', () => {
  it('Deve ter labels nos inputs de login', () => {
    cy.visit('/login')
    cy.get('label[for="email"]').should('exist')
    cy.get('label[for="senha"]').should('exist')
  })

  it('Deve ter labels nos inputs de cadastro', () => {
    cy.visit('/cadastro')
    cy.get('label[for="email"]').should('exist')
    cy.get('label[for="senha"]').should('exist')
    cy.get('label[for="confirmarSenha"]').should('exist')
  })

  it('Deve ter placeholders descritivos', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').should('have.attr', 'placeholder')
    cy.get('input[type="password"]').should('have.attr', 'placeholder')
  })

  it('Deve ter alt text nas imagens', () => {
    cy.visit('/')
    cy.get('img').each(($img) => {
      cy.wrap($img).should('have.attr', 'alt')
    })
  })

  it('Deve navegar por Tab entre inputs', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').focus()
    cy.focused().should('have.attr', 'type', 'email')
    
    cy.focused().tab()
    cy.focused().should('have.attr', 'type', 'password')
    
    cy.focused().tab()
    cy.focused().should('have.attr', 'type', 'submit')
  })

  it('Deve ter required nos campos obrigatórios', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').should('have.attr', 'required')
    cy.get('input[type="password"]').should('have.attr', 'required')
  })
})

