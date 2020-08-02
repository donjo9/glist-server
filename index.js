require("dotenv").config();
const bcrypt = require("bcryptjs");
const { ApolloServer, gql } = require("apollo-server");
const { Pool } = require("pg");
const { nanoid } = require("nanoid");

const pgConfig = {
  user: process.env.PGUSER,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
};

const pool = new Pool(pgConfig);

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    password: String!
    Lists: [GroseryList]
  }

  type GroseryList {
    id: String!
    name: String!
    items: [ListItem]
  }

  type ListItem {
    id: String!
    name: String!
  }

  type Query {
    users: [User]
    me: User
    user: User
  }

  input AddUser {
    name: String!
    email: String!
    password: String!
  }

  type AddUserResponse {
    message: String
  }
  type Mutation {
    addUser(data: AddUser): AddUserResponse!
  }
`;

const tempUsers = [
  { id: "sdbf345qy", name: "Johnni", email: "don@jo9.dk", password: "red123" },
];

const resolvers = {
  Query: {
    users: async () => {
      const res = await pool.query("SELECT * FROM users");
      console.dir(res.rows);
      return res.rows;
    },
    me: async () => {
      const res = await pool.query("SELECT * FROM users");
      return res.rows[0];
    },
  },
  Mutation: {
    addUser: async (_, { data: { name, email, password } }) => {
      const hash = await bcrypt.hash(password, 10);
      const compare = await bcrypt.compare(password, hash);
      const id = nanoid();
      query =
        "INSERT INTO users (id,name,email, password ) VALUES($1,$2 ,$3 ,$4);";
      pool.query(query,[id, name, email,hash ]);
      return {
        message: `Hej ${name}, din mail er ${email} og dit password er ${hash}, dit id bliver ${id}, password isValid = ${compare}`,
      };
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
