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
      protein: {
        type: Sequelize.TEXT,
      },
      nutrition: {
        type: Sequelize.TEXT,
      },
      cuisine: {
        type: Sequelize.TEXT,
      },
      title: {
        type: Sequelize.TEXT,
      },
      description: {
        type: Sequelize.TEXT,
      },
      serving: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      readyTime: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      response: {
        type: Sequelize.TEXT,
      },
      ip: {
        type: Sequelize.TEXT,
        defaultValue: ""
      },
      fingerprint: {
        type: Sequelize.TEXT,
        defaultValue: ""
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
