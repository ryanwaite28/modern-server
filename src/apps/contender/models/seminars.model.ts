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
import { Audios } from '../../_common/models/audio.model';
import { Photos } from '../../_common/models/photo.model';
import { Videos } from '../../_common/models/video.model';



export const ContenderSeminars = <MyModelStatic> sequelize.define('contender_seminars', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  title:               { type: Sequelize.STRING, allowNull: false },
  summary:             { type: Sequelize.TEXT, allowNull: false },
  video_link:          { type: Sequelize.TEXT, allowNull: false },
  video_bucket:        { type: Sequelize.TEXT, allowNull: false },
  video_key:           { type: Sequelize.TEXT, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const ContenderSeminarAttendees = <MyModelStatic> sequelize.define('contender_seminar_attendees', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  seminar_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ContenderSeminars, key: 'id' } },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ContenderSeminarReactions = <MyModelStatic> sequelize.define('contender_seminar_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  seminar_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ContenderSeminars, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ContenderSeminarComments = <MyModelStatic> sequelize.define('contender_seminar_comments', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  seminar_id:          { type: Sequelize.INTEGER, allowNull: true, references: { model: ContenderSeminars, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false },
  last_edited:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ContenderSeminarCommentReactions = <MyModelStatic> sequelize.define('contender_seminar_comment_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ContenderSeminarComments, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ContenderSeminarCommentPhotos = <MyModelStatic> sequelize.define('contender_seminar_comment_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ContenderSeminarComments, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ContenderSeminarCommentVideos = <MyModelStatic> sequelize.define('contender_seminar_comment_videos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ContenderSeminarComments, key: 'id' } },
  video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ContenderSeminarCommentAudios = <MyModelStatic> sequelize.define('contender_seminar_comment_audios', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ContenderSeminarComments, key: 'id' } },
  audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);



export const ContenderSeminarCommentReplies = <MyModelStatic> sequelize.define('contender_seminar_comment_replies', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ContenderSeminarComments, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false },
  last_edited:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ContenderSeminarCommentReplyReactions = <MyModelStatic> sequelize.define('contender_seminar_comment_reply_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: ContenderSeminarCommentReplies, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ContenderSeminarCommentReplyPhotos = <MyModelStatic> sequelize.define('contender_seminar_comment_reply_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: ContenderSeminarCommentReplies, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ContenderSeminarCommentReplyVideos = <MyModelStatic> sequelize.define('contender_seminar_comment_reply_videos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: ContenderSeminarCommentReplies, key: 'id' } },
  video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ContenderSeminarCommentReplyAudios = <MyModelStatic> sequelize.define('contender_seminar_comment_reply_audios', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: ContenderSeminarCommentReplies, key: 'id' } },
  audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);




Users.hasMany(ContenderSeminars, { as: 'contender_seminars', foreignKey: 'owner_id', sourceKey: 'id' });
ContenderSeminars.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Users.hasMany(ContenderSeminarComments, { as: 'user_contender_seminar_comments', foreignKey: 'owner_id', sourceKey: 'id' });
ContenderSeminarComments.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Users.hasMany(ContenderSeminarCommentReplies, { as: 'user_contender_seminar_comment_replies', foreignKey: 'owner_id', sourceKey: 'id' });
ContenderSeminarCommentReplies.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });

Users.hasMany(ContenderSeminarReactions, { as: 'user_contender_seminar_reactions', foreignKey: 'owner_id', sourceKey: 'id' });
ContenderSeminarReactions.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Users.hasMany(ContenderSeminarCommentReactions, { as: 'user_contender_seminar_comment_reactions', foreignKey: 'owner_id', sourceKey: 'id' });
ContenderSeminarCommentReactions.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Users.hasMany(ContenderSeminarCommentReplyReactions, { as: 'user_contender_seminar_comment_reply_reactions', foreignKey: 'owner_id', sourceKey: 'id' });
ContenderSeminarCommentReplyReactions.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });


ContenderSeminars.hasMany(ContenderSeminarComments, { as: 'contender_seminar_comments', foreignKey: 'seminar_id', sourceKey: 'id' });
ContenderSeminarComments.belongsTo(ContenderSeminars, { as: 'seminar', foreignKey: 'seminar_id', targetKey: 'id' });
ContenderSeminars.hasMany(ContenderSeminarReactions, { as: 'contender_seminar_reactions', foreignKey: 'seminar_id', sourceKey: 'id' });
ContenderSeminarReactions.belongsTo(ContenderSeminars, { as: 'comment_seminar', foreignKey: 'seminar_id', targetKey: 'id' });

ContenderSeminarComments.hasMany(ContenderSeminarCommentPhotos, { as: 'contender_comment_photos', foreignKey: 'comment_id', sourceKey: 'id' });
ContenderSeminarCommentPhotos.belongsTo(ContenderSeminarComments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });
Photos.hasMany(ContenderSeminarCommentPhotos, { as: 'contender_seminar_comment_photos', foreignKey: 'photo_id', sourceKey: 'id' });
ContenderSeminarCommentPhotos.belongsTo(Photos, { as: 'photo_comment', foreignKey: 'photo_id', targetKey: 'id' });

ContenderSeminarComments.hasMany(ContenderSeminarCommentVideos, { as: 'contender_seminar_comment_videos', foreignKey: 'comment_id', sourceKey: 'id' });
ContenderSeminarCommentVideos.belongsTo(ContenderSeminarComments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });
Videos.hasMany(ContenderSeminarCommentVideos, { as: 'contender_seminar_comment_videos', foreignKey: 'video_id', sourceKey: 'id' });
ContenderSeminarCommentVideos.belongsTo(Videos, { as: 'video_comment', foreignKey: 'video_id', targetKey: 'id' });

ContenderSeminarComments.hasMany(ContenderSeminarCommentAudios, { as: 'contender_seminar_comment_audios', foreignKey: 'comment_id', sourceKey: 'id' });
ContenderSeminarCommentAudios.belongsTo(ContenderSeminarComments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });
Audios.hasMany(ContenderSeminarCommentAudios, { as: 'contender_seminar_comment_audios', foreignKey: 'audio_id', sourceKey: 'id' });
ContenderSeminarCommentAudios.belongsTo(Audios, { as: 'audio_comment', foreignKey: 'audio_id', targetKey: 'id' });

ContenderSeminarCommentReplies.hasMany(ContenderSeminarCommentReplyPhotos, { as: 'contender_seminar_reply_photos', foreignKey: 'reply_id', sourceKey: 'id' });
ContenderSeminarCommentReplyPhotos.belongsTo(ContenderSeminarCommentReplies, { as: 'reply', foreignKey: 'reply_id', targetKey: 'id' });
Photos.hasMany(ContenderSeminarCommentReplyPhotos, { as: 'contender_seminar_reply_photos', foreignKey: 'photo_id', sourceKey: 'id' });
ContenderSeminarCommentReplyPhotos.belongsTo(Photos, { as: 'photo_reply', foreignKey: 'photo_id', targetKey: 'id' });

ContenderSeminarCommentReplies.hasMany(ContenderSeminarCommentReplyVideos, { as: 'contender_seminar_reply_videos', foreignKey: 'reply_id', sourceKey: 'id' });
ContenderSeminarCommentReplyVideos.belongsTo(ContenderSeminarCommentReplies, { as: 'reply', foreignKey: 'reply_id', targetKey: 'id' });
Videos.hasMany(ContenderSeminarCommentReplyVideos, { as: 'contender_seminar_reply_videos', foreignKey: 'video_id', sourceKey: 'id' });
ContenderSeminarCommentReplyVideos.belongsTo(Videos, { as: 'video_reply', foreignKey: 'video_id', targetKey: 'id' });

ContenderSeminarCommentReplies.hasMany(ContenderSeminarCommentReplyAudios, { as: 'contender_seminar_reply_audios', foreignKey: 'reply_id', sourceKey: 'id' });
ContenderSeminarCommentReplyAudios.belongsTo(ContenderSeminarCommentReplies, { as: 'reply', foreignKey: 'reply_id', targetKey: 'id' });
Audios.hasMany(ContenderSeminarCommentReplyAudios, { as: 'contender_seminar_reply_audios', foreignKey: 'audio_id', sourceKey: 'id' });
ContenderSeminarCommentReplyAudios.belongsTo(Audios, { as: 'audio_reply', foreignKey: 'audio_id', targetKey: 'id' });

ContenderSeminarComments.hasMany(ContenderSeminarCommentReplies, { as: 'seminar_comment_replies', foreignKey: 'comment_id', sourceKey: 'id' });
ContenderSeminarCommentReplies.belongsTo(ContenderSeminarComments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });
ContenderSeminarComments.hasMany(ContenderSeminarCommentReactions, { as: 'reactions', foreignKey: 'comment_id', sourceKey: 'id' });
ContenderSeminarCommentReactions.belongsTo(ContenderSeminarComments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });

ContenderSeminarCommentReplies.hasMany(ContenderSeminarCommentReplyReactions, { as: 'reactions', foreignKey: 'reply_id', sourceKey: 'id' });
ContenderSeminarCommentReplyReactions.belongsTo(ContenderSeminarCommentReplies, { as: 'reply', foreignKey: 'reply_id', targetKey: 'id' });
