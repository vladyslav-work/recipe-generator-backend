'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("variations", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      title1: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      description1: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      title2: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      description2: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      title3: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      description3: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      response: {
        type: Sequelize.TEXT,
        allowNull: false
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
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("variations");
  }
};
