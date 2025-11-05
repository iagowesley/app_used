describe('Responsividade', () => {
  const sizes = [
    { device: 'iphone-x', width: 375, height: 812 },
    { device: 'ipad-2', width: 768, height: 1024 },
    { device: 'macbook-15', width: 1440, height: 900 },
  ]

  sizes.forEach((size) => {
    it(`Deve funcionar corretamente em ${size.device}`, () => {
      cy.viewport(size.width, size.height)
      cy.visit('/')
      
      // Hero deve estar visível
      cy.contains(/used/i).should('be.visible')
      
      // Header deve estar visível
      cy.get('header').should('be.visible')
      
      // Produtos devem estar visíveis
      cy.get('.products-grid', { timeout: 10000 }).should('be.visible')
      
      // Campo de busca deve estar visível
      cy.get('input[placeholder*="buscar"]').should('be.visible')
    })
  })

  it('Deve manter layout em mobile', () => {
    cy.viewport('iphone-x')
    cy.visit('/')
    
    // Grid deve empilhar em mobile
    cy.get('.products-grid').should('be.visible')
    
    // Formulários devem ser responsivos
    cy.visit('/login')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
  })
})

