import axios from 'axios';
import { Types } from 'mongoose';
import { logger } from '../utils';

export interface IPushNotification {
  token?: string;
  title?: string;
  message?: string;
  url?: string;
  subtitle?: string;
}

class PushNotification {
  public async send({ token, title, message, url, subtitle }: IPushNotification) {
    const body = {
      to: token,
      title,
      body: message,
      subtitle,
      data: { message, title, url },
      priority: 'high',
      sound: 'default',
      _displayInForeground: true,
    };

    try {
      const response = await axios.post('https://exp.host/--/api/v2/push/send', body, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'accept-encoding': 'gzip, deflate',
          host: 'exp.host',
        },
      });
      return response.data;
    } catch (error: any) {
      logger.error(error.message);
    }
  }

  public async chargeLocked(token: string | undefined, _id: Types.ObjectId | undefined) {
    if (token) {
      await this.send({
        token,
        title: 'Charge Locked',
        message: 'Your charge was locked successfully',
        url: `bluetanks://charges/${_id}`,
        subtitle: 'Your charge request has been locked by the station',
      });
    }
  }

  public async chargeUnlocked(token: string | undefined, _id: Types.ObjectId | undefined) {
    if (token) {
      await this.send({
        token,
        title: 'Charge UnLocked',
        message: 'Your charge has been unlocked',
        url: `bluetanks://charges/${_id}`,
        subtitle: 'Your charge request was unlocked by the charging station',
      });
    }
  }

  public async chargeCancelled(token: string | undefined, _id: Types.ObjectId | undefined) {
    if (token) {
      await this.send({
        token,
        title: 'Charge Cancelled',
        message: 'Your charge was cancelled',
        url: `bluetanks://charges/${_id}`,
        subtitle: 'Your charge request was cancelled by the charging station',
      });
    }
  }

  public async chargeStarted(token: string | undefined, _id: Types.ObjectId | undefined) {
    if (token) {
      await this.send({
        token,
        title: 'Charge Started',
        message: 'Your charge have started',
        url: `bluetanks://charges/${_id}`,
        subtitle: 'Your charge have started, relax and wait',
      });
    }
  }

  public async chargeCompleted(token: string | undefined, _id: Types.ObjectId | undefined) {
    if (token) {
      await this.send({
        token,
        title: 'Charge Completed',
        message: 'Your charge is completed',
        url: `bluetanks://charges/${_id}`,
        subtitle: 'Your charge is completed, proceed to details',
      });
    }
  }
}

export const pushNotification = new PushNotification();
