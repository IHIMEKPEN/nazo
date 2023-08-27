import { Schema } from 'mongoose';
import { IBank } from '../interfaces';

export const BankSchema = new Schema<IBank>({
  accountName: { type: String },
  accountNumber: { type: String },
  bankName: { type: String },
  isDefault: { type: Boolean, default: false },
});
