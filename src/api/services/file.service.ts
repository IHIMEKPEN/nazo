import fs from 'fs';
import {  DeleteObjectCommand, PutObjectCommand, S3Client as S3 } from "@aws-sdk/client-s3";
import { promisify } from 'util';
import { ValidationError } from '../utils';
import { AWS_ACCESS_KEY, AWS_BUCKET, AWS_REGION, AWS_SECRET_ACCESS_KEY } from '../../config';

/** File Service class */
export  class FileService {
  private readonly s3: S3;

  constructor() {
    this.s3 = new S3({
      credentials: {
        accessKeyId: AWS_ACCESS_KEY as string,
        secretAccessKey: AWS_SECRET_ACCESS_KEY as string,
      },
      region: AWS_REGION,
    });
  }

  /**
   * @method uploadSingle
   * @param dir aws folder
   * @param file file to upload
   * @returns file uploaded
   */
  public async uploadSingle(file: Express.Multer.File, dir = 'uploads') {
    const { fieldname, size, path } = file;

    if (size > 5 * 1024 * 1024) {
      const errorMessage = 'file upload failed, file size is too large';
      const possibleSolution = 'check that the file size is less than 5mb';
      await this.unlinkFile(path);
      throw new ValidationError(errorMessage, fieldname, possibleSolution);
    }

    const fileStream = fs.createReadStream(path);
    const uploadOptions: PutObjectCommand = new PutObjectCommand({
      // ACL: 'public-read',
      Bucket: AWS_BUCKET as string,
      Body: fileStream as fs.ReadStream,
      Key: `${dir}/${file.filename}`,
      ContentType: 'image/jpeg',
    });
    await this.s3.send(uploadOptions)
    return {
      Location: `https://portsuploads.s3.us-east-2.amazonaws.com/${dir}/${file.filename}`}
    // return await this.s3.upload(uploadOptions).promise();
  }

  /**
   * @method uploadMultiple
   * @param dir aws folder
   * @param files files to upload
   * @returns file uploaded
   */
  public async uploadMultiple(files:any
  //    Express.Multer.File[] | {
  //   [fieldname: string]: Express.Multer.File[];
  // }
  , dir = 'uploads') {
    const uploadPromises: Promise<any>[] = [];
    files.forEach(async (file:any) => {
      const { fieldname, size, path } = file;
      if (size > 5 * 1024 * 1024) {
        const errorMessage = 'file upload failed, file size is too large';
        const possibleSolution = 'check that the file size is less than 5mb';
        await this.unlinkFile(path);
        throw new ValidationError(errorMessage, fieldname, possibleSolution);
      }
      const fileStream = fs.createReadStream(path);
      const uploadOptions: PutObjectCommand = new PutObjectCommand({
        Bucket: AWS_BUCKET as string,
        Body: fileStream,
        Key: `${dir}/${file.filename}`,
        ContentType: 'image/jpeg',
      });
      uploadPromises.push(this.s3.send(uploadOptions));
    });
    return await Promise.all(uploadPromises);
  }

  /**
   * @method unlinkFile
   * @param path file path to unlink/delete
   */
  public async unlinkFile(path: string) {
    await promisify(fs.unlink)(path);
  }

  /**
   * @method unlinkFiles
   * @param files files to unlink/delete
   */
  public async unlinkFiles(files: Express.Multer.File[] = []) {
    files.forEach(async (file) => await promisify(fs.unlink)(file.path));
  }

  /**
   * @method deleteFile
   * @param key s3 object key to delete
   */
  public async deleteFile(key: string) {
    const deleteOption: DeleteObjectCommand = new DeleteObjectCommand({
      Bucket: AWS_BUCKET as string,
      Key: key,
    });
    await this.s3.send(deleteOption)
  }

  /**
   * @method deleteFiles
   * @param keys s3 object key to delete
   */
  public async deleteFiles(keys: string[]) {
    keys.forEach(async (key) => {
      const deleteOption: DeleteObjectCommand = new DeleteObjectCommand({
        Bucket: AWS_BUCKET as string,
        Key: key,
      });
      await this.s3.send(deleteOption)})
    return true;
  }

  /**
   * @method getObjectKey
   * @param url s3 object url
   */
  public getObjectKey(url: string, separator = '/') {
    const parts = url.split(separator);
    return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
  }
}

