const db = require("./knex")();
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

class User {
  static async create(email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [user] = await db("users")
      .insert({
        id: uuidv4(),
        email,
        password_hash: hashedPassword,
      })
      .returning("*");
    return user;
  }

  static async findByEmail(email) {
    return db("users").where({ email }).first();
  }

  static async findById(id) {
    return db("users").where({ id }).first();
  }

  static async validatePassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
  }
  static async updateResetToken(userId, resetToken, resetTokenExpiry) {
    await db("users")
      .where({ id: userId })
      .update({
        reset_token: resetToken,
        reset_token_expiry: db.raw("to_timestamp(?)", [
          resetTokenExpiry / 1000,
        ]),
      });
  }

  static async findByResetToken(resetToken) {
    return db("users").where({ reset_token: resetToken }).first();
  }

  static async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db("users")
      .where({ id: userId })
      .update({ password_hash: hashedPassword });
  }

  static async clearResetToken(userId) {
    await db("users").where({ id: userId }).update({
      reset_token: null,
      reset_token_expiry: null,
    });
  }
}

module.exports = User;
