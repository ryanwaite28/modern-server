import * as Sequelize from 'sequelize';

import {
  common_options,
  sequelizeInst as sequelize
} from '../../_common/models/_def.model';

import {
  MyModelStaticGeneric,
  MyModelStatic
} from '../../_common/models/common.model-types';

import {
  Users
} from '../../_common/models/user.model';

export const HotspotUserProfileSettings = <MyModelStatic> sequelize.define('hotspot_user_profile_settings', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  wallpaper_link:      { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  wallpaper_id:        { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  visibility:          { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);