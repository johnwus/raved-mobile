"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineStatus = void 0;
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
class OfflineStatus extends sequelize_1.Model {
}
exports.OfflineStatus = OfflineStatus;
OfflineStatus.init({
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
    deviceId: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    isOnline: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    lastSeen: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    connectionType: {
        type: sequelize_1.DataTypes.ENUM('wifi', 'cellular', 'ethernet', 'unknown'),
        allowNull: true,
    },
    networkQuality: {
        type: sequelize_1.DataTypes.ENUM('excellent', 'good', 'poor', 'offline'),
        allowNull: true,
    },
    batteryLevel: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0,
            max: 100,
        },
    },
    appVersion: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
    platform: {
        type: sequelize_1.DataTypes.ENUM('ios', 'android', 'web'),
        allowNull: false,
    },
    syncEnabled: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    lastSyncAttempt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    lastSuccessfulSync: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    pendingSyncItems: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    modelName: 'OfflineStatus',
    tableName: 'offline_status',
    timestamps: true,
    indexes: [
        {
            fields: ['userId', 'deviceId'],
            unique: true,
        },
        {
            fields: ['isOnline', 'lastSeen'],
        },
        {
            fields: ['platform'],
        },
        {
            fields: ['syncEnabled'],
        },
        {
            fields: ['lastSuccessfulSync'],
        },
    ],
});
exports.default = OfflineStatus;
