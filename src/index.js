require("dotenv").config();

const { ApolloServer } = require("apollo-server");
const typeDefs = require("./typerDefs");
const { listItemLoader } = require("./loaders");
const { lists, me, items } = require("./query");
const { signup, login, addList, addListItem } = require("./mutations");

const resolvers = {
  Query: {
    me,
    lists,
  },
  User: {
    lists,
  },
  GroceryList: {
    items,
  },
  Mutation: {
    signup,
    login,
    addList,
    addListItem,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: (ctx) => {
    const AuthHeader = ctx.req.headers.authorization;
    return { AuthHeader, getListItems: listItemLoader() };
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
