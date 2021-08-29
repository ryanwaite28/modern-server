export interface ICreateDeliveryProps {
  owner_id: number;

  title: string;
  description: string;

  from_street: string;
  from_city: string;
  from_state: string;
  from_zipcode: number;

  to_street: string;
  to_city: string;
  to_state: string;
  to_zipcode: number;

  category: string;
  size: string;
  weight: string;
  auto_accept_anyone: boolean;
  urgent: boolean;
  payout: number;
  penalty: number;
}