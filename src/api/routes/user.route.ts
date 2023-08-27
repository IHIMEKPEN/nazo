import { Router } from 'express';
import { authMiddleware as auth, fileProcess as file } from '../middlewares';
import {
  userController as ctr,
  notificationController as notificationCtr,

  transactionController as trxCtr,
 
} from '../controllers';

const router = Router();


/** Applying middleware */
router.use('/me', [auth.authenticate]);

/** User routes */
router.get('/me', ctr.me);
router.patch('/me/update', [file.upload('user').single('photo'), ctr.updateMe]);
router.patch('/me/password/update', ctr.updatePassword);
router.patch('/me/location', ctr.updateUserLocation);
router.delete('/me/delete', ctr.deleteMe);



// User notification resources
router.get('/me/notifications', notificationCtr.getUserNotifications);




router.route('/me/billings/banks').patch(ctr.addUserBank);

router.route('/me/billings/transactions').get(trxCtr.getUserTransactions);

// TODO: Admin Access Alone
/** Apply access middleware to protect route */
router.use('/users', [auth.authenticate]);

router.param('user', ctr.foundUser);
router.route('/users').get(ctr.getUsers).post(ctr.createUser);

router
  .route('/users/:user')
  .get(ctr.getUser)
  .patch([file.upload('user').single('photo'), ctr.updateUser])
  .delete(ctr.deleteUser);




export { router as userRoute };
