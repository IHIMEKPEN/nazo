import { Router } from 'express';
import { authController as authCtr } from '../controllers';

const router: Router = Router();

/** Authentication routes */
router.post('/auth/register', authCtr.register);
router.post('/auth/login', authCtr.login);
router.post('/auth/verify', authCtr.verify);
router.post('/auth/resend-token', authCtr.resendToken);
router.post('/auth/password-reset-request', authCtr.passwordResetRequest);
router.post('/auth/password-reset', authCtr.passwordReset);

/** Analytic routes */
router.get('/logs', authCtr.log);

export { router as authRoute };
