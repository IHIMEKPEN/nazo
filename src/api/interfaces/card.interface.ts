import { Types } from 'mongoose';

export interface ICard {
  _id?: Types.ObjectId;
  authorization_code: string;
  bin: number;
  last4: number;
  exp_month: number;
  exp_year: number;
  card_type: string;
  brand: 'visa' | 'mastercard' | 'verve';
  country_code: 'US';
  reusable: boolean;
  signature: string;
  default: boolean;
}