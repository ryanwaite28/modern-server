export interface ICreateDeliveryProps {
  owner_id: number;

  title: string;
  description: string;

  item_image_link: string;
  item_image_id: string;

  from_location: string;
  from_address: string;
  from_street: string;
  from_city: string;
  from_state: string;
  from_zipcode: number;
  from_country: string;
  from_place_id: string;
  from_lat: number;
  from_lng: number;
  from_person: string;
  from_person_phone: string;
  from_person_email: string;
  from_person_id_required: boolean;
  from_person_sig_required: boolean;

  to_location: string;
  to_address: string;
  to_street: string;
  to_city: string;
  to_state: string;
  to_zipcode: number;
  to_country: string;
  to_place_id: string;
  to_lat: number;
  to_lng: number;
  to_person: string;
  to_person_phone: string;
  to_person_email: string;
  to_person_id_required: boolean;
  to_person_sig_required: boolean;

  category: string;
  size: string;
  weight: number;
  auto_accept_anyone: boolean;
  urgent: boolean;
  payout: number;
  penalty: number;
}

export interface ICreateDeliveryTrackingUpdateProps {
  user_id: number;
  delivery_id: number;

  icon_link?: string;
  icon_id?: string;
  message: string;
  carrier_lat: number;
  carrier_lng: number;
}