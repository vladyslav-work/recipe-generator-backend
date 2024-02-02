import { DataTypes } from "sequelize";
import sequelize from "./sequelize"; // Assuming you have configured Sequelize properly

const Dish = sequelize.define(
  "dishes",
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
    }
  },
  {
    timestamps: true,
  }
);

export default Dish;
