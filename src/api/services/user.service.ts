import { User } from '../models';
import { IUser } from '../interfaces';
import { compareHash, hashData, signToken, ValidationError } from '../utils';

/** User Service class */
export class UserService {
  /** @private */
  private readonly _user = User;

  /**
   * @method create
   * @param data user data
   * @return {Promise} IUser | Error
   */
  public async create({
    firstname,
    lastname,
    email,
    password,
    type,
    phone,
    isVerified = false,
  }: Partial<IUser>): Promise<IUser> {
    const user = await this._user.create({
      firstname, lastname, email, password, type,
      phone, isVerified
    });
    return user;
  }

  /**
   * @method getAll
   * @param filter query filter
   * @return {Promise} IUser | []
   */
  public async getAll(filter = {}): Promise<IUser[] | []> {
    const users = await this._user.find(filter);
    return users;
  }

  /**
   * @method get
   * @param _id user _id
   * @return {Promise} IUser | null
   */
  public async get(_id: IUser['_id']): Promise<IUser | null> {
    const user = await this._user.findById(_id);
    return user;
  }

  /**
   * @method update
   * @param _id user _id
   * @param data user new data
   * @return {Promise} IUser | null
   */
  public async update(_id: IUser['_id'], data: any): Promise<IUser | null> {
    const user = await this._user.findByIdAndUpdate(_id, data, { new: true });
    return user;
  }

  /**
   * @method delete
   * @param _id user _id
   * @return {Promise} boolean
   */
  public async delete(_id: IUser['_id']): Promise<boolean> {
    await this._user.findByIdAndDelete(_id);
    return true;
  }

  /**
   * @method findOne
   * @param filter query filter
   * @return {Promise} User || null
   */
  public async findOne(filter: any): Promise<IUser | null> {
    const user = await this._user.findOne(filter).select('+password +verificationToken +tokenExpires');
    return user;
  }

  /**
   * @method updatePassword
   * @param _id user _id
   * @param data user new data
   * @return {Promise} IUser |
   */
  public async updatePassword(
    _id: IUser['_id'],
    { currentPassword, password }: Partial<IUser>
  ): Promise<{ user: IUser | null; token: string }> {
    if (!currentPassword) throw new ValidationError('currentPassword field is required', 'currentPassword');
    if (!password) throw new ValidationError('password field is required', 'password');

    const user = await this._user.findById(_id).select('+password');
    if (user && !(await compareHash(currentPassword, user.password))) {
      const errorMessage = 'the current password provided is wrong';
      const possibleSolution = 'provide the correct current password and try again';
      throw new ValidationError(errorMessage, 'currentPassword', possibleSolution);
    }

    /** Update password and save user */
    user!.password = await hashData(password);
    await user?.save();

    /** Sign new token for user */
    const token = signToken(<IUser>user);
    return { user, token };
  }
}
