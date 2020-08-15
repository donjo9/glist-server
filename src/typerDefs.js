const { gql } = require("apollo-server");
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    lists: [GroceryList]
  }

  type GroceryList {
    id: String!
    name: String!
    items: [ListItem]
  }

  type ListItem {
    id: String!
    itemname: String!
  }

  type Query {
    me: User
    lists: [GroceryList]
  }

  input SignupData {
    name: String!
    email: String!
    password: String!
  }

  type AuthPayload {
    token: String
    user: User
  }
  type Mutation {
    signup(data: SignupData): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    addList(name: String!): GroceryList!
    addListItem(name: String!, listId: String!): ListItem
  }
`;

module.exports = typeDefs;
