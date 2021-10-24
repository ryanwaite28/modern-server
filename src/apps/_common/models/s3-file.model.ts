import * as Sequelize from 'sequelize';

import {
  common_options,
  sequelizeInst as sequelize
} from './_def.model';

import {
  MyModelStatic,
} from './common.model-types';

import {
  Users
} from './user.model';

export const S3Files = <MyModelStatic> sequelize.define('common_s3files', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  model_type:          { type: Sequelize.STRING, allowNull: true }, // determines if post belongs to a particular model; default (null) is user
  model_id:            { type: Sequelize.INTEGER, allowNull: true },
  title:               { type: Sequelize.STRING(250), allowNull: false, defaultValue: '' },
  description:         { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  file_type:           { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  file_size:           { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  tags:                { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  key:                 { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  bucket:              { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  media_link:          { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  media_id:            { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  metadata:            { type: Sequelize.JSON, allowNull: true },
  is_explicit:         { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  is_private:          { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

