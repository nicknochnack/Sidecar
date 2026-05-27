const db = require("./knex")();

(async () => {
  const response = await db("a2a_server_configs")
    .where({ server_id: "cb1a9a75-db9b-4957-9044-9fda5707b910" })
    .first();
  console.log(response);
})();
