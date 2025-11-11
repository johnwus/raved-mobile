import { DataTypes, Model } from 'sequelize';
import { pgPool } from '../../config/database';
import { Sequelize } from 'sequelize';
import { CONFIG } from '../../config';

const sequelize = new Sequelize(CONFIG.POSTGRES_URL, {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export interface OfflineStatusAttributes {
  id: string;
  userId: string;
  deviceId: string;
  isOnline: boolean;
  lastSeen: Date;
  connectionType?: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  networkQuality?: 'excellent' | 'good' | 'poor' | 'offline';
  batteryLevel?: number;
  appVersion: string;
  platform: 'ios' | 'android' | 'web';
  syncEnabled: boolean;
  lastSyncAttempt?: Date;
  lastSuccessfulSync?: Date;
  pendingSyncItems: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export class OfflineStatus extends Model<OfflineStatusAttributes> implements OfflineStatusAttributes {
  public id!: string;
  public userId!: string;
  public deviceId!: string;
  public isOnline!: boolean;
  public lastSeen!: Date;
  public connectionType?: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  public networkQuality?: 'excellent' | 'good' | 'poor' | 'offline';
  public batteryLevel?: number;
  public appVersion!: string;
  public platform!: 'ios' | 'android' | 'web';
  public syncEnabled!: boolean;
  public lastSyncAttempt?: Date;
  public lastSuccessfulSync?: Date;
  public pendingSyncItems!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public metadata?: Record<string, any>;
}

OfflineStatus.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    deviceId: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isOnline: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    lastSeen: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    connectionType: {
      type: DataTypes.ENUM('wifi', 'cellular', 'ethernet', 'unknown'),
      allowNull: true,
    },
    networkQuality: {
      type: DataTypes.ENUM('excellent', 'good', 'poor', 'offline'),
      allowNull: true,
    },
    batteryLevel: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
    appVersion: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    platform: {
      type: DataTypes.ENUM('ios', 'android', 'web'),
      allowNull: false,
    },
    syncEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    lastSyncAttempt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastSuccessfulSync: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    pendingSyncItems: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
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
  }
);

export default OfflineStatus;