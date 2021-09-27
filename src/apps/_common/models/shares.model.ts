import * as Sequelize from 'sequelize';

import {
  common_options,
  sequelizeInst as sequelize
} from './_def.model';

import {
  MyModelStaticGeneric,
  IMyModel,
  MyModelStatic,
} from './common.model-types';

import {
  Users
} from './user.model';
import { Audios } from './audio.model';
import { Photos } from './photo.model';
import { Videos } from './video.model';
import { Links } from './link.model';
import { Recipes } from '../../chef-city/models/recipe.model';
import { Notices } from '../../hotspot/models/notice.model';
import { HotspotPosts } from '../../hotspot/models/post.model';

export const SharedPhotos = <MyModelStatic> sequelize.define('common_shared_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const SharedVideos = <MyModelStatic> sequelize.define('common_shared_videos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const SharedAudios = <MyModelStatic> sequelize.define('common_shared_audios', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const SharedLinks = <MyModelStatic> sequelize.define('common_shared_links', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  link_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Links, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const SharedPosts = <MyModelStatic> sequelize.define('common_shared_posts', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  post_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: HotspotPosts, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const SharedNotices = <MyModelStatic> sequelize.define('common_shared_notices', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  notice_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Notices, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const SharedRecipes = <MyModelStatic> sequelize.define('common_shared_recipes', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  recipe_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Recipes, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);
