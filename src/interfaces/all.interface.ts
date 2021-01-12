import {
  Request,
  Response
} from 'express';
import { Server } from 'socket.io';
import { IUserModel } from '../model-types';

export interface PlainObject {
  [key: string]: any;
}

export interface IRequest extends Request {
  io: Server;
  session: {
    [key: string]: any;
    id?: string;
    you?: IUser;
    youModel?: IUserModel;
  };
  device?: { [key: string]: any; };
}

export interface IResponse extends Response {}

export interface ICommon {
  id:                      number;
  date_created:            string;
  created_at:              string;
  updated_at:              string;
  deleted_at:              string;
  uuid:                    string;
}

export interface IUser extends ICommon {
  firstname:                   string;
  middlename:                  string;
  lastname:                    string;
  username:                    string;
  email:                       string;
  paypal:                      string;
  password?:                   string;
  phone:                       string;
  bio:                         string;
  headline:                    string;
  tags:                        string;
  icon_link:                   string;
  icon_id:                     string;
  photo_id_link:               string;
  photo_id_id:                 string;
  wallpaper_link:              string;
  wallpaper_id:                string;
  location:                    string;
  location_id:                 string;
  location_json:               string;
  zipcode:                     string;
  city:                        string;
  state:                       string;
  county:                      string;
  country:                     string;
  lat:                         number;
  lng:                         number;
  public:                      boolean;
  online:                      boolean;
  premium:                     boolean;
  certified:                   boolean;
  entrepreneur_interests:      string;
  investor_interest:           boolean;
  investor_interests:          string;
  partner_interest:            boolean;
  partner_interests:           string;
  is_author:                   boolean;
  author_expertise:            string;
  is_coach:                    boolean;
  coach_expertise:             string;
  email_verified:              boolean;
  phone_verified:              boolean;
  can_message:                 boolean;
  can_converse:                boolean;
  notifications_last_opened:   string;
}

export interface IResetPasswordRequest extends ICommon {
  user_id:                 number;
  completed:               boolean;
  unique_value:            string;
}

export interface INotification extends ICommon {
  from_id:                 number;
  to_id:                   number;
  action:                  string;
  target_type:             string;
  target_id:               number;
  message:                 string;
  link:                    string;
  read:                    boolean;
  image_link:              string;
  image_id:                string;
}

export interface IClique extends ICommon {
  creator_id:          number;
  title:               string;
  summary:             string;
  tags:                string;
  icon_link:           string;
  icon_id:             string;
  visibility:          string;
}

export interface IResource extends ICommon {
  owner_id:            number;
  resource_type:       string;
  tags:                string;
  title:               string;
  link:                string;
  icon_link:           string;
  icon_id:             string;
  description:         string;
  visibility:          string;
}

export interface IPhoto extends ICommon {
  owner_id:            number;
  caption:             string;
  photo_link:          string;
  photo_id:            string;
  is_explicit:         boolean;
  is_private:          boolean;
}

export interface IVideo extends ICommon {
  owner_id:            number;
  caption:             string;
  video_link:          string;
  video_id:            string;
  is_explicit:         boolean;
  is_private:          boolean;
}

export interface IAudio extends ICommon {
  owner_id:            number;
  caption:             string;
  audio_link:          string;
  audio_id:            string;
  is_explicit:         boolean;
  is_private:          boolean;
}

export interface IPost extends ICommon {
  owner_id:            number;
  title:               string;
  body:                string;
  tags:                string;
  is_explicit:         boolean;
  is_private:          boolean;
  visibility:          string;
  last_edited:         string;
}
export interface IPostViewer extends ICommon {
  owner_id:            number;
  user_id:             number;
  post_id:             number;
}
export interface IPostReaction extends ICommon {
  owner_id:            number;
  post_id:             number;
  reaction_id:         number;
  reaction:            string;
}

export interface IPostComment extends ICommon {
  owner_id:            number;
  post_id:             number;
  body:                string;
  last_edited:         string;
}
export interface IPostCommentReaction extends ICommon {
  owner_id:            number;
  comment_id:          number;
  reaction_id:         number;
  reaction:            string;
}

export interface IPostCommentReply extends ICommon {
  owner_id:            number;
  comment_id:          number;
  body:                string;
  last_edited:         string;
}
export interface IPostCommentReplyReaction extends ICommon {
  owner_id:            number;
  reply_id:            number;
  reaction_id:         number;
  reaction:            string;
}

export interface IContentSubscription extends ICommon {
  user_id:                 number;
  subscribes_to_id:        string;
  content_type:            string;
}

export interface IToken extends ICommon {
  user_id:                 number;
  device:                  string;
  token:                   string;
  ip_address:              string;
  user_agent:              string;
  date_created:            string;
  date_last_used:          string;
}
