import * as Sequelize from 'sequelize';

import {
  common_options,
  sequelizeInst as sequelize
} from './_def.model';

import {
  MyModelStaticGeneric,
  IMyModel,
} from '../model-types';

import {
  Users
} from './user.model';
import { Audios } from './audio.model';
import { Photos } from './photo.model';
import { Videos } from './video.model';

export const Messagings = <MyModelStaticGeneric<IMyModel>> sequelize.define('messagings', {
  id:                 { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  sender_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  date_created:       { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:               { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MessagingRequests = <MyModelStaticGeneric<IMyModel>> sequelize.define('messaging_requests', {
  id:                 { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  sender_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  date_created:       { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:               { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const Messages = <MyModelStaticGeneric<IMyModel>> sequelize.define('messages', {
  id:                 { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  from_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  to_id:              { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  body:               { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  opened:             { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  date_created:       { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:               { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MessagePhotos = <MyModelStaticGeneric<IMyModel>> sequelize.define('message_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  message_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Messages, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MessageVideos = <MyModelStaticGeneric<IMyModel>> sequelize.define('message_videos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  message_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Messages, key: 'id' } },
  video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const MessageAudios = <MyModelStaticGeneric<IMyModel>> sequelize.define('message_audios', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  message_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Messages, key: 'id' } },
  audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);