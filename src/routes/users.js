const express = require("express");
const router = express.Router();
const db = require("../db");

const findByEmail = (email) => {
  return (query = {
    name: "fetch-category",
    text: "SELECT * FROM users WHERE email=$1",
    values: [email],
  });
};

router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (name.length < 3) {
      return res
        .status(400)
        .json({ error: "Name should have more than 3 characters." });
    }

    if (email.length < 5 || !email.includes("@")) {
      return res.status(400).json({ error: "E-mail is invalid." });
    }

    const query = findByEmail(email);
    const alreadyExists = await db.query(query);

    if (alreadyExists.rows[0]) {
      return res.status(400).json({ error: "User already exists." });
    }

    const text = "INSERT INTO users(name, email) VALUES($1, $2) RETURNING*";
    const values = [name, email];
    const createResponse = await db.query(text, values);

    if (!createResponse.rows[0]) {
      return res.status(400).json({ error: "User not created." });
    }

    return res.status(200).json(createResponse.rows[0]);
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
