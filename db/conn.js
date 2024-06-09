const mongoose = require("mongoose");

async function main() {
    await mongoose.connect("mongodb://localhost:27017/getapet");
    console.log("Conexão ao db estabelecida com sucesso");
}

main().catch((err) => {
    console.error("Ocorreu um erro ao tentar conectar ao db: " + err);
});

module.exports = mongoose;
