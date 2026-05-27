const db = require("./knex")();
// (() => {
//   console.log("pre used ports");
//   const response = db("a2a_servers")
//     .whereNot({ status: "deleted" })
//     .pluck("port");
//   console.log("pre used ports");
//   return response;
// })();

(async () => {
  const response = await db("users").orderBy("created_at", "desc");
  console.log(response);
})();
