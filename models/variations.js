import { DataTypes } from "sequelize";
import sequelize from "../seq.js"; // Assuming you have configured Sequelize properly
import Recipe from "./recipes.js";

const Variation = sequelize.define(
  "variations",
  {
    recipe:{
      type: DataTypes.INTEGER,
      references: {
        model: Recipe,
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    timestamps: true,
  }
);

export default Variation;
