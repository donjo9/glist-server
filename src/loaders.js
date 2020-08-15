const db = require("./db");
const Dataloader = require("dataloader");

const batchGetListItems = async (list_ids) => {
  const query = "SELECT * FROM listitems WHERE list_id = ANY($1)";
  const { rows } = await db.query(query, [list_ids]);
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

const listItemLoader = () => new Dataloader((keys) => batchGetListItems(keys));

module.exports = { listItemLoader };
