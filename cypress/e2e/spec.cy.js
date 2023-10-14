beforeEach(() => {
  cy.visit('https://example.cypress.io');
});
describe('Test Scenario 1', () => {
  
  it('Test Case 1', () => {
    cy.get('h1').should('have.text', 'Kitchen Sink');
    cy.get('.navbar-brand').click();
  });
  it("Clicks and verifies all dropdown elements", () => {
    cy.contains('Commands').click()
    const numberOfElements = 17;
    for (let i = 1; i <= numberOfElements; i++) {
      const selector = `.dropdown-menu > :nth-child(${i}) > a`;
      cy.get(selector).click({ force: true });
    }
  });
});
describe('Action- Type',() => {
  it('Type into input element', ()=>{
    cy.contains('type').click()
    cy.get('.action-email').click()
    cy.get('.action-email').should('have.focus');
    cy.get('.action-email').type('fake@email.com').should('have.value', 'fake@email.com')
  })
})
describe('form submitted', () =>{
  it('Verify form is submitted', ()=> {
    cy.contains('submit').click()
    cy.get('.action-form').find('#couponCode1').type('HALFOFF')
    cy.get('.action-form').submit().next().should('contain', 'Your form has been submitted!')
  })
})
describe('ead and write data in a file', () => {
  it ('Upload file ', () => {
    cy.get('.dropdown-menu > :nth-child(14) > a').click({ force: true });
    cy.get('.fixture-btn').click()
    cy.request('https://jsonplaceholder.cypress.io/users')
    cy.readFile('cypress/fixtures/users.json').then((addData) => {
      const newData = {
        "id": 10,
        "name": "Ashana Chougle",
        "username": "Ashana.Chougle",
        "email": "aashna.chougle@gmail",
        "address": {
          "street": "23 Str",
          "suite": "Suite 198",
          "city": "Edinburg",
          "zipcode": "31428-2261",
          "geo": {
            "lat": "-38.2386",
            "lng": "57.2232"
          }
        },
        "phone": "024-648-3804",
        "website": "ashana.com",
        "company": {
          "name": "Hoeger LLC",
          "catchPhrase": "Centralized empowering task-force for women",
          "bs": "target end-to-end testing"
        }
      };
      addData.push(newData);
      cy.writeFile('cypress/fixtures/users.json', addData);
    })
    

  })
})
describe('handling http requests', () => {
  it("verify the response from an api call ", function(){
    cy.request('https://jsonplaceholder.cypress.io/comments')
    .should((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.length(500)
      expect(response).to.have.property('headers')
      expect(response).to.have.property('duration')
  })
  })
})
describe('handling http requests', () => {
  it("verify request ", function(){
    cy.request('https://jsonplaceholder.cypress.io/users')
    .its('body.0') 
    .then((user) => {
      expect(user).property('id').to.be.a('number')
      cy.request('POST', 'https://jsonplaceholder.cypress.io/posts', {
        userId: user.id,
        title: 'Ashana: Cypress Test Runner',
        body: 'Fast, easy and reliable testing done by Ashana for anything that runs in a browser.',
      })
    }).its('body').as('post')
  });
})





