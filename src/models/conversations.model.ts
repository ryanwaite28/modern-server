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

export const Conversations = <MyModelStaticGeneric<IMyModel>> sequelize.define('conversations', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  creator_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  title:               { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  icon_link:           { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  icon_id:             { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ConversationLastOpeneds = <MyModelStaticGeneric<IMyModel>> sequelize.define('conversation_last_openeds', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  conversation_id:     { type: Sequelize.INTEGER, allowNull: false, references: { model: Conversations, key: 'id' } },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  last_opened:         { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ConversationMembers = <MyModelStaticGeneric<IMyModel>> sequelize.define('conversation_members', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  conversation_id:     { type: Sequelize.INTEGER, allowNull: false, references: { model: Conversations, key: 'id' } },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  role:                { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ConversationMemberRequests = <MyModelStaticGeneric<IMyModel>> sequelize.define('conversation_member_requests', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  conversation_id:     { type: Sequelize.INTEGER, allowNull: false, references: { model: Conversations, key: 'id' } },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  sender_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  role:                { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ConversationMessages = <MyModelStaticGeneric<IMyModel>> sequelize.define('conversation_messages', {
  id:                 { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  conversation_id:    { type: Sequelize.INTEGER, allowNull: false, references: { model: Conversations, key: 'id' } },
  parent_message_id:  { type: Sequelize.INTEGER, allowNull: true },
  user_id:            { type: Sequelize.INTEGER, allowNull: true, references: { model: Users, key: 'id' } },
  body:               { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  date_created:       { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:               { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ConversationMessagePhotos = <MyModelStaticGeneric<IMyModel>> sequelize.define('message_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  message_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ConversationMessages, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ConversationMessageVideos = <MyModelStaticGeneric<IMyModel>> sequelize.define('message_videos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  message_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ConversationMessages, key: 'id' } },
  video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ConversationMessageAudios = <MyModelStaticGeneric<IMyModel>> sequelize.define('message_audios', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  message_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ConversationMessages, key: 'id' } },
  audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ConversationMessageSeens = <MyModelStaticGeneric<IMyModel>> sequelize.define('conversation_message_seens', {
  id:                 { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  conversation_id:    { type: Sequelize.INTEGER, allowNull: false, references: { model: Conversations, key: 'id' } },
  message_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: ConversationMessages, key: 'id' } },
  user_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  seen:               { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
  date_created:       { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:               { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);