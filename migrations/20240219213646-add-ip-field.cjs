"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.addColumn('recipes', 'ip', Sequelize.TEXT);
     */
    return queryInterface.addColumn("recipes", "ip", { type: Sequelize.TEXT });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.removeColumn('recipes', 'ip');
     */
    return queryInterface.removeColumn("recipes", "ip");
  },
};
