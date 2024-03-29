'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("directions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      recipe: {
        type: Sequelize.INTEGER,
        references: {
          model: "recipes",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
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
    await queryInterface.dropTable("directions");
  }
};
