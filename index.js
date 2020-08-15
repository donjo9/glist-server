require("dotenv").config();
const bcrypt = require("bcryptjs");
const { ApolloServer, gql } = require("apollo-server");
const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const jwt = require("jsonwebtoken");
const { getUserId, getToken } = require("./utils");
const Dataloader = require("dataloader");

const pgConfig = {
  user: process.env.PGUSER,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
};

const batchGetListItems = async (list_ids) => {
  const query = "SELECT * FROM listitems WHERE list_id = ANY($1)";
  const { rows } = await pool.query(query, [list_ids]);
  if (rows) {
    let mappedInput = {};
    rows.forEach((x) => {
      if (mappedInput[x.list_id] !== undefined) {
        mappedInput[x.list_id].push(x);
      } else {
        mappedInput[x.list_id] = [];
        mappedInput[x.list_id].push(x);
      }
    });

    return list_ids.map((key) => mappedInput[key]);
  }
  return [];
};

const listItemLoader = new Dataloader((keys) => batchGetListItems(keys));

const pool = new Pool(pgConfig);

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

  input AddUser {
    name: String!
    email: String!
    password: String!
  }

  type AuthPayload {
    token: String
    user: User
  }
  type Mutation {
    addUser(data: AddUser): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    addList(name: String!): GroceryList!
    addListItem(name: String!, listId: String!): ListItem
  }
`;

const resolvers = {
  Query: {
    lists: async (_, args, { AuthHeader }) => {
      const userId = getUserId(AuthHeader);
      const query = "SELECT * FROM lists WHERE user_id = $1::text;";
      const { rows } = await pool.query(query, [userId]);
      return rows;
    },
    me: async (_, args, { AuthHeader }) => {
      const userId = getUserId(AuthHeader);
      const res = await pool.query("SELECT * FROM users WHERE id = $1::text;", [
        userId,
      ]);
      return res.rows[0];
    },
  },
  User: {
    lists: async (parent, ) => {
      const query = "SELECT * FROM lists WHERE user_id = $1";
      const  {rows} = await pool.query(query, [parent.id]);
      return rows;
    }
  },
  GroceryList: {
    items: async (parent, args, { getListItems }) => {
      const items = await getListItems.load(parent.id);
      console.dir(items);
      return items;
    },
  },
  Mutation: {
    addUser: async (_, { data: { name, email, password } }) => {
      const hash = await bcrypt.hash(password, 10);
      const id = nanoid();
      query =
        "INSERT INTO users (id,name,email, password ) VALUES($1,$2 ,$3 ,$4) RETURNING *;";
      const { rows } = await pool.query(query, [id, name, email, hash]);

      const token = getToken(rows[0]);

      return {
        token: token,
        user: rows[0],
      };
    },
    login: async (_, { email, password }) => {
      const query = "SELECT * FROM users WHERE email = $1;";
      const { rows } = await pool.query(query, [email]);

      const validPassword = await bcrypt.compare(password, rows[0].password);

      if (rows.length === 1 && validPassword) {
        const token = getToken(rows[0]);
        return { token, user: rows[0] };
      }
      throw new Error("Email or password incorrect");
    },
    addList: async (_, { name }, { AuthHeader }) => {
      const userId = getUserId(AuthHeader);
      const id = nanoid();
      const query =
        "INSERT INTO lists (id, name, user_id) VALUES($1,$2, $3) RETURNING *;";
      const { rows } = await pool.query(query, [id, name, userId]);

      return rows[0];
    },
    addListItem: async (_, { name, listId }, { AuthHeader }) => {
      const userId = getUserId(AuthHeader);
      const listQuery = "SELECT id FROM lists WHERE id = $1 AND user_id = $2";

      const { rows: ListRows } = await pool.query(listQuery, [listId, userId]);

      if (ListRows.length === 1) {
        const itemQuery =
          "INSERT INTO listitems (itemname, list_id) VALUES($1, $2) RETURNING *;";
        const { rows } = await pool.query(itemQuery, [name, listId]);
        return rows[0];
      }
      throw new Error("List not found");
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: (ctx) => {
    const AuthHeader = ctx.req.headers.authorization;
    return { AuthHeader, getListItems: listItemLoader };
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
