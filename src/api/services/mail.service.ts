import { createTransport } from 'nodemailer';
import path from 'path';
import hbs from 'nodemailer-express-handlebars';
import { IUser } from '../interfaces';
import { MAIL_OPTIONS, MAIL_FROM, APP_NAME, SUPPORT_EMAIL, CLIENT_URL } from '../../config';
import { capitalizeFirstChar } from '../utils';
import { UserService } from './index';

export interface IMail {
  email?: string;
  text?: string;
  html?: string;
  subject?: string;
}

const viewPath = path.resolve(__dirname, '../../views/emails');
const partialsPath = path.resolve(__dirname, '../../views/partials');

export  class MailService {
  userService = new UserService()
  /** @private transport */
  private readonly transport = createTransport(MAIL_OPTIONS);
  

  constructor() {
    this.transport.use(
      'compile',
      hbs({
        viewEngine: {
          extname: '.hbs',
          layoutsDir: viewPath,
          defaultLayout: false,
          partialsDir: partialsPath,
        },
        viewPath: viewPath,
        extName: '.hbs',
      })
    );
  }

  public async registrationMail({ email, firstname }: IUser, code: string) {
    return this.transport.sendMail({
      from: `${APP_NAME} <${MAIL_FROM}>`,
      to: email,
      subject: 'Registration Mail',
      // @ts-ignore
      template: 'register',
      context: { code, firstname: capitalizeFirstChar(firstname), expires: 30, APP_NAME, SUPPORT_EMAIL },
      priority: 'high',
    });
  }

  public async welcomeMail({ email, firstname }: IUser) {
    return this.transport.sendMail({
      from: `${APP_NAME} <${MAIL_FROM}>`,
      to: email,
      subject: 'Welcome Mail',
      // @ts-ignore
      template: 'welcome',
      context: { firstname: capitalizeFirstChar(firstname), APP_NAME, SUPPORT_EMAIL },
      priority: 'high',
    });
  }

  public async verificationMail({ email, firstname }: IUser, code: string) {
    return this.transport.sendMail({
      from: `${APP_NAME} <${MAIL_FROM}>`,
      to: email,
      subject: 'Verification Mail',
      // @ts-ignore
      template: 'verification',
      context: { code, firstname: capitalizeFirstChar(firstname), expires: 30, APP_NAME, SUPPORT_EMAIL },
      priority: 'high',
    });
  }

  public async passwordResetMail({ email, firstname }: IUser, code: string) {
    return this.transport.sendMail({
      from: `${APP_NAME} <${MAIL_FROM}>`,
      to: email,
      subject: 'Password Reset',
      // @ts-ignore
      template: 'password-reset',
      context: { code, firstname: capitalizeFirstChar(firstname), expires: 30, APP_NAME, SUPPORT_EMAIL },
      priority: 'high',
    });
  }

 
}

// export const mailService = new MailService();
