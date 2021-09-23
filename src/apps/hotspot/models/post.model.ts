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

export const Posts = <MyModelStaticGeneric<IPostModel>> sequelize.define('hotspot_posts', {
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

export const PostReactions = <MyModelStaticGeneric<IPostReactionModel>> sequelize.define('hotspot_post_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  post_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Posts, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const PostViewers = <MyModelStaticGeneric<IPostViewerModel>> sequelize.define('hotspot_post_viewers', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  post_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Posts, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const PostPhotos = <MyModelStatic> sequelize.define('hotspot_post_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  post_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Posts, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const PostVideos = <MyModelStatic> sequelize.define('hotspot_post_videos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  post_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Posts, key: 'id' } },
  video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const PostAudios = <MyModelStatic> sequelize.define('hotspot_post_audios', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  post_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Posts, key: 'id' } },
  audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);



export const PostComments = <MyModelStaticGeneric<IPostCommentModel>> sequelize.define('hotspot_post_comments', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  post_id:             { type: Sequelize.INTEGER, allowNull: true, references: { model: Posts, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false },
  last_edited:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const PostCommentReactions = <MyModelStaticGeneric<IPostCommentReactionModel>> sequelize.define('hotspot_post_comment_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: PostComments, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const PostCommentPhotos = <MyModelStatic> sequelize.define('hotspot_post_comment_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: PostComments, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const PostCommentVideos = <MyModelStatic> sequelize.define('hotspot_post_comment_videos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: PostComments, key: 'id' } },
  video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const PostCommentAudios = <MyModelStatic> sequelize.define('hotspot_post_comment_audios', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: PostComments, key: 'id' } },
  audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);



export const PostCommentReplies = <MyModelStaticGeneric<IPostCommentReplyModel>> sequelize.define('hotspot_post_comment_replies', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: PostComments, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false },
  last_edited:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const PostCommentReplyReactions = <MyModelStaticGeneric<IPostCommentReplyReactionModel>> sequelize.define('hotspot_post_comment_reply_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: PostCommentReplies, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const PostCommentReplyPhotos = <MyModelStatic> sequelize.define('hotspot_post_comment_reply_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: PostCommentReplies, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const PostCommentReplyVideos = <MyModelStatic> sequelize.define('hotspot_post_comment_reply_videos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: PostCommentReplies, key: 'id' } },
  video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const PostCommentReplyAudios = <MyModelStatic> sequelize.define('hotspot_post_comment_reply_audios', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: PostCommentReplies, key: 'id' } },
  audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);




Users.hasMany(Posts, { as: 'posts', foreignKey: 'owner_id', sourceKey: 'id' });
Posts.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Users.hasMany(PostComments, { as: 'user_hotspot_post_comments', foreignKey: 'owner_id', sourceKey: 'id' });
PostComments.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Users.hasMany(PostCommentReplies, { as: 'user_hotspot_post_comment_replies', foreignKey: 'owner_id', sourceKey: 'id' });
PostCommentReplies.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });

Users.hasMany(PostReactions, { as: 'post_reactions', foreignKey: 'owner_id', sourceKey: 'id' });
PostReactions.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Users.hasMany(PostCommentReactions, { as: 'user_hotspot_post_comment_reactions', foreignKey: 'owner_id', sourceKey: 'id' });
PostCommentReactions.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Users.hasMany(PostCommentReplyReactions, { as: 'user_hotspot_post_comment_reply_reactions', foreignKey: 'owner_id', sourceKey: 'id' });
PostCommentReplyReactions.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });

Posts.hasMany(PostViewers, { as: 'viewers', foreignKey: 'post_id', sourceKey: 'id' });
PostViewers.belongsTo(Posts, { as: 'post', foreignKey: 'post_id', targetKey: 'id' });
Users.hasMany(PostViewers, { as: 'viewings', foreignKey: 'user_id', sourceKey: 'id' });
PostViewers.belongsTo(Users, { as: 'viewer', foreignKey: 'user_id', targetKey: 'id' });

Posts.hasMany(PostPhotos, { as: 'photos', foreignKey: 'post_id', sourceKey: 'id' });
PostPhotos.belongsTo(Posts, { as: 'post', foreignKey: 'post_id', targetKey: 'id' });
Photos.hasMany(PostPhotos, { as: 'post_photos', foreignKey: 'photo_id', sourceKey: 'id' });
PostPhotos.belongsTo(Photos, { as: 'photo', foreignKey: 'photo_id', targetKey: 'id' });

Posts.hasMany(PostVideos, { as: 'post_videos', foreignKey: 'post_id', sourceKey: 'id' });
PostVideos.belongsTo(Posts, { as: 'post', foreignKey: 'post_id', targetKey: 'id' });
Videos.hasMany(PostVideos, { as: 'post_videos', foreignKey: 'video_id', sourceKey: 'id' });
PostVideos.belongsTo(Videos, { as: 'video_post', foreignKey: 'video_id', targetKey: 'id' });

Posts.hasMany(PostAudios, { as: 'post_audios', foreignKey: 'post_id', sourceKey: 'id' });
PostAudios.belongsTo(Posts, { as: 'post', foreignKey: 'post_id', targetKey: 'id' });
Photos.hasMany(PostAudios, { as: 'post_audios', foreignKey: 'audio_id', sourceKey: 'id' });
PostAudios.belongsTo(Photos, { as: 'audio_post', foreignKey: 'audio_id', targetKey: 'id' });

Posts.hasMany(PostComments, { as: 'post_comments', foreignKey: 'post_id', sourceKey: 'id' });
PostComments.belongsTo(Posts, { as: 'post', foreignKey: 'post_id', targetKey: 'id' });
Posts.hasMany(PostReactions, { as: 'reactions', foreignKey: 'post_id', sourceKey: 'id' });
PostReactions.belongsTo(Posts, { as: 'comment_post', foreignKey: 'post_id', targetKey: 'id' });

PostComments.hasMany(PostCommentPhotos, { as: 'hotspot_post_comment_photos', foreignKey: 'comment_id', sourceKey: 'id' });
PostCommentPhotos.belongsTo(PostComments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });
Photos.hasMany(PostCommentPhotos, { as: 'hotspot_post_comment_photos', foreignKey: 'photo_id', sourceKey: 'id' });
PostCommentPhotos.belongsTo(Photos, { as: 'photo_comment', foreignKey: 'photo_id', targetKey: 'id' });

PostComments.hasMany(PostCommentVideos, { as: 'hotspot_post_comment_videos', foreignKey: 'comment_id', sourceKey: 'id' });
PostCommentVideos.belongsTo(PostComments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });
Videos.hasMany(PostCommentVideos, { as: 'hotspot_post_comment_videos', foreignKey: 'video_id', sourceKey: 'id' });
PostCommentVideos.belongsTo(Videos, { as: 'video_comment', foreignKey: 'video_id', targetKey: 'id' });

PostComments.hasMany(PostCommentAudios, { as: 'hotspot_post_comment_audios', foreignKey: 'comment_id', sourceKey: 'id' });
PostCommentAudios.belongsTo(PostComments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });
Audios.hasMany(PostCommentAudios, { as: 'hotspot_post_comment_audios', foreignKey: 'audio_id', sourceKey: 'id' });
PostCommentAudios.belongsTo(Audios, { as: 'audio_comment', foreignKey: 'audio_id', targetKey: 'id' });

PostCommentReplies.hasMany(PostCommentReplyPhotos, { as: 'hotspot_post_reply_photos', foreignKey: 'reply_id', sourceKey: 'id' });
PostCommentReplyPhotos.belongsTo(PostCommentReplies, { as: 'reply', foreignKey: 'reply_id', targetKey: 'id' });
Photos.hasMany(PostCommentReplyPhotos, { as: 'hotspot_post_reply_photos', foreignKey: 'photo_id', sourceKey: 'id' });
PostCommentReplyPhotos.belongsTo(Photos, { as: 'photo_reply', foreignKey: 'photo_id', targetKey: 'id' });

PostCommentReplies.hasMany(PostCommentReplyVideos, { as: 'hotspot_post_reply_videos', foreignKey: 'reply_id', sourceKey: 'id' });
PostCommentReplyVideos.belongsTo(PostCommentReplies, { as: 'reply', foreignKey: 'reply_id', targetKey: 'id' });
Videos.hasMany(PostCommentReplyVideos, { as: 'hotspot_post_reply_videos', foreignKey: 'video_id', sourceKey: 'id' });
PostCommentReplyVideos.belongsTo(Videos, { as: 'video_reply', foreignKey: 'video_id', targetKey: 'id' });

PostCommentReplies.hasMany(PostCommentReplyAudios, { as: 'hotspot_post_reply_audios', foreignKey: 'reply_id', sourceKey: 'id' });
PostCommentReplyAudios.belongsTo(PostCommentReplies, { as: 'reply', foreignKey: 'reply_id', targetKey: 'id' });
Audios.hasMany(PostCommentReplyAudios, { as: 'hotspot_post_reply_audios', foreignKey: 'audio_id', sourceKey: 'id' });
PostCommentReplyAudios.belongsTo(Audios, { as: 'audio_reply', foreignKey: 'audio_id', targetKey: 'id' });

PostComments.hasMany(PostCommentReplies, { as: 'post_comment_replies', foreignKey: 'comment_id', sourceKey: 'id' });
PostCommentReplies.belongsTo(PostComments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });
PostComments.hasMany(PostCommentReactions, { as: 'post_comment_reactions', foreignKey: 'comment_id', sourceKey: 'id' });
PostCommentReactions.belongsTo(PostComments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });

PostCommentReplies.hasMany(PostCommentReplyReactions, { as: 'post_comment_reply_reactions', foreignKey: 'reply_id', sourceKey: 'id' });
PostCommentReplyReactions.belongsTo(PostCommentReplies, { as: 'reply', foreignKey: 'reply_id', targetKey: 'id' });
