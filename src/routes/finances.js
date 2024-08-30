const express = require("express");
const router = express.Router();
const db = require("../db");
const usersQueries = require("../queries/users");
const categoriesQueries = require("../queries/categories");

router.post("/", async (req, res) => {
  try {
    const { email } = req.headers;
    const { category_id, title, date, value } = req.body;

    if (email.length < 5 || !email.includes("@")) {
      return res.status(400).json({ error: "E-mail is invalid." });
    }

    if (!category_id) {
      return res.status(400).json({ error: "Category id is mandatory." });
    }

    if (!value) {
      return res.status(400).json({ error: "Value is mandatory." });
    }

    if (!title || title.length < 3) {
      return res.status(400).json({
        error: "Title is mandatory and should have more then 3 characters.",
      });
    }

    if (!date || date.length < 10) {
      return res.status(400).json({
        error: "Date is mandatory and should be in the format yyyy-mm-dd",
      });
    }

    const userQueries = await db.query(usersQueries.findByEmail(email));
    if (!userQueries.rows[0]) {
      return res.status(400).json({ error: "User does not exists." });
    }

    const category = await db.query(categoriesQueries.findById(category_id));
    if (!category.rows[0]) {
      return res.status(400).json({ error: "Category not found." });
    }

    const text =
      "INSERT INTO finances(users_id, category_id, date, title, value) VALUES($1,$2,$3,$4,$5) RETURNING *";
    const values = [userQueries.rows[0].id, category_id, date, title, value];

    const createResponse = await db.query(text, values);
    if (!createResponse.rows[0]) {
      return res.status(400).json({ error: "Finance row not created." });
    }

    return res.status(200).json(createResponse.rows[0]);
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
