import {
  Request,
  Response
} from 'express';
import { Server } from 'socket.io';
import { IUserModel } from '../models/common.model-types';
import { SocketsService } from '../services/sockets.service';
import socket_io from 'socket.io';
import { ServiceMethodAsyncResults } from '../types/common.types';
import { Optional } from 'sequelize/types';

export interface PlainObject<T = any> {
  [key: string]: T;
}

export interface IRequest extends Request {
  io: Server;
  socketsService: SocketsService;
  session: {
    [key: string]: any;
    id?: string,
    you?: IUser;
    youModel?: IUserModel;
  };
  device?: { [key: string]: any; };
}

export interface IResponse extends Response {}

export interface ISocketEventsHandler {
  handleNewSocket(io: socket_io.Server, socket: socket_io.Socket): void;
}

export interface ICommonModel {
  id:                      number,
  date_created:            string,
  uuid:                    string,
  created_at:              string,
  updated_at:              string,
  deleted_at:              string,
}

export interface IUser extends ICommonModel {
  gender:                      number,
  firstname:                   string,
  middlename:                  string,
  lastname:                    string,
  username:                    string,
  displayname:                 string,
  email:                       string,
  password?:                   string,
  paypal:                      string,
  paypal_verified:             boolean,
  stripe_account_id:           string,
  stripe_account_verified:     boolean,
  phone:                       string,
  headline:                    string,
  bio:                         string,
  tags:                        string,
  icon_link:                   string,
  icon_id:                     string,
  photo_id_link:               string,
  photo_id_id:                 string,
  wallpaper_link:              string,
  wallpaper_id:                string,
  location:                    string,
  location_id:                 string,
  location_json:               string,
  zipcode:                     string,
  city:                        string,
  state:                       string,
  county:                      string,
  country:                     string,
  lat:                         number,
  lng:                         number,
  public:                      boolean,
  online:                      boolean,
  premium:                     boolean,
  certified:                   boolean,
  person_verified:             boolean,
  email_verified:              boolean,
  phone_verified:              boolean,
  can_message:                 boolean,
  can_converse:                boolean,
  notifications_last_opened:   string,
}
export interface IUserCreation extends Optional<IUser, 'middlename'> {};

export interface IUserPaymentIntent extends ICommonModel {
  user_id:                             number,
  payment_intent_id:                   string,
  payment_intent_event:                string,
  micro_app:                           string,
  target_type:                         string,
  target_id:                           number,
  status:                              string,
}

export interface IUserPremiumSubscription extends ICommonModel {
  user_id:              number,
  billing_id:           string,
  product_id:           string,
  plan_id:              string,
  active:               boolean,
}

export interface IUserType extends ICommonModel {
  user_id:              number,
  type:                 string,
}

export interface IUserField extends ICommonModel {
  user_id:              number,
  fieldname:            string,
  fieldtype:            string,
  fieldvalue:           string,
}

export interface IUsersEmailVerification extends ICommonModel {
  user_id:                 number,
  email:                   string,
  verification_code:       string,
  verified:                boolean,
}

export interface IUsersPhoneVerification extends ICommonModel {
  user_id:                 number,
  request_id:              string,
  phone:                   string,
  verification_code:       string,
}

export interface IUserPageView extends ICommonModel {
  user_id:             number,
  seen_id:             number,
}

export interface IUserRating extends ICommonModel {
  user_id:             number,
  writer_id:           number,
  rating:              number,
  title:               string,
  summary:             string,
}

export interface IUserReaction extends ICommonModel {
  owner_id:            number,
  user_id:             number,
  reaction_id:         number,
  reaction:            string,
}

export interface IResetPasswordRequest extends ICommonModel {
  user_id:             number,
  completed:           boolean,
  unique_value:        string,
}

export interface IContentSubscription extends ICommonModel {
  user_id:                    number,
  target_type:                string,
  target_id:                  number,
  target_action:              string,
  target_action_info:         string,
  frequency:                  string,
}

export interface IFollow extends ICommonModel {
  user_id:             number,
  follows_id:          number,
}

export interface IFollowRequest extends ICommonModel {
  user_id:             number,
  follows_id:          number,
}

export interface IBlocking extends ICommonModel {
  user_id:             number,
  blocks_id:           number,
}

export interface IAccountReported extends ICommonModel {
  user_id:             number,
  reporting_id:        number,
  issue_type:          string,
  details:             string,
}

export interface ISiteFeedback extends ICommonModel {
  user_id:             number,
  rating:              number,
  title:               string,
  summary:             string,
}

export interface IResetPasswordRequest extends ICommonModel {
  user_id:                 number,
  completed:               boolean,
  unique_value:            string,
}

export interface INotification extends ICommonModel {
  from_id:                 number,
  to_id:                   number,
  event:                   string,
  micro_app:               string,
  target_type:             string,
  target_id:               number,
  read:                    boolean,
  image_link:              string,
  image_id:                string,
  
  message?:                string,
  link?:                   string,
  [key:string]:            any;
}

export interface INotice extends ICommonModel {
  owner_id:            number,

  parent_id:           number,
  quote_id:            number,
  share_id:            number,

  body:                string,
  tags:                string,
  is_explicit:         boolean,
  is_private:          boolean,
  visibility:          string,
  last_edited:         string,
  date_created:        string,
  uuid:                string,
}

export interface IClique extends ICommonModel {
  creator_id:          number,
  title:               string,
  summary:             string,
  tags:                string,
  icon_link:           string,
  icon_id:             string,
  visibility:          string,
}

export interface IResource extends ICommonModel {
  owner_id:            number,
  resource_type:       string,
  tags:                string,
  title:               string,
  link:                string,
  icon_link:           string,
  icon_id:             string,
  description:         string,
  visibility:          string,
}

export interface IPhoto extends ICommonModel {
  owner_id:            number,
  caption:             string,
  photo_link:          string,
  photo_id:            string,
  is_explicit:         boolean,
  is_private:          boolean,
}

export interface IVideo extends ICommonModel {
  owner_id:            number,
  caption:             string,
  video_link:          string,
  video_id:            string,
  is_explicit:         boolean,
  is_private:          boolean,
}

export interface IRecipe extends ICommonModel {
  creator_id:          number,
  title:               string,
  description:         string,
  tags:                string,
  image_link:          string,
  youtube_link:        string,
  image_id:            string,
  visibility:          string,
}

export interface IAudio extends ICommonModel {
  owner_id:            number,
  caption:             string,
  audio_link:          string,
  audio_id:            string,
  is_explicit:         boolean,
  is_private:          boolean,
}

export interface IPost extends ICommonModel {
  owner_id:            number,
  title:               string,
  body:                string,
  tags:                string,
  is_explicit:         boolean,
  is_private:          boolean,
  visibility:          string,
  last_edited:         string,
}
export interface IPostViewer extends ICommonModel {
  owner_id:            number,
  user_id:             number,
  post_id:             number,
}
export interface IPostReaction extends ICommonModel {
  owner_id:            number,
  post_id:             number,
  reaction_id:         number,
  reaction:            string,
}

export interface IPostComment extends ICommonModel {
  owner_id:            number,
  post_id:             number,
  body:                string,
  last_edited:         string,
}
export interface IPostCommentReaction extends ICommonModel {
  owner_id:            number,
  comment_id:          number,
  reaction_id:         number,
  reaction:            string,
}

export interface IPostCommentReply extends ICommonModel {
  owner_id:            number,
  comment_id:          number,
  body:                string,
  last_edited:         string,
}
export interface IPostCommentReplyReaction extends ICommonModel {
  owner_id:            number,
  reply_id:            number,
  reaction_id:         number,
  reaction:            string,
}

export interface IContentSubscription extends ICommonModel {
  user_id:                 number,
  subscribes_to_id:        string,
  content_type:            string,
}

export interface IToken extends ICommonModel {
  user_id:                 number,
  device:                  string,
  token:                   string,
  ip_address:              string,
  user_agent:              string,
  date_created:            string,
  date_last_used:          string,
}

/**
 * @description 
 * Interface for validating data from requests
 */
export interface IModelValidator {
  field: string,
  name: string,
  validator: (arg: any) => boolean,
  errorMessage?: string,
}


/**
 * @description 
 * 
 */
 export type IAppService = {

  [key:string]: ServiceMethodAsyncResults;
}