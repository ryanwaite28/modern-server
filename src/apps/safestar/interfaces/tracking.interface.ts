import { ICommonModel } from '../../_common/interfaces/common.interface';
import { ISafestarUser } from './safestar.interface';

export interface ITracking extends ICommonModel {
  user_id: number,
  tracking_id: number,
  uuid: string,

  user?: ISafestarUser,
  tracking?: ISafestarUser,
}

export interface ITrackingRequest extends ICommonModel {
  user_id: number,
  tracking_id: number,
  status: number, // null = pending, 1 = accepted, 0 = rejected
  uuid: string,

  user?: ISafestarUser,
  tracking?: ISafestarUser,
}