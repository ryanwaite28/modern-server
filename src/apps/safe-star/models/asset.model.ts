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
import { Entities } from './entity.model';

export const Assets = <MyModelStatic> sequelize.define('safestar_assets', {
  id:               { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  asset_name:       { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  asset_type:       { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  active:           { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
  verified:         { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  date_created:     { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:             { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const AssetFields = <MyModelStatic> sequelize.define('safestar_asset_fields', {
  id:               { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  asset_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Assets, key: 'id' } },
  field_name:       { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  field_type:       { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  field_value:      { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  date_created:     { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:             { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const AssetPhotos = <MyModelStatic> sequelize.define('safestar_asset_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  asset_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Assets, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const AssetAuthorizedEntities = <MyModelStatic> sequelize.define('safestar_asset_authorized_entities', {
  id:               { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  asset_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Assets, key: 'id' } },
  entity_id:        { type: Sequelize.INTEGER, allowNull: false, references: { model: Entities, key: 'id' } },
  date_created:     { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:             { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const AssetAuthorizeRequests = <MyModelStatic> sequelize.define('safestar_asset_authorize_requests', {
  id:               { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  asset_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Assets, key: 'id' } },
  entity_id:        { type: Sequelize.INTEGER, allowNull: false, references: { model: Entities, key: 'id' } },
  date_created:     { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:             { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 },
}, common_options);
