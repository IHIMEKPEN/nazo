import { Review } from '../models';
import { IReview } from '../interfaces';
import { ValidationError } from '../utils';

/** Review Service class */

export class ReviewService {
  /**
   * @method create
   * @param reviewData IReview
   */
  public async create(reviewData: IReview) {
    const { user, station } = reviewData;
    const foundReview = await Review.findOne({ user, station });

    if (foundReview) throw new ValidationError('user already reviewed this station', 'station');

    const review = await Review.create(reviewData);
    return review;
  }

  /**
   * @method get
   * @param _id review id
   */
  public async get(_id: IReview['_id']) {
    const review = await Review.findById(_id);
    return review;
  }

  /**
   * @method getAll
   * @param filter query object
   */
  public async getAll(filter = {}) {
    const reviews = await Review.find(filter);
    return reviews;
  }

  /**
   * @method update
   * @param _id review id
   * @param data IReview
   */
  public async update(_id: IReview['_id'], data: IReview) {
    const { comment, rating } = data;
    const updatedReview = await Review.findByIdAndUpdate(_id, { comment, rating }, { new: true, runValidators: true });
    return updatedReview;
  }

  /**
   * @method delete
   * @param _id review id
   */
  public async delete(_id: IReview['_id']) {
    await Review.findByIdAndDelete(_id);
    return true;
  }
}
