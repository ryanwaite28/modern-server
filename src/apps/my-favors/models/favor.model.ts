import * as Sequelize from 'sequelize';

import {
  common_options,
  sequelizeInst as sequelize
} from '../../_common/models/_def.model';

import {
  MyModelStaticGeneric,
  MyModelStatic,
} from '../../_common/models/common.model-types';

import { Users } from '../../_common/models/user.model';
import { Photos } from '../../_common/models/photo.model';
import { Videos } from '../../_common/models/video.model';

/*
export const null = <MyModelStatic> sequelize.define('app_nnull', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
}, common_options);
*/



export const Favors = <MyModelStatic> sequelize.define('myfavors_favors', {
  id:                        { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:                  { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },

  title:                     { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  description:               { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  charge_id:                 { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },

  category:                  { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  featured:                  { type: Sequelize.STRING, allowNull: true, defaultValue: '' }, // bronze/silver/gold
  item_image_link:           { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  item_image_id:             { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  
  location:                  { type: Sequelize.STRING(500), allowNull: false },
  address:                   { type: Sequelize.STRING(500), allowNull: false },
  street:                    { type: Sequelize.STRING(500), allowNull: false },
  city:                      { type: Sequelize.STRING(500), allowNull: false },
  state:                     { type: Sequelize.STRING(500), allowNull: false },
  zipcode:                   { type: Sequelize.INTEGER, allowNull: false },
  country:                   { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  place_id:                  { type: Sequelize.STRING, allowNull: false },
  lat:                       { type: Sequelize.DOUBLE, allowNull: false },
  lng:                       { type: Sequelize.DOUBLE, allowNull: false },
  
  payout_per_helper:         { type: Sequelize.INTEGER, allowNull: false },
  helpers_wanted:            { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
  payment_session_id:        { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  payment_intent_id:         { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  auto_assign_lead_helper:   { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },

  // started:                   { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  // fulfilled:                 { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },

  datetime_started:         { type: Sequelize.DATE, allowNull: true, },
  datetime_fulfilled:       { type: Sequelize.DATE, allowNull: true, },
  cancel:                      { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },

  fulfilled_image_link:      { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  fulfilled_image_id:        { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  date_needed:               { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },

  date_created:              { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                      { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const FavorCancellations = <MyModelStatic> sequelize.define('myfavors_favor_cancellations', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  favor_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Favors, key: 'id' } },
  reason:              { type: Sequelize.STRING(500), allowNull: false, unique: true },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const FavorCategories = <MyModelStatic> sequelize.define('myfavors_favor_categories', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  name:                { type: Sequelize.STRING(500), allowNull: false, unique: true },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const FavorAssignedCategories = <MyModelStatic> sequelize.define('myfavors_favor_assigned_categories', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  favor_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Favors, key: 'id' } },
  category_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: FavorCategories, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const FavorPhotos = <MyModelStatic> sequelize.define('myfavors_favor_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  favor_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Favors, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const FavorVideos = <MyModelStatic> sequelize.define('myfavors_favor_videos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  favor_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Favors, key: 'id' } },
  video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const FavorTransactions = <MyModelStatic> sequelize.define('myfavors_favor_transactions', {
  id:                 { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  favor_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Favors, key: 'id' } },
  action_type:        { type: Sequelize.STRING, allowNull: false },
  action_id:          { type: Sequelize.STRING, allowNull: false },
  status:             { type: Sequelize.STRING, allowNull: false },
  
  date_created:       { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:               { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const FavorMessages = <MyModelStatic> sequelize.define('myfavors_favor_messages', {
  id:                 { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  favor_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Favors, key: 'id' } },
  user_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  body:               { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  opened:             { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  date_created:       { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:               { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const FavorUpdates = <MyModelStatic> sequelize.define('myfavors_favor_updates', {
  id:                { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  favor_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Favors, key: 'id' } },
  user_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  message:           { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  helper_lat:        { type: Sequelize.DOUBLE, allowNull: true },
  helper_lng:        { type: Sequelize.DOUBLE, allowNull: true },
  icon_link:         { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  icon_id:           { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  date_created:      { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:              { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);



export const FavorHelpers = <MyModelStatic> sequelize.define('myfavors_favor_helpers', {
  id:              { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  favor_id:        { type: Sequelize.INTEGER, allowNull: false, references: { model: Favors, key: 'id' } },
  date_created:    { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  is_lead:                   { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  helped:                    { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  paid:                      { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  payment_session_id:        { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  payment_intent_id:         { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  uuid:                      { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const FavorRequests = <MyModelStatic> sequelize.define('myfavors_favor_requests', {
  id:              { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  favor_id:        { type: Sequelize.INTEGER, allowNull: false, references: { model: Favors, key: 'id' } },
  date_created:    { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  message:         { type: Sequelize.STRING, allowNull: true },
  uuid:            { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const FavorDisputes = <MyModelStatic> sequelize.define('myfavors_favor_disputes', {
  id:              { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  creator_id:      { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  user_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  favor_id:        { type: Sequelize.INTEGER, allowNull: false, references: { model: Favors, key: 'id' } },
  date_created:    { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  title:           { type: Sequelize.STRING, allowNull: true },
  status:          { type: Sequelize.STRING, allowNull: false },
  uuid:            { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const FavorDisputeLogs = <MyModelStatic> sequelize.define('myfavors_favor_dispute_logs', {
  id:              { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  creator_id:      { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  user_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  favor_id:        { type: Sequelize.INTEGER, allowNull: false, references: { model: Favors, key: 'id' } },
  body:            { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  date_created:    { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:            { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);



Users.hasMany(Favors, { as: 'myfavors_favors', foreignKey: 'owner_id', sourceKey: 'id' });
Favors.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });

Favors.hasMany(FavorUpdates, { as: 'favor_updates', foreignKey: 'favor_id', sourceKey: 'id' });
FavorUpdates.belongsTo(Favors, { as: 'favor', foreignKey: 'favor_id', targetKey: 'id' });
Users.hasMany(FavorUpdates, { as: 'myfavors_user_favor_updates', foreignKey: 'user_id', sourceKey: 'id' });
FavorUpdates.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });


Users.hasMany(FavorMessages, { as: 'myfavors_favor_messages_sent', foreignKey: 'user_id', sourceKey: 'id' });
FavorMessages.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });

Favors.hasMany(FavorMessages, { as: 'favor_messages', foreignKey: 'favor_id', sourceKey: 'id' });
FavorMessages.belongsTo(Favors, { as: 'favor', foreignKey: 'favor_id', targetKey: 'id' });

Favors.hasMany(FavorCancellations, { as: 'favor_cancellations', foreignKey: 'favor_id', sourceKey: 'id' });
FavorCancellations.belongsTo(Favors, { as: 'favor', foreignKey: 'favor_id', targetKey: 'id' });


Favors.hasMany(FavorHelpers, { as: 'favor_helpers', foreignKey: 'favor_id', sourceKey: 'id' });
FavorHelpers.belongsTo(Favors, { as: 'favor', foreignKey: 'favor_id', targetKey: 'id' });

Favors.hasMany(FavorPhotos, { as: 'favor_photos', foreignKey: 'favor_id', sourceKey: 'id' });
FavorPhotos.belongsTo(Favors, { as: 'favor', foreignKey: 'favor_id', targetKey: 'id' });

Favors.hasMany(FavorVideos, { as: 'favor_videos', foreignKey: 'favor_id', sourceKey: 'id' });
FavorVideos.belongsTo(Favors, { as: 'favor', foreignKey: 'favor_id', targetKey: 'id' });

FavorPhotos.belongsTo(Photos, { as: 'favor_photo', foreignKey: 'photo_id', targetKey: 'id' });
// Videos.belongsTo(FavorVideos, { as: 'video_favor', foreignKey: 'video_id', targetKey: 'id' });

FavorVideos.belongsTo(Videos, { as: 'favor_video', foreignKey: 'video_id', targetKey: 'id' });
// FavorVideos.belongsTo(Favors, { as: 'favor', foreignKey: 'favor_id', targetKey: 'id' });

Favors.hasMany(FavorAssignedCategories, { as: 'favor_assigned_categories', foreignKey: 'favor_id', sourceKey: 'id' });
FavorAssignedCategories.belongsTo(Favors, { as: 'favor', foreignKey: 'favor_id', targetKey: 'id' });

Users.hasMany(FavorHelpers, { as: 'myfavors_favors_helping', foreignKey: 'user_id', sourceKey: 'id' });
FavorHelpers.belongsTo(Users, { as: 'helper', foreignKey: 'user_id', targetKey: 'id' });