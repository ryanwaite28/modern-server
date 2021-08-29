import { NextFunction, Request, Response } from 'express';
import { get_listing_by_id } from '../repos/listings.repo';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { IMyModel } from '../../_common/models/common.model-types';


export async function ListingExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const listing_id = parseInt(request.params.listing_id, 10);
  const listing_model = await get_listing_by_id(listing_id);
  if (!listing_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `Listing not found`
    });
  }
  response.locals.listing_model = listing_model;
  return next();
}

export async function IsListingOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const listing_model = <IMyModel> response.locals.listing_model;
  const isOwner: boolean = response.locals.you.id === listing_model.get('owner_id');
  if (!isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Not listing owner`
    });
  }
  return next();
}

export async function IsNotListingOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const listing_model = <IMyModel> response.locals.listing_model;
  const isOwner: boolean = response.locals.you.id === listing_model.get('owner_id');
  if (isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Is listing owner`
    });
  }
  return next();
}