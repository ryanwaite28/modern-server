import * as Sequelize from 'sequelize';

import { Audios } from '../../_common/models/audio.model';
import { Photos } from '../../_common/models/photo.model';
import { Users } from '../../_common/models/user.model';
import { Videos } from '../../_common/models/video.model';
import { common_options, sequelizeInst as sequelize } from '../../_common/models/_def.model';
import { MyModelStaticGeneric, IMyModel } from '../../_common/models/common.model-types';
import { Cliques } from './clique.model';

export const Notices = <MyModelStaticGeneric<IMyModel>> sequelize.define('hotspot_notices', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  clique_id:           { type: Sequelize.INTEGER, allowNull: true, references: { model: Cliques, key: 'id' } },

  parent_id:           { type: Sequelize.INTEGER, allowNull: true }, // if this notice is a reply to another
  quoting_id:          { type: Sequelize.INTEGER, allowNull: true }, // if this notice is quoting another
  share_id:            { type: Sequelize.INTEGER, allowNull: true }, // if this notice is a share of another

  body:                { type: Sequelize.STRING(250), allowNull: false },
  tags:                { type: Sequelize.STRING, allowNull: false, defaultValue: '' },

  is_explicit:         { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  is_private:          { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  visibility:          { type: Sequelize.STRING(75), allowNull: false, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const NoticeReactions = <MyModelStaticGeneric<IMyModel>> sequelize.define('hotspot_notice_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  notice_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Notices, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const NoticeViewers = <MyModelStaticGeneric<IMyModel>> sequelize.define('hotspot_notice_viewers', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  notice_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Notices, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const NoticePhotos = <MyModelStaticGeneric<IMyModel>> sequelize.define('hotspot_notice_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  notice_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Notices, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const NoticeVideos = <MyModelStaticGeneric<IMyModel>> sequelize.define('hotspot_notice_videos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  notice_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Notices, key: 'id' } },
  video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const NoticeAudios = <MyModelStaticGeneric<IMyModel>> sequelize.define('hotspot_notice_audios', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  notice_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Notices, key: 'id' } },
  audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);



Users.hasMany(Notices, { as: 'hotspot_user_notices', foreignKey: 'owner_id', sourceKey: 'id' });
Notices.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });

Notices.hasMany(NoticeReactions, { as: 'hotspot_notice_reactions', foreignKey: 'notice_id', sourceKey: 'id' });
NoticeReactions.belongsTo(Notices, { as: 'notice', foreignKey: 'notice_id', targetKey: 'id' });

Notices.hasMany(NoticePhotos, { as: 'notice_photos', foreignKey: 'notice_id', sourceKey: 'id' });
NoticePhotos.belongsTo(Notices, { as: 'notice', foreignKey: 'notice_id', targetKey: 'id' });

Notices.hasMany(NoticeVideos, { as: 'notice_videos', foreignKey: 'notice_id', sourceKey: 'id' });
NoticeVideos.belongsTo(Notices, { as: 'notice', foreignKey: 'notice_id', targetKey: 'id' });

Notices.hasMany(NoticeAudios, { as: 'notice_audios', foreignKey: 'notice_id', sourceKey: 'id' });
NoticeAudios.belongsTo(Notices, { as: 'notice', foreignKey: 'notice_id', targetKey: 'id' });

NoticePhotos.belongsTo(Photos, { as: 'notice_photo', foreignKey: 'photo_id', targetKey: 'id' });

NoticeVideos.belongsTo(Videos, { as: 'notice_video', foreignKey: 'video_id', targetKey: 'id' });

NoticeAudios.belongsTo(Audios, { as: 'notice_audio', foreignKey: 'audio_id', targetKey: 'id' });