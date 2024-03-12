import { DataTypes } from "sequelize";
import sequelize from "../seq.js"; // Assuming you have configured Sequelize properly
import Recipe from "./recipes.js";

const Variation = sequelize.define(
  "variations",
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
    title1: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description1: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    title2: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description2: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    title3: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description3: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    response:{
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ip: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    fingerprint: {
      type: DataTypes.STRING,
      defaultValue: ''
    }
  },
  {
    timestamps: true,
  }
);

export default Variation;
