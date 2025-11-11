"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncConflict = void 0;
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
class SyncConflict extends sequelize_1.Model {
}
exports.SyncConflict = SyncConflict;
SyncConflict.init({
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
    entityType: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
    entityId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    localVersion: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    serverVersion: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    localData: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
    },
    serverData: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
    },
    conflictType: {
        type: sequelize_1.DataTypes.ENUM('create', 'update', 'delete'),
        allowNull: false,
    },
    resolutionStrategy: {
        type: sequelize_1.DataTypes.ENUM('local_wins', 'server_wins', 'merge', 'manual'),
        allowNull: false,
        defaultValue: 'manual',
    },
    resolved: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    resolvedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    resolvedBy: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
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
    modelName: 'SyncConflict',
    tableName: 'sync_conflicts',
    timestamps: true,
    indexes: [
        {
            fields: ['userId', 'resolved'],
        },
        {
            fields: ['entityType', 'entityId'],
        },
        {
            fields: ['conflictType'],
        },
        {
            fields: ['createdAt'],
        },
    ],
});
exports.default = SyncConflict;
