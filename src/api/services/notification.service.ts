import { INotification } from '../interfaces';
import { Notification } from '../models';

export class NotificationService {
  /**
   * @method create
   * @param notificationData INotification
   */
  public async create(notificationData: Partial<INotification>) {
    const notification = await Notification.create(notificationData);
    return notification;
  }

  /**
   * @method get
   * @param _id notifiaction id
   */
  public async get(_id: INotification['_id']) {
    const notification = await Notification.findOne({ _id });
    return notification;
  }

  /**
   * @method getAll
   * @param filter query filter
   */
  public async getAll(filter = {}, select = {}) {
    const notifications = await Notification.find(filter, select);
    return notifications;
  }

  /**
   * @method update
   * @param _id notification id
   */
  public async update(_id: INotification['_id'], { isRead }: Partial<INotification>) {
    const notification = await Notification.findByIdAndUpdate(_id, { isRead }, { new: true });
    return notification;
  }

  /**
   * @method delete
   * @param _id notification id
   */
  public async delete(_id: INotification['_id']) {
    await Notification.findByIdAndDelete(_id);
    return true;
  }
}
