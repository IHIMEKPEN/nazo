import { Types, Document } from 'mongoose';
import { IBank } from './bank.interface';
import { ICard } from './card.interface';


export interface IUser extends Document {
  _id?: Types.ObjectId;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone:string;
  type: 'HOUSE_HOLD' | 'BUSINESS_OWNER';
  customerPaystackId?: string;
  isVerified?: boolean;
  emailVerifiedAt?: number;
  photo?: string;
  address?: string;
  lga?: string;
  country?: string;
 state?: string;
 pushToken?: string;
 verificationToken?: string;
 tokenExpires?: number;


  currentPassword?: string;
  location: {
    type: string;
    coordinates: number[];
    address?: string;
  };
  status?: 'ACTIVE' | 'INACTIVE';
  billings?: {
    banks: IBank[];
    wallet: number;
  };
  subscription_id?: string;
  code?: string;
  paymentMethodId?: string;

}
