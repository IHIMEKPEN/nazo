import { TWILO_SID, TWILO_TOKEN, TWILO_MESSAGE_SID } from '../../config';
import { ValidationError } from '../utils';

const accountSid = TWILO_SID;
const authToken = TWILO_TOKEN;
const client = require('twilio')(accountSid, authToken);

type SMSType = {
  to: string | any;
  message: string;
};

/** SMSService class */
class SMSService {
  
  /**
   * @method sendSingle
   */
  async send({ to, message }: SMSType) {
    // console.log(to, message)
    try {
      let data = await client.messages.create({
        body: message,
        messagingServiceSid: TWILO_MESSAGE_SID,
        to: to,
      });

      return data;
    } catch (error: any) {
      console.log(error)
      const { message } = error;
      throw new ValidationError(message, '');
    }
  }
  /**
   * @method voiceCall
   */
  async voiceCall({ phone }: any) {
 
    try {
      let data = await client.calls.create({
        url: 'http://demo.twilio.com/docs/voice.xml',
        to: phone,
        from: '+16206368672'
      })

      return data;
    } catch (error: any) {
      console.log(error)
      const { message } = error;
      throw new ValidationError(message, '');
    }
  }
}

export const smsService = new SMSService();
