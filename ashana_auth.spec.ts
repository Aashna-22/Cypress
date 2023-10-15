beforeEach(() => {
  cy.visit('http://localhost:3000/');
});
import { User } from "models";
const apiGraphQL = `${Cypress.env("apiUrl")}/graphql`;
describe("Cypress Studio Demo", function () {
  beforeEach(function () {
    cy.task("db:seed");

    cy.intercept("POST", "/users").as("signup");
    cy.intercept("POST", apiGraphQL, (req) => {
      const { body } = req;

      if (body.hasOwnProperty("operationName") && body.operationName === "CreateBankAccount") {
        req.alias = "gqlCreateBankAccountMutation";
      }
    });
  });
  it("should redirect unauthenticated user to signin page", function () {
    cy.visit("/personal");
    cy.location("pathname").should("equal", "/signin");
    cy.visualSnapshot("Redirect to SignIn");
  });
  it("should handle login scenarios", function () {
    // First, test for an invalid password for an existing user
    cy.database("find", "users").then((user: User) => {
      cy.login(user.username, "INVALID");
    });
  
    cy.getBySel("signin-error")
      .should("be.visible")
      .and("have.text", "Username or password is invalid");
    cy.visualSnapshot("Sign In, Invalid Username, Username or Password is Invalid");
  
    // Second, test for a successful login
    cy.database("find", "users").then((user: User) => {
      cy.login(user.username, "s3cret", { rememberUser: false });
      cy.location('pathname').should("equal", "/");
      cy.visualSnapshot("Display Username is Required Error");
    });
  });
  it("should display login errors", () =>{
    cy.getBySel('signin-username').type('user').find("input").clear().blur();
    cy.get('#username-helper-text').should('be.visible').and('contain', 'Username is required');
    cy.getBySel("signin-password").type("abc").find("input").blur();
    cy.get("#password-helper-text")
      .should("be.visible")
      .and("contain", "Password must contain at least 4 characters");
    // cy.visualSnapshot("Display Password Error");
    cy.getBySel("signin-submit").should("be.disabled");
  });
  it("allows users to signup, login and logout", () => {
    const userInfo = {
      firstName: "Ashana",
      lastName: "Chougle",
      username: "AshanaChougle22",
      password: "mord3rn",
    };
    cy.getBySel('signup').click();
    cy.getBySel('signup-title').should('be.visible').and('contain', 'Sign Up');
    cy.getBySel('signup-first-name').type(userInfo.firstName);
    cy.getBySel('signup-last-name').type(userInfo.lastName);
    cy.getBySel('signup-username').type(userInfo.username);
    cy.getBySel('signup-password').type(userInfo.password);
    cy.getBySel('signup-confirmPassword').type(userInfo.password);
    cy.getBySel('signup-submit').click();
    cy.wait('@signup');
    cy.login(userInfo.username, userInfo.password);
    cy.getBySel("user-onboarding-dialog").should("be.visible");
    cy.getBySel("list-skeleton").should("not.exist");
    cy.getBySel("nav-top-notifications-count").should("exist");
    cy.visualSnapshot("User Onboarding Dialog");
    cy.getBySel("user-onboarding-next").click();

    cy.getBySel("user-onboarding-dialog-title").should("contain", "Create Bank Account");

    cy.getBySelLike("bankName-input").type("The Best Bank");
    cy.getBySelLike("accountNumber-input").type("123456789");
    cy.getBySelLike("routingNumber-input").type("987654321");
    cy.visualSnapshot("About to complete User Onboarding");
    cy.getBySelLike("submit").click();

    cy.wait("@gqlCreateBankAccountMutation");

    cy.getBySel("user-onboarding-dialog-title").should("contain", "Finished");
    cy.getBySel("user-onboarding-dialog-content").should("contain", "You're all set!");
    cy.visualSnapshot("Finished User Onboarding");
    cy.getBySel("user-onboarding-next").click();

    cy.getBySel("transaction-list").should("be.visible");
    cy.visualSnapshot("Transaction List is visible after User Onboarding");
  });
  it("should display signup errors", function () {
    cy.intercept("GET", "/signup");

    cy.visit("/signup");

    cy.getBySel("signup-first-name").type("First").find("input").clear().blur();
    cy.get("#firstName-helper-text").should("be.visible").and("contain", "First Name is required");

    cy.getBySel("signup-last-name").type("Last").find("input").clear().blur();
    cy.get("#lastName-helper-text").should("be.visible").and("contain", "Last Name is required");

    cy.getBySel("signup-username").type("User").find("input").clear().blur();
    cy.get("#username-helper-text").should("be.visible").and("contain", "Username is required");

    cy.getBySel("signup-password").type("password").find("input").clear().blur();
    cy.get("#password-helper-text").should("be.visible").and("contain", "Enter your password");

    cy.getBySel("signup-confirmPassword").type("DIFFERENT PASSWORD").find("input").blur();
    cy.get("#confirmPassword-helper-text")
      .should("be.visible")
      .and("contain", "Password does not match");
    cy.visualSnapshot("Display Sign Up Required Errors");

    cy.getBySel("signup-submit").should("be.disabled");
    cy.visualSnapshot("Sign Up Submit Disabled");
  });

  it("should error for an invalid user", function () {
    cy.login("invalidUserName", "invalidPa$$word");

    cy.getBySel("signin-error")
      .should("be.visible")
      .and("have.text", "Username or password is invalid");
    cy.visualSnapshot("Sign In, Invalid Username and Password, Username or Password is Invalid");
  });
  
  
});


