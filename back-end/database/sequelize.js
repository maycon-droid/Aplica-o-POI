
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT || 5432),
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  }
);

try {
  await sequelize.authenticate();
  console.log("Conexão com o banco estabelecida!");
} catch (error) {
  console.error("Erro ao conectar ao banco:", error);
  throw error;
}

export default sequelize;
