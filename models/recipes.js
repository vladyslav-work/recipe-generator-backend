import { DataTypes } from "sequelize";
import sequelize from "../seq.js";

const Recipe = sequelize.define(
  "recipes",
  {
    step:{
      type: DataTypes.NUMBER,
      default: 0
    },
    material: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nutrition: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cuisine: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    },
    image:{
      type: DataTypes.STRING,
    },
    serving: {
      type: DataTypes.INTEGER,
      default: 0
    },
    readyTime: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default Recipe;
