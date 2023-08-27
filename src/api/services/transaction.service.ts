import { Transaction } from '../models';
import { ITransaction } from '../interfaces';

export class TransactionService {
  /**
   * @method create
   * @param transactionData
   */
  public async create(transactionData: Partial<ITransaction>) {
    const transaction = await Transaction.create(transactionData);
    return transaction;
  }

  /**
   * @method get
   * @param _id
   */
  public async get(_id: ITransaction['_id']) {
    const transaction = await Transaction.findById(_id);
    return transaction;
  }

  /**
   * @method getAll
   * @param filter
   */
  public async getAll(filter: any) {
    const transactions = await Transaction.find(filter);
    return transactions;
  }

  /**
   * @method update
   * @param _id
   * @param transactionData
   */
  public async update(_id: ITransaction['_id'], transactionData: Partial<ITransaction>) {
    const transaction = await Transaction.findByIdAndUpdate(_id, transactionData, { new: true });
    return transaction;
  }

  /**
   * @method delete
   * @param _id
   */
  public async delete(_id: ITransaction['_id']) {
    await Transaction.findByIdAndDelete(_id);
    return true;
  }
}
