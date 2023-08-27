import { Types } from 'mongoose';

export interface ITransaction {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  title: string;
  description?: string;
  status: 'SUCCESSFUL' | 'PENDING' | 'FAILED';
}
