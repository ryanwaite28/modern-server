import * as Sequelize from 'sequelize';

import {
  common_options,
  sequelizeInst as sequelize
} from '../../_common/models/_def.model';
import {
  MyModelStatic,
} from '../../_common/models/common.model-types';
import { Users } from '../../_common/models/user.model';
import { Audios } from '../../_common/models/audio.model';
import { Photos } from '../../_common/models/photo.model';
import { Videos } from '../../_common/models/video.model';



export const CarmasterUserProfileSettings = <MyModelStatic> sequelize.define('carmaster_user_profile_settings', {
  id:                               { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:                          { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  phone:                            { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  email:                            { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  cashapp_tag:                      { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  venmo_id:                         { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  paypal_me:                        { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  google_pay:                       { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  date_created:                     { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  notifications_last_opened:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                             { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const CarmasterMessagings = <MyModelStatic> sequelize.define('carmaster_messagings', {
  id:                 { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  sender_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  date_created:       { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:               { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const CarmasterMessagingRequests = <MyModelStatic> sequelize.define('carmaster_messaging_requests', {
  id:                 { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  sender_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  date_created:       { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:               { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const CarmasterMessages = <MyModelStatic> sequelize.define('carmaster_messages', {
  id:                 { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  from_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  to_id:              { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  body:               { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  app_context:        { type: Sequelize.STRING, allowNull: true, defaultValue: '' }, // _common/hotspot.myfavors/etc
  opened:             { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  date_created:       { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:               { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const CarmasterMessagePhotos = <MyModelStatic> sequelize.define('carmaster_message_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  message_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: CarmasterMessages, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const CarmasterMessageVideos = <MyModelStatic> sequelize.define('carmaster_message_videos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  message_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: CarmasterMessages, key: 'id' } },
  video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const CarmasterMessageAudios = <MyModelStatic> sequelize.define('carmaster_message_audios', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  message_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: CarmasterMessages, key: 'id' } },
  audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const CarmasterNotifications = <MyModelStatic> sequelize.define('carmaster_notifications', {
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




export const Mechanics = <MyModelStatic> sequelize.define('carmaster_mechanics', {
  id:                 { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  bio:                { type: Sequelize.STRING, allowNull: false },
  website:            { type: Sequelize.STRING, allowNull: false },
  phone:              { type: Sequelize.STRING, allowNull: false },
  email:              { type: Sequelize.STRING, allowNull: false },
  city:               { type: Sequelize.STRING(500), allowNull: false },
  state:              { type: Sequelize.STRING(500), allowNull: false },
  zipcode:            { type: Sequelize.INTEGER, allowNull: false },
  country:            { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  lat:                { type: Sequelize.FLOAT, allowNull: true, defaultValue: null },
  lng:                { type: Sequelize.FLOAT, allowNull: true, defaultValue: null },
  
  date_created:       { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:               { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MechanicFavorites = <MyModelStatic> sequelize.define('carmaster_mechanic_favorites', {
  id:                 { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  mechanic_id:        { type: Sequelize.INTEGER, allowNull: false, references: { model: Mechanics, key: 'id' } },
  
  date_created:       { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:               { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MechanicFields = <MyModelStatic> sequelize.define('carmaster_mechanic_fields', {
  id:                   { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  mechanic_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Mechanics, key: 'id' } },
  fieldname:            { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  fieldvalue:           { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  fieldtype:            { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  is_link:              { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  
  date_created:         { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                 { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const MechanicCredentials = <MyModelStatic> sequelize.define('carmaster_mechanic_credentials', {
  id:                 { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  mechanic_id:        { type: Sequelize.INTEGER, allowNull: false, references: { model: Mechanics, key: 'id' } },
  title:              { type: Sequelize.STRING, allowNull: false },
  description:        { type: Sequelize.STRING(500), allowNull: false },
  website:            { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  image_link:         { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  image_id:           { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  
  date_created:       { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:               { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MechanicCredentialReportings = <MyModelStatic> sequelize.define('carmaster_mechanic_credential_reportings', {
  id:                 { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  credential_id:      { type: Sequelize.INTEGER, allowNull: true, references: { model: MechanicCredentials, key: 'id' } },
  issue:              { type: Sequelize.TEXT, allowNull: false },
  date_created:       { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:               { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MechanicCredentialReportingMessages = <MyModelStatic> sequelize.define('carmaster_mechanic_credential_reporting_messages', {
  id:                 { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  reporting_id:       { type: Sequelize.INTEGER, allowNull: true, references: { model: MechanicCredentialReportings, key: 'id' } },
  user_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  body:               { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  opened:             { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  date_created:       { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:               { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MechanicRatings = <MyModelStatic> sequelize.define('carmaster_mechanic_ratings', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  writer_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  mechanic_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Mechanics, key: 'id' } },
  rating:              { type: Sequelize.INTEGER, allowNull: false, defaultValue: 5 },
  title:               { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  summary:             { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const MechanicRatingEdits = <MyModelStatic> sequelize.define('carmaster_mechanic_rating_edits', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  rating_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: MechanicRatings, key: 'id' } },
  summary:             { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const MechanicExpertises = <MyModelStatic> sequelize.define('carmaster_mechanic_expertises', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  mechanic_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Mechanics, key: 'id' } },
  credential_id:       { type: Sequelize.INTEGER, allowNull: true, references: { model: MechanicCredentials, key: 'id' } },
  description:         { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  make:                { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  model:               { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  type:                { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  trim:                { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  min_year:            { type: Sequelize.INTEGER, allowNull: false },
  max_year:            { type: Sequelize.INTEGER, allowNull: false },
  
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const MechanicServices = <MyModelStatic> sequelize.define('carmaster_mechanic_services', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  mechanic_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Mechanics, key: 'id' } },
  expertise_id:        { type: Sequelize.INTEGER, allowNull: true, references: { model: MechanicExpertises, key: 'id' } },
  service_category:    { type: Sequelize.STRING, allowNull: false },
  service_type:        { type: Sequelize.STRING, allowNull: false },
  service_action:      { type: Sequelize.STRING, allowNull: false },
  description:         { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  cost:                { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
  
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const MechanicServiceRequests = <MyModelStatic> sequelize.define('carmaster_mechanic_service_requests', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  mechanic_id:         { type: Sequelize.INTEGER, allowNull: true, references: { model: Mechanics, key: 'id' } },
  service_id:          { type: Sequelize.INTEGER, allowNull: true, references: { model: MechanicServices, key: 'id' } },
  payment_method_id:   { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  payment_intent_id:   { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },

  image_link:         { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  image_id:           { type: Sequelize.STRING, allowNull: true, defaultValue: '' },

  work_finished_image_link:         { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  work_finished_image_id:           { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  
  title:               { type: Sequelize.STRING, allowNull: false },
  description:         { type: Sequelize.STRING(500), allowNull: false },
  notes:               { type: Sequelize.TEXT, allowNull: false },
  payout:              { type: Sequelize.INTEGER, allowNull: true },
  service_category:    { type: Sequelize.STRING, allowNull: false },
  service_type:        { type: Sequelize.STRING, allowNull: false },
  service_action:      { type: Sequelize.STRING, allowNull: false },
  make:                { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  model:               { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  type:                { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  trim:                { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  year:                { type: Sequelize.INTEGER, allowNull: false },
  city:                { type: Sequelize.STRING(500), allowNull: false },
  state:               { type: Sequelize.STRING(500), allowNull: false },
  zipcode:             { type: Sequelize.INTEGER, allowNull: false },
  country:             { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  

  datetime_needed:         { type: Sequelize.DATE, allowNull: true, },
  datetime_canceled:       { type: Sequelize.DATE, allowNull: true, },
  datetime_accepted:       { type: Sequelize.DATE, allowNull: true, },
  datetime_declined:       { type: Sequelize.DATE, allowNull: true, },
  datetime_work_started:   { type: Sequelize.DATE, allowNull: true, },
  datetime_work_finished:  { type: Sequelize.DATE, allowNull: true, },
  datetime_completed:      { type: Sequelize.DATE, allowNull: true, },
  status:                  { type: Sequelize.STRING, allowNull: false },
  
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const MechanicServiceRequestOffers = <MyModelStatic> sequelize.define('carmaster_mechanic_service_request_offers', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  service_request_id:  { type: Sequelize.INTEGER, allowNull: false, references: { model: MechanicServiceRequests, key: 'id' } },
  service_request_user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  mechanic_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Mechanics, key: 'id' } },
  notes:               { type: Sequelize.TEXT, allowNull: false },
  status:              { type: Sequelize.STRING, allowNull: false },
  
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const MechanicServiceRequestMessages = <MyModelStatic> sequelize.define('carmaster_service_request_messages', {
  id:                 { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  service_request_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: MechanicServiceRequests, key: 'id' } },
  user_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  body:               { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  opened:             { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  date_created:       { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:               { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MechanicServiceRequestDisputes = <MyModelStatic> sequelize.define('carmaster_service_request_disputes', {
  id:                      { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  creator_id:              { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  user_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  service_request_id:      { type: Sequelize.INTEGER, allowNull: false, references: { model: MechanicServiceRequests, key: 'id' } },
  title:                   { type: Sequelize.STRING, allowNull: true },
  description:             { type: Sequelize.TEXT, allowNull: true },
  status:                  { type: Sequelize.STRING, allowNull: false },
  date_created:            { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                    { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MechanicServiceRequestDisputeLogs = <MyModelStatic> sequelize.define('carmaster_service_request_dispute_logs', {
  id:              { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  creator_id:      { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  user_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  dispute_id:      { type: Sequelize.INTEGER, allowNull: false, references: { model: MechanicServiceRequestDisputes, key: 'id' } },
  body:            { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  image_link:      { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  image_id:        { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  date_created:    { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:            { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MechanicServiceRequestDisputeSettlementOffers = <MyModelStatic> sequelize.define('carmaster_service_request_dispute_settlement_offers', {
  id:              { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  creator_id:      { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  user_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  dispute_id:      { type: Sequelize.INTEGER, allowNull: false, references: { model: MechanicServiceRequestDisputes, key: 'id' } },
  message:         { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  offer_amount:    { type: Sequelize.INTEGER, allowNull: false },
  status:          { type: Sequelize.STRING, allowNull: false },
  date_created:    { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:            { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);



Users.hasOne(Mechanics, { as: 'carmaster_mechanic', foreignKey: 'user_id', sourceKey: 'id' });
Mechanics.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });



Users.hasMany(CarmasterMessagings, { as: 'carmaster_message_sendings', foreignKey: 'sender_id', sourceKey: 'id' });
CarmasterMessagings.belongsTo(Users, { as: 'sender', foreignKey: 'sender_id', targetKey: 'id' });
Users.hasMany(CarmasterMessagings, { as: 'carmaster_message_receivings', foreignKey: 'user_id', sourceKey: 'id' });
CarmasterMessagings.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });

Users.hasMany(CarmasterMessages, { as: 'carmaster_messages_sent', foreignKey: 'from_id', sourceKey: 'id' });
CarmasterMessages.belongsTo(Users, { as: 'from', foreignKey: 'from_id', targetKey: 'id' });
Users.hasMany(CarmasterMessages, { as: 'carmaster_messages_received', foreignKey: 'to_id', sourceKey: 'id' });
CarmasterMessages.belongsTo(Users, { as: 'to', foreignKey: 'to_id', targetKey: 'id' });



Users.hasMany(MechanicFavorites, { as: 'carmaster_mechanic_favorites', foreignKey: 'user_id', sourceKey: 'id' });
MechanicFavorites.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });
Mechanics.hasMany(MechanicFavorites, { as: 'mechanic_favorites', foreignKey: 'mechanic_id', sourceKey: 'id' });
MechanicFavorites.belongsTo(Mechanics, { as: 'mechanic', foreignKey: 'mechanic_id', targetKey: 'id' });

Mechanics.hasMany(MechanicFields, { as: 'mechanic_fields', foreignKey: 'mechanic_id', sourceKey: 'id' });
MechanicFields.belongsTo(Mechanics, { as: 'mechanic', foreignKey: 'mechanic_id', targetKey: 'id' });

Mechanics.hasMany(MechanicCredentials, { as: 'mechanic_credentials', foreignKey: 'mechanic_id', sourceKey: 'id' });
MechanicCredentials.belongsTo(Mechanics, { as: 'mechanic', foreignKey: 'mechanic_id', targetKey: 'id' });

Users.hasMany(MechanicCredentialReportings, { as: 'carmaster_mechanic_credential_reportings', foreignKey: 'user_id', sourceKey: 'id' });
MechanicCredentialReportings.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });
MechanicCredentials.hasMany(MechanicCredentialReportings, { as: 'mechanic_credential_reportings', foreignKey: 'credential_id', sourceKey: 'id' });
MechanicCredentialReportings.belongsTo(MechanicCredentials, { as: 'credential', foreignKey: 'credential_id', targetKey: 'id' });

Users.hasMany(MechanicCredentialReportingMessages, { as: 'carmaster_mechanic_credential_reporting_messages', foreignKey: 'user_id', sourceKey: 'id' });
MechanicCredentialReportingMessages.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });
MechanicCredentialReportings.hasMany(MechanicCredentialReportingMessages, { as: 'mechanic_credential_reporting_messages', foreignKey: 'reporting_id', sourceKey: 'id' });
MechanicCredentialReportingMessages.belongsTo(MechanicCredentialReportings, { as: 'reporting', foreignKey: 'reporting_id', targetKey: 'id' });

Mechanics.hasMany(MechanicRatings, { as: 'mechanic_ratings', foreignKey: 'mechanic_id', sourceKey: 'id' });
MechanicRatings.belongsTo(Mechanics, { as: 'mechanic', foreignKey: 'mechanic_id', targetKey: 'id' });
Users.hasMany(MechanicRatings, { as: 'mechanic_ratings_given', foreignKey: 'writer_id', sourceKey: 'id' });
MechanicRatings.belongsTo(Users, { as: 'writer', foreignKey: 'writer_id', targetKey: 'id' });

MechanicRatings.hasMany(MechanicRatingEdits, { as: 'mechanic_rating_edits', foreignKey: 'rating_id', sourceKey: 'id' });
MechanicRatingEdits.belongsTo(MechanicRatings, { as: 'rating', foreignKey: 'rating_id', targetKey: 'id' });

Mechanics.hasMany(MechanicExpertises, { as: 'mechanic_expertises', foreignKey: 'mechanic_id', sourceKey: 'id' });
MechanicExpertises.belongsTo(Mechanics, { as: 'mechanic', foreignKey: 'mechanic_id', targetKey: 'id' });
MechanicCredentials.hasMany(MechanicExpertises, { as: 'credential_expertises', foreignKey: 'credential_id', sourceKey: 'id' });
MechanicExpertises.belongsTo(MechanicCredentials, { as: 'credential', foreignKey: 'credential_id', targetKey: 'id' });

Mechanics.hasMany(MechanicServices, { as: 'mechanic_services', foreignKey: 'mechanic_id', sourceKey: 'id' });
MechanicServices.belongsTo(Mechanics, { as: 'mechanic', foreignKey: 'mechanic_id', targetKey: 'id' });

Mechanics.hasMany(MechanicServiceRequests, { as: 'mechanic_service_requests', foreignKey: 'mechanic_id', sourceKey: 'id' });
MechanicServiceRequests.belongsTo(Mechanics, { as: 'mechanic', foreignKey: 'mechanic_id', targetKey: 'id' });
Users.hasMany(MechanicServiceRequests, { as: 'carmaster_mechanic_service_requests', foreignKey: 'user_id', sourceKey: 'id' });
MechanicServiceRequests.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });

Mechanics.hasMany(MechanicServiceRequestOffers, { as: 'mechanic_service_request_offers', foreignKey: 'mechanic_id', sourceKey: 'id' });
MechanicServiceRequestOffers.belongsTo(Mechanics, { as: 'mechanic', foreignKey: 'mechanic_id', targetKey: 'id' });
Users.hasMany(MechanicServiceRequestOffers, { as: 'carmaster_user_service_request_offers', foreignKey: 'service_request_user_id', sourceKey: 'id' });
MechanicServiceRequestOffers.belongsTo(Users, { as: 'user', foreignKey: 'service_request_user_id', targetKey: 'id' });

MechanicServiceRequests.hasMany(MechanicServiceRequestMessages, { as: 'mechanic_service_request_messages', foreignKey: 'service_request_id', sourceKey: 'id' });
MechanicServiceRequestMessages.belongsTo(MechanicServiceRequests, { as: 'service_request', foreignKey: 'service_request_id', targetKey: 'id' });
Users.hasMany(MechanicServiceRequestMessages, { as: 'carmaster_service_request_messages_sent', foreignKey: 'user_id', sourceKey: 'id' });
MechanicServiceRequestMessages.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });

MechanicServiceRequests.hasMany(MechanicServiceRequestOffers, { as: 'service_request_offers', foreignKey: 'service_request_id', sourceKey: 'id' });
MechanicServiceRequestOffers.belongsTo(MechanicServiceRequests, { as: 'service_request', foreignKey: 'service_request_id', targetKey: 'id' });

MechanicServices.hasMany(MechanicServiceRequests, { as: 'service_requests', foreignKey: 'service_id', sourceKey: 'id' });
MechanicServiceRequests.belongsTo(MechanicServices, { as: 'service', foreignKey: 'service_id', targetKey: 'id' });

Users.hasMany(MechanicServiceRequestDisputes, { as: 'carmaster_service_request_disputes', foreignKey: 'creator_id', sourceKey: 'id' });
MechanicServiceRequestDisputes.belongsTo(Users, { as: 'creator', foreignKey: 'creator_id', targetKey: 'id' });
MechanicServiceRequests.hasMany(MechanicServiceRequestDisputes, { as: 'mechanic_service_request_disputes', foreignKey: 'service_request_id', sourceKey: 'id' });
MechanicServiceRequestDisputes.belongsTo(MechanicServiceRequests, { as: 'service_request', foreignKey: 'service_request_id', targetKey: 'id' });

MechanicServiceRequestDisputes.hasMany(MechanicServiceRequestDisputeLogs, { as: 'mechanic_service_request_dispute_logs', foreignKey: 'dispute_id', sourceKey: 'id' });
MechanicServiceRequestDisputeLogs.belongsTo(MechanicServiceRequestDisputes, { as: 'dispute', foreignKey: 'dispute_id', targetKey: 'id' });
