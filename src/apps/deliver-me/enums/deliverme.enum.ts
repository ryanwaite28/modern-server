export enum DELIVERME_EVENT_TYPES {
  CARRIER_ASSIGNED = 'CARRIER_ASSIGNED',
  CARRIER_UNASSIGNED = 'CARRIER_UNASSIGNED',
  CARRIER_MARKED_AS_PICKED_UP = 'CARRIER_MARKED_AS_PICKED_UP',
  CARRIER_MARKED_AS_DROPPED_OFF = 'CARRIER_MARKED_AS_DROPPED_OFF',
  DELIVERY_NEW_TRACKING_UPDATE = 'DELIVERY_NEW_TRACKING_UPDATE',
  DELIVERY_NEW_MESSAGE = 'DELIVERY_NEW_MESSAGE',
  DELIVERY_ADD_COMPLETED_PICTURE = 'DELIVERY_ADD_COMPLETED_PICTURE',
  DELIVERY_COMPLETED = 'DELIVERY_COMPLETED',
  DELIVERY_RETURNED = 'DELIVERY_RETURNED',

  TO_DELIVERY = 'TO_DELIVERY',
}

export enum DELIVERME_NOTIFICATION_TARGET_TYPES {
  DELIVERY = 'DELIVERY',
  DELIVERY_TRACKING_UPDATE = 'DELIVERY_TRACKING_UPDATE',
}

export enum DELIVERME_DELIVERY_TRANSACTION_TYPES {
  TRANSACTION = 'TRANSACTION',
  CHARGE = 'CHARGE',
  REFUND = 'REFUND',
  PAID = 'PAID',
  TRANSFER = 'TRANSFER',
}

export enum DELIVERME_DELIVERY_TRANSACTION_STATUS {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED',
  DECLINED = 'DECLINED',
}