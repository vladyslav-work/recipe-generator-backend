import { DataTypes } from "sequelize";
import sequelize from "../seq.js"; // Assuming you have configured Sequelize properly
import Recipe from "./recipes.js";

const Response = sequelize.define(
  "responses",
  {
    recipe:{
      type: DataTypes.INTEGER,
      references: {
        model: Recipe,
        key: 'id'
      }
    },
    variations: {
      type: DataTypes.TEXT
    },
    main: {
      type: DataTypes.TEXT
    }
  },
  {
    timestamps: true,
  }
);

export default Response;
