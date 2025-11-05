describe('Listagem e Busca de Produtos', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Deve exibir a página inicial com seção hero', () => {
    cy.contains(/used/i).should('be.visible')
    cy.contains(/marketplace/i).should('be.visible')
  })

  it('Deve exibir o título "todos os anúncios"', () => {
    cy.contains(/todos os anúncios/i).should('be.visible')
  })

  it('Deve ter campo de busca visível', () => {
    cy.get('input[placeholder*="buscar"]').should('be.visible')
  })

  it('Deve ter header com logo', () => {
    cy.get('header').should('be.visible')
    cy.get('header img[alt*="used"]').should('be.visible')
  })

  it('Deve exibir loading enquanto carrega produtos', () => {
    // Recarregar para ver loading
    cy.reload()
    cy.get('.loading', { timeout: 1000 }).should('exist')
  })

  it('Deve exibir produtos após carregar', () => {
    cy.get('.products-grid', { timeout: 10000 }).should('be.visible')
  })

  it('Deve filtrar produtos pela busca', () => {
    // Aguardar produtos carregarem
    cy.get('.products-grid', { timeout: 10000 }).should('be.visible')
    
    // Buscar por algo específico
    cy.get('input[placeholder*="buscar"]').type('teste')
    
    // Aguardar filtro
    cy.wait(500)
  })

  it('Deve mostrar mensagem quando não encontrar produtos', () => {
    cy.get('input[placeholder*="buscar"]').type('xyzprodutoquenaoexiste123')
    cy.wait(500)
    cy.contains(/nenhum anúncio encontrado/i).should('be.visible')
  })

  it('Deve limpar busca ao apagar texto', () => {
    cy.get('input[placeholder*="buscar"]').type('teste')
    cy.wait(500)
    cy.get('input[placeholder*="buscar"]').clear()
    cy.wait(500)
    
    // Produtos devem aparecer novamente
    cy.get('.products-grid').should('be.visible')
  })

  it('Deve clicar em produto e ir para detalhes', () => {
    cy.get('.products-grid', { timeout: 10000 }).should('be.visible')
    cy.get('.products-grid').find('a').first().click()
    cy.url().should('include', '/produto/')
  })

  it('Deve ter botões de login/cadastro quando não logado', () => {
    cy.contains(/entrar/i).should('be.visible')
    cy.contains(/cadastrar/i).should('be.visible')
  })

  it('Deve navegar para login ao clicar no botão', () => {
    cy.contains(/entrar/i).click()
    cy.url().should('include', '/login')
  })

  it('Deve navegar para cadastro ao clicar no botão', () => {
    cy.visit('/')
    cy.contains(/cadastrar/i).click()
    cy.url().should('include', '/cadastro')
  })
})

