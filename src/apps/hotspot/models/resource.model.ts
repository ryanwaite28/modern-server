import * as Sequelize from 'sequelize';
import { Audios } from '../../_common/models/audio.model';
import { Photos } from '../../_common/models/photo.model';
import { Users } from '../../_common/models/user.model';
import { Videos } from '../../_common/models/video.model';
import {
  common_options,
  sequelizeInst as sequelize
} from '../../_common/models/_def.model';
import {
  MyModelStaticGeneric,
  IResourceModel,
  IMyModel,
} from '../../_common/models/common.model-types';
import { Cliques } from './clique.model';

export const HotspotResources = <MyModelStaticGeneric<IResourceModel>> sequelize.define('hotspot_resources', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  clique_id:           { type: Sequelize.INTEGER, allowNull: true, references: { model: Cliques, key: 'id' } },
  
  model_type:          { type: Sequelize.STRING, allowNull: true }, // determines if post belongs to a particular model; default (null) is user
  model_id:            { type: Sequelize.INTEGER, allowNull: true },
  resource_type:       { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  tags:                { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  title:               { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  resource:            { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  industry:            { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  link:                { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  icon_link:           { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  icon_id:             { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  description:         { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  visibility:          { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const HotspotResourceInterests = <MyModelStaticGeneric<IMyModel>> sequelize.define('hotspot_resource_interests', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  resource_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotResources, key: 'id' } },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const HotspotResourceReactions = <MyModelStaticGeneric<IMyModel>> sequelize.define('hotspot_resource_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  resource_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotResources, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const HotspotResourceComments = <MyModelStaticGeneric<IMyModel>> sequelize.define('hotspot_resource_comments', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  resource_id:         { type: Sequelize.INTEGER, allowNull: true, references: { model: HotspotResources, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false },
  last_edited:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const HotspotResourceCommentReactions = <MyModelStaticGeneric<IMyModel>> sequelize.define('hotspot_resource_comment_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotResourceComments, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const HotspotResourceCommentPhotos = <MyModelStaticGeneric<IMyModel>> sequelize.define('hotspot_resource_comment_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotResources, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const HotspotResourceCommentVideos = <MyModelStaticGeneric<IMyModel>> sequelize.define('hotspot_resource_comment_videos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotResources, key: 'id' } },
  video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const HotspotResourceCommentAudios = <MyModelStaticGeneric<IMyModel>> sequelize.define('hotspot_resource_comment_audios', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotResources, key: 'id' } },
  audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);



export const HotspotResourceCommentReplies = <MyModelStaticGeneric<IMyModel>> sequelize.define('hotspot_resource_comment_replies', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotResourceComments, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false },
  last_edited:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const HotspotResourceCommentReplyReactions = <MyModelStaticGeneric<IMyModel>> sequelize.define('hotspot_resource_comment_reply_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotResourceCommentReplies, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const HotspotResourceCommentReplyPhotos = <MyModelStaticGeneric<IMyModel>> sequelize.define('hotspot_resource_comment_reply_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotResources, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const HotspotResourceCommentReplyVideos = <MyModelStaticGeneric<IMyModel>> sequelize.define('hotspot_resource_comment_reply_videos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotResources, key: 'id' } },
  video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const HotspotResourceCommentReplyAudios = <MyModelStaticGeneric<IMyModel>> sequelize.define('hotspot_resource_comment_reply_audios', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotResources, key: 'id' } },
  audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);



Users.hasMany(HotspotResources, { as: 'hotspot_resources', foreignKey: 'owner_id', sourceKey: 'id' });
HotspotResources.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
HotspotResources.hasMany(HotspotResourceInterests, { as: 'interests', foreignKey: 'resource_id', sourceKey: 'id' });
HotspotResourceInterests.belongsTo(HotspotResources, { as: 'resource', foreignKey: 'resource_id', targetKey: 'id' });
Users.hasMany(HotspotResourceInterests, { as: 'hotspot_sresource_interests', foreignKey: 'user_id', sourceKey: 'id' });
HotspotResourceInterests.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });