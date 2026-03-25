const db = require("./knex")();

class Integration {
  static async findByUserAndProvider(userId, provider) {
    return db("user_integrations").where({ user_id: userId, provider }).first();
  }

  static async findAllByUser(userId) {
    return db("user_integrations").where({ user_id: userId });
  }

  static async upsert(userId, provider, data) {
    const existing = await Integration.findByUserAndProvider(userId, provider);
    if (existing) {
      const [updated] = await db("user_integrations")
        .where({ user_id: userId, provider })
        .update({ ...data, last_updated: db.fn.now() })
        .returning("*");
      return updated;
    } else {
      const [created] = await db("user_integrations")
        .insert({ user_id: userId, provider, ...data })
        .returning("*");
      return created;
    }
  }

  static async delete(userId, provider) {
    return db("user_integrations").where({ user_id: userId, provider }).delete();
  }
}

module.exports = Integration;
