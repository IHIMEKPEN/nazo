import { NextFunction, Request, Response } from 'express';
import { Types, isObjectIdOrHexString } from 'mongoose';
import { UserService, FileService,PaymentService} from '../services';
import { asyncWrapper, httpResponse, ValidationError } from '../utils';
import { IUserRequest } from '../middlewares';
import { IUser } from '../interfaces';

class UserController {
  private readonly paymentService = new PaymentService();
  constructor(
    private readonly userService: UserService,
    private readonly fileService: FileService,
   
    
  ) {}

  /**
   * @method me
   * @param req request Object
   * @param res response object
   * @param next express next function
   */
  public me = asyncWrapper(async (req: IUserRequest, res: Response, next: NextFunction) => {
    res.status(200).json(httpResponse('user fetch successfully', { user: req.user }));
  });

  /**
   * @method updateMe
   * @param req request Object
   * @param res response object
   * @param next express next function
   */
  public updateMe = asyncWrapper(async (req: IUserRequest, res: Response, next: NextFunction) => {
    const { firstname, lastname, pushToken } = req.body;

    if (req.file && req.file.fieldname === 'photo') {
      let previousPhotoUrl = '';
      if (req.user?.photo) previousPhotoUrl = req.user.photo;

      /** Upload new photo to AWS S3 */
      const { Location } = await this.fileService.uploadSingle(req.file, 'users');
      await this.fileService.unlinkFile(req.file.path);
      req.body.photo = Location;

      /** Delete previous photo from AWS S3 */
      const key = this.fileService.getObjectKey(previousPhotoUrl);
      await this.fileService.deleteFile(key);
    }

    const user = await this.userService.update(req.user?._id, {
      firstname,
      lastname,
      pushToken,
      photo: req.body.photo,
    });
    res.status(200).json(httpResponse('user updated successfully', { user }));
  });

  /**
   * @method deleteMe
   * @param req request Object
   * @param res response object
   * @param next express next function
   */
  public deleteMe = asyncWrapper(async (req: IUserRequest, res: Response, next: NextFunction) => {
    /** If user has photo, delete it from AWS S3 */
    if (req.user?.photo) {
      const key = this.fileService.getObjectKey(req.user.photo);
      await this.fileService.deleteFile(key);
    }

    await this.userService.delete(req.user?._id);
    res.status(200).json(httpResponse('account deleted successfully', null));
  });

  /**
   * @method updateUserLocation
   * @param req request Object
   * @param res response object
   * @param next express next function
   */
  public updateUserLocation = asyncWrapper(async (req: IUserRequest, res: Response, next: NextFunction) => {
    const { address, longitude, latitude } = req.body;

    if (!address || typeof address !== 'string') {
      return next(new ValidationError('address field is required and must be of type string', 'address'));
    }
    if (!longitude || typeof longitude !== 'number') {
      return next(new ValidationError('longitude field is required and must be of type number', 'longitude'));
    }
    if (!latitude || typeof latitude !== 'number') {
      return next(new ValidationError('latitude field is required and must be of type number', 'latitude'));
    }

    const location = { type: 'Point', coordinates: [Number(longitude), Number(latitude)], address };

    const user = await this.userService.update(req.user?._id, { location });
    res.status(200).json(httpResponse('user location updated successfully', { user }));
  });

  /**
   * @method updatePassword
   * @param req request Object
   * @param res response object
   * @param next express next function
   */
  public updatePassword = asyncWrapper(async (req: IUserRequest, res: Response, next: NextFunction) => {
    const { user, token } = await this.userService.updatePassword(req.user?._id, req.body);
    res.status(200).json(httpResponse('user password updated successfully', { user, token }));
  });

  /**
   * @method addUserBank
   * @param req request Object
   * @param res response object
   * @param next express next function
   */
  public addUserBank = asyncWrapper(async (req: IUserRequest, res: Response, next: NextFunction) => {
    const { accountName, accountNumber, bankName } = req.body;

    if (!accountName) return next(new ValidationError('accountName field is required', 'accountName'));
    if (!accountNumber) return next(new ValidationError('accountNumber field is required', 'accountNumber'));
    if (!bankName) return next(new ValidationError('bankName field is required', 'bankName'));

    req.user?.billings?.banks.forEach(bank => (bank.isDefault = false));
    await req.user?.save();

    const user = await this.userService.update(req.user?._id, {
      $push: { 'billings.banks': { accountName, accountNumber, bankName, isDefault: true } },
    });
    res.status(200).json(httpResponse('user bank added successfully', { user }));
  });

  /**
   * @method createStripeCustomer
   * @param req request Object
   * @param res response object
   * @param next express next function
   */
  public createPaystackCustomer = asyncWrapper(async (req: IUserRequest, res: Response, next: NextFunction) => {
    const { firstname, lastname, email, _id, customerPaystackId } = req.user as IUser;

    const customer = await this.paymentService.createCustomer({ firstname, lastname, email, _id, customerPaystackId });
    const user = await this.userService.get(req.user?._id);
    res.status(200).json(httpResponse('stripe customer created successfully', { user, customer }));
  });


 

  /**
   * @method getUsers
   * @param req request Object
   * @param res response object
   * @param next express next function
   */
  public getUsers = asyncWrapper(async (req: Request, res: Response, nex: NextFunction) => {
    const filter = {};
    const users = await this.userService.getAll(filter);
    res.status(200).json(httpResponse('users fetch successfully', { total: users.length, users }));
  });

  /**
   * @method getUser
   * @param req request Object
   * @param res response object
   * @param next express next function
   */
  public getUser = asyncWrapper(async (req: IUserRequest, res: Response, nex: NextFunction) => {
    res.status(200).json(httpResponse('user fetch successfully', { user: req.foundUser }));
  });

  /**
   * @method createUser
   * @param req request Object
   * @param res response object
   * @param next express next function
   */
  public createUser = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const user = await this.userService.create(req.body);
    res.status(200).json(httpResponse('user create successfully', { user }));
  });

  /**
   * @method updateUser
   * @param req request Object
   * @param res response object
   * @param next express next function
   */
  public updateUser = asyncWrapper(async (req: IUserRequest, res: Response, next: NextFunction) => {
    if (req.file && req.file.fieldname === 'photo') {
      let previousPhotoUrl = '';
      if (req.foundUser?.photo) previousPhotoUrl = req.foundUser.photo;

      /** Upload new photo to AWS S3 */
      const { Location } = await this.fileService.uploadSingle(req.file, 'users');
      await this.fileService.unlinkFile(req.file.path);
      req.body.photo = Location;

      /** Delete previous photo from AWS S3 */
      const key = this.fileService.getObjectKey(previousPhotoUrl);
      await this.fileService.deleteFile(key);
    }

    const user = await this.userService.update(req.foundUser?._id, req.body);
    res.status(200).json(httpResponse('user updated successfully', { user }));
  });

 
 


  /**
   * @method deleteUser
   * @param req request Object
   * @param res response object
   * @param next express next function
   */
  public deleteUser = asyncWrapper(async (req: IUserRequest, res: Response, next: NextFunction) => {
    /** If user has photo, delete it from AWS S3 */
    if (req.foundUser?.photo) {
      const key = this.fileService.getObjectKey(req.foundUser.photo);
      await this.fileService.deleteFile(key);
    }

    await this.userService.delete(req.foundUser?._id);
    res.status(200).json(httpResponse('user deleted successfully', null));
  });

  /**
   * @method foundUser
   * @param req request Object
   * @param res response object
   * @param next express next function
   */
  public foundUser = async (req: IUserRequest, res: Response, next: NextFunction, val: Types.ObjectId) => {
    /** NB: use 'isObjectIdOrHexString' instead of 'isValidObjectId' for better validation */
    if (!isObjectIdOrHexString(val)) {
      const errorMessage = `user id: ${val} is invalid`;
      const possibleSolution = 'provide a valid user id and try again.';
      return next(new ValidationError(errorMessage, 'id', possibleSolution));
    }

    const user = await this.userService.findOne({ _id: val });

    if (!user) {
      const errorMessage = `user with id: ${val} not found`;
      const possibleSolution = 'provide a valid user id and try again.';
      return next(new ValidationError(errorMessage, 'id', possibleSolution));
    }

    req.foundUser = user;
    next();
  };

 
}

export const userController = new UserController(
  new UserService(),
  new FileService(),
);
