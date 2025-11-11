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

export interface DataVersionAttributes {
  id: string;
  entityType: string;
  entityId: string;
  version: number;
  userId: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  checksum: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export class DataVersion extends Model<DataVersionAttributes> implements DataVersionAttributes {
  public id!: string;
  public entityType!: string;
  public entityId!: string;
  public version!: number;
  public userId!: string;
  public operation!: 'create' | 'update' | 'delete';
  public data!: any;
  public checksum!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public metadata?: Record<string, any>;
}

DataVersion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    entityType: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    operation: {
      type: DataTypes.ENUM('create', 'update', 'delete'),
      allowNull: false,
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    checksum: {
      type: DataTypes.STRING(64),
      allowNull: false,
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
  }
);

export default DataVersion;