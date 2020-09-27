const { getUserId, getToken } = require("./utils");
const db = require("./db");
const bcrypt = require("bcryptjs");
const { nanoid } = require("nanoid");

const signup = async (_, { data: { name, email, password } }) => {
  const hash = await bcrypt.hash(password, 10);
  const id = nanoid();
  query =
    "INSERT INTO users (id,name,email, password ) VALUES($1,$2 ,$3 ,$4) RETURNING *;";
  const { rows } = await db.query(query, [id, name, email, hash]);

  const token = getToken(rows[0]);

  return {
    token: token,
    user: rows[0],
  };
};

const login = async (_, { email, password }) => {
  const query = "SELECT * FROM users WHERE email = $1;";
  const { rows } = await db.query(query, [email]);
  if (rows.length > 0) {
    const validPassword = await bcrypt.compare(password, rows[0].password);
  
    if (rows.length === 1 && validPassword) {
      const token = getToken(rows[0]);
      return { token, user: rows[0] };
    }
  }
  throw new Error("Email or password incorrect");
};

const addList = async (_, { name }, { AuthHeader }) => {
  const userId = getUserId(AuthHeader);
  const id = nanoid();
  const query =
    "INSERT INTO lists (id, name, user_id) VALUES($1,$2, $3) RETURNING *;";
  const { rows } = await db.query(query, [id, name, userId]);

  return rows[0];
};

const addListItem = async (_, { name, listId }, { AuthHeader }) => {
  const userId = getUserId(AuthHeader);
  const listQuery = "SELECT id FROM lists WHERE id = $1 AND user_id = $2";

  const { rows: ListRows } = await db.query(listQuery, [listId, userId]);

  if (ListRows.length === 1) {
    const itemQuery =
      "INSERT INTO listitems (itemname, list_id) VALUES($1, $2) RETURNING *;";
    const { rows } = await db.query(itemQuery, [name, listId]);
    return rows[0];
  }
  throw new Error("List not found");
};

module.exports = { signup, login, addList, addListItem };
