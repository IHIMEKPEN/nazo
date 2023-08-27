import { model, Schema } from 'mongoose';
import validator from 'validator';
import { IUser } from '../interfaces';
import { hashData } from '../utils';
import { BankSchema } from './bank.model';

const schema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'email field is required'],
    validate: [validator.isEmail, 'please provide a valid email address'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'password field is required'],
    minLength: [4, 'password field should be at least 4 characters'],
    maxLength: [255, 'password field should be at most 255 characters'],
    select: false,
  },
  type: {
    type: String,
    enum: {
      values: ['HOUSE_HOLD', 'BUSINESS_OWNER'],
      message: '{VALUE} is not supported for role field',
    },
   
  },
  firstname: {
    type: String,
    required: [true, 'firstname field is required'],
    minlength: [2, 'firstname field should be at least 2 characters'],
    maxlength: [255, 'firstname field should be at most 255 characters'],
    trim: true,
    lowercase: true,
  },
  lastname: {
    type: String,
    required: [true, 'lastname field is required'],
    minlength: [2, 'lastname field should be at least 2 characters'],
    maxlength: [255, 'lastname field should be at most 255 characters'],
    trim: true,
    lowercase: true,
  },
  photo: String,
  customerPaystackId: String,
  emailVerifiedAt: Date,
  isVerified: {
    type: Boolean,
    default: false,
  },
  pushToken: String,
  verificationToken: {
    type: String,
    select: false,
  },
  tokenExpires: {
    type: Date,
    select: false,
  },
  address: String,
  country:String,
  state:String,
  lga:String,

  
  subscription_id: String,
  

  billings: {
    banks: [BankSchema],
  },

});



/** Query Middlewares */
schema.pre('save', async function (next) {
  if (!this.isNew || !this.isModified('password')) return next();
  this.password = await hashData(this.password);

  next();
});



/** Added properties */

schema.set('toJSON', { virtuals: true });
schema.set('toObject', { virtuals: true });
schema.set('timestamps', { createdAt: true, updatedAt: true });
schema.set('id', false);

export const UserModel = model<IUser>('User', schema);
