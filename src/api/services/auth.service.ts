import { IUser } from '../interfaces';
import { UserService, MailService, PaymentService } from './index';
import {
  AppError,
  codeGenerator,
  compareHash,
  DuplicateKeyError,
  hashData,
  logger,
  signToken,
  ValidationError,
} from '../utils';

type CustomType = { token: string; user: IUser };

/** Authentication Service Class */
export class AuthService {
  private readonly mailService = new MailService();
  private readonly userService = new UserService();
  private readonly paymentService = new PaymentService();
  /**
   * @method register
   * @param userData new user's data
   * @return {Promise} token & IUser
   */
  public async register({ firstname, lastname, email, password, type, phone }: Partial<IUser>): Promise<CustomType> {
    if (!firstname) throw new ValidationError('firstname field is required', 'firstname', '', 'firstname-required');
    if (!lastname) throw new ValidationError('lastname field is required', 'lastname', '', 'lastname-required');
    if (!password) throw new ValidationError('password field is required', 'password', '', 'password-required');
    if (!email) throw new ValidationError('email address field is required', 'email', '', 'email-required');
    if (!type) throw new ValidationError('type address field is required', 'type', '', 'type-required');
    if (!phone) throw new ValidationError('phone address field is required', 'phone', '', 'phone-required');

    let user = await this.userService.findOne({ $and: [{ email }, { type }] });
    if (user) throw new DuplicateKeyError('', 'email', email);

    user = await this.userService.create({ firstname, lastname, email, password, type, phone });

    try {
      const code = codeGenerator();
      await this.mailService.registrationMail(user, code);

      user.verificationToken = await hashData(code);
      user.tokenExpires = Date.now() + 3000 * 60 * 20; // 30 mins
    } catch (error: any) {
      user.verificationToken = undefined;
      user.tokenExpires = undefined;

      logger.error(`${error.message}: failed to send mail to ${user.email}`);
    }

    await user.save();
    const token = signToken(user);

    return { token, user };
  }

  /**
   * @method login
   * @param userData userData
   * @return {Promise} token && users
   */
  public async login({ email, password, type }: Partial<IUser>): Promise<string> {
    if (!password) throw new ValidationError('password field is required', 'password', '', 'password-required');
    if (!email) throw new ValidationError('email address field is required', 'email', '', 'email-required');
    if (!type) throw new ValidationError('type address field is required', 'type', '', 'type-required');

    let user = await this.userService.findOne({ $and: [{ email }, { type }] });
    if (!user) {
      const error_message = `the email or password provided is incorrect`;
      const solution = 'try providing a valid email and password';
      throw new ValidationError(error_message, 'email', solution, 'user-not-found');
    }

    if (!user.isVerified) {
      const error_message = `email address not verified`;
      const solution = 'try verifying your email to login';
      throw new ValidationError(error_message, 'email', solution, 'email-unverified');
    }

    if (user && !(await compareHash(password, user.password))) {
      const error_message = `the email or password provided is incorrect`;
      const solution = 'try providing a valid email and password';
      throw new ValidationError(error_message, 'password', solution, 'password-incorrect');
    }

    const token = signToken(user);
    return token;
  }

  /**
   * @method verify
   * @param email user email
   * @param code verification code
   * @returns {Promise} token
   */
  async verify(email: IUser['email'], code: string, type: string): Promise<string> {
    if (!code) throw new ValidationError(`code field is required`, 'code');
    if (!email) throw new ValidationError(`email field is required`, 'email');
    if (!type) throw new ValidationError(`type field is required`, 'type');
    let user = await this.userService.findOne({ $and: [{ email }, { type }] });

    if (!user) {
      const error_message = `the user with email address '${email}' not recognized.`;
      const solution = `try using a registered email address.`;
      throw new ValidationError(error_message, 'email', solution, 'user-not-found');
    }

    if (user && user.isVerified) {
      const error_message = `the user with email address '${email}' already registered.`;
      const solution = `try to login with the registered email address.`;
      throw new ValidationError(error_message, 'email', solution, 'user-already-verified');
    }

    if (Date.now() > new Date(user.tokenExpires as number).getTime()) {
      const error_message = 'the code provided has expired';
      throw new ValidationError(error_message, 'code', 'try generating a new code.', 'code-expired');
    }

    if (!user.verificationToken || !(await compareHash(code, user.verificationToken))) {
      const error_message = 'the code provided is invalid.';
      const solution = 'try providing a valid verification code or request for another verification code.';
      throw new ValidationError(error_message, 'code', solution, 'code-invalid');
    }

    user.isVerified = true;
    user.emailVerifiedAt = Date.now();
    user.verificationToken = undefined;
    user.tokenExpires = undefined;

    await user.save();
    const token = signToken(user);

    /** Save user as customer on paystack */
    await this.paymentService.createCustomer(user);

    try {
      await this.mailService.welcomeMail(user);
    } catch (error: any) {
      logger.error(error);
    }

    return token;
  }

  /**
   * @method resendToken
   * @param email user email
   * @returns {Promise} IUser
   */
  async resendToken(email: IUser['email'], type: IUser['type']): Promise<IUser> {
    if (!email) {
      const error_message = `the email field is required`;
      const solution = `try providing the email field and try again.`;
      throw new ValidationError(error_message, 'email', solution, 'email-required');
    }
    if (!type) {
      const error_message = `the type field is required`;
      const solution = `try providing the type field and try again.`;
      throw new ValidationError(error_message, 'type', solution, 'type-required');
    }

    let user = await this.userService.findOne({ $and: [{ email }, { type }] });
    if (!user) {
      const error_message = `the user with the email address '${email}' not recognized`;
      const solution = `confirm that the email address is correct or try using a registered email address.`;
      throw new ValidationError(error_message, 'email', solution, 'user-not-found');
    }

    try {
      const code = codeGenerator();
      await this.mailService.verificationMail(user, code);

      user.verificationToken = await hashData(code); // hash code and store it
      user.tokenExpires = Date.now() + 3000 * 60 * 20; // 30 mins
    } catch (error: any) {
      user.verificationToken = undefined;
      user.tokenExpires = undefined;

      logger.error(error.message);
      throw new AppError('Server Error: error occurred while sending mail', 500);
    }
    await user.save();
    return user;
  }

  /**
   * @method passwordResetRequest
   * @param email user email
   * @returns {Promise} boolean
   */
  async passwordResetRequest(email: IUser['email']): Promise<boolean> {
    let user = await this.userService.findOne({ email });
    if (!user) {
      const error_message = 'the email address provided is invalid or not registered';
      const solution = 'try providing a registered email address';
      throw new ValidationError(error_message, 'email', solution, 'email-invalid');
    }

    try {
      const code = codeGenerator();
      await this.mailService.passwordResetMail(user, code);

      user.verificationToken = await hashData(code);
      user.tokenExpires = Date.now() + 1000 * 60 * 20; // 10 mins
    } catch (error: any) {
      user.verificationToken = undefined;
      user.tokenExpires = undefined;

      logger.error(error.message);
      throw new AppError('Server Error: error occurred while sending mail', 500);
    } finally {
      await user.save();
    }
    return true;
  }

  /**
   * @method passwordReset
   * @param userData user reset password object
   * @return {Promise} string
   */
  async passwordReset({ email, code, password }: Partial<IUser>): Promise<string> {
    if (!code) {
      const error_message = 'the code field is missing or does not have a value';
      throw new ValidationError(error_message, 'code', '', 'code-required');
    }
    if (!password) {
      const error_message = 'the password field is missing or does not have a value';
      throw new ValidationError(error_message, 'password', '', 'password-required');
    }
    if (!email) {
      const error_message = 'the email field is missing or does not have a value';
      throw new ValidationError(error_message, 'email', '', 'email-required');
    }

    const user = await this.userService.findOne({ email });
    if (!user) {
      const error_message = `the user with email address '${email}' not found`;
      const solution = `try providing a registered email for the 'email' field`;
      throw new ValidationError(error_message, 'email', solution);
    }
    if (!user.verificationToken || !(await compareHash(code, user.verificationToken))) {
      const error_message = 'invalid token provided or token expired';
      throw new ValidationError(error_message, 'code', 'try requesting a new code');
    }
    if (Date.now() > new Date(user.tokenExpires as number).getTime()) {
      const error_message = 'the verification code has expired';
      throw new ValidationError(error_message, 'code', 'try requesting a new code', 'code-expired');
    }

    user.password = await hashData(password);
    user.verificationToken = undefined;
    user.tokenExpires = undefined;
    const token = signToken(user);
    await user.save();

    return token;
  }
}
