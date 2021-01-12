import * as Sequelize from 'sequelize';

import {
  common_options,
  sequelizeInst as sequelize
} from './_def.model';

import {
  MyModelStaticGeneric,
  IMyModel,
  ICliqueModel,
} from '../model-types';

import {
  Users
} from './user.model';

export const Cliques = <MyModelStaticGeneric<ICliqueModel>> sequelize.define('cliques', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  creator_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  title:               { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  summary:             { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  tags:                { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  icon_link:           { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  icon_id:             { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  wallpaper_link:      { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  wallpaper_id:        { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  visibility:          { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const CliqueReactions = <MyModelStaticGeneric<IMyModel>> sequelize.define('clique_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  clique_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Cliques, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const CliqueInterests = <MyModelStaticGeneric<IMyModel>> sequelize.define('clique_interests', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  clique_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Cliques, key: 'id' } },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const CliqueMembers = <MyModelStaticGeneric<IMyModel>> sequelize.define('clique_members', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  clique_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Cliques, key: 'id' } },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  role:                { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const CliqueMemberRequests = <MyModelStaticGeneric<IMyModel>> sequelize.define('clique_member_requests', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  clique_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Cliques, key: 'id' } },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  sender_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  role:                { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);