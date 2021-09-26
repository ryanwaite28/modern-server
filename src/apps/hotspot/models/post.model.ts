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
  IPostModel,
  IPostViewerModel,
  IMyModel,
  IPostCommentModel,
  IPostCommentReplyModel,
  IPostReactionModel,
  IPostCommentReactionModel,
  IPostCommentReplyReactionModel,
  MyModelStatic,
} from '../../_common/models/common.model-types';

export const HotspotPosts = <MyModelStaticGeneric<IPostModel>> sequelize.define('hotspot_posts', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  title:               { type: Sequelize.STRING(250), allowNull: false, defaultValue: '' },
  body:                { type: Sequelize.TEXT, allowNull: false },
  tags:                { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  is_explicit:         { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  is_private:          { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  visibility:          { type: Sequelize.STRING(75), allowNull: false, defaultValue: '' },
  last_edited:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const HotspotPostReactions = <MyModelStaticGeneric<IPostReactionModel>> sequelize.define('hotspot_post_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  post_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotPosts, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const HotspotPostViewers = <MyModelStaticGeneric<IPostViewerModel>> sequelize.define('hotspot_post_viewers', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  post_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotPosts, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const HotspotPostPhotos = <MyModelStatic> sequelize.define('hotspot_post_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  post_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotPosts, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const HotspotPostVideos = <MyModelStatic> sequelize.define('hotspot_post_videos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  post_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotPosts, key: 'id' } },
  video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const HotspotPostAudios = <MyModelStatic> sequelize.define('hotspot_post_audios', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  post_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotPosts, key: 'id' } },
  audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);



export const HotspotPostComments = <MyModelStaticGeneric<IPostCommentModel>> sequelize.define('hotspot_post_comments', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  post_id:             { type: Sequelize.INTEGER, allowNull: true, references: { model: HotspotPosts, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false },
  last_edited:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const HotspotPostCommentReactions = <MyModelStaticGeneric<IPostCommentReactionModel>> sequelize.define('hotspot_post_comment_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotPostComments, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const HotspotPostCommentPhotos = <MyModelStatic> sequelize.define('hotspot_post_comment_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotPostComments, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const HotspotPostCommentVideos = <MyModelStatic> sequelize.define('hotspot_post_comment_videos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotPostComments, key: 'id' } },
  video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const HotspotPostCommentAudios = <MyModelStatic> sequelize.define('hotspot_post_comment_audios', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotPostComments, key: 'id' } },
  audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);



export const HotspotPostCommentReplies = <MyModelStaticGeneric<IPostCommentReplyModel>> sequelize.define('hotspot_post_comment_replies', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotPostComments, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false },
  last_edited:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const HotspotPostCommentReplyReactions = <MyModelStaticGeneric<IPostCommentReplyReactionModel>> sequelize.define('hotspot_post_comment_reply_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotPostCommentReplies, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const HotspotPostCommentReplyPhotos = <MyModelStatic> sequelize.define('hotspot_post_comment_reply_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotPostCommentReplies, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const HotspotPostCommentReplyVideos = <MyModelStatic> sequelize.define('hotspot_post_comment_reply_videos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotPostCommentReplies, key: 'id' } },
  video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const HotspotPostCommentReplyAudios = <MyModelStatic> sequelize.define('hotspot_post_comment_reply_audios', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotPostCommentReplies, key: 'id' } },
  audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);




Users.hasMany(HotspotPosts, { as: 'hotspot_posts', foreignKey: 'owner_id', sourceKey: 'id' });
HotspotPosts.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Users.hasMany(HotspotPostComments, { as: 'hotspot_post_comments', foreignKey: 'owner_id', sourceKey: 'id' });
HotspotPostComments.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Users.hasMany(HotspotPostCommentReplies, { as: 'user_hotspot_post_comment_replies', foreignKey: 'owner_id', sourceKey: 'id' });
HotspotPostCommentReplies.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });

Users.hasMany(HotspotPostReactions, { as: 'post_reactions', foreignKey: 'owner_id', sourceKey: 'id' });
HotspotPostReactions.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Users.hasMany(HotspotPostCommentReactions, { as: 'user_hotspot_post_comment_reactions', foreignKey: 'owner_id', sourceKey: 'id' });
HotspotPostCommentReactions.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Users.hasMany(HotspotPostCommentReplyReactions, { as: 'user_hotspot_post_comment_reply_reactions', foreignKey: 'owner_id', sourceKey: 'id' });
HotspotPostCommentReplyReactions.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });

HotspotPosts.hasMany(HotspotPostViewers, { as: 'viewers', foreignKey: 'post_id', sourceKey: 'id' });
HotspotPostViewers.belongsTo(HotspotPosts, { as: 'post', foreignKey: 'post_id', targetKey: 'id' });
Users.hasMany(HotspotPostViewers, { as: 'viewings', foreignKey: 'user_id', sourceKey: 'id' });
HotspotPostViewers.belongsTo(Users, { as: 'viewer', foreignKey: 'user_id', targetKey: 'id' });

HotspotPosts.hasMany(HotspotPostPhotos, { as: 'photos', foreignKey: 'post_id', sourceKey: 'id' });
HotspotPostPhotos.belongsTo(HotspotPosts, { as: 'post', foreignKey: 'post_id', targetKey: 'id' });
Photos.hasMany(HotspotPostPhotos, { as: 'post_photos', foreignKey: 'photo_id', sourceKey: 'id' });
HotspotPostPhotos.belongsTo(Photos, { as: 'photo', foreignKey: 'photo_id', targetKey: 'id' });

HotspotPosts.hasMany(HotspotPostVideos, { as: 'post_videos', foreignKey: 'post_id', sourceKey: 'id' });
HotspotPostVideos.belongsTo(HotspotPosts, { as: 'post', foreignKey: 'post_id', targetKey: 'id' });
Videos.hasMany(HotspotPostVideos, { as: 'post_videos', foreignKey: 'video_id', sourceKey: 'id' });
HotspotPostVideos.belongsTo(Videos, { as: 'video_post', foreignKey: 'video_id', targetKey: 'id' });

HotspotPosts.hasMany(HotspotPostAudios, { as: 'post_audios', foreignKey: 'post_id', sourceKey: 'id' });
HotspotPostAudios.belongsTo(HotspotPosts, { as: 'post', foreignKey: 'post_id', targetKey: 'id' });
Photos.hasMany(HotspotPostAudios, { as: 'post_audios', foreignKey: 'audio_id', sourceKey: 'id' });
HotspotPostAudios.belongsTo(Photos, { as: 'audio_post', foreignKey: 'audio_id', targetKey: 'id' });

HotspotPosts.hasMany(HotspotPostComments, { as: 'post_comments', foreignKey: 'post_id', sourceKey: 'id' });
HotspotPostComments.belongsTo(HotspotPosts, { as: 'post', foreignKey: 'post_id', targetKey: 'id' });
HotspotPosts.hasMany(HotspotPostReactions, { as: 'reactions', foreignKey: 'post_id', sourceKey: 'id' });
HotspotPostReactions.belongsTo(HotspotPosts, { as: 'comment_post', foreignKey: 'post_id', targetKey: 'id' });

HotspotPostComments.hasMany(HotspotPostCommentPhotos, { as: 'hotspot_post_comment_photos', foreignKey: 'comment_id', sourceKey: 'id' });
HotspotPostCommentPhotos.belongsTo(HotspotPostComments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });
Photos.hasMany(HotspotPostCommentPhotos, { as: 'hotspot_post_comment_photos', foreignKey: 'photo_id', sourceKey: 'id' });
HotspotPostCommentPhotos.belongsTo(Photos, { as: 'photo_comment', foreignKey: 'photo_id', targetKey: 'id' });

HotspotPostComments.hasMany(HotspotPostCommentVideos, { as: 'hotspot_post_comment_videos', foreignKey: 'comment_id', sourceKey: 'id' });
HotspotPostCommentVideos.belongsTo(HotspotPostComments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });
Videos.hasMany(HotspotPostCommentVideos, { as: 'hotspot_post_comment_videos', foreignKey: 'video_id', sourceKey: 'id' });
HotspotPostCommentVideos.belongsTo(Videos, { as: 'video_comment', foreignKey: 'video_id', targetKey: 'id' });

HotspotPostComments.hasMany(HotspotPostCommentAudios, { as: 'hotspot_post_comment_audios', foreignKey: 'comment_id', sourceKey: 'id' });
HotspotPostCommentAudios.belongsTo(HotspotPostComments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });
Audios.hasMany(HotspotPostCommentAudios, { as: 'hotspot_post_comment_audios', foreignKey: 'audio_id', sourceKey: 'id' });
HotspotPostCommentAudios.belongsTo(Audios, { as: 'audio_comment', foreignKey: 'audio_id', targetKey: 'id' });

HotspotPostCommentReplies.hasMany(HotspotPostCommentReplyPhotos, { as: 'hotspot_post_reply_photos', foreignKey: 'reply_id', sourceKey: 'id' });
HotspotPostCommentReplyPhotos.belongsTo(HotspotPostCommentReplies, { as: 'reply', foreignKey: 'reply_id', targetKey: 'id' });
Photos.hasMany(HotspotPostCommentReplyPhotos, { as: 'hotspot_post_reply_photos', foreignKey: 'photo_id', sourceKey: 'id' });
HotspotPostCommentReplyPhotos.belongsTo(Photos, { as: 'photo_reply', foreignKey: 'photo_id', targetKey: 'id' });

HotspotPostCommentReplies.hasMany(HotspotPostCommentReplyVideos, { as: 'hotspot_post_reply_videos', foreignKey: 'reply_id', sourceKey: 'id' });
HotspotPostCommentReplyVideos.belongsTo(HotspotPostCommentReplies, { as: 'reply', foreignKey: 'reply_id', targetKey: 'id' });
Videos.hasMany(HotspotPostCommentReplyVideos, { as: 'hotspot_post_reply_videos', foreignKey: 'video_id', sourceKey: 'id' });
HotspotPostCommentReplyVideos.belongsTo(Videos, { as: 'video_reply', foreignKey: 'video_id', targetKey: 'id' });

HotspotPostCommentReplies.hasMany(HotspotPostCommentReplyAudios, { as: 'hotspot_post_reply_audios', foreignKey: 'reply_id', sourceKey: 'id' });
HotspotPostCommentReplyAudios.belongsTo(HotspotPostCommentReplies, { as: 'reply', foreignKey: 'reply_id', targetKey: 'id' });
Audios.hasMany(HotspotPostCommentReplyAudios, { as: 'hotspot_post_reply_audios', foreignKey: 'audio_id', sourceKey: 'id' });
HotspotPostCommentReplyAudios.belongsTo(Audios, { as: 'audio_reply', foreignKey: 'audio_id', targetKey: 'id' });

HotspotPostComments.hasMany(HotspotPostCommentReplies, { as: 'post_comment_replies', foreignKey: 'comment_id', sourceKey: 'id' });
HotspotPostCommentReplies.belongsTo(HotspotPostComments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });
HotspotPostComments.hasMany(HotspotPostCommentReactions, { as: 'post_comment_reactions', foreignKey: 'comment_id', sourceKey: 'id' });
HotspotPostCommentReactions.belongsTo(HotspotPostComments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });

HotspotPostCommentReplies.hasMany(HotspotPostCommentReplyReactions, { as: 'post_comment_reply_reactions', foreignKey: 'reply_id', sourceKey: 'id' });
HotspotPostCommentReplyReactions.belongsTo(HotspotPostCommentReplies, { as: 'reply', foreignKey: 'reply_id', targetKey: 'id' });
