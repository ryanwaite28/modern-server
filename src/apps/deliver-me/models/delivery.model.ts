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



export const Delivery = <MyModelStatic> sequelize.define('deliverme_deliveries', {
  id:                          { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:                    { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  carrier_id:                  { type: Sequelize.INTEGER, allowNull: true, references: { model: Users, key: 'id' } },
  carrier_assigned_date:       { type: Sequelize.DATE, allowNull: true },

  title:                       { type: Sequelize.STRING, allowNull: false },
  description:                 { type: Sequelize.STRING(500), allowNull: false },
  tags:                        { type: Sequelize.STRING(250), allowNull: false, defaultValue: '' },
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

export const DeliveryTransactions = <MyModelStatic> sequelize.define('deliverme_delivery_transactions', {
  id:                 { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  delivery_id:        { type: Sequelize.INTEGER, allowNull: false, references: { model: Delivery, key: 'id' } },
  action_type:        { type: Sequelize.STRING, allowNull: false },
  action_id:          { type: Sequelize.STRING, allowNull: false },
  status:             { type: Sequelize.STRING, allowNull: false },
  
  date_created:       { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:               { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const DeliveryMessages = <MyModelStatic> sequelize.define('deliverme_deliveries_messages', {
  id:                 { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  delivery_id:        { type: Sequelize.INTEGER, allowNull: false, references: { model: Delivery, key: 'id' } },
  user_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  body:               { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  opened:             { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  date_created:       { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:               { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const DeliveryPayoutAttempts = <MyModelStatic> sequelize.define('deliverme_delivery_payout_attempts', {
  id:                          { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  delivery_id:                 { type: Sequelize.INTEGER, allowNull: false, references: { model: Delivery, key: 'id' } },
  transaction_id:              { type: Sequelize.STRING, allowNull: false },
  date_created:                { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                        { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const DeliveryPenaltyAttempts = <MyModelStatic> sequelize.define('deliverme_delivery_penalty_attempts', {
  id:                          { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  delivery_id:                 { type: Sequelize.INTEGER, allowNull: false, references: { model: Delivery, key: 'id' } },
  transaction_id:              { type: Sequelize.STRING, allowNull: false },
  date_created:                { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                        { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const DeliveryRequests = <MyModelStatic> sequelize.define('deliverme_delivery_requests', {
  id:              { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  delivery_id:     { type: Sequelize.INTEGER, allowNull: false, references: { model: Delivery, key: 'id' } },
  date_created:    { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  message:         { type: Sequelize.STRING, allowNull: true },
  uuid:            { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const DeliveryDisputes = <MyModelStatic> sequelize.define('deliverme_delivery_disputes', {
  id:              { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  creator_id:      { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  user_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  delivery_id:     { type: Sequelize.INTEGER, allowNull: false, references: { model: Delivery, key: 'id' } },
  date_created:    { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  title:           { type: Sequelize.STRING, allowNull: true },
  uuid:            { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const DeliveryDisputeLogs = <MyModelStatic> sequelize.define('deliverme_delivery_dispute_logs', {
  id:              { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  creator_id:      { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  user_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  delivery_id:     { type: Sequelize.INTEGER, allowNull: false, references: { model: Delivery, key: 'id' } },
  date_created:    { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:            { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const DeliveryTrackingUpdates = sequelize.define('deliverme_delivery_tracking_updates', {
  id:                { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  delivery_id:       { type: Sequelize.INTEGER, allowNull: false, references: { model: Delivery, key: 'id' } },
  user_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  message:           { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  carrier_lat:       { type: Sequelize.DOUBLE, allowNull: true },
  carrier_lng:       { type: Sequelize.DOUBLE, allowNull: true },
  icon_link:         { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  icon_id:           { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  date_created:      { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:              { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);






Users.hasMany(Delivery, { as: 'deliverme_deliveries', foreignKey: 'owner_id', sourceKey: 'id' });
Delivery.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Users.hasMany(Delivery, { as: 'deliverme_deliverings', foreignKey: 'carrier_id', sourceKey: 'id' });
Delivery.belongsTo(Users, { as: 'carrier', foreignKey: 'carrier_id', targetKey: 'id' });

Delivery.hasMany(DeliveryTrackingUpdates, { as: 'deliverme_delivery_tracking_updates', foreignKey: 'delivery_id', sourceKey: 'id' });
DeliveryTrackingUpdates.belongsTo(Delivery, { as: 'delivery', foreignKey: 'delivery_id', targetKey: 'id' });
Users.hasMany(DeliveryTrackingUpdates, { as: 'deliverme_user_tracking_updates', foreignKey: 'user_id', sourceKey: 'id' });
DeliveryTrackingUpdates.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });


Users.hasMany(DeliveryMessages, { as: 'delivery_messages_sent', foreignKey: 'user_id', sourceKey: 'id' });
DeliveryMessages.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });

Delivery.hasMany(DeliveryMessages, { as: 'delivery_messages', foreignKey: 'delivery_id', sourceKey: 'id' });
DeliveryMessages.belongsTo(Delivery, { as: 'delivery', foreignKey: 'delivery_id', targetKey: 'id' });