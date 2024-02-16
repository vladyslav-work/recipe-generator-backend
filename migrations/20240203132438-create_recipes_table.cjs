"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("recipes", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      step: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      protein: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      cuisine: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      nutrition: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      title: {
        type: Sequelize.TEXT,
      },
      description: {
        type: Sequelize.TEXT,
      },
      image: {
        type: Sequelize.STRING,
      },
      serving: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      readyTime: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('recipes');
  },
};
