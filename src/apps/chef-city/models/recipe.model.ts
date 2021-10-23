import * as Sequelize from 'sequelize';

import {
  common_options,
  sequelizeInst as sequelize
} from '../../_common/models/_def.model';

import {
  IMyModel,
  IRecipeModel,
  MyModelStatic,
  MyModelStaticGeneric,
} from '../../_common/models/common.model-types';

import { Users } from '../../_common/models/user.model';
import { createCommonGenericModelSocialModels } from '../../_common/helpers/create-model-social-models.helper';
import { MODERN_APP_NAMES } from '../../_common/enums/common.enum';

export const Recipes = <MyModelStaticGeneric<IRecipeModel>> sequelize.define('chefcity_recipes', {
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

export const ChefKnownRecipes = <MyModelStaticGeneric<IRecipeModel>> sequelize.define('chefcity_chef_known_recipes', {
  user_id:                     { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  recipe_id:                   { type: Sequelize.INTEGER, allowNull: false, references: { model: Recipes, key: 'id' } },
  date_created:                { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                        { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const RecipeIngredients = <MyModelStatic> sequelize.define('chefcity_recipe_ingredients', {
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

export const RecipeInstructions = <MyModelStatic> sequelize.define('chefcity_recipe_instructions', {
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



const SocialModels = createCommonGenericModelSocialModels({
  micro_app: MODERN_APP_NAMES.CHEFCITY,
  base_model_name: 'recipe',
  base_model: Recipes,
});

export const RecipeReactions = SocialModels.ModelReactions;
export const RecipeViewers = SocialModels.ModelViewers;
export const RecipePhotos = SocialModels.ModelPhotos;
export const RecipeVideos = SocialModels.ModelVideos;
export const RecipeAudios = SocialModels.ModelAudios;

export const RecipeComments = SocialModels.ModelComments;
export const RecipeCommentReactions = SocialModels.ModelCommentReactions;
export const RecipeCommentPhotos = SocialModels.ModelCommentPhotos;
export const RecipeCommentVideos = SocialModels.ModelCommentVideos;
export const RecipeCommentAudios = SocialModels.ModelCommentAudios;

export const RecipeCommentReplies = SocialModels.ModelCommentReplies;
export const RecipeCommentReplyReactions = SocialModels.ModelCommentReplyReactions;
export const RecipeCommentReplyPhotos = SocialModels.ModelCommentReplyPhotos;
export const RecipeCommentReplyVideos = SocialModels.ModelCommentReplyVideos;
export const RecipeCommentReplyAudios = SocialModels.ModelCommentReplyAudios;



Users.hasMany(Recipes, { as: 'chefcity_recipes', foreignKey: 'owner_id', sourceKey: 'id' });
Recipes.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });