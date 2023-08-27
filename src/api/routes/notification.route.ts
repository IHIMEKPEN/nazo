import { Router } from 'express';
import { notificationController as ctr } from '../controllers';
import { authMiddleware as auth } from '../middlewares';

const router = Router();

router.use('/notifications', [auth.authenticate]);

router.param('notification', ctr.findNotification);
router.route('/notifications').get(ctr.getNotifications).post(ctr.createNotification);
router
  .route('/notifications/:notification')
  .get(ctr.getNotification)
  .patch(ctr.updateNotification)
  .delete(ctr.deleteNotification);

export { router as notificationRoute };
