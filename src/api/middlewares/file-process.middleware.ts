import fs from 'fs';
import path from 'path';
import multer, { diskStorage } from 'multer';
import { ValidationError } from '../utils';
import { IUserRequest } from './auth.middleware';

class FileProcessMiddleware {
  private filter = (req: IUserRequest, file: Express.Multer.File, cb: any) => {
    const { fieldname, mimetype } = file;
    console.log(mimetype)
    if (!mimetype.startsWith('application')&&!mimetype.startsWith('image')) {
      const errorMessage = `file upload failed`;
      const possibleSolution = `try uploading a file type of image`;
      cb(new ValidationError(errorMessage, fieldname, possibleSolution), false);
    } else {
      cb(null, true);
    }
  };

  public upload = (resource: string) => {
    const storage = diskStorage({
      filename: (req: IUserRequest, file: Express.Multer.File, cb: any) => {
        const name = `${req.user?._id}-${resource}-${Date.now()}`;
        const ext = path.extname(file.originalname);
        cb(null, `${name + ext}`);
      },
      destination: (req, file, cb: any) => {
        /** Create upload folder if it doesn't exist */
        const uploadPath = path.resolve(`${__dirname}/../../uploads`);

        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
      },
    });
    return multer({ storage, fileFilter: this.filter });
  };
}

export const fileProcess = new FileProcessMiddleware();
