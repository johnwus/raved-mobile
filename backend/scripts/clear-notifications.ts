import { connectDB } from '../src/config/database';
import { Notification } from '../src/models/mongoose/notification.model';
import { NotificationPreference } from '../src/models/mongoose/notification-preference.model';

async function clearNotifications() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();

    console.log('🧹 Clearing all notifications from database...');

    // Delete all notifications
    const notificationResult = await Notification.deleteMany({});
    console.log(`✅ Deleted ${notificationResult.deletedCount} notifications`);

    // Delete all notification preferences
    const preferenceResult = await NotificationPreference.deleteMany({});
    console.log(`✅ Deleted ${preferenceResult.deletedCount} notification preferences`);

    console.log('🎉 Database cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing notifications:', error);
    process.exit(1);
  }
}

// Run the script
clearNotifications();