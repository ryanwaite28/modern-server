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
  MyModelStatic,
  IMyModel,
} from '../../_common/models/common.model-types';



// create social models helper

export function createCommonGenericModelSocialModels(params: {
  micro_app: string,
  base_model: MyModelStatic | MyModelStaticGeneric<IMyModel>,
  base_model_name: string,
}) {
  const appName = params.micro_app.toLowerCase();

  const ModelReactions = <MyModelStatic> sequelize.define(`${appName}_${params.base_model_name}_reactions`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: `id` } },
    [params.base_model_name + '_id']:             { type: Sequelize.INTEGER, allowNull: false, references: { model: params.base_model, key: `id` } },
    reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
    reaction:            { type: Sequelize.STRING, allowNull: false },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  const ModelViewers = <MyModelStatic> sequelize.define(`${appName}_${params.base_model_name}_viewers`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: `id` } },
    user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: `id` } },
    [params.base_model_name + '_id']:             { type: Sequelize.INTEGER, allowNull: false, references: { model: params.base_model, key: `id` } },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  const ModelPhotos = <MyModelStatic> sequelize.define(`${appName}_${params.base_model_name}_photos`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    [params.base_model_name + '_id']:             { type: Sequelize.INTEGER, allowNull: false, references: { model: params.base_model, key: `id` } },
    photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: `id` } },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  const ModelVideos = <MyModelStatic> sequelize.define(`${appName}_${params.base_model_name}_videos`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    [params.base_model_name + '_id']:             { type: Sequelize.INTEGER, allowNull: false, references: { model: params.base_model, key: `id` } },
    video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: `id` } },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  const ModelAudios = <MyModelStatic> sequelize.define(`${appName}_${params.base_model_name}_audios`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    [params.base_model_name + '_id']:             { type: Sequelize.INTEGER, allowNull: false, references: { model: params.base_model, key: `id` } },
    audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: `id` } },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  
  
  const ModelComments = <MyModelStatic> sequelize.define(`${appName}_${params.base_model_name}_comments`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: `id` } },
    [params.base_model_name + '_id']:             { type: Sequelize.INTEGER, allowNull: true, references: { model: params.base_model, key: `id` } },
    body:                { type: Sequelize.TEXT, allowNull: false },
    last_edited:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  const ModelCommentReactions = <MyModelStatic> sequelize.define(`${appName}_${params.base_model_name}_comment_reactions`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: `id` } },
    comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ModelComments, key: `id` } },
    reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
    reaction:            { type: Sequelize.STRING, allowNull: false },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  const ModelCommentPhotos = <MyModelStatic> sequelize.define(`${appName}_${params.base_model_name}_comment_photos`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ModelComments, key: `id` } },
    photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: `id` } },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  const ModelCommentVideos = <MyModelStatic> sequelize.define(`${appName}_${params.base_model_name}_comment_videos`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ModelComments, key: `id` } },
    video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: `id` } },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  const ModelCommentAudios = <MyModelStatic> sequelize.define(`${appName}_${params.base_model_name}_comment_audios`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ModelComments, key: `id` } },
    audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: `id` } },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  
  
  const ModelCommentReplies = <MyModelStatic> sequelize.define(`${appName}_${params.base_model_name}_comment_replies`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: `id` } },
    comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ModelComments, key: `id` } },
    body:                { type: Sequelize.TEXT, allowNull: false },
    last_edited:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  const ModelCommentReplyReactions = <MyModelStatic> sequelize.define(`${appName}_${params.base_model_name}_comment_reply_reactions`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: `id` } },
    reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: ModelCommentReplies, key: `id` } },
    reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
    reaction:            { type: Sequelize.STRING, allowNull: false },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  const ModelCommentReplyPhotos = <MyModelStatic> sequelize.define(`${appName}_${params.base_model_name}_comment_reply_photos`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: ModelCommentReplies, key: `id` } },
    photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: `id` } },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  const ModelCommentReplyVideos = <MyModelStatic> sequelize.define(`${appName}_${params.base_model_name}_comment_reply_videos`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: ModelCommentReplies, key: `id` } },
    video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: `id` } },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  const ModelCommentReplyAudios = <MyModelStatic> sequelize.define(`${appName}_${params.base_model_name}_comment_reply_audios`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: ModelCommentReplies, key: `id` } },
    audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: `id` } },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);



  // relations

  // Users.hasMany(Models, { as: `${appName}_posts`, foreignKey: `owner_id`, sourceKey: `id` });
  // Models.belongsTo(Users, { as: `owner`, foreignKey: `owner_id`, targetKey: `id` });
  
  Users.hasMany(ModelComments, { as: `${appName}_${params.base_model_name}_comments`, foreignKey: `owner_id`, sourceKey: `id` });
  ModelComments.belongsTo(Users, { as: `owner`, foreignKey: `owner_id`, targetKey: `id` });
  Users.hasMany(ModelCommentReplies, { as: `user_${appName}_${params.base_model_name}_comment_replies`, foreignKey: `owner_id`, sourceKey: `id` });
  ModelCommentReplies.belongsTo(Users, { as: `owner`, foreignKey: `owner_id`, targetKey: `id` });

  Users.hasMany(ModelReactions, { as: `${params.base_model_name}_reactions`, foreignKey: `owner_id`, sourceKey: `id` });
  ModelReactions.belongsTo(Users, { as: `owner`, foreignKey: `owner_id`, targetKey: `id` });
  Users.hasMany(ModelCommentReactions, { as: `user_${appName}_${params.base_model_name}_comment_reactions`, foreignKey: `owner_id`, sourceKey: `id` });
  ModelCommentReactions.belongsTo(Users, { as: `owner`, foreignKey: `owner_id`, targetKey: `id` });
  Users.hasMany(ModelCommentReplyReactions, { as: `user_${appName}_${params.base_model_name}_comment_reply_reactions`, foreignKey: `owner_id`, sourceKey: `id` });
  ModelCommentReplyReactions.belongsTo(Users, { as: `owner`, foreignKey: `owner_id`, targetKey: `id` });

  params.base_model.hasMany(ModelViewers, { as: `viewers`, foreignKey: `${params.base_model_name}_id`, sourceKey: `id` });
  ModelViewers.belongsTo(params.base_model, { as: `post`, foreignKey: `${params.base_model_name}_id`, targetKey: `id` });
  Users.hasMany(ModelViewers, { as: `viewings`, foreignKey: `user_id`, sourceKey: `id` });
  ModelViewers.belongsTo(Users, { as: `viewer`, foreignKey: `user_id`, targetKey: `id` });

  params.base_model.hasMany(ModelPhotos, { as: `photos`, foreignKey: `${params.base_model_name}_id`, sourceKey: `id` });
  ModelPhotos.belongsTo(params.base_model, { as: `post`, foreignKey: `${params.base_model_name}_id`, targetKey: `id` });
  Photos.hasMany(ModelPhotos, { as: `${params.base_model_name}_photos`, foreignKey: `photo_id`, sourceKey: `id` });
  ModelPhotos.belongsTo(Photos, { as: `photo`, foreignKey: `photo_id`, targetKey: `id` });

  params.base_model.hasMany(ModelVideos, { as: `${params.base_model_name}_videos`, foreignKey: `${params.base_model_name}_id`, sourceKey: `id` });
  ModelVideos.belongsTo(params.base_model, { as: `post`, foreignKey: `${params.base_model_name}_id`, targetKey: `id` });
  Videos.hasMany(ModelVideos, { as: `${params.base_model_name}_videos`, foreignKey: `video_id`, sourceKey: `id` });
  ModelVideos.belongsTo(Videos, { as: `video_post`, foreignKey: `video_id`, targetKey: `id` });

  params.base_model.hasMany(ModelAudios, { as: `${params.base_model_name}_audios`, foreignKey: `${params.base_model_name}_id`, sourceKey: `id` });
  ModelAudios.belongsTo(params.base_model, { as: `post`, foreignKey: `${params.base_model_name}_id`, targetKey: `id` });
  Photos.hasMany(ModelAudios, { as: `${params.base_model_name}_audios`, foreignKey: `audio_id`, sourceKey: `id` });
  ModelAudios.belongsTo(Photos, { as: `audio_post`, foreignKey: `audio_id`, targetKey: `id` });

  params.base_model.hasMany(ModelComments, { as: `${params.base_model_name}_comments`, foreignKey: `${params.base_model_name}_id`, sourceKey: `id` });
  ModelComments.belongsTo(params.base_model, { as: `post`, foreignKey: `${params.base_model_name}_id`, targetKey: `id` });
  params.base_model.hasMany(ModelReactions, { as: `reactions`, foreignKey: `${params.base_model_name}_id`, sourceKey: `id` });
  ModelReactions.belongsTo(params.base_model, { as: `comment_post`, foreignKey: `${params.base_model_name}_id`, targetKey: `id` });

  ModelComments.hasMany(ModelCommentPhotos, { as: `${appName}_${params.base_model_name}_comment_photos`, foreignKey: `comment_id`, sourceKey: `id` });
  ModelCommentPhotos.belongsTo(ModelComments, { as: `comment`, foreignKey: `comment_id`, targetKey: `id` });
  Photos.hasMany(ModelCommentPhotos, { as: `${appName}_${params.base_model_name}_comment_photos`, foreignKey: `photo_id`, sourceKey: `id` });
  ModelCommentPhotos.belongsTo(Photos, { as: `photo_comment`, foreignKey: `photo_id`, targetKey: `id` });

  ModelComments.hasMany(ModelCommentVideos, { as: `${appName}_${params.base_model_name}_comment_videos`, foreignKey: `comment_id`, sourceKey: `id` });
  ModelCommentVideos.belongsTo(ModelComments, { as: `comment`, foreignKey: `comment_id`, targetKey: `id` });
  Videos.hasMany(ModelCommentVideos, { as: `${appName}_${params.base_model_name}_comment_videos`, foreignKey: `video_id`, sourceKey: `id` });
  ModelCommentVideos.belongsTo(Videos, { as: `video_comment`, foreignKey: `video_id`, targetKey: `id` });

  ModelComments.hasMany(ModelCommentAudios, { as: `${appName}_${params.base_model_name}_comment_audios`, foreignKey: `comment_id`, sourceKey: `id` });
  ModelCommentAudios.belongsTo(ModelComments, { as: `comment`, foreignKey: `comment_id`, targetKey: `id` });
  Audios.hasMany(ModelCommentAudios, { as: `${appName}_${params.base_model_name}_comment_audios`, foreignKey: `audio_id`, sourceKey: `id` });
  ModelCommentAudios.belongsTo(Audios, { as: `audio_comment`, foreignKey: `audio_id`, targetKey: `id` });

  ModelCommentReplies.hasMany(ModelCommentReplyPhotos, { as: `${appName}_${params.base_model_name}_reply_photos`, foreignKey: `reply_id`, sourceKey: `id` });
  ModelCommentReplyPhotos.belongsTo(ModelCommentReplies, { as: `reply`, foreignKey: `reply_id`, targetKey: `id` });
  Photos.hasMany(ModelCommentReplyPhotos, { as: `${appName}_${params.base_model_name}_reply_photos`, foreignKey: `photo_id`, sourceKey: `id` });
  ModelCommentReplyPhotos.belongsTo(Photos, { as: `photo_reply`, foreignKey: `photo_id`, targetKey: `id` });

  ModelCommentReplies.hasMany(ModelCommentReplyVideos, { as: `${appName}_${params.base_model_name}_reply_videos`, foreignKey: `reply_id`, sourceKey: `id` });
  ModelCommentReplyVideos.belongsTo(ModelCommentReplies, { as: `reply`, foreignKey: `reply_id`, targetKey: `id` });
  Videos.hasMany(ModelCommentReplyVideos, { as: `${appName}_${params.base_model_name}_reply_videos`, foreignKey: `video_id`, sourceKey: `id` });
  ModelCommentReplyVideos.belongsTo(Videos, { as: `video_reply`, foreignKey: `video_id`, targetKey: `id` });

  ModelCommentReplies.hasMany(ModelCommentReplyAudios, { as: `${appName}_${params.base_model_name}_reply_audios`, foreignKey: `reply_id`, sourceKey: `id` });
  ModelCommentReplyAudios.belongsTo(ModelCommentReplies, { as: `reply`, foreignKey: `reply_id`, targetKey: `id` });
  Audios.hasMany(ModelCommentReplyAudios, { as: `${appName}_${params.base_model_name}_reply_audios`, foreignKey: `audio_id`, sourceKey: `id` });
  ModelCommentReplyAudios.belongsTo(Audios, { as: `audio_reply`, foreignKey: `audio_id`, targetKey: `id` });

  ModelComments.hasMany(ModelCommentReplies, { as: `${params.base_model_name}_comment_replies`, foreignKey: `comment_id`, sourceKey: `id` });
  ModelCommentReplies.belongsTo(ModelComments, { as: `comment`, foreignKey: `comment_id`, targetKey: `id` });
  ModelComments.hasMany(ModelCommentReactions, { as: `${params.base_model_name}_comment_reactions`, foreignKey: `comment_id`, sourceKey: `id` });
  ModelCommentReactions.belongsTo(ModelComments, { as: `comment`, foreignKey: `comment_id`, targetKey: `id` });

  ModelCommentReplies.hasMany(ModelCommentReplyReactions, { as: `${params.base_model_name}_comment_reply_reactions`, foreignKey: `reply_id`, sourceKey: `id` });
  ModelCommentReplyReactions.belongsTo(ModelCommentReplies, { as: `reply`, foreignKey: `reply_id`, targetKey: `id` });


  return {
    ModelReactions,
    ModelViewers,
    ModelPhotos,
    ModelVideos,
    ModelAudios,
  
    ModelComments,
    ModelCommentReactions,
    ModelCommentPhotos,
    ModelCommentVideos,
    ModelCommentAudios,
  
    ModelCommentReplies,
    ModelCommentReplyReactions,
    ModelCommentReplyPhotos,
    ModelCommentReplyVideos,
    ModelCommentReplyAudios,
  };
}