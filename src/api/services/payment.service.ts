
import { IUser } from '../interfaces';
import { PAYSTACK_SK } from '../../config';
import { AppError, logger, ValidationError } from '../utils';
import axios from 'axios';
import { User } from '../models';


export interface CreateChargeData {
  amount: number;
  customerStripeId?: string;
  currency?: string;
  description?: string;
  capture?: boolean;
}

export class PaymentService {


  constructor() {

  }

  /**
   * @method createCustomer
   * @param userData
   */
  public async createCustomer({ firstname, lastname, email, customerPaystackId, _id, phone }: Partial<IUser>) {


    // if (!customerPaystackId) {

    var body = {
      email,
      first_name: firstname,
      last_name: lastname,
      phone,
      metadata: { _id }
    };
    let headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': `Bearer ${PAYSTACK_SK}`
    }
    try {

      const response = await axios.post('https://api.paystack.co/customer', body, {
        headers
      });
       await User.findByIdAndUpdate(_id, { customerPaystackId: response.data.customer_code }, { new: true });
      return response.data;
    } catch (error: any) {
      console.log(error)
      logger.error(error.message);
      throw new AppError(error.message);
    }

    // }




  }


}
