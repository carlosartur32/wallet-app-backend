const db = require("../db");
const tableQueries = require("../queries/tables");

const init = async () => {
  try {
    await db.connect();
    await db.query(tableQueries.createDatabase());
    await db.query(tableQueries.createUsers());
    await db.query(tableQueries.createCategories());
    await db.query(tableQueries.createFinances());
    console.log("Successfully created tables.");
  } catch (error) {
    console.error("Error configuring database", error.message);
    throw new Error("Error configuring database", error);
  }
};

init();
