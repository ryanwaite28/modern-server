import * as Sequelize from 'sequelize';

import {
  common_options,
  sequelizeInst as sequelize
} from './_def.model';

import {
  MyModelStaticGeneric,
  IMyModel,
} from '../model-types';

import {
  Users
} from './user.model';

export const PremiumProducts = <MyModelStaticGeneric<IMyModel>> sequelize.define('premium_products', {
  id:                   { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  paypal_product_id:    { type: Sequelize.STRING, allowNull: false },
  paypal_product_json:  { type: Sequelize.JSON, allowNull: false }
}, common_options);

export const PremiumProductPlans = <MyModelStaticGeneric<IMyModel>> sequelize.define('premium_product_plans', {
  id:                   { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  product_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: PremiumProducts, key: 'id' } },
  paypal_plan_id:       { type: Sequelize.STRING, allowNull: false },
  paypal_plan_json:     { type: Sequelize.JSON, allowNull: false }
}, common_options);

export const Tags = <MyModelStaticGeneric<IMyModel>> sequelize.define('tags', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  name:                { type: Sequelize.STRING, allowNull: false, unique: true },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, {
  ...common_options,
  indexes: [{ unique: true, fields: ['name']} ] 
});

export const Reactions = <MyModelStaticGeneric<IMyModel>> sequelize.define('reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  name:                { type: Sequelize.STRING, allowNull: false, unique: true },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, {
  ...common_options,
  indexes: [{ unique: true, fields: ['name']} ] 
});

export const NewsDataCache = <MyModelStaticGeneric<IMyModel>> sequelize.define('news_data_cache', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  json_data:           { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const ApiKeys = <MyModelStaticGeneric<IMyModel>> sequelize.define('api_keys', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  key:                 { type: Sequelize.UUID, unique: true, defaultValue: Sequelize.UUIDV1 },
  firstname:           { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  middlename:          { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  lastname:            { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  email:               { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  phone:               { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  website:             { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  verified:            { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  requests_count:      { type: Sequelize.INTEGER, defaultValue: 0 },
}, common_options);