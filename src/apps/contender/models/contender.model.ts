import * as Sequelize from 'sequelize';

import {
  common_options,
  sequelizeInst as sequelize
} from '../../_common/models/_def.model';

import {
  MyModelStatic,
  MyModelStaticGeneric,
  IMyModel,
} from '../../_common/models/common.model-types';

import { Users } from '../../_common/models/user.model';

export const ContenderUserSettings = <MyModelStatic> sequelize.define('contender_user_settings', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ContenderUserRatings = <MyModelStatic> sequelize.define('contender_user_ratings', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  writer_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  rating:              { type: Sequelize.INTEGER, allowNull: false, defaultValue: 5 },
  title:               { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  summary:             { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

Users.hasOne(ContenderUserSettings, { as: 'contender_settings', foreignKey: 'user_id', sourceKey: 'id' });
ContenderUserSettings.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });

Users.hasMany(ContenderUserRatings, { as: 'contender_ratings', foreignKey: 'user_id', sourceKey: 'id' });
ContenderUserRatings.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });

Users.hasMany(ContenderUserRatings, { as: 'contender_ratings_written', foreignKey: 'writer_id', sourceKey: 'id' });
ContenderUserRatings.belongsTo(Users, { as: 'writer', foreignKey: 'writer_id', targetKey: 'id' });
