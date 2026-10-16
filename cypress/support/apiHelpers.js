export const createAccount = (user) =>
  cy.apiCall({ method: "POST", endpoint: "createAccount", body: user });

export const updateAccount = (user) =>
  cy.apiCall({ method: "PUT", endpoint: "updateAccount", body: user });

export const deleteAccount = (email, password) =>
  cy.apiCall({
    method: "DELETE",
    endpoint: "deleteAccount",
    body: { email, password },
  });

export const verifyLogin = (email, password) =>
  cy.apiCall({
    method: "POST",
    endpoint: "verifyLogin",
    body: { email, password },
  });

export const getUserDetails = (email) =>
  cy.apiCall({
    method: "GET",
    endpoint: "getUserDetailByEmail",
    qs: email ? { email } : undefined,
  });

export const detailFieldMap = {
  name: "name",
  email: "email",
  title: "title",
  birth_date: "birth_day",
  birth_month: "birth_month",
  birth_year: "birth_year",
  firstname: "first_name",
  lastname: "last_name",
  company: "company",
  address1: "address1",
  address2: "address2",
  country: "country",
  state: "state",
  city: "city",
  zipcode: "zipcode",
};