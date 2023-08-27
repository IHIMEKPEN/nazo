import { Types } from 'mongoose';

export interface INotification {
  _id?: Types.ObjectId;
  sender?: Types.ObjectId;
  receiver: Types.ObjectId;
  type?: string;
  content: string;
  action: string;
  isRead?: boolean;
}
