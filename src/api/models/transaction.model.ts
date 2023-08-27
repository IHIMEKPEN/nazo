import { model, Schema } from 'mongoose';
import { ITransaction } from '../interfaces';

const schema = new Schema<ITransaction>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'transaction user is required'],
  },
  type: {
    type: String,
    enum: {
      values: ['DEBIT', 'CREDIT'],
      message: '{VALUE} is not a supported value for transaction type',
    },
    required: [true, 'transaction type is required'],
  },
  amount: {
    type: Number,
    required: [true, 'transaction amount required'],
  },
  title: {
    type: String,
    required: [true, 'transaction title is required'],
  },
  status: {
    type: String,
    enum: {
      values: ['SUCCESSFUL', 'PENDING', 'FAILED'],
      message: '{VALUE} is not a supported value for transaction status',
    },
    default: 'PENDING',
  },
  description: String,
});

/** Added properties */
schema.set('timestamps', { createdAt: true, updatedAt: true });
schema.set('id', false);

export const TransactionModel = model<ITransaction>('Transaction', schema);
