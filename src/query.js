const { getUserId } = require("./utils");
const db = require("./db");

const lists = async (_, args, { AuthHeader }) => {
  const userId = getUserId(AuthHeader);
  const query = "SELECT * FROM lists WHERE user_id = $1::text;";
  const { rows } = await db.query(query, [userId]);
  return rows;
};
const me = async (_, args, { AuthHeader }) => {
  const userId = getUserId(AuthHeader);
  const res = await db.query("SELECT * FROM users WHERE id = $1::text;", [
    userId,
  ]);
  return res.rows[0];
};

const items = async (parent, args, { getListItems }) => {
  const items = await getListItems.load(parent.id);
  console.dir(items);
  return items;
};

module.exports = { lists, me, items };
