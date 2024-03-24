const { sequelize } = require("../models");

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.changeColumn('User', 'image',
                {
                    type: Sequelize.BLOB('long'),
                    allowNull: true,
                }
            ),
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.changeColumn('User', 'image',
                {
                    type: Sequelize.String,
                    allowNull: true,
                }
            ),
        ]);
    }
};
// npx sequelize-cli db:migrate