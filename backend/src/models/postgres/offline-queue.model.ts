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

export interface OfflineQueueAttributes {
  id: string;
  userId: string;
  requestId: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers: Record<string, any>;
  body?: any;
  priority: number;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  scheduledAt?: Date;
  dependencies?: string[];
  tags?: string[];
}

export class OfflineQueue extends Model<OfflineQueueAttributes> implements OfflineQueueAttributes {
  public id!: string;
  public userId!: string;
  public requestId!: string;
  public method!: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  public url!: string;
  public headers!: Record<string, any>;
  public body?: any;
  public priority!: number;
  public retryCount!: number;
  public maxRetries!: number;
  public status!: 'pending' | 'processing' | 'completed' | 'failed';
  public errorMessage?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public scheduledAt?: Date;
  public dependencies?: string[];
  public tags?: string[];
}

OfflineQueue.init(
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
    requestId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    method: {
      type: DataTypes.ENUM('GET', 'POST', 'PUT', 'PATCH', 'DELETE'),
      allowNull: false,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    headers: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    body: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    retryCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    maxRetries: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    dependencies: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: true,
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
  }
);

export default OfflineQueue;