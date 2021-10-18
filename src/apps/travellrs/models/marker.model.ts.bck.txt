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

import { Audios } from '../../_common/models/audio.model';
import { Photos } from '../../_common/models/photo.model';
import { Users } from '../../_common/models/user.model';
import { Videos } from '../../_common/models/video.model';

export const Markers = <MyModelStatic> sequelize.define('travellrs_markers', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  location:            { type: Sequelize.STRING, allowNull: false },
  lat:                 { type: Sequelize.DOUBLE, allowNull: false },
  lng:                 { type: Sequelize.DOUBLE, allowNull: false },
  caption:             { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  image_link:          { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  image_id:            { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  place_id:            { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  date_traveled:       { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MarkerReactions = <MyModelStatic> sequelize.define('travellrs_marker_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  marker_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Markers, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MarkerViewers = <MyModelStatic> sequelize.define('travellrs_marker_viewers', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  marker_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Markers, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MarkerPhotos = <MyModelStatic> sequelize.define('travellrs_marker_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  marker_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Markers, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MarkerVideos = <MyModelStatic> sequelize.define('travellrs_marker_videos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  marker_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Markers, key: 'id' } },
  video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MarkerAudios = <MyModelStatic> sequelize.define('travellrs_marker_audios', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  marker_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Markers, key: 'id' } },
  audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);



export const MarkerComments = <MyModelStatic> sequelize.define('travellrs_marker_comments', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  marker_id:           { type: Sequelize.INTEGER, allowNull: true, references: { model: Markers, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false },
  last_edited:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MarkerCommentReactions = <MyModelStatic> sequelize.define('travellrs_marker_comment_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: MarkerComments, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MarkerCommentPhotos = <MyModelStatic> sequelize.define('travellrs_marker_comment_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: MarkerComments, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MarkerCommentVideos = <MyModelStatic> sequelize.define('travellrs_marker_comment_videos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: MarkerComments, key: 'id' } },
  video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MarkerCommentAudios = <MyModelStatic> sequelize.define('travellrs_marker_comment_audios', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: MarkerComments, key: 'id' } },
  audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);



export const MarkerCommentReplies = <MyModelStatic> sequelize.define('travellrs_marker_comment_replies', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: MarkerComments, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false },
  last_edited:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MarkerCommentReplyReactions = <MyModelStatic> sequelize.define('travellrs_marker_comment_reply_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: MarkerCommentReplies, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MarkerCommentReplyPhotos = <MyModelStatic> sequelize.define('travellrs_marker_comment_reply_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: MarkerCommentReplies, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MarkerCommentReplyVideos = <MyModelStatic> sequelize.define('travellrs_marker_comment_reply_videos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: MarkerCommentReplies, key: 'id' } },
  video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MarkerCommentReplyAudios = <MyModelStatic> sequelize.define('travellrs_marker_comment_reply_audios', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: MarkerCommentReplies, key: 'id' } },
  audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);




Users.hasMany(Markers, { as: 'owner', foreignKey: 'owner_id', sourceKey: 'id' });
Markers.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });


Markers.hasMany(MarkerPhotos, { as: 'photos', foreignKey: 'marker_id', sourceKey: 'id' });
MarkerPhotos.belongsTo(Markers, { as: 'marker', foreignKey: 'marker_id', targetKey: 'id' });
Photos.hasMany(MarkerPhotos, { as: 'marker_photos', foreignKey: 'photo_id', sourceKey: 'id' });
MarkerPhotos.belongsTo(Photos, { as: 'photo_marker', foreignKey: 'photo_id', targetKey: 'id' });

Markers.hasMany(MarkerVideos, { as: 'videos', foreignKey: 'marker_id', sourceKey: 'id' });
MarkerVideos.belongsTo(Markers, { as: 'marker', foreignKey: 'marker_id', targetKey: 'id' });
Videos.hasMany(MarkerVideos, { as: 'marker_videos', foreignKey: 'video_id', sourceKey: 'id' });
MarkerVideos.belongsTo(Videos, { as: 'video_marker', foreignKey: 'video_id', targetKey: 'id' });

Markers.hasMany(MarkerAudios, { as: 'audios', foreignKey: 'marker_id', sourceKey: 'id' });
MarkerAudios.belongsTo(Markers, { as: 'marker', foreignKey: 'marker_id', targetKey: 'id' });
Audios.hasMany(MarkerAudios, { as: 'marker_audios', foreignKey: 'audio_id', sourceKey: 'id' });
MarkerAudios.belongsTo(Audios, { as: 'audio_marker', foreignKey: 'audio_id', targetKey: 'id' });