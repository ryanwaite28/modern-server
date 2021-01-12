import * as Sequelize from 'sequelize';

import {
  common_options,
  sequelizeInst as sequelize
} from './_def.model';

import {
  IMyModel,
  IRecipeModel,
  MyModelStatic,
  MyModelStaticGeneric,
} from '../model-types';

import { Users } from './user.model';
import { Audios } from './audio.model';
import { Photos } from './photo.model';
import { Videos } from './video.model';

export const Recipes = <MyModelStaticGeneric<IRecipeModel>> sequelize.define('recipes', {
  user_id:                  { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  title:                       { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  description:                 { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  tags:                        { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  youtube_link:                { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  youtube_embed:               { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  cost:                        { type: Sequelize.INTEGER, allowNull: false },
  currency:                    { type: Sequelize.STRING, allowNull: false },
  image_link:                  { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  image_id:                    { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  date_created:                { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  visibility:                  { type: Sequelize.STRING(75), allowNull: false, defaultValue: '' },
  uuid:                        { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ChefKnownRecipes = <MyModelStaticGeneric<IRecipeModel>> sequelize.define('chef_known_recipes', {
  user_id:                     { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  recipe_id:                   { type: Sequelize.INTEGER, allowNull: false, references: { model: Recipes, key: 'id' } },
  date_created:                { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                        { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const RecipeIngredients = <MyModelStatic> sequelize.define('recipe_ingredients', {
  creator_id:                  { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  recipe_id:                   { type: Sequelize.INTEGER, allowNull: false, references: { model: Recipes, key: 'id' } },
  name:                        { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  notes:                       { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  tags:                        { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  image_link:                  { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  image_id:                    { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  date_created:                { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                        { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const RecipeInstructions = <MyModelStatic> sequelize.define('recipe_instructions', {
  creator_id:                  { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  recipe_id:                   { type: Sequelize.INTEGER, allowNull: false, references: { model: Recipes, key: 'id' } },
  body:                        { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  tags:                        { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  image_link:                  { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  image_id:                    { type: Sequelize.STRING(500), allowNull: true, defaultValue: '' },
  video_link:                  { type: Sequelize.STRING(500), allowNull: false },
  video_id:                    { type: Sequelize.STRING(500), allowNull: false },
  video_source_type:           { type: Sequelize.STRING, allowNull: false, defaultValue: false },
  audio_link:                  { type: Sequelize.STRING(500), allowNull: false },
  audio_id:                    { type: Sequelize.STRING(500), allowNull: false },
  audio_source_type:           { type: Sequelize.STRING, allowNull: false, defaultValue: false },
  date_created:                { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                        { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const RecipeReactions = <MyModelStatic> sequelize.define('recipe_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  recipe_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Recipes, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const RecipePhotos = <MyModelStatic> sequelize.define('recipe_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  recipe_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Recipes, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const RecipeVideos = <MyModelStatic> sequelize.define('recipe_videos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  recipe_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Recipes, key: 'id' } },
  video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const RecipeAudios = <MyModelStatic> sequelize.define('recipe_audios', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  recipe_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Recipes, key: 'id' } },
  audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);



export const RecipeComments = <MyModelStatic> sequelize.define('recipe_comments', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  recipe_id:           { type: Sequelize.INTEGER, allowNull: true, references: { model: Recipes, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false },
  last_edited:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const RecipeCommentReactions = <MyModelStatic> sequelize.define('recipe_comment_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: RecipeComments, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const RecipeCommentPhotos = <MyModelStatic> sequelize.define('recipe_comment_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: RecipeComments, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const RecipeCommentVideos = <MyModelStatic> sequelize.define('recipe_comment_videos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: RecipeComments, key: 'id' } },
  video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const RecipeCommentAudios = <MyModelStatic> sequelize.define('recipe_comment_audios', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: RecipeComments, key: 'id' } },
  audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);



export const RecipeCommentReplies = <MyModelStatic> sequelize.define('recipe_comment_replies', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: RecipeComments, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false },
  last_edited:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const RecipeCommentReplyReactions = <MyModelStatic> sequelize.define('recipe_comment_reply_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: RecipeCommentReplies, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const RecipeCommentReplyPhotos = <MyModelStatic> sequelize.define('recipe_comment_reply_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: RecipeCommentReplies, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const RecipeCommentReplyVideos = <MyModelStatic> sequelize.define('recipe_comment_reply_videos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: RecipeCommentReplies, key: 'id' } },
  video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const RecipeCommentReplyAudios = <MyModelStatic> sequelize.define('recipe_comment_reply_audios', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: RecipeCommentReplies, key: 'id' } },
  audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);