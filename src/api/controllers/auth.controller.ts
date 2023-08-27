import { Request, Response, NextFunction } from 'express';
import _ from 'underscore';
import { AuthService } from '../services';
import { asyncWrapper, httpResponse } from '../utils';
import path from 'path';

/** Auth Controller Class */
class AuthController {
  constructor(private readonly authService: AuthService) { }

  /**
   * @method register
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - express next function
   */
  register = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const { token, user } = await this.authService.register(req.body);
    const filtered = _.pick(user, 'firstname', 'lastname', 'email', 'isVerified', 'type');
    res.status(200)
      .setHeader("Set-Cookie", ["token=" + token])
      .json(httpResponse('user registration successful', { user: filtered, token }));
  });

  /**
   * @method verify
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - express next function
   */
  verify = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const { email,type, code } = req.body;
    const token = await this.authService.verify(email, code,type);
    res.status(200)
      .setHeader("Set-Cookie", ["token=" + token])
    .json(httpResponse('user email verification successful', { token }));
  });

  /**
   * @method login
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - express next function
   */
  login = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const token = await this.authService.login(req.body);
    res.status(200)
      .setHeader("Set-Cookie", ["token=" + token])
      .json(httpResponse('user login successful', { token }));
  });

  /**
   * @method resendToken
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - express next function
   */
  resendToken = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const { email,type } = req.body;
    await this.authService.resendToken(email,type);
    res.status(200).json(httpResponse(`an email with the verification code was sent to ${email}`));
  });

  /**
   * @method passwordResetRequest
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - express next function
   */
  passwordResetRequest = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    await this.authService.passwordResetRequest(email);
    res.status(200).json(httpResponse('a code to reset your password was sent to the email address provided'));
  });

  /**
   * @method passwordReset
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - express next function
   */
  passwordReset = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const token = await this.authService.passwordReset(req.body);
    res.status(200)
      .setHeader("Set-Cookie", ["token=" + token])
      .json(httpResponse('user password was reset successfully', { token }));
  });
  /**
   * @method log
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - express next function
   */
  log = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const uploadPath = path.resolve(`${__dirname}/../../../error.log`);
    res.status(200).download(uploadPath)
  });
}

/** Export the authController object with AuthService Dependency */
export const authController = new AuthController(new AuthService());
