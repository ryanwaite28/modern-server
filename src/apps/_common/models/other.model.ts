import * as Sequelize from 'sequelize';

import {
  common_options,
  sequelizeInst as sequelize
} from './_def.model';

import {
  MyModelStaticGeneric,
  IMyModel,
} from './common.model-types';

import {
  Users
} from './user.model';



export const PremiumProducts = <MyModelStaticGeneric<IMyModel>> sequelize.define('common_premium_products', {
  id:                   { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  paypal_product_id:    { type: Sequelize.STRING, allowNull: false },
  paypal_product_json:  { type: Sequelize.JSON, allowNull: false }
}, common_options);

export const PremiumProductPlans = <MyModelStaticGeneric<IMyModel>> sequelize.define('common_premium_product_plans', {
  id:                   { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  product_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: PremiumProducts, key: 'id' } },
  paypal_plan_id:       { type: Sequelize.STRING, allowNull: false },
  paypal_plan_json:     { type: Sequelize.JSON, allowNull: false }
}, common_options);

export const Tags = <MyModelStaticGeneric<IMyModel>> sequelize.define('common_tags', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  name:                { type: Sequelize.STRING, allowNull: false, unique: true },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, {
  ...common_options,
  indexes: [{ unique: true, fields: ['name']} ] 
});

export const Reactions = <MyModelStaticGeneric<IMyModel>> sequelize.define('common_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  name:                { type: Sequelize.STRING, allowNull: false, unique: true },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, {
  ...common_options,
  indexes: [{ unique: true, fields: ['name']} ] 
});

export const NewsDataCache = <MyModelStaticGeneric<IMyModel>> sequelize.define('common_news_data_cache', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  key:                 { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  json_data:           { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);





export const ApiKeys = <MyModelStaticGeneric<IMyModel>> sequelize.define('common_api_keys', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  key:                 { type: Sequelize.UUID, unique: true, defaultValue: Sequelize.UUIDV4 },
  
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  firstname:           { type: Sequelize.STRING, allowNull: false },
  middlename:          { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  lastname:            { type: Sequelize.STRING, allowNull: false },
  email:               { type: Sequelize.STRING, allowNull: false },
  phone:               { type: Sequelize.STRING, allowNull: false },
  website:             { type: Sequelize.STRING, allowNull: false },
  subscription_plan:   { type: Sequelize.STRING, allowNull: false },
  
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const ApiKeyInvoices = <MyModelStaticGeneric<IMyModel>> sequelize.define('common_api_key_invoices', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  key_id:              { type: Sequelize.INTEGER, allowNull: false, references: { model: ApiKeys, key: 'id' } },
  invoice_id:          { type: Sequelize.TEXT, allowNull: false }, // via stripe
  status:              { type: Sequelize.TEXT, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const ApiKeyAllowedOrigins = <MyModelStaticGeneric<IMyModel>> sequelize.define('common_api_key_allowed_origins', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  key_id:              { type: Sequelize.INTEGER, allowNull: false, references: { model: ApiKeys, key: 'id' } },
  origin:              { type: Sequelize.TEXT, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const ApiKeyRequests = <MyModelStaticGeneric<IMyModel>> sequelize.define('common_api_key_requests', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  key_id:              { type: Sequelize.INTEGER, allowNull: false, references: { model: ApiKeys, key: 'id' } },
  request_url:         { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  request_headers:     { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  request_body:        { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  resource:            { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  response:            { type: Sequelize.INTEGER, allowNull: false },
  results:             { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);



Users.hasOne(ApiKeys, { as: 'api_key', foreignKey: 'user_id', sourceKey: 'id' });
ApiKeys.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });

ApiKeys.hasMany(ApiKeyInvoices, { as: 'api_key_invoices', foreignKey: 'key_id', sourceKey: 'id' });
ApiKeyInvoices.belongsTo(ApiKeys, { as: 'api_key', foreignKey: 'key_id', targetKey: 'id' });

ApiKeys.hasMany(ApiKeyAllowedOrigins, { as: 'api_key_origins', foreignKey: 'key_id', sourceKey: 'id' });
ApiKeyAllowedOrigins.belongsTo(ApiKeys, { as: 'api_key', foreignKey: 'key_id', targetKey: 'id' });

ApiKeys.hasMany(ApiKeyRequests, { as: 'api_key_requests', foreignKey: 'key_id', sourceKey: 'id' });
ApiKeyRequests.belongsTo(ApiKeys, { as: 'api_key', foreignKey: 'key_id', targetKey: 'id' });