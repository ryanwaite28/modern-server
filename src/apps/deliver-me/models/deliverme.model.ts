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

export const DeliverMeUserProfileSettings = <MyModelStatic> sequelize.define('deliverme_user_profile_settings', {
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

export const DeliverMeUserRatings = <MyModelStatic> sequelize.define('deliverme_user_ratings', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  writer_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  rating:              { type: Sequelize.INTEGER, allowNull: false, defaultValue: 5 },
  title:               { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  summary:             { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);


Users.hasOne(DeliverMeUserProfileSettings, { as: 'deliverme_settings', foreignKey: 'user_id', sourceKey: 'id' });
DeliverMeUserProfileSettings.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });