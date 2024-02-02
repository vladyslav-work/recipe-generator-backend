import { DataTypes } from "sequelize";
import sequelize from "../utils/sequelize.js"; // Assuming you have configured Sequelize properly
import Dish from "./dishes.js";

const Variation = sequelize.define(
  "variations",
  {
    dish:{
      type: DataTypes.INTEGER,
      references: {
        model: Dish,
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    discription: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    selected : {
      type: DataTypes.BOOLEAN,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

export default Variation;
