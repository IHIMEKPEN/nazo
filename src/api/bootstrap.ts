import express, { Request, Response, NextFunction, Express } from 'express';
import cors from 'cors';
import { NotFoundError } from './utils';
import { errorMiddleware } from './middlewares';
import * as route from './routes';
import cookieParser from "cookie-parser";
import { APP_NAME } from "../config"
/**
 * @description Class App
 */
class App {
  constructor(private readonly app: Express) { }

  /**
   * @method start
   * @description bootstrap the application routes
   */
  public start() {
    /** Header/BodyParser Pre-middlewares */
    this.app.use(cors());
    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    /** Test API */
    this.app.get('/', (req: Request, res: Response, next: NextFunction) => {
      res.status(200).json({
        success: true,
        message: `😁 ${APP_NAME} API up and running...`,
      });
    });

    /** Route Handlers */
    this.app.use('/api/v1', route.authRoute);
    // this.app.use('/api/v1', route.userRoute);


    /** Error Handle Middleware */
    this.app.all('*', (req: Request, res: Response, next: NextFunction) => {
      const message = `Not Found: can not make a ${req.method} request to ${req.originalUrl}`;
      return next(new NotFoundError(message));
    });

    // Catch Errors
    this.app.use(errorMiddleware);

    return this.app;
  }
}

/** Bootstrap App Routes */
export const app = new App(express()).start();
