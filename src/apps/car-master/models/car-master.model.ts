import * as Sequelize from 'sequelize';

import {
  common_options,
  sequelizeInst as sequelize
} from '../../_common/models/_def.model';

import {
  MyModelStatic,
} from '../../_common/models/common.model-types';

import { Users } from '../../_common/models/user.model';


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
  
  date_created:       { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:               { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MechanicFields = <MyModelStatic> sequelize.define('carmaster_mechanic_fields', {
  id:                   { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  mechanic_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Mechanics, key: 'id' } },
  fieldname:            { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  fieldtype:            { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  fieldvalue:           { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  is_link:              { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  
  date_created:         { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                 { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const MechanicCredentials = <MyModelStatic> sequelize.define('carmaster_mechanic_credentials', {
  id:                 { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  mechanic_id:        { type: Sequelize.INTEGER, allowNull: false, references: { model: Mechanics, key: 'id' } },
  title:              { type: Sequelize.STRING, allowNull: false },
  description:        { type: Sequelize.STRING(500), allowNull: false },
  image_link:         { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  image_id:           { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  website:            { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  
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

export const MechanicExpertises = <MyModelStatic> sequelize.define('carmaster_mechanic_expertises', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  mechanic_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Mechanics, key: 'id' } },
  credential_id:       { type: Sequelize.INTEGER, allowNull: true, references: { model: MechanicCredentials, key: 'id' } },
  make:                { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  model:               { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  type:                { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  trim:                { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  description:         { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  min_year:            { type: Sequelize.INTEGER, allowNull: false },
  max_year:            { type: Sequelize.INTEGER, allowNull: false },
  
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const MechanicServices = <MyModelStatic> sequelize.define('carmaster_mechanic_services', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  mechanic_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Mechanics, key: 'id' } },
  expertise_id:        { type: Sequelize.INTEGER, allowNull: true, references: { model: MechanicExpertises, key: 'id' } },
  service:             { type: Sequelize.STRING, allowNull: false },
  description:         { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  cost:                { type: Sequelize.INTEGER, allowNull: false },
  deposit:             { type: Sequelize.INTEGER, allowNull: false },
  
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const MechanicServiceRequests = <MyModelStatic> sequelize.define('carmaster_mechanic_service_requests', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  mechanic_id:         { type: Sequelize.INTEGER, allowNull: true, references: { model: Mechanics, key: 'id' } },
  service_id:          { type: Sequelize.INTEGER, allowNull: true, references: { model: MechanicServices, key: 'id' } },
  action_type:         { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  payment_method_id:   { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  
  title:               { type: Sequelize.STRING, allowNull: false },
  description:         { type: Sequelize.STRING(500), allowNull: false },
  notes:               { type: Sequelize.TEXT, allowNull: false },
  payout:              { type: Sequelize.INTEGER, allowNull: true },
  deposit_paid:        { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },

  datetime_needed:     { type: Sequelize.DATE, allowNull: true, },
  datetime_canceled:   { type: Sequelize.DATE, allowNull: true, },
  datetime_accepted:   { type: Sequelize.DATE, allowNull: true, },
  datetime_declined:   { type: Sequelize.DATE, allowNull: true, },
  datetime_completed:  { type: Sequelize.DATE, allowNull: true, },
  status:              { type: Sequelize.STRING, allowNull: false },
  
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const MechanicServiceRequestOffers = <MyModelStatic> sequelize.define('carmaster_mechanic_service_request_offers', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  service_request_id:  { type: Sequelize.INTEGER, allowNull: false, references: { model: MechanicServiceRequests, key: 'id' } },
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

export const MechanicServiceRequestDisputes = <MyModelStatic> sequelize.define('carmaster_service_disputes', {
  id:                      { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  creator_id:              { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  service_request_id:      { type: Sequelize.INTEGER, allowNull: false, references: { model: MechanicServiceRequests, key: 'id' } },
  title:                   { type: Sequelize.STRING, allowNull: true },
  description:             { type: Sequelize.TEXT, allowNull: true },
  status:                  { type: Sequelize.STRING, allowNull: false },
  date_created:            { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                    { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MechanicServiceRequestDisputeLogs = <MyModelStatic> sequelize.define('carmaster_service_dispute_logs', {
  id:              { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  creator_id:      { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  dispute_id:      { type: Sequelize.INTEGER, allowNull: false, references: { model: MechanicServiceRequestDisputes, key: 'id' } },
  body:            { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  image_link:      { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  image_id:        { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  date_created:    { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:            { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);



Users.hasOne(Mechanics, { as: 'carmaster_mechanic', foreignKey: 'user_id', sourceKey: 'id' });
Mechanics.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });

Mechanics.hasMany(MechanicFields, { as: 'mechanic_fields', foreignKey: 'mechanic_id', sourceKey: 'id' });
MechanicFields.belongsTo(Mechanics, { as: 'mechanic', foreignKey: 'mechanic_id', targetKey: 'id' });

Mechanics.hasMany(MechanicCredentials, { as: 'mechanic_credentials', foreignKey: 'mechanic_id', sourceKey: 'id' });
MechanicCredentials.belongsTo(Mechanics, { as: 'mechanic', foreignKey: 'mechanic_id', targetKey: 'id' });

Mechanics.hasMany(MechanicRatings, { as: 'mechanic_ratings', foreignKey: 'mechanic_id', sourceKey: 'id' });
MechanicRatings.belongsTo(Mechanics, { as: 'mechanic', foreignKey: 'mechanic_id', targetKey: 'id' });
Mechanics.hasMany(MechanicRatings, { as: 'mechanic_ratings_given', foreignKey: 'user_id', sourceKey: 'id' });
MechanicRatings.belongsTo(Mechanics, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });

Mechanics.hasMany(MechanicExpertises, { as: 'mechanic_auto_expertises', foreignKey: 'mechanic_id', sourceKey: 'id' });
MechanicExpertises.belongsTo(Mechanics, { as: 'mechanic', foreignKey: 'mechanic_id', targetKey: 'id' });
MechanicExpertises.hasMany(MechanicCredentials, { as: 'expertise_credentials', foreignKey: 'credential_id', sourceKey: 'id' });
MechanicCredentials.belongsTo(MechanicExpertises, { as: 'expertise', foreignKey: 'credential_id', targetKey: 'id' });

Mechanics.hasMany(MechanicServices, { as: 'mechanic_services', foreignKey: 'mechanic_id', sourceKey: 'id' });
MechanicServices.belongsTo(Mechanics, { as: 'mechanic', foreignKey: 'mechanic_id', targetKey: 'id' });

Mechanics.hasMany(MechanicServiceRequests, { as: 'mechanic_service_requests', foreignKey: 'mechanic_id', sourceKey: 'id' });
MechanicServiceRequests.belongsTo(Mechanics, { as: 'mechanic', foreignKey: 'mechanic_id', targetKey: 'id' });
Users.hasMany(MechanicServiceRequests, { as: 'carmaster_mechanic_service_requests', foreignKey: 'user_id', sourceKey: 'id' });
MechanicServiceRequests.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });

Mechanics.hasMany(MechanicServiceRequestOffers, { as: 'mechanic_offers', foreignKey: 'mechanic_id', sourceKey: 'id' });
MechanicServiceRequestOffers.belongsTo(Mechanics, { as: 'mechanic', foreignKey: 'mechanic_id', targetKey: 'id' });

MechanicServiceRequests.hasMany(MechanicServiceRequestMessages, { as: 'mechanic_service_request_messages', foreignKey: 'service_request_id', sourceKey: 'id' });
MechanicServiceRequestMessages.belongsTo(MechanicServiceRequests, { as: 'service_request', foreignKey: 'service_request_id', targetKey: 'id' });

MechanicServiceRequests.hasMany(MechanicServiceRequestOffers, { as: 'mechanic_service_request_offers', foreignKey: 'service_request_id', sourceKey: 'id' });
MechanicServiceRequestOffers.belongsTo(MechanicServiceRequests, { as: 'service_request', foreignKey: 'service_request_id', targetKey: 'id' });

MechanicServices.hasMany(MechanicServiceRequests, { as: 'service_requests', foreignKey: 'service_id', sourceKey: 'id' });
MechanicServiceRequests.belongsTo(MechanicServices, { as: 'service', foreignKey: 'service_id', targetKey: 'id' });

Users.hasMany(MechanicServiceRequestDisputes, { as: 'carmaster_service_request_disputes', foreignKey: 'creator_id', sourceKey: 'id' });
MechanicServiceRequestDisputes.belongsTo(Users, { as: 'creator', foreignKey: 'creator_id', targetKey: 'id' });
MechanicServiceRequests.hasMany(MechanicServiceRequestDisputes, { as: 'mechanic_service_request_disputes', foreignKey: 'service_request_id', sourceKey: 'id' });
MechanicServiceRequestDisputes.belongsTo(MechanicServiceRequests, { as: 'service_request', foreignKey: 'service_request_id', targetKey: 'id' });

MechanicServiceRequestDisputes.hasMany(MechanicServiceRequestDisputeLogs, { as: 'mechanic_service_request_dispute_logs', foreignKey: 'dispute_id', sourceKey: 'id' });
MechanicServiceRequestDisputeLogs.belongsTo(MechanicServiceRequestDisputes, { as: 'dispute', foreignKey: 'dispute_id', targetKey: 'id' });
