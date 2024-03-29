import { DataTypes } from "sequelize";
import sequelize from "../seq.js";

const Recipe = sequelize.define(
  "recipes",
  {
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
    // image:{
    //   type: DataTypes.TEXT,
    // },
    serving: {
      type: DataTypes.INTEGER,
      default: 0
    },
    readyTime: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    ip: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    fingerprint: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    response: {
      type: DataTypes.TEXT
    },
  },
  {
    timestamps: true,
  }
);

export default Recipe;
