import { Request, Response, NextFunction } from 'express';
import { isObjectIdOrHexString } from 'mongoose';
import { NotificationService } from '../services';
import { INotification } from '../interfaces';
import { IUserRequest } from '../middlewares';
import { asyncWrapper, httpResponse, ValidationError } from '../utils';

export interface INotificationBody extends Request, IUserRequest {
  notification?: INotification;
}

/** Notification Controller class */
class NotificationController {
  /** Constructor */
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * @method getNotifications
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - express next function
   */
  getNotifications = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const filter = {};
    const notifications = await this.notificationService.getAll(filter);
    res.status(200).json(
      httpResponse('notifications fetched successfully', {
        total: notifications.length,
        notifications,
      })
    );
  });

  /**
   * @method createNotification
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - express next function
   */
  createNotification = asyncWrapper(async (req: INotificationBody, res: Response, next: NextFunction) => {
    const notification = await this.notificationService.create({ ...req.body, receiver: req.user?._id });
    res.status(200).json(httpResponse('notification created successfully', { notification }));
  });

  /**
   * @method getNotification
   * @param {INotificationBody} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - express next function
   */
  getNotification = asyncWrapper(async (req: INotificationBody, res: Response, next: NextFunction) => {
    const notification = await this.notificationService.get(req.notification?._id);
    res.status(200).json(httpResponse('notification fetched successfully', { notification }));
  });

  /**
   * @method getUserNotifications
   * @param {INotificationBody} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - express next function
   */
  getUserNotifications = asyncWrapper(async (req: INotificationBody, res: Response, next: NextFunction) => {
    const notifications = await this.notificationService.getAll({ receiver: req.user?._id });
    res.status(200).json(
      httpResponse('user notifications fetched successfully', {
        total: notifications.length,
        notifications,
      })
    );
  });

  /**
   * @method updateNotification
   * @param {INotificationBody} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - express next function
   */
  updateNotification = asyncWrapper(async (req: INotificationBody, res: Response, next: NextFunction) => {
    // @ts-ignore
    if (!req.notification?.receiver.equals(req.user?._id)) {
      return next(new ValidationError('the notification does not belong to the user.', 'id'));
    }

    const notification = await this.notificationService.update(req.notification?._id, req.body);
    res.status(200).json(httpResponse('notification updated successfully', { notification }));
  });

  /**
   * @method deleteNotification
   * @param {INotificationBody} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - express next function
   */
  deleteNotification = asyncWrapper(async (req: INotificationBody, res: Response, next: NextFunction) => {
    // @ts-ignore
    if (!req.notification?.receiver.equals(req.user?._id)) {
      return next(new ValidationError('the notification does not belong to the user', 'id'));
    }

    await this.notificationService.delete(req.notification?._id);
    res.status(200).json(httpResponse('notification deleted successfully', null));
  });

  /**
   * @method findNotification
   * @param {INotificationBody} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - express next function
   */
  findNotification = async (req: INotificationBody, res: Response, next: NextFunction, val: INotification['_id']) => {
    if (!isObjectIdOrHexString(val)) return next(new ValidationError(`the notification id: ${val} is invalid`, 'id'));

    const notification = await this.notificationService.get(val);
    if (!notification) return next(new ValidationError(`the notification with id: ${val} was not found`, 'id'));

    req.notification = notification;
    next();
  };
}

/** Export NotificationController with NotificationService injected */
export const notificationController = new NotificationController(new NotificationService());
