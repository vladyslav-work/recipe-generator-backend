import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  username: 'root',
  password: '',
  database: 'recipe'
});

export default sequelize
