const express = require("express");
const app = express();
const port = 3010;

app.get("/", (req, res) => {
  res.send("Olá, essa é a aplicação WalletApp!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
