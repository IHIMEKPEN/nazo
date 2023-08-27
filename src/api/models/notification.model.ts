import { Schema, model } from 'mongoose';
import { INotification } from '../interfaces';

const schema = new Schema<INotification>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  receiver: {
    type: Schema.Types.ObjectId,
    required: [true, "Notification receiver's id is required"],
    ref: 'User',
  },
  type: {
    type: String,
    enum: {
      values: ['user_request', 'user_review'],
      message: '{VALUE} is not supported for Notification types',
      default: 'user_request',
    },
  },
  content: {
    type: String,
    required: [true, 'Notification content is required'],
  },
  action: {
    type: String,
    required: [true, 'Notification action url is required'],
  },
  isRead: {
    type: Boolean,
    default: false,
  },
});

/** Added properties */
schema.set('timestamps', { createdAt: true, updatedAt: true });
schema.set('id', false);

export const NotificationModel = model<INotification>('Notification', schema);
