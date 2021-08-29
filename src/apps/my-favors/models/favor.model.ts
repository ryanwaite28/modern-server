import * as Sequelize from 'sequelize';

import {
  common_options,
  sequelizeInst as sequelize
} from '../../_common/models/_def.model';

import {
  MyModelStaticGeneric,
  MyModelStatic,
} from '../../_common/models/common.model-types';

import { Users } from '../../_common/models/user.model';
import { Photos } from '../../_common/models/photo.model';
import { Videos } from '../../_common/models/video.model';

/*
export const null = <MyModelStatic> sequelize.define('app_nnull', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
}, common_options);
*/



export const Favors = <MyModelStatic> sequelize.define('myfavors_favors', {
  id:              { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:        { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  title:           { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  desc:            { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  location:        { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  category:        { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  payout:          { type: Sequelize.INTEGER, allowNull: false },
  helpers_needed:  { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
  fulfilled:       { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  media_type:      { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  media_link:      { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  date_needed:     { type: Sequelize.DATE, allowNull: false },
  date_created:    { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:            { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const FavorPhotos = <MyModelStatic> sequelize.define('myfavors_post_comment_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  favor_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Favors, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const FavorVideos = <MyModelStatic> sequelize.define('myfavors_post_comment_videos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  favor_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Favors, key: 'id' } },
  video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);



export const FavorHelpers = <MyModelStatic> sequelize.define('myfavors_favor_helpers', {
  id:              { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  favor_id:        { type: Sequelize.INTEGER, allowNull: false, references: { model: Favors, key: 'id' } },
  date_created:    { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  helped:          { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  uuid:            { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const FavorRequests = <MyModelStatic> sequelize.define('myfavors_favor_requests', {
  id:              { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  favor_id:        { type: Sequelize.INTEGER, allowNull: false, references: { model: Favors, key: 'id' } },
  date_created:    { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  message:         { type: Sequelize.STRING, allowNull: true },
  uuid:            { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const FavorDisputes = <MyModelStatic> sequelize.define('myfavors_favor_disputes', {
  id:              { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  creator_id:      { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  user_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  favor_id:        { type: Sequelize.INTEGER, allowNull: false, references: { model: Favors, key: 'id' } },
  date_created:    { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  title:           { type: Sequelize.STRING, allowNull: true },
  uuid:            { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const FavorDisputeLogs = <MyModelStatic> sequelize.define('myfavors_favor_dispute_logs', {
  id:              { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  creator_id:      { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  user_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  favor_id:        { type: Sequelize.INTEGER, allowNull: false, references: { model: Favors, key: 'id' } },
  date_created:    { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:            { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);
