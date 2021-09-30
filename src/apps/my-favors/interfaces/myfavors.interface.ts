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

  uploadedPhotos?: { fileInfo: PlainObject; results: IStoreImage }[];
}

export interface ICreateFavorUpdateProps {
  user_id: number;
  delivery_id: number;

  icon_link?: string;
  icon_id?: string;
  message: string;
  helper_lat: number;
  helper_lng: number;
}