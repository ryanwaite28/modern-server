import * as Sequelize from 'sequelize';

import {
  common_options,
  sequelizeInst as sequelize
} from '../../_common/models/_def.model';

import {
  MyModelStatic,
} from '../../_common/models/common.model-types';
import { Users } from '../../_common/models/user.model';
import { createCommonGenericModelSocialModels } from '../../_common/helpers/create-model-social-models.helper';
import { MODERN_APP_NAMES } from '../../_common/enums/common.enum';

export const Markers = <MyModelStatic> sequelize.define('travellrs_markers', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  location:            { type: Sequelize.STRING, allowNull: false },
  lat:                 { type: Sequelize.DOUBLE, allowNull: false },
  lng:                 { type: Sequelize.DOUBLE, allowNull: false },
  caption:             { type: Sequelize.STRING(250), allowNull: false, defaultValue: '' },
  image_link:          { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  image_id:            { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  place_id:            { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  date_traveled:       { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

const SocialModels = createCommonGenericModelSocialModels({
  micro_app: MODERN_APP_NAMES.TRAVELLRS,
  base_model_name: 'marker',
  base_model: Markers,
});

export const MarkerReactions = SocialModels.ModelReactions;
export const MarkerViewers = SocialModels.ModelViewers;
export const MarkerPhotos = SocialModels.ModelPhotos;
export const MarkerVideos = SocialModels.ModelVideos;
export const MarkerAudios = SocialModels.ModelAudios;

export const MarkerComments = SocialModels.ModelComments;
export const MarkerCommentReactions = SocialModels.ModelCommentReactions;
export const MarkerCommentPhotos = SocialModels.ModelCommentPhotos;
export const MarkerCommentVideos = SocialModels.ModelCommentVideos;
export const MarkerCommentAudios = SocialModels.ModelCommentAudios;

export const MarkerCommentReplies = SocialModels.ModelCommentReplies;
export const MarkerCommentReplyReactions = SocialModels.ModelCommentReplyReactions;
export const MarkerCommentReplyPhotos = SocialModels.ModelCommentReplyPhotos;
export const MarkerCommentReplyVideos = SocialModels.ModelCommentReplyVideos;
export const MarkerCommentReplyAudios = SocialModels.ModelCommentReplyAudios;



Users.hasMany(Markers, { as: 'travellrs_markers', foreignKey: 'owner_id', sourceKey: 'id' });
Markers.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
