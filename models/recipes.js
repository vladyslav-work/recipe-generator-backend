import { DataTypes } from "sequelize";
import sequelize from "../seq.js";

const Recipe = sequelize.define(
  "recipes",
  {
    step:{
      type: DataTypes.NUMBER,
      default: 0
    },
    protein: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    nutrition: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    cuisine: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    title: {
      type: DataTypes.TEXT
    },
    description: {
      type: DataTypes.TEXT
    },
    image:{
      type: DataTypes.TEXT,
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
