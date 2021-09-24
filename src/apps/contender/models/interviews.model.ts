import * as Sequelize from 'sequelize';

import {
  common_options,
  sequelizeInst as sequelize
} from '../../_common/models/_def.model';

import {
  MyModelStatic,
  MyModelStaticGeneric,
  IMyModel,
} from '../../_common/models/common.model-types';

import { Users } from '../../_common/models/user.model';




export const ContenderInterviews = <MyModelStatic> sequelize.define('contender_interviews', {
  id:                        { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:                  { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  interviewer_id:            { type: Sequelize.INTEGER, allowNull: true, references: { model: Users, key: 'id' } },
  interviewee_id:            { type: Sequelize.INTEGER, allowNull: true, references: { model: Users, key: 'id' } },
  title:                     { type: Sequelize.STRING, allowNull: false },
  body:                      { type: Sequelize.TEXT, allowNull: false },
  
  photo_link:                { type: Sequelize.TEXT, allowNull: true },
  photo_bucket:              { type: Sequelize.TEXT, allowNull: true },
  photo_key:                 { type: Sequelize.TEXT, allowNull: true },

  video_link:                { type: Sequelize.TEXT, allowNull: true },
  video_bucket:              { type: Sequelize.TEXT, allowNull: true },
  video_key:                 { type: Sequelize.TEXT, allowNull: true },
  
  date_created:              { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                      { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const ContenderInterviewReactions = <MyModelStatic> sequelize.define('contender_interview_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  interview_id:        { type: Sequelize.INTEGER, allowNull: false, references: { model: ContenderInterviews, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ContenderInterviewComments = <MyModelStatic> sequelize.define('contender_interview_comments', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  interview_id:          { type: Sequelize.INTEGER, allowNull: true, references: { model: ContenderInterviews, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false },
  last_edited:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ContenderInterviewCommentReactions = <MyModelStatic> sequelize.define('contender_interview_comment_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ContenderInterviewComments, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ContenderInterviewCommentReplies = <MyModelStatic> sequelize.define('contender_interview_comment_replies', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ContenderInterviewComments, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false },
  last_edited:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ContenderInterviewCommentReplyReactions = <MyModelStatic> sequelize.define('contender_interview_comment_reply_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: ContenderInterviewCommentReplies, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);





export const ContenderInterviewQuestions = <MyModelStatic> sequelize.define('contender_interview_questions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  title:               { type: Sequelize.STRING, allowNull: false },
  contents:            { type: Sequelize.TEXT, allowNull: false },
  
  photo_link:          { type: Sequelize.TEXT, allowNull: true },
  photo_bucket:        { type: Sequelize.TEXT, allowNull: true },
  photo_key:           { type: Sequelize.TEXT, allowNull: true },

  video_link:          { type: Sequelize.TEXT, allowNull: true },
  video_bucket:        { type: Sequelize.TEXT, allowNull: true },
  video_key:           { type: Sequelize.TEXT, allowNull: true },
  
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const ContenderInterviewQuestionReactions = <MyModelStatic> sequelize.define('contender_interview_question_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  interview_question_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ContenderInterviewQuestions, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ContenderInterviewQuestionComments = <MyModelStatic> sequelize.define('contender_interview_question_comments', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  interview_question_id:          { type: Sequelize.INTEGER, allowNull: true, references: { model: ContenderInterviewQuestions, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false },
  last_edited:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ContenderInterviewQuestionCommentsReactions = <MyModelStatic> sequelize.define('contender_interview_question_comment_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ContenderInterviewQuestionComments, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ContenderInterviewQuestionCommentReplies = <MyModelStatic> sequelize.define('contender_interview_question_comment_replies', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ContenderInterviewQuestionComments, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false },
  last_edited:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ContenderInterviewQuestionCommentReplyReactions = <MyModelStatic> sequelize.define('contender_interview_question_comment_reply_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: ContenderInterviewQuestionCommentReplies, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);




export const ContenderInterviewAnswers = <MyModelStatic> sequelize.define('contender_interview_answers', {
  id:                        { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:                  { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  interview_question_id:     { type: Sequelize.INTEGER, allowNull: false, references: { model: ContenderInterviewQuestions, key: 'id' } },
  body:                      { type: Sequelize.TEXT, allowNull: false },
  
  photo_link:                { type: Sequelize.TEXT, allowNull: true },
  photo_bucket:              { type: Sequelize.TEXT, allowNull: true },
  photo_key:                 { type: Sequelize.TEXT, allowNull: true },

  video_link:                { type: Sequelize.TEXT, allowNull: true },
  video_bucket:              { type: Sequelize.TEXT, allowNull: true },
  video_key:                 { type: Sequelize.TEXT, allowNull: true },
  
  date_created:              { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                      { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const ContenderInterviewAnswerReactions = <MyModelStatic> sequelize.define('contender_interview_answer_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  interview_answer_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ContenderInterviewAnswers, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ContenderInterviewAnswerComments = <MyModelStatic> sequelize.define('contender_interview_answer_comments', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  interview_answer_id:          { type: Sequelize.INTEGER, allowNull: true, references: { model: ContenderInterviewAnswers, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false },
  last_edited:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ContenderInterviewAnswerCommentReactions = <MyModelStatic> sequelize.define('contender_interview_answer_comment_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ContenderInterviewAnswerComments, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ContenderInterviewAnswerCommentReplies = <MyModelStatic> sequelize.define('contender_interview_answer_comment_replies', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  comment_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ContenderInterviewAnswerComments, key: 'id' } },
  body:                { type: Sequelize.TEXT, allowNull: false },
  last_edited:         { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ContenderInterviewAnswerCommentReplyReactions = <MyModelStatic> sequelize.define('contender_interview_answer_comment_reply_reactions', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  reply_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: ContenderInterviewAnswerCommentReplies, key: 'id' } },
  reaction_id:         { type: Sequelize.INTEGER, allowNull: true },
  reaction:            { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);
