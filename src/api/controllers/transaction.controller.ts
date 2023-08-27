import { Request, Response, NextFunction } from 'express';
import { isObjectIdOrHexString } from 'mongoose';
import { TransactionService } from '../services';
import { ITransaction } from '../interfaces';
import { IUserRequest } from '../middlewares';
import { asyncWrapper, httpResponse, ValidationError } from '../utils';

export interface ITransactionBody extends Request, IUserRequest {
  transaction?: ITransaction;
}

/** Transaction Controller class */
class TransactionController {
  /** Constructor */
  constructor(private readonly transactionService: TransactionService) {}

  /**
   * @method getTransactions
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - express next function
   */
  getTransactions = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const filter = {};
    const transactions = await this.transactionService.getAll(filter);
    res.status(200).json(
      httpResponse('transactions fetched successfully', {
        total: transactions.length,
        transactions,
      })
    );
  });

  /**
   * @method createTransaction
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - express next function
   */
  createTransaction = asyncWrapper(async (req: ITransactionBody, res: Response, next: NextFunction) => {
    const transaction = await this.transactionService.create({ ...req.body, receiver: req.user?._id });
    res.status(200).json(httpResponse('transaction created successfully', { transaction }));
  });

  /**
   * @method getTransaction
   * @param {ITransactionBody} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - express next function
   */
  getTransaction = asyncWrapper(async (req: ITransactionBody, res: Response, next: NextFunction) => {
    const transaction = await this.transactionService.get(req.transaction?._id);
    res.status(200).json(httpResponse('transaction fetched successfully', { transaction }));
  });

  /**
   * @method getUserTransactions
   * @param {ITransactionBody} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - express next function
   */
  getUserTransactions = asyncWrapper(async (req: ITransactionBody, res: Response, next: NextFunction) => {
    const transactions = await this.transactionService.getAll({ user: req.user?._id });
    res.status(200).json(
      httpResponse('user transactions fetched successfully', {
        total: transactions.length,
        transactions,
      })
    );
  });

  /**
   * @method updateTransaction
   * @param {ITransactionBody} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - express next function
   */
  updateTransaction = asyncWrapper(async (req: ITransactionBody, res: Response, next: NextFunction) => {
    const transaction = await this.transactionService.update(req.transaction?._id, { ...req.body });
    res.status(200).json(httpResponse('transaction updated successfully', { transaction }));
  });

  /**
   * @method deleteTransaction
   * @param {ITransactionBody} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - express next function
   */
  deleteTransaction = asyncWrapper(async (req: ITransactionBody, res: Response, next: NextFunction) => {
    await this.transactionService.delete(req.transaction?._id);
    res.status(200).json(httpResponse('transaction deleted successfully', null));
  });

  /**
   * @method findTransaction
   * @param {ITransactionBody} req - express request object
   * @param {Response} res - express response object
   * @param {NextFunction} next - express next function
   */
  findTransaction = async (req: ITransactionBody, res: Response, next: NextFunction, val: ITransaction['_id']) => {
    if (!isObjectIdOrHexString(val)) return next(new ValidationError(`the transaction id: ${val} is invalid`, 'id'));

    const transaction = await this.transactionService.get(val);
    if (!transaction) return next(new ValidationError(`the transaction with id: ${val} was not found`, 'id'));

    req.transaction = transaction;
    next();
  };
}

/** Export TransactionController with TransactionService injected */
export const transactionController = new TransactionController(new TransactionService());
