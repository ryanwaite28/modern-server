import * as Sequelize from 'sequelize';

import {
  common_options,
  sequelizeInst as sequelize
} from './_def.model';

import {
  IUserModel,
  MyModelStaticGeneric,
  IResetPasswordRequestModel,
  INotificationModel,
  IContentSubscriptionModel,
  ITokenModel,
  IMyModel,
} from '../model-types';

export const Users = <MyModelStaticGeneric<IUserModel>> sequelize.define('users', {
  id:                                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  gender:                              { type: Sequelize.INTEGER, allowNull: true }, // Unknown/Other or 0, Male or 1, Female or 2
  firstname:                           { type: Sequelize.STRING, allowNull: false },
  lastname:                            { type: Sequelize.STRING, allowNull: false },
  username:                            { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  email:                               { type: Sequelize.STRING, allowNull: false },
  paypal:                              { type: Sequelize.STRING, allowNull: true },
  phone:                               { type: Sequelize.STRING, allowNull: true },
  password:                            { type: Sequelize.STRING, allowNull: false },
  headline:                            { type: Sequelize.STRING(75), allowNull: false, defaultValue: '' },
  bio:                                 { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  tags:                                { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  icon_link:                           { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  icon_id:                             { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  photo_id_link:                       { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  photo_id_id:                         { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  wallpaper_link:                      { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  wallpaper_id:                        { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  location:                            { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  location_id:                         { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  location_json:                       { type: Sequelize.JSON, allowNull: true, defaultValue: '' },
  zipcode:                             { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  city:                                { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  state:                               { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  county:                              { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  country:                             { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  lat:                                 { type: Sequelize.FLOAT, allowNull: true, defaultValue: 0 },
  lng:                                 { type: Sequelize.FLOAT, allowNull: true, defaultValue: 0 },
  public:                              { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
  online:                              { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  premium:                             { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  cerified:                            { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  email_verified:                      { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  phone_verified:                      { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  can_message:                         { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
  can_converse:                        { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
  notifications_last_opened:           { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  date_created:                        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                                { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, {
  ...common_options,
  indexes: [{ unique: true, fields: ['email', 'paypal', 'uuid']} ] 
});

export const UserPremiumSubscriptions = <MyModelStaticGeneric<IMyModel>> sequelize.define('user_premium_suscriptions', {
  id:                   { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:              { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  billing_id:           { type: Sequelize.STRING, allowNull: false },
  product_id:           { type: Sequelize.STRING, allowNull: false },
  plan_id:              { type: Sequelize.STRING, allowNull: false },
  date_created:         { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  active:               { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  uuid:                 { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const UserTypes = <MyModelStaticGeneric<IMyModel>> sequelize.define('user_types', {
  id:                   { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:              { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  type:                 { type: Sequelize.STRING, allowNull: false },
  uuid:                 { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const UserFields = <MyModelStaticGeneric<IMyModel>> sequelize.define('user_fields', {
  id:                   { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:              { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  fieldname:            { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  fieldtype:            { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  fieldvalue:           { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  uuid:                 { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const UsersEmailVerifications = <MyModelStaticGeneric<IMyModel>> sequelize.define('users_email_verifications', {
  id:                      { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:                 { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  email:                   { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  verification_code:       { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 },
  verified:                { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
}, common_options);

export const UsersPhoneVerifications = <MyModelStaticGeneric<IMyModel>> sequelize.define('users_phone_verifications', {
  id:                      { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:                 { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  request_id:              { type: Sequelize.STRING, unique: true, allowNull: true },
  phone:                   { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  verification_code:       { type: Sequelize.STRING, allowNull: false },
}, common_options);

export const UserPageViews = <MyModelStaticGeneric<IMyModel>> sequelize.define('page_views', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  seen_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const UserRatings = <MyModelStaticGeneric<IMyModel>> sequelize.define('user_ratings', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  writer_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  rating:              { type: Sequelize.INTEGER, allowNull: false, defaultValue: 5 },
  title:               { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  summary:             { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const UserReactions = <MyModelStaticGeneric<IMyModel>> sequelize.define('user_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ResetPasswordRequests = <MyModelStaticGeneric<IResetPasswordRequestModel>> sequelize.define('reset_password_requests', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  completed:           { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  uuid:                { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 },
  unique_value:        { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const Notifications = <MyModelStaticGeneric<INotificationModel>> sequelize.define('notifications', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  from_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  to_id:               { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  event:               { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  target_type:         { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  target_id:           { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
  read:                { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  image_link:          { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  image_id:            { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ContentSubscriptions = <MyModelStaticGeneric<IContentSubscriptionModel>> sequelize.define('content_subscriptions', {
  id:                         { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:                    { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  target_type:                { type: Sequelize.STRING, allowNull: false },
  target_id:                  { type: Sequelize.INTEGER,allowNull: false },
  target_action:              { type: Sequelize.STRING,allowNull: false },
  target_action_info:         { type: Sequelize.STRING,allowNull: false },
  frequency:                  { type: Sequelize.STRING, allowNull: false },
  date_created:               { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                       { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const Tokens = <MyModelStaticGeneric<ITokenModel>> sequelize.define('tokens', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  device:              { type: Sequelize.STRING, allowNull: false },
  token:               { type: Sequelize.TEXT, allowNull: false, unique: true },
  ip_address:          { type: Sequelize.STRING, allowNull: false },
  user_agent:          { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  date_last_used:      { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
}, common_options);

export const Follows = <MyModelStaticGeneric<IMyModel>> sequelize.define('follows', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  follows_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const FollowRequests = <MyModelStaticGeneric<IMyModel>> sequelize.define('follow_requests', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  follows_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const Blockings = <MyModelStaticGeneric<IMyModel>> sequelize.define('blockings', {
  id:                    { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  blocks_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const SiteFeedbacks = <MyModelStaticGeneric<IMyModel>> sequelize.define('site_feedbacks', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  rating:              { type: Sequelize.INTEGER, allowNull: false, defaultValue: 5 },
  title:               { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  summary:             { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);