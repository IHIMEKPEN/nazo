import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { JWT_KEY } from '../../config';
import { IUser, IVehicle } from '../interfaces';
import { UserService } from '../services';
import { UserRequest } from '../models';
import { AppError, AuthError, asyncWrapper } from '../utils';

export interface IUserRequest extends Request {
  user?: IUser;
  foundUser?: IUser;
  foundVehicle?: IVehicle;
}

class AuthMiddleare {
  constructor(private readonly userService: UserService) { }

  /**
   * @method authenticate
   * @param req request object
   * @param res response object
   * @param next express next function
   */
  public authenticate = asyncWrapper(async (req: IUserRequest, res: Response, next: NextFunction) => {
    let token = '';
    /** Determing the time of authorization header used, must be 'Bearer Auth' */
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    token = req.cookies["token"] || token;
    if (!token) {
      const errorMessage = 'user not authenticated';
      const possibleSolution = 'login and try again';
      return next(new AuthError(errorMessage, 'token', possibleSolution));
    }

    const payload = <IUser>verify(token, JWT_KEY);
    const _user = await this.userService.get(payload._id);

    if (!_user) {
      const errorMessage = 'invalid or expired token provided';
      const possibleSolution = 'login and try again';
      return next(new AuthError(errorMessage, 'token', possibleSolution));
    }

    if (!_user.isVerified) {
      const errorMessage = 'user not verified';
      const possibleSolution = 'try verifying your email address to proceed';
      return next(new AuthError(errorMessage, 'email', possibleSolution));
    }

    req.user = _user;
    next();
  });
  /**
   * @method userNetwork
   * @param req request object
   * @param res response object
   * @param next express next function
   */
  public userNetwork = asyncWrapper(async (req: IUserRequest, res: Response, next: NextFunction) => {
    if (req.method != 'GET') {
      console.log(req.body)
      let userRequest = await UserRequest.findOne({ request: req.body })
      if (userRequest) throw new AppError('Duplicate Request')
      await UserRequest.create({ request: req.body })
    }
    next();
  });
}

export const authMiddleware = new AuthMiddleare(new UserService());
