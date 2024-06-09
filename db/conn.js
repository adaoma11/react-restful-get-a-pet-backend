const mongoose = require("mongoose");

const host = "localhost";
const port = "27017";
const db = "getapet";

async function main() {
    await mongoose.connect(`mongodb://${host}:${port}/${db}`);
    console.log(`Successfully connected to the database on ${host}:${port}`);
}

main().catch((err) => {
    console.error(
        "An error occurred when trying to connect to the database: " + err
    );
});

module.exports = mongoose;
