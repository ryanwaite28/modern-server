import { PlainObject } from "../../../apps/_common/interfaces/common.interface";
import { IStoreImage } from "../../../cloudinary-manager";


export interface ICreateUpdateFavor {
  owner_id: number,
  
  title: string,
  description: string,
  category?: string,
  item_image_link: string,
  item_image_id: string,
  fulfilled_image_link?: string,
  fulfilled_image_id?: string,
  featured?: boolean,
  
  location: string,
  address: string,
  street: string,
  city: string,
  state: string,
  zipcode: number,
  country: string,
  place_id: string,
  lat: number,
  lng: number,

  payout_per_helper: number,
  auto_assign_lead_helper?: boolean,
  helpers_wanted: number,
  payment_session_id: string,
  date_needed?: Date | string,
  time_needed?: string,

  uploadedPhotos?: { fileInfo: PlainObject; results: IStoreImage }[];
}

export interface ICreateFavorUpdateProps {
  user_id: number;
  favor_id: number;

  icon_link?: string;
  icon_id?: string;
  message: string;
  helper_lat: number;
  helper_lng: number;
}

export interface IFavor {
  id:                        number,
  owner_id:                  number,

  title:                     string,
  description:               string,

  category:                  string,
  featured:                  string, // bronze/silver/gold
  item_image_link:           string,
  item_image_id:             string,
  
  location:                  string,
  address:                   string,
  street:                    string,
  city:                      string,
  state:                     string,
  zipcode:                   number,
  country:                   string,
  place_id:                  string,
  lat:                       number,
  lng:                       number,
  
  payout_per_helper:         number,
  helpers_wanted:            number,
  payment_session_id:        string,
  payment_intent_id:         string,
  auto_assign_lead_helper:   boolean,

  // started:                   boolean,
  // fulfilled:                 boolean,

  datetime_started:         string,
  datetime_fulfilled:       string,
  cancel:                      boolean,

  fulfilled_image_link:      string,
  fulfilled_image_id:        string,
  date_needed:               string,

  date_created:              string,
  uuid:                      string,
}

export interface IFavorCancellation {
  id:                  number,
  favor_id:            number,
  reason:              string,
  date_created:        string,
  uuid:                string,
}

export interface IFavorCategorie {
  id:                  number,
  name:                string,
  date_created:        string,
  uuid:                string,
}

export interface IFavorAssignedCategorie {
  id:                  number,
  favor_id:            number,
  category_id:         number,
  date_created:        string,
  uuid:                string,
}

export interface IFavorPhoto {
  id:                  number,
  favor_id:            number,
  photo_id:            number,
  date_created:        string,
  uuid:                string,
}

export interface IFavorVideo {
  id:                  number,
  favor_id:            number,
  video_id:            number,
  date_created:        string,
  uuid:                string,
}

export interface IFavorTransaction {
  id:                 number,
  favor_id:          number,
  action_type:        string,
  action_id:          string,
  status:             string,
  
  date_created:       string,
  uuid:               string,
}

export interface IFavorMessage {
  id:                 number,
  favor_id:           number,
  user_id:            number,
  body:               string,
  opened:             boolean,
  date_created:       string,
  uuid:               string,
}

export interface IFavorUpdates {
  id:                number,
  favor_id:          number,
  user_id:           number,
  message:           string,
  helper_lat:        number,
  helper_lng:        number,
  icon_link:         string,
  icon_id:           string,
  date_created:      string,
  uuid:              string,
}



export interface IFavorHelper {
  id:              number,
  user_id:         number,
  favor_id:        number,
  date_created:    string,
  is_lead:                   boolean,
  helped:                    boolean,
  paid:                      boolean,
  payment_session_id:        string,
  payment_intent_id:         string,
  uuid:                      string,
}

export interface IFavorRequest {
  id:              number,
  user_id:         number,
  favor_id:        number,
  date_created:    string,
  message:         string,
  uuid:            string,
}

export interface IFavorDispute {
  id:              number,
  creator_id:      number,
  user_id:         number,
  favor_id:        number,
  date_created:    string,
  title:           string,
  status:          string,
  uuid:            string,
}

export interface IFavorDisputeLog {
  id:              number,
  creator_id:      number,
  user_id:         number,
  favor_id:        number,
  body:            string,
  date_created:    string,
  uuid:            string,
}