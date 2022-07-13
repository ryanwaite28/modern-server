import { ICommonModel } from '../../_common/interfaces/common.interface';
import { ISafestarUser } from './safestar.interface';


export interface IPulse extends ICommonModel {
  owner_id: number,
  code: string,
  lat: number,
  lng: number,
  sent_in_error: boolean,
  uuid: string,

  owner?: ISafestarUser,
}

export interface IPulseLocationWatch extends ICommonModel {
  owner_id: number,
  lat: number,
  lng: number,
  radius: number,
  uuid: string,

  owner?: ISafestarUser,
  messages: IPulseMessage[];
}

export interface IPulseMessage extends ICommonModel {
  owner_id: number,
  pulse_id: number,
  body: string,
  opened: boolean,
  uuid: string,

  owner?: ISafestarUser,
}

export interface IPhotoPulse extends ICommonModel {
  owner_id: number,
  code: string,
  photo_link: string,
  photo_id: string,
  lat: number,
  lng: number,
  uuid: string,

  owner?: ISafestarUser,
  messages: IPhotoPulseMessage[];
}

export interface IPhotoPulseMessage extends ICommonModel {
  owner_id: number,
  pulse_id: number,
  body: string,
  opened: boolean,
  uuid: string,

  owner?: ISafestarUser,
}

export interface IAudioPulse extends ICommonModel {
  owner_id: number,
  code: string,
  s3object_bucket: string,
  s3object_key: string,
  lat: number,
  lng: number,
  uuid: string,

  owner?: ISafestarUser,
}

export interface IVideoPulse extends ICommonModel {
  owner_id: number,
  code: string,
  s3object_bucket: string,
  s3object_key: string,
  lat: number,
  lng: number,
  uuid: string,

  owner?: ISafestarUser,
}
