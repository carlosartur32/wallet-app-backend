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

router.delete("/:id", async (req, res) => {
  try {
    const { email } = req.headers;
    const { id } = req.params;

    if (email.length < 5 || !email.includes("@")) {
      return res.status(400).json({ error: "E-mail is invalid." });
    }

    if (!id) {
      return res.status(400).json({ error: "Id is mandatory." });
    }

    const userQuery = await db.query(usersQueries.findByEmail(email));
    if (!userQuery.rows[0]) {
      return res.status(400).json({ error: "User does not exists." });
    }

    const findFinanceText = "SELECT * FROM finances WHERE id=$1";
    const findFinanceValue = [Number(id)];
    const financeItemQuery = await db.query(findFinanceText, findFinanceValue);

    if (!financeItemQuery.rows[0]) {
      return res.status(400).json({ error: "Finance row not found." });
    }

    if (financeItemQuery.rows[0].users_id !== userQuery.rows[0].id) {
      return res
        .status(401)
        .json({ error: "Finance row does not belong to user." });
    }

    const text = "DELETE FROM finances WHERE id=$1 RETURNING *";
    const values = [Number(id)];
    const deleteResponse = await db.query(text, values);

    if (!deleteResponse.rows[0]) {
      return res.status(400).json({ error: "Finance row not deleted." });
    }

    return res.status(200).json(deleteResponse.rows[0]);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const { date } = req.query;
    const { email } = req.headers;

    if (!date || date.length < 10) {
      return res.status(400).json({
        error: "Date is mandatory and should be in the format yyyy-mm-dd",
      });
    }

    if (email.length < 5 || !email.includes("@")) {
      return res.status(400).json({ error: "E-mail is invalid." });
    }

    const userQuery = await db.query(usersQueries.findByEmail(email));
    if (!userQuery.rows[0]) {
      return res.status(400).json({ error: "User does not exist." });
    }

    const dateObject = new Date(date);
    const year = dateObject.getFullYear();
    const month = dateObject.getMonth();
    const initDate = new Date(year, month, 1).toISOString();
    const finDate = new Date(year, month + 1, 0).toISOString();

    const text =
      "SELECT fin.title, fin.value, fin.date, fin.users_id, fin.category_id, cat.name FROM finances as fin JOIN categories as cat ON fin.category_id = cat.id WHERE fin.users_id=$1 and fin.date BETWEEN $2 and $3 ORDER BY fin.date DESC";
    const values = [userQuery.rows[0].id, initDate, finDate];
    const financesQuery = await db.query(text, values);

    return res.status(200).json(financesQuery.rows);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

module.exports = router;
