import { DataTypes } from "sequelize";
import sequelize from "../seq.js"; // Assuming you have configured Sequelize properly
import Recipe from "./recipes.js";

const Direction = sequelize.define(
  "directions",
  {
    recipe:{
      type: DataTypes.INTEGER,
      references: {
        model: Recipe,
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

export default Direction;
