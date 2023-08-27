import { Router } from 'express';
import { transactionController as ctr } from '../controllers';
import { authMiddleware as auth } from '../middlewares';

const router = Router();

router.use('/transaction', [auth.authenticate]);

router.param('transaction', ctr.findTransaction);
router.route('/transactions').get(ctr.getTransactions).post(ctr.createTransaction);
router
  .route('/transactions/:transaction')
  .get(ctr.getTransaction)
  .patch(ctr.updateTransaction)
  .delete(ctr.deleteTransaction);

export { router as transactionRoute };
