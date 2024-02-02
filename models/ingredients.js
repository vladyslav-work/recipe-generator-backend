import { DataTypes } from "sequelize";
import sequelize from "./sequelize"; // Assuming you have configured Sequelize properly

const Ingredient = sequelize.define(
  "ingredients",
  {
    dish:{
      type: DataTypes.INTEGER,
      references: {
        model: Dish,
        key: 'id'
      }
    },
    discription: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    timestamps: true,
  }
);

export default Ingredient;
