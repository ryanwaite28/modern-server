import { create_rating_required_props, validateData } from "../common.chamber";
import { HttpStatusCode } from "../enums/http-codes.enum";
import { IModelRating } from "../interfaces/common.interface";
import { MyModelStatic } from "../models/common.model-types";
import { create_rating_via_model } from '../repos/ratings.repo';
import { ServiceMethodResults } from "../types/common.types";



export class CommonRatingsServices {
  static async create_rating(ratingsModel: MyModelStatic, data: any) {
    const createObj: any = {};
    const dataValidation = validateData({
      data, 
      validators: create_rating_required_props,
      mutateObj: createObj
    });
    if (dataValidation.error) {
      return dataValidation;
    }

    const new_rating = await create_rating_via_model(ratingsModel, createObj);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `New rating created`,
        data: new_rating
      }
    };
    return serviceMethodResults;
  }
}