import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';
import { pgPool } from '../config/database';
import mongoose from 'mongoose';
import { CONFIG } from '../config';
import crypto from 'crypto';

const execAsync = promisify(exec);

export interface BackupOptions {
  includeData?: boolean;
  includeSchema?: boolean;
  compress?: boolean;
  encrypt?: boolean;
  retentionDays?: number;
}

export interface ExportOptions {
  userId: string;
  anonymize?: boolean;
  format?: 'json' | 'csv';
  includePersonalData?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface BackupMetadata {
  id: string;
  type: 'full' | 'incremental' | 'schema';
  databases: string[];
  timestamp: Date;
  size: number;
  checksum: string;
  status: 'success' | 'failed' | 'in_progress';
  path: string;
  retentionDays: number;
  expiresAt: Date;
}

class BackupService {
  private backupDir: string;
  private tempDir: string;

  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
    this.tempDir = path.join(this.backupDir, 'temp');
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    await fs.mkdir(this.backupDir, { recursive: true });
    await fs.mkdir(this.tempDir, { recursive: true });
  }

  // PostgreSQL Backup
  async backupPostgreSQL(options: BackupOptions = {}): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `postgres_backup_${timestamp}.sql`;
    const filepath = path.join(this.tempDir, filename);

    try {
      // Use pg_dump for full backup
      const pgUrl = new URL(CONFIG.POSTGRES_URL);
      const dumpCommand = `pg_dump --host=${pgUrl.hostname} --port=${pgUrl.port} --username=${pgUrl.username} --dbname=${pgUrl.pathname.slice(1)} --no-password --format=c --compress=9 --file=${filepath}`;

      // Set password in environment
      const env = { ...process.env, PGPASSWORD: pgUrl.password };

      await execAsync(dumpCommand, { env });

      if (options.compress) {
        const compressedPath = await this.compressFile(filepath);
        await fs.unlink(filepath);
        return compressedPath;
      }

      return filepath;
    } catch (error) {
      console.error('PostgreSQL backup failed:', error);
      throw new Error(`PostgreSQL backup failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // MongoDB Backup
  async backupMongoDB(options: BackupOptions = {}): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dirname = `mongodb_backup_${timestamp}`;
    const dirpath = path.join(this.tempDir, dirname);

    try {
      await fs.mkdir(dirpath, { recursive: true });

      // Use mongodump
      const mongoUrl = new URL(CONFIG.MONGODB_URL);
      let dumpCommand = `mongodump --host=${mongoUrl.hostname} --port=${mongoUrl.port || 27017} --db=${mongoUrl.pathname.slice(1)} --out=${dirpath}`;

      if (mongoUrl.username) {
        dumpCommand += ` --username=${mongoUrl.username} --password=${mongoUrl.password} --authenticationDatabase=admin`;
      }

      await execAsync(dumpCommand);

      if (options.compress) {
        const archivePath = `${dirpath}.tar.gz`;
        await execAsync(`tar -czf ${archivePath} -C ${path.dirname(dirpath)} ${path.basename(dirpath)}`);
        await fs.rm(dirpath, { recursive: true, force: true });
        return archivePath;
      }

      return dirpath;
    } catch (error) {
      console.error('MongoDB backup failed:', error);
      throw new Error(`MongoDB backup failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Full System Backup
  async createFullBackup(options: BackupOptions = {}): Promise<BackupMetadata> {
    const backupId = crypto.randomUUID();
    const timestamp = new Date();

    try {
      console.log('Starting full system backup...');

      // Backup PostgreSQL
      const pgBackupPath = await this.backupPostgreSQL(options);

      // Backup MongoDB
      const mongoBackupPath = await this.backupMongoDB(options);

      // Create metadata
      const metadata: BackupMetadata = {
        id: backupId,
        type: 'full',
        databases: ['postgresql', 'mongodb'],
        timestamp,
        size: 0,
        checksum: '',
        status: 'in_progress',
        path: '',
        retentionDays: options.retentionDays || 30,
        expiresAt: new Date(timestamp.getTime() + (options.retentionDays || 30) * 24 * 60 * 60 * 1000)
      };

      // Combine backups into single archive
      const combinedPath = path.join(this.backupDir, `full_backup_${backupId}_${timestamp.toISOString().split('T')[0]}.tar.gz`);
      await execAsync(`tar -czf ${combinedPath} -C ${this.tempDir} .`);

      // Calculate size and checksum
      const stats = await fs.stat(combinedPath);
      metadata.size = stats.size;
      metadata.checksum = await this.calculateChecksum(combinedPath);
      metadata.path = combinedPath;
      metadata.status = 'success';

      // Save metadata
      await this.saveBackupMetadata(metadata);

      // Cleanup temp files
      await fs.unlink(pgBackupPath).catch(() => {});
      await fs.unlink(mongoBackupPath).catch(() => {});
      await this.cleanupTempDir();

      console.log(`Full backup completed: ${backupId}`);
      return metadata;

    } catch (error) {
      console.error('Full backup failed:', error);
      await this.saveBackupMetadata({
        id: backupId,
        type: 'full',
        databases: ['postgresql', 'mongodb'],
        timestamp: new Date(),
        size: 0,
        checksum: '',
        status: 'failed',
        path: '',
        retentionDays: options.retentionDays || 30,
        expiresAt: new Date(Date.now() + (options.retentionDays || 30) * 24 * 60 * 60 * 1000)
      });
      throw error;
    }
  }

  // Data Export for GDPR Compliance
  async exportUserData(options: ExportOptions): Promise<string> {
    const { userId, anonymize = false, format = 'json', includePersonalData = true, dateRange } = options;

    try {
      const exportData: any = {
        user: {},
        posts: [],
        comments: [],
        likes: [],
        connections: [],
        orders: [],
        events: [],
        notifications: [],
        exportDate: new Date().toISOString(),
        gdprCompliant: true
      };

      // Export user data (anonymized if requested)
      const userResult = await pgPool.query(`
        SELECT id, username, email, first_name, last_name, bio, faculty, university,
               student_id, location, website, subscription_tier, created_at, updated_at
        FROM users WHERE id = $1 AND deleted_at IS NULL
      `, [userId]);

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = userResult.rows[0];
      exportData.user = anonymize ? this.anonymizeUserData(user) : user;

      // Export posts
      const posts = await mongoose.connection.db.collection('posts').find({
        userId,
        ...(dateRange && {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        })
      }).toArray();
      exportData.posts = posts.map(post => anonymize ? this.anonymizePostData(post) : post);

      // Export comments
      const comments = await mongoose.connection.db.collection('comments').find({
        userId,
        ...(dateRange && {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        })
      }).toArray();
      exportData.comments = comments;

      // Export likes
      const likes = await mongoose.connection.db.collection('likes').find({
        userId,
        ...(dateRange && {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        })
      }).toArray();
      exportData.likes = likes;

      // Export connections
      const connections = await pgPool.query(`
        SELECT c.*, u.username, u.first_name, u.last_name
        FROM connections c
        JOIN users u ON (c.follower_id = u.id OR c.following_id = u.id)
        WHERE (c.follower_id = $1 OR c.following_id = $1) AND u.id != $1
      `, [userId]);
      exportData.connections = connections.rows.map(conn => anonymize ? this.anonymizeConnectionData(conn) : conn);

      // Export orders
      const orders = await pgPool.query(`
        SELECT o.*, si.name as item_name, si.price
        FROM orders o
        JOIN store_items si ON o.item_id = si.id
        WHERE (o.buyer_id = $1 OR o.seller_id = $1) AND o.created_at >= $2
      `, [userId, dateRange?.start || new Date(0)]);
      exportData.orders = orders.rows.map(order => anonymize ? this.anonymizeOrderData(order) : order);

      // Export event attendance
      const events = await pgPool.query(`
        SELECT e.*, ea.status, ea.registered_at
        FROM event_attendees ea
        JOIN events e ON ea.event_id = e.id
        WHERE ea.user_id = $1 AND ea.registered_at >= $2
      `, [userId, dateRange?.start || new Date(0)]);
      exportData.events = events.rows;

      // Export notifications
      const notifications = await mongoose.connection.db.collection('notifications').find({
        userId,
        ...(dateRange && {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        })
      }).toArray();
      exportData.notifications = notifications;

      // Generate export file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `user_export_${userId}_${timestamp}.${format}`;
      const filepath = path.join(this.tempDir, filename);

      if (format === 'json') {
        await fs.writeFile(filepath, JSON.stringify(exportData, null, 2));
      } else {
        // CSV format - simplified implementation
        const csvContent = this.convertToCSV(exportData);
        await fs.writeFile(filepath, csvContent);
      }

      return filepath;

    } catch (error) {
      console.error('Data export failed:', error);
      throw new Error(`Data export failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Anonymization methods
  private anonymizeUserData(user: any): any {
    return {
      ...user,
      email: this.hashValue(user.email),
      first_name: `User_${crypto.randomBytes(4).toString('hex')}`,
      last_name: `User_${crypto.randomBytes(4).toString('hex')}`,
      username: `user_${crypto.randomBytes(4).toString('hex')}`,
      phone: user.phone ? this.hashValue(user.phone) : null,
      student_id: user.student_id ? this.hashValue(user.student_id) : null,
      location: null, // Remove location for privacy
      bio: null // Remove bio for privacy
    };
  }

  private anonymizePostData(post: any): any {
    return {
      ...post,
      content: this.maskText(post.content),
      location: null,
      tags: [] // Remove tags for privacy
    };
  }

  private anonymizeConnectionData(connection: any): any {
    return {
      ...connection,
      username: `user_${crypto.randomBytes(4).toString('hex')}`,
      first_name: `User_${crypto.randomBytes(4).toString('hex')}`,
      last_name: `User_${crypto.randomBytes(4).toString('hex')}`
    };
  }

  private anonymizeOrderData(order: any): any {
    return {
      ...order,
      delivery_address: null, // Remove delivery address
      buyer_phone: null // Remove phone number
    };
  }

  private hashValue(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex').substring(0, 16);
  }

  private maskText(text: string): string {
    if (!text) return text;
    // Mask sensitive words or patterns
    return text.replace(/\b\d{10,}\b/g, '[PHONE_MASKED]')
               .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_MASKED]');
  }

  private convertToCSV(data: any): string {
    // Simplified CSV conversion - in production, use a proper CSV library
    const rows = [];
    rows.push('Section,Data');
    rows.push(`User,${JSON.stringify(data.user)}`);
    rows.push(`Posts Count,${data.posts.length}`);
    rows.push(`Comments Count,${data.comments.length}`);
    rows.push(`Export Date,${data.exportDate}`);
    return rows.join('\n');
  }

  // Backup Management
  async listBackups(): Promise<BackupMetadata[]> {
    try {
      const metadataPath = path.join(this.backupDir, 'metadata.json');
      const metadata = await fs.readFile(metadataPath, 'utf-8');
      return JSON.parse(metadata);
    } catch {
      return [];
    }
  }

  async deleteExpiredBackups(): Promise<number> {
    const backups = await this.listBackups();
    const now = new Date();
    let deletedCount = 0;

    for (const backup of backups) {
      if (backup.expiresAt < now) {
        try {
          await fs.unlink(backup.path);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete expired backup ${backup.id}:`, error);
        }
      }
    }

    // Update metadata
    const remainingBackups = backups.filter(b => b.expiresAt >= now);
    await this.saveBackupMetadataList(remainingBackups);

    return deletedCount;
  }

  async verifyBackupIntegrity(backupId: string): Promise<boolean> {
    const backups = await this.listBackups();
    const backup = backups.find(b => b.id === backupId);

    if (!backup) {
      throw new Error('Backup not found');
    }

    try {
      const currentChecksum = await this.calculateChecksum(backup.path);
      return currentChecksum === backup.checksum;
    } catch {
      return false;
    }
  }

  // Restore functionality
  async restoreFromBackup(backupId: string, targetDatabases: string[] = ['postgresql', 'mongodb']): Promise<void> {
    const backups = await this.listBackups();
    const backup = backups.find(b => b.id === backupId);

    if (!backup) {
      throw new Error('Backup not found');
    }

    // Verify integrity before restore
    if (!(await this.verifyBackupIntegrity(backupId))) {
      throw new Error('Backup integrity check failed');
    }

    try {
      // Extract backup
      const extractDir = path.join(this.tempDir, `restore_${backupId}`);
      await fs.mkdir(extractDir, { recursive: true });
      await execAsync(`tar -xzf ${backup.path} -C ${extractDir}`);

      // Restore PostgreSQL
      if (targetDatabases.includes('postgresql')) {
        const pgDumpFile = path.join(extractDir, 'postgres_backup_*.sql');
        // Note: Actual restore would require careful handling of database connections
        console.log('PostgreSQL restore would be implemented here');
      }

      // Restore MongoDB
      if (targetDatabases.includes('mongodb')) {
        const mongoDumpDir = path.join(extractDir, 'mongodb_backup_*');
        // Note: Actual restore would require careful handling of database connections
        console.log('MongoDB restore would be implemented here');
      }

      await fs.rm(extractDir, { recursive: true, force: true });

    } catch (error) {
      console.error('Restore failed:', error);
      throw new Error(`Restore failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Utility methods
  private async compressFile(filepath: string): Promise<string> {
    const compressedPath = `${filepath}.gz`;
    await execAsync(`gzip ${filepath}`);
    return compressedPath;
  }

  private async calculateChecksum(filepath: string): Promise<string> {
    const fileBuffer = await fs.readFile(filepath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  private async saveBackupMetadata(metadata: BackupMetadata): Promise<void> {
    const metadataPath = path.join(this.backupDir, 'metadata.json');
    let existingMetadata: BackupMetadata[] = [];

    try {
      const data = await fs.readFile(metadataPath, 'utf-8');
      existingMetadata = JSON.parse(data);
    } catch {
      // File doesn't exist, start with empty array
    }

    existingMetadata.push(metadata);
    await fs.writeFile(metadataPath, JSON.stringify(existingMetadata, null, 2));
  }

  private async saveBackupMetadataList(metadata: BackupMetadata[]): Promise<void> {
    const metadataPath = path.join(this.backupDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  private async cleanupTempDir(): Promise<void> {
    try {
      const files = await fs.readdir(this.tempDir);
      for (const file of files) {
        await fs.unlink(path.join(this.tempDir, file));
      }
    } catch (error) {
      console.error('Temp directory cleanup failed:', error);
    }
  }
}

export const backupService = new BackupService();