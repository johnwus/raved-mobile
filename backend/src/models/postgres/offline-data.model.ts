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

export interface OfflineDataAttributes {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  data: any;
  version: number;
  lastModified: Date;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'conflict' | 'error';
  checksum: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  priority: number;
  tags?: string[];
}

export class OfflineData extends Model<OfflineDataAttributes> implements OfflineDataAttributes {
  public id!: string;
  public userId!: string;
  public entityType!: string;
  public entityId!: string;
  public data!: any;
  public version!: number;
  public lastModified!: Date;
  public syncStatus!: 'pending' | 'syncing' | 'synced' | 'conflict' | 'error';
  public checksum!: string;
  public metadata?: Record<string, any>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public expiresAt?: Date;
  public priority!: number;
  public tags?: string[];

  // Virtual properties for offline-first operations
  public get isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  public get needsSync(): boolean {
    return ['pending', 'conflict', 'error'].includes(this.syncStatus);
  }

  public get isStale(): boolean {
    const staleThreshold = 24 * 60 * 60 * 1000; // 24 hours
    return Date.now() - this.lastModified.getTime() > staleThreshold;
  }
}

OfflineData.init(
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
    entityType: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    lastModified: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    syncStatus: {
      type: DataTypes.ENUM('pending', 'syncing', 'synced', 'conflict', 'error'),
      allowNull: false,
      defaultValue: 'pending',
    },
    checksum: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
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
  }
);

export default OfflineData;