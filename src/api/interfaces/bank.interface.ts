import { Types } from 'mongoose';

export interface IBank {
  _id?: Types.ObjectId;
  accountName: string;
  accountNumber: string;
  bankName: string;
  isDefault: boolean;
}
