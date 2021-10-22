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
import { MODERN_APP_NAMES } from '../enums/common.enum';


export interface ISocialModelsConstructed {
  ModelReactions: MyModelStatic,
  ModelViewers: MyModelStatic,
  ModelPhotos: MyModelStatic,
  ModelVideos: MyModelStatic,
  ModelAudios: MyModelStatic,

  ModelComments: MyModelStatic,
  ModelCommentReactions: MyModelStatic,
  ModelCommentPhotos: MyModelStatic,
  ModelCommentVideos: MyModelStatic,
  ModelCommentAudios: MyModelStatic,

  ModelCommentReplies: MyModelStatic,
  ModelCommentReplyReactions: MyModelStatic,
  ModelCommentReplyPhotos: MyModelStatic,
  ModelCommentReplyVideos: MyModelStatic,
  ModelCommentReplyAudios: MyModelStatic,
}


// create social models helper

export function createCommonGenericModelSocialModels(params: {
  micro_app: MODERN_APP_NAMES | string,
  base_model: MyModelStatic | MyModelStaticGeneric<IMyModel>,
  base_model_name: string,
  ignoreRelations?: boolean,
}): ISocialModelsConstructed {
  const appName = params.micro_app.toLowerCase().replace(/\_/gi, '');
  const model_id_field = params.base_model_name + '_id';

  const table_model_prefix = `${appName}_${params.base_model_name}`;

  const ModelReactions = <MyModelStatic> sequelize.define(`${table_model_prefix}_reactions`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: `id` } },
    [model_id_field]:    { type: Sequelize.INTEGER, allowNull: false, references: { model: params.base_model, key: `id` } },
    reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
    reaction:            { type: Sequelize.STRING, allowNull: false },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  const ModelViewers = <MyModelStatic> sequelize.define(`${table_model_prefix}_viewers`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: `id` } },
    user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: `id` } },
    [model_id_field]:    { type: Sequelize.INTEGER, allowNull: false, references: { model: params.base_model, key: `id` } },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  const ModelPhotos = <MyModelStatic> sequelize.define(`${table_model_prefix}_photos`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    [model_id_field]:    { type: Sequelize.INTEGER, allowNull: false, references: { model: params.base_model, key: `id` } },
    photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: `id` } },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  const ModelVideos = <MyModelStatic> sequelize.define(`${table_model_prefix}_videos`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    [model_id_field]:    { type: Sequelize.INTEGER, allowNull: false, references: { model: params.base_model, key: `id` } },
    video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: `id` } },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  const ModelAudios = <MyModelStatic> sequelize.define(`${table_model_prefix}_audios`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    [model_id_field]:    { type: Sequelize.INTEGER, allowNull: false, references: { model: params.base_model, key: `id` } },
    audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: `id` } },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  
  
  const ModelComments = <MyModelStatic> sequelize.define(`${table_model_prefix}_comments`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: `id` } },
    [model_id_field]:    { type: Sequelize.INTEGER, allowNull: false, references: { model: params.base_model, key: `id` } },
    body:                { type: Sequelize.TEXT, allowNull: false },
    last_edited:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  const ModelCommentReactions = <MyModelStatic> sequelize.define(`${table_model_prefix}_comment_reactions`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: `id` } },
    comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ModelComments, key: `id` } },
    reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
    reaction:            { type: Sequelize.STRING, allowNull: false },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  const ModelCommentPhotos = <MyModelStatic> sequelize.define(`${table_model_prefix}_comment_photos`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ModelComments, key: `id` } },
    photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: `id` } },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  const ModelCommentVideos = <MyModelStatic> sequelize.define(`${table_model_prefix}_comment_videos`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ModelComments, key: `id` } },
    video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: `id` } },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  const ModelCommentAudios = <MyModelStatic> sequelize.define(`${table_model_prefix}_comment_audios`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ModelComments, key: `id` } },
    audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: `id` } },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  
  
  const ModelCommentReplies = <MyModelStatic> sequelize.define(`${table_model_prefix}_comment_replies`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: `id` } },
    comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ModelComments, key: `id` } },
    body:                { type: Sequelize.TEXT, allowNull: false },
    last_edited:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  const ModelCommentReplyReactions = <MyModelStatic> sequelize.define(`${table_model_prefix}_comment_reply_reactions`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: `id` } },
    reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: ModelCommentReplies, key: `id` } },
    reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
    reaction:            { type: Sequelize.STRING, allowNull: false },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  const ModelCommentReplyPhotos = <MyModelStatic> sequelize.define(`${table_model_prefix}_comment_reply_photos`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: ModelCommentReplies, key: `id` } },
    photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: `id` } },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  const ModelCommentReplyVideos = <MyModelStatic> sequelize.define(`${table_model_prefix}_comment_reply_videos`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: ModelCommentReplies, key: `id` } },
    video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: `id` } },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);
  
  const ModelCommentReplyAudios = <MyModelStatic> sequelize.define(`${table_model_prefix}_comment_reply_audios`, {
    id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: ModelCommentReplies, key: `id` } },
    audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: `id` } },
    date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  }, common_options);



  // relations

  if (!params.ignoreRelations) {
    Users.hasMany(ModelComments, { as: `${table_model_prefix}_comments`, foreignKey: `owner_id`, sourceKey: `id` });
    ModelComments.belongsTo(Users, { as: `owner`, foreignKey: `owner_id`, targetKey: `id` });
    Users.hasMany(ModelCommentReplies, { as: `${table_model_prefix}_comment_replies`, foreignKey: `owner_id`, sourceKey: `id` });
    ModelCommentReplies.belongsTo(Users, { as: `owner`, foreignKey: `owner_id`, targetKey: `id` });
  
    Users.hasMany(ModelReactions, { as: `${table_model_prefix}_reactions`, foreignKey: `owner_id`, sourceKey: `id` });
    ModelReactions.belongsTo(Users, { as: `owner`, foreignKey: `owner_id`, targetKey: `id` });
    Users.hasMany(ModelCommentReactions, { as: `${table_model_prefix}_comment_reactions`, foreignKey: `owner_id`, sourceKey: `id` });
    ModelCommentReactions.belongsTo(Users, { as: `owner`, foreignKey: `owner_id`, targetKey: `id` });
    Users.hasMany(ModelCommentReplyReactions, { as: `${table_model_prefix}_comment_reply_reactions`, foreignKey: `owner_id`, sourceKey: `id` });
    ModelCommentReplyReactions.belongsTo(Users, { as: `owner`, foreignKey: `owner_id`, targetKey: `id` });
  
    params.base_model.hasMany(ModelViewers, { as: `${params.base_model_name}_viewers`, foreignKey: `${params.base_model_name}_id`, sourceKey: `id` });
    ModelViewers.belongsTo(params.base_model, { as: params.base_model_name, foreignKey: `${params.base_model_name}_id`, targetKey: `id` });
    Users.hasMany(ModelViewers, { as: `${table_model_prefix}_viewings`, foreignKey: `user_id`, sourceKey: `id` });
    ModelViewers.belongsTo(Users, { as: `viewer`, foreignKey: `user_id`, targetKey: `id` });
  
    params.base_model.hasMany(ModelPhotos, { as: `${params.base_model_name}_photos`, foreignKey: `${params.base_model_name}_id`, sourceKey: `id` });
    ModelPhotos.belongsTo(params.base_model, { as: params.base_model_name, foreignKey: `${params.base_model_name}_id`, targetKey: `id` });
    Photos.hasMany(ModelPhotos, { as: `${params.base_model_name}_photos`, foreignKey: `photo_id`, sourceKey: `id` });
    ModelPhotos.belongsTo(Photos, { as: `photo_${params.base_model_name}`, foreignKey: `photo_id`, targetKey: `id` });
  
    params.base_model.hasMany(ModelVideos, { as: `${params.base_model_name}_videos`, foreignKey: `${params.base_model_name}_id`, sourceKey: `id` });
    ModelVideos.belongsTo(params.base_model, { as: params.base_model_name, foreignKey: `${params.base_model_name}_id`, targetKey: `id` });
    Videos.hasMany(ModelVideos, { as: `${params.base_model_name}_videos`, foreignKey: `video_id`, sourceKey: `id` });
    ModelVideos.belongsTo(Videos, { as: `video_${params.base_model_name}`, foreignKey: `video_id`, targetKey: `id` });
  
    params.base_model.hasMany(ModelAudios, { as: `${params.base_model_name}_audios`, foreignKey: `${params.base_model_name}_id`, sourceKey: `id` });
    ModelAudios.belongsTo(params.base_model, { as: params.base_model_name, foreignKey: `${params.base_model_name}_id`, targetKey: `id` });
    Photos.hasMany(ModelAudios, { as: `${params.base_model_name}_audios`, foreignKey: `audio_id`, sourceKey: `id` });
    ModelAudios.belongsTo(Photos, { as: `audio_${params.base_model_name}`, foreignKey: `audio_id`, targetKey: `id` });
  
    params.base_model.hasMany(ModelComments, { as: `${params.base_model_name}_comments`, foreignKey: `${params.base_model_name}_id`, sourceKey: `id` });
    ModelComments.belongsTo(params.base_model, { as: params.base_model_name, foreignKey: `${params.base_model_name}_id`, targetKey: `id` });
    params.base_model.hasMany(ModelReactions, { as: `${params.base_model_name}_reactions`, foreignKey: `${params.base_model_name}_id`, sourceKey: `id` });
    ModelReactions.belongsTo(params.base_model, { as: `comment_${params.base_model_name}`, foreignKey: `${params.base_model_name}_id`, targetKey: `id` });
  
    ModelComments.hasMany(ModelCommentPhotos, { as: `${params.base_model_name}_comment_photos`, foreignKey: `comment_id`, sourceKey: `id` });
    ModelCommentPhotos.belongsTo(ModelComments, { as: `comment`, foreignKey: `comment_id`, targetKey: `id` });
    Photos.hasMany(ModelCommentPhotos, { as: `${table_model_prefix}_comment_photos`, foreignKey: `photo_id`, sourceKey: `id` });
    ModelCommentPhotos.belongsTo(Photos, { as: `photo_comment`, foreignKey: `photo_id`, targetKey: `id` });
  
    ModelComments.hasMany(ModelCommentVideos, { as: `${params.base_model_name}_comment_videos`, foreignKey: `comment_id`, sourceKey: `id` });
    ModelCommentVideos.belongsTo(ModelComments, { as: `comment`, foreignKey: `comment_id`, targetKey: `id` });
    Videos.hasMany(ModelCommentVideos, { as: `${table_model_prefix}_comment_videos`, foreignKey: `video_id`, sourceKey: `id` });
    ModelCommentVideos.belongsTo(Videos, { as: `video_comment`, foreignKey: `video_id`, targetKey: `id` });
  
    ModelComments.hasMany(ModelCommentAudios, { as: `${params.base_model_name}_comment_audios`, foreignKey: `comment_id`, sourceKey: `id` });
    ModelCommentAudios.belongsTo(ModelComments, { as: `comment`, foreignKey: `comment_id`, targetKey: `id` });
    Audios.hasMany(ModelCommentAudios, { as: `${table_model_prefix}_comment_audios`, foreignKey: `audio_id`, sourceKey: `id` });
    ModelCommentAudios.belongsTo(Audios, { as: `audio_comment`, foreignKey: `audio_id`, targetKey: `id` });
  
    ModelCommentReplies.hasMany(ModelCommentReplyPhotos, { as: `${params.base_model_name}_reply_photos`, foreignKey: `reply_id`, sourceKey: `id` });
    ModelCommentReplyPhotos.belongsTo(ModelCommentReplies, { as: `reply`, foreignKey: `reply_id`, targetKey: `id` });
    Photos.hasMany(ModelCommentReplyPhotos, { as: `${table_model_prefix}_reply_photos`, foreignKey: `photo_id`, sourceKey: `id` });
    ModelCommentReplyPhotos.belongsTo(Photos, { as: `photo_reply`, foreignKey: `photo_id`, targetKey: `id` });
  
    ModelCommentReplies.hasMany(ModelCommentReplyVideos, { as: `${params.base_model_name}_reply_videos`, foreignKey: `reply_id`, sourceKey: `id` });
    ModelCommentReplyVideos.belongsTo(ModelCommentReplies, { as: `reply`, foreignKey: `reply_id`, targetKey: `id` });
    Videos.hasMany(ModelCommentReplyVideos, { as: `${table_model_prefix}_reply_videos`, foreignKey: `video_id`, sourceKey: `id` });
    ModelCommentReplyVideos.belongsTo(Videos, { as: `video_reply`, foreignKey: `video_id`, targetKey: `id` });
  
    ModelCommentReplies.hasMany(ModelCommentReplyAudios, { as: `${params.base_model_name}_reply_audios`, foreignKey: `reply_id`, sourceKey: `id` });
    ModelCommentReplyAudios.belongsTo(ModelCommentReplies, { as: `reply`, foreignKey: `reply_id`, targetKey: `id` });
    Audios.hasMany(ModelCommentReplyAudios, { as: `${table_model_prefix}_reply_audios`, foreignKey: `audio_id`, sourceKey: `id` });
    ModelCommentReplyAudios.belongsTo(Audios, { as: `audio_reply`, foreignKey: `audio_id`, targetKey: `id` });
  
    ModelComments.hasMany(ModelCommentReplies, { as: `${params.base_model_name}_comment_replies`, foreignKey: `comment_id`, sourceKey: `id` });
    ModelCommentReplies.belongsTo(ModelComments, { as: `comment`, foreignKey: `comment_id`, targetKey: `id` });
    ModelComments.hasMany(ModelCommentReactions, { as: `${params.base_model_name}_comment_reactions`, foreignKey: `comment_id`, sourceKey: `id` });
    ModelCommentReactions.belongsTo(ModelComments, { as: `comment`, foreignKey: `comment_id`, targetKey: `id` });
  
    ModelCommentReplies.hasMany(ModelCommentReplyReactions, { as: `${params.base_model_name}_comment_reply_reactions`, foreignKey: `reply_id`, sourceKey: `id` });
    ModelCommentReplyReactions.belongsTo(ModelCommentReplies, { as: `reply`, foreignKey: `reply_id`, targetKey: `id` });
  }
  


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