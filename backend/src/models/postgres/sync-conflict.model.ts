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

export interface SyncConflictAttributes {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  localVersion: number;
  serverVersion: number;
  localData: any;
  serverData: any;
  conflictType: 'create' | 'update' | 'delete';
  resolutionStrategy: 'local_wins' | 'server_wins' | 'merge' | 'manual';
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export class SyncConflict extends Model<SyncConflictAttributes> implements SyncConflictAttributes {
  public id!: string;
  public userId!: string;
  public entityType!: string;
  public entityId!: string;
  public localVersion!: number;
  public serverVersion!: number;
  public localData!: any;
  public serverData!: any;
  public conflictType!: 'create' | 'update' | 'delete';
  public resolutionStrategy!: 'local_wins' | 'server_wins' | 'merge' | 'manual';
  public resolved!: boolean;
  public resolvedAt?: Date;
  public resolvedBy?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public metadata?: Record<string, any>;
}

SyncConflict.init(
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
    localVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    serverVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    localData: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    serverData: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    conflictType: {
      type: DataTypes.ENUM('create', 'update', 'delete'),
      allowNull: false,
    },
    resolutionStrategy: {
      type: DataTypes.ENUM('local_wins', 'server_wins', 'merge', 'manual'),
      allowNull: false,
      defaultValue: 'manual',
    },
    resolved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resolvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
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
  }
);

export default SyncConflict;