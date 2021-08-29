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

export const Entities = <MyModelStatic> sequelize.define('safestar_entities', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  name:                { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  desc:                { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  industry:            { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  email:               { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  phone:               { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  website:             { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  code:                { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  p_o_c:               { type: Sequelize.STRING, allowNull: false, defaultValue: '' }, // point of contact
  icon:                { type: Sequelize.STRING, allowNull: true },
  verified:            { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const EntityFields = <MyModelStatic> sequelize.define('safestar_entity_fields', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  entity_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Entities, key: 'id' } },
  field_name:          { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  field_type:          { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  field_value:         { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const EntityPhotos = <MyModelStatic> sequelize.define('safestar_entity_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  asset_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Entities, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);