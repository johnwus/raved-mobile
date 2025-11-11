"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataVersion = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = require("sequelize");
const config_1 = require("../../config");
const sequelize = new sequelize_2.Sequelize(config_1.CONFIG.POSTGRES_URL, {
    dialect: 'postgres',
    logging: false,
    pool: {
        max: 20,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});
class DataVersion extends sequelize_1.Model {
}
exports.DataVersion = DataVersion;
DataVersion.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    entityType: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
    entityId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    version: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    operation: {
        type: sequelize_1.DataTypes.ENUM('create', 'update', 'delete'),
        allowNull: false,
    },
    data: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
    },
    checksum: {
        type: sequelize_1.DataTypes.STRING(64),
        allowNull: false,
    },
    metadata: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'DataVersion',
    tableName: 'data_versions',
    timestamps: true,
    indexes: [
        {
            fields: ['entityType', 'entityId', 'version'],
            unique: true,
        },
        {
            fields: ['userId', 'createdAt'],
        },
        {
            fields: ['operation'],
        },
        {
            fields: ['checksum'],
        },
    ],
});
exports.default = DataVersion;
