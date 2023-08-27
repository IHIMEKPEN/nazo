import { Schema } from 'mongoose';
import { ICard } from '../interfaces';

export const CardSchema = new Schema<ICard>({
  authorization_code: {
    type: String,
    required: [true, 'card authorization_code is required'],
  },
  bin: {
    type: Number,
    required: [true, 'card bin or first 6 digits is required'],
  },
  last4: {
    type: Number,
    required: [true, 'card last four digit is required'],
  },
  exp_month: {
    type: Number,
    required: [true, 'card expiration month is required'],
  },
  exp_year: {
    type: Number,
    required: [true, 'card expiration year is required'],
  },
  brand: {
    type: String,
    enum: {
      values: ['visa', 'mastercard', 'verve'],
      message: '{VALUE} is not a support card type',
    },
  },
  card_type: {
    type: String,
    required: [true, 'card_type is required'],
  },
  country_code: {
    type: String,
    enum: {
      values: ['US'],
      message: '{VALUE} is not a supported country code type',
    },
  },
  reusable: {
    type: Boolean,
    required: [true, 'card reusable field is required'],
    default: true,
  },
  signature: {
    type: String,
    required: [true, 'card signature is required'],
  },
  default: {
    type: Boolean,
    default: false,
  },
});
