import {
  DURATION_1_DAY_FULL,
  DURATION_1_HOUR,
  DURATION_1_MINUTE,
  DURATION_1_SECOND,
  DURATION_1_WEEK
} from "../common.chamber";

export enum COMMON_DURATIONS {
  SECOND = DURATION_1_SECOND,
  MINUTE = DURATION_1_MINUTE,
  HOUR = DURATION_1_HOUR,
  DAY = DURATION_1_DAY_FULL,
  WEEK = DURATION_1_WEEK,
}

export enum COMMON_REACTIONS {
  LIKE = 1,
  DISLIKE,
  LOVE,
  CLAP,
  IDEA,
  CONFUSED,
  EXCITED,
  CARE,
  LAUGH,
  WOW,
  SAD,
  UPSET,
  FIRE,
  ONE_HUNDRED,
}

export enum COMMON_REACTION_TYPES {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE',
  LOVE = 'LOVE',
  CLAP = 'CLAP',
  IDEA = 'IDEA',
  CONFUSED = 'CONFUSED',
  EXCITED = 'EXCITED',
  CARE = 'CARE',
  LAUGH = 'LAUGH',
  WOW = 'WOW',
  SAD = 'SAD',
  UPSET = 'UPSET',
  FIRE = 'FIRE',
  ONE_HUNDRED = 'ONE_HUNDRED',
}

export enum COMMON_PREMIUM_SUBSCRIPTIONS {
  
}

export enum COMMON_NOTIFICATION_TARGET_TYPES {
  MESSAGING = 'MESSAGING',
  MESSAGE = 'MESSAGE',
  CONVERSATION = 'CONVERSATION',
}

export enum COMMON_SUBSCRIPTION_TARGET_ACTIONS {
  
}

export enum COMMON_SUBSCRIPTION_TARGET_ACTIONS_INFO {
  
}

export enum COMMON_SUBSCRIPTION_TARGET_FREQ {
  INSTANT = 'INSTANT',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum APP_NAMES {
  COMMON = 'COMMON',
  HOTSPOT = 'HOTSPOT',
}

export enum COMMON_EVENT_TYPES {

  // socket actions
  SOCKET_TRACK = 'SOCKET_TRACK',
  SOCKET_TO_USER_EVENT = 'SOCKET_TO_USER_EVENT',

  // events
  NEW_MESSAGE = 'NEW_MESSAGE',
  NEW_MESSAGING = 'NEW_MESSAGING',
  MESSAGING_EVENTS_SUBSCRIBED = 'MESSAGING_EVENTS_SUBSCRIBED',
  MESSAGING_EVENTS_UNSUBSCRIBED = 'MESSAGING_EVENTS_UNSUBSCRIBED',
  NEW_FOLLOWER = 'NEW_FOLLOWER',
  NEW_UNFOLLOWER = 'NEW_UNFOLLOWER',
  NEW_CONVERSATION = 'NEW_CONVERSATION',
  NEW_CONVERSATION_MESSAGE = 'NEW_CONVERSATION_MESSAGE',
  CONVERSATION_MEMBER_ADDED = 'CONVERSATION_MEMBER_ADDED',
  CONVERSATION_MEMBER_REMOVED = 'CONVERSATION_MEMBER_REMOVED',
  CONVERSATION_MEMBER_LEFT = 'CONVERSATION_MEMBER_LEFT',
  CONVERSATION_EVENTS_SUBSCRIBED = 'CONVERSATION_EVENTS_SUBSCRIBED',
  CONVERSATION_EVENTS_UNSUBSCRIBED = 'CONVERSATION_EVENTS_UNSUBSCRIBED',
  MESSAGE_TYPING = 'MESSAGE_TYPING',
  MESSAGE_TYPING_STOPPED = 'MESSAGE_TYPING_STOPPED',
  CONVERSATION_MESSAGE_TYPING = 'CONVERSATION_MESSAGE_TYPING',
  CONVERSATION_MESSAGE_TYPING_STOPPED = 'CONVERSATION_MESSAGE_TYPING_STOPPED',
  CONVERSATION_UPDATED = 'CONVERSATION_UPDATED',
  CONVERSATION_DELETED = 'CONVERSATION_DELETED',
  
}

export enum COMMON_CRON_JOB_TYPES {
  UNSUSCRIBE_PREMIUM = 'UNSUSCRIBE_PREMIUM',
}

export enum COMMON_USER_TYPES {
  
}

export enum MODERN_APP_NAMES {
  DELIVERME = 'DELIVERME',
}