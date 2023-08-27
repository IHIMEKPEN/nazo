import { Schema, model } from 'mongoose';
import validator from 'validator';
import { IMaillist } from '../interfaces';

const schema = new Schema<any>({
  request: { },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 60, //seconds---1 minutes
  },

});

/** Added properties */
schema.set('toJSON', { virtuals: true });
schema.set('toObject', { virtuals: true });
schema.set('timestamps', { createdAt: true, updatedAt: true });
schema.set('id', false);

export const UserRequestModel = model<any>('UserRequest', schema);
