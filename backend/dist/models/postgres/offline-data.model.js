"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineData = void 0;
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
class OfflineData extends sequelize_1.Model {
    // Virtual properties for offline-first operations
    get isExpired() {
        return this.expiresAt ? new Date() > this.expiresAt : false;
    }
    get needsSync() {
        return ['pending', 'conflict', 'error'].includes(this.syncStatus);
    }
    get isStale() {
        const staleThreshold = 24 * 60 * 60 * 1000; // 24 hours
        return Date.now() - this.lastModified.getTime() > staleThreshold;
    }
}
exports.OfflineData = OfflineData;
OfflineData.init({
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
    data: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
    },
    version: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    lastModified: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    syncStatus: {
        type: sequelize_1.DataTypes.ENUM('pending', 'syncing', 'synced', 'conflict', 'error'),
        allowNull: false,
        defaultValue: 'pending',
    },
    checksum: {
        type: sequelize_1.DataTypes.STRING(64),
        allowNull: false,
    },
    metadata: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true,
    },
    expiresAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    priority: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    modelName: 'OfflineData',
    tableName: 'offline_data',
    timestamps: true,
    indexes: [
        {
            fields: ['userId', 'entityType'],
        },
        {
            fields: ['userId', 'syncStatus'],
        },
        {
            fields: ['entityType', 'entityId'],
            unique: true,
        },
        {
            fields: ['syncStatus', 'priority', 'lastModified'],
        },
        {
            fields: ['expiresAt'],
            where: {
                expiresAt: {
                    [require('sequelize').Op.ne]: null,
                },
            },
        },
        {
            fields: ['tags'],
            using: 'gin',
        },
        {
            fields: ['lastModified'],
        },
    ],
});
exports.default = OfflineData;
