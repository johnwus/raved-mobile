"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineQueue = void 0;
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
class OfflineQueue extends sequelize_1.Model {
}
exports.OfflineQueue = OfflineQueue;
OfflineQueue.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    requestId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        unique: true,
    },
    method: {
        type: sequelize_1.DataTypes.ENUM('GET', 'POST', 'PUT', 'PATCH', 'DELETE'),
        allowNull: false,
    },
    url: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    headers: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
    },
    body: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true,
    },
    priority: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    retryCount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    maxRetries: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
    },
    errorMessage: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    scheduledAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    dependencies: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.UUID),
        allowNull: true,
    },
    tags: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
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
    modelName: 'OfflineQueue',
    tableName: 'offline_queues',
    timestamps: true,
    indexes: [
        {
            fields: ['userId', 'status'],
        },
        {
            fields: ['priority', 'createdAt'],
        },
        {
            fields: ['scheduledAt'],
        },
        {
            fields: ['tags'],
            using: 'gin',
        },
    ],
});
exports.default = OfflineQueue;
