import * as Sequelize from 'sequelize';

import {
  common_options,
  sequelizeInst as sequelize
} from '../../_common/models/_def.model';

import {
  MyModelStatic,
} from '../../_common/models/common.model-types';

import { Users } from '../../_common/models/user.model';

export const FetchAppUserProfileSettings = <MyModelStatic> sequelize.define('fetchapp_user_profile_settings', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  
  phone:               { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  email:               { type: Sequelize.STRING, allowNull: false, defaultValue: '' },

  cashapp_tag:         { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  venmo_id:            { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  paypal_me:           { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  google_pay:          { type: Sequelize.STRING, allowNull: false, defaultValue: '' },

  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const FetchAppUserRatings = <MyModelStatic> sequelize.define('fetchapp_user_ratings', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  writer_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  rating:              { type: Sequelize.INTEGER, allowNull: false, defaultValue: 5 },
  title:               { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  summary:             { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);



export const FetchRequest = <MyModelStatic> sequelize.define('fetchapp_fetch_request', {
  id:                          { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:                    { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  carrier_id:                  { type: Sequelize.INTEGER, allowNull: true, references: { model: Users, key: 'id' } },
  carrier_assigned_date:       { type: Sequelize.DATE, allowNull: true },

  title:                       { type: Sequelize.STRING, allowNull: false },
  instructions:                { type: Sequelize.TEXT, allowNull: false },
  item_image_link:             { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  item_image_id:               { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  
  from_location:               { type: Sequelize.STRING(500), allowNull: false },
  from_address:                { type: Sequelize.STRING(500), allowNull: false },
  from_street:                 { type: Sequelize.STRING(500), allowNull: false },
  from_city:                   { type: Sequelize.STRING(500), allowNull: false },
  from_state:                  { type: Sequelize.STRING(500), allowNull: false },
  from_zipcode:                { type: Sequelize.INTEGER, allowNull: false },
  from_country:                { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  from_place_id:               { type: Sequelize.STRING, allowNull: false },
  from_lat:                    { type: Sequelize.DOUBLE, allowNull: false },
  from_lng:                    { type: Sequelize.DOUBLE, allowNull: false },
  from_person:                 { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  from_person_phone:           { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  from_person_email:           { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  from_person_id_required:     { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  from_person_sig_required:    { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },

  from_person_id_image_link:   { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  from_person_id_image_id:     { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  from_person_sig_image_link:  { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  from_person_sig_image_id:    { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },

  to_location:                 { type: Sequelize.STRING(500), allowNull: false },
  to_address:                  { type: Sequelize.STRING(500), allowNull: false },
  to_street:                   { type: Sequelize.STRING(500), allowNull: false },
  to_city:                     { type: Sequelize.STRING(500), allowNull: false },
  to_state:                    { type: Sequelize.STRING(500), allowNull: false },
  to_zipcode:                  { type: Sequelize.INTEGER, allowNull: false },
  to_country:                  { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  to_place_id:                 { type: Sequelize.STRING, allowNull: false },
  to_lat:                      { type: Sequelize.DOUBLE, allowNull: false },
  to_lng:                      { type: Sequelize.DOUBLE, allowNull: false },
  to_person:                   { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  to_person_phone:             { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  to_person_email:             { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  to_person_id_required:       { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  to_person_sig_required:      { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },

  to_person_id_image_link:     { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  to_person_id_image_id:       { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  to_person_sig_image_link:    { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  to_person_sig_image_id:      { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },

  distance_miles:              { type: Sequelize.DOUBLE, allowNull: false, defaultValue: 0 },
  
  category:                    { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  size:                        { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  weight:                      { type: Sequelize.INTEGER, allowNull: false },
  featured:                    { type: Sequelize.STRING, allowNull: true, defaultValue: '' }, // bronze/silver/gold
  available:                   { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
  started:                     { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  auto_accept_anyone:          { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  urgent:                      { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  canceled:                    { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  returned:                    { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  completed:                   { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  delivered_instructions:      { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  delivered_image_link:        { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  delivered_image_id:          { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  payment_session_id:          { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  payout:                      { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
  payout_invoice_id:           { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' }, // paypal
  penalty:                     { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
  penalty_invoice_id:          { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' }, // paypal

  datetime_pick_up_by:         { type: Sequelize.DATE, allowNull: true, },
  datetime_picked_up:          { type: Sequelize.DATE, allowNull: true, },
  datetime_picked_up_est:      { type: Sequelize.DATE, allowNull: true, },
  
  datetime_delivered:          { type: Sequelize.DATE, allowNull: true, },
  datetime_deliver_by:         { type: Sequelize.DATE, allowNull: true, },
  datetime_delivered_est:      { type: Sequelize.DATE, allowNull: true, },

  date_created:                { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                        { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);















Users.hasOne(FetchAppUserProfileSettings, { as: 'fetchapp_settings', foreignKey: 'user_id', sourceKey: 'id' });
FetchAppUserProfileSettings.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });