import { DataTypes } from "sequelize";
import sequelize from "./sequelize"; // Assuming you have configured Sequelize properly

const Option = sequelize.define(
  "options",
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

export default Option;
