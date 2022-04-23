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
import { CASHLY_MEMBERSHIPS } from '../enums/cashly.enum';
import { COMMON_STRIPE_PAYOUT_TYPES } from '../../_common/enums/common.enum';




export const CashlyUserProfileSettings = <MyModelStatic> sequelize.define('cashly_user_profile_settings', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  phone:               { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  email:               { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  cashapp_tag:         { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  venmo_id:            { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  paypal_me:           { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  google_pay:          { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  membership:          { type: Sequelize.STRING, allowNull: false, defaultValue: CASHLY_MEMBERSHIPS.FREE },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const CashlyUserMembershipChanges = <MyModelStatic> sequelize.define('cashly_user_membership_changes', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  membership:          { type: Sequelize.STRING, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  date_ended:          { type: Sequelize.DATE, allowNull: true },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const CashlyUserBorrowerRatings = <MyModelStatic> sequelize.define('cashly_user_borrower_ratings', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  writer_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  rating:              { type: Sequelize.INTEGER, allowNull: false, defaultValue: 5 },
  title:               { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  summary:             { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const CashlyUserLenderRatings = <MyModelStatic> sequelize.define('cashly_user_lender_ratings', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  writer_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  rating:              { type: Sequelize.INTEGER, allowNull: false, defaultValue: 5 },
  title:               { type: Sequelize.TEXT, allowNull: true, defaultValue: '' },
  summary:             { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);

export const CashlyLoanRequests = <MyModelStatic> sequelize.define('cashly_loan_requests', {
  id:                           { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:                      { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  
  payout_method:                { type: Sequelize.TEXT, allowNull: false, defaultValue: COMMON_STRIPE_PAYOUT_TYPES.INSTANT },
  loan_amount:                  { type: Sequelize.INTEGER, allowNull: false },
  repay_amount:                 { type: Sequelize.INTEGER, allowNull: false },
  tip_amount:                   { type: Sequelize.INTEGER, allowNull: false },
  repay_date:                   { type: Sequelize.DATE, allowNull: false },
  canceled:                     { type: Sequelize.BOOLEAN, defaultValue: false },
  paid:                         { type: Sequelize.BOOLEAN, defaultValue: false },
  paid_date:                    { type: Sequelize.DATE, allowNull: true },
  last_paid_attempt_date:       { type: Sequelize.DATE, allowNull: true },
  paid_attempts:                { type: Sequelize.INTEGER, defaultValue: 0 },
  date_created:                 { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
}, common_options);

export const CashlyBorrowRequests = <MyModelStatic> sequelize.define('cashly_borrow_requests', {
  id:                           { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  borrower_id:                  { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  lender_id:                    { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  
  borrower_payment_method:      { type: Sequelize.TEXT, allowNull: false },
  lender_payment_method:        { type: Sequelize.TEXT, allowNull: false },

  payout_method:                { type: Sequelize.TEXT, allowNull: false, defaultValue: COMMON_STRIPE_PAYOUT_TYPES.INSTANT },
  loan_amount:                  { type: Sequelize.INTEGER, allowNull: false },
  repay_amount:                 { type: Sequelize.INTEGER, allowNull: false },
  tip_amount:                   { type: Sequelize.INTEGER, allowNull: false },
  repay_date:                   { type: Sequelize.DATE, allowNull: false },
  canceled:                     { type: Sequelize.BOOLEAN, defaultValue: false },
  paid:                         { type: Sequelize.BOOLEAN, defaultValue: false },
  paid_date:                    { type: Sequelize.DATE, allowNull: true },
  last_paid_attempt_date:       { type: Sequelize.DATE, allowNull: true },
  paid_attempts:                { type: Sequelize.INTEGER, defaultValue: 0 },
  date_created:                 { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                         { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 },
}, common_options);






Users.hasOne(CashlyUserProfileSettings, { as: 'cashly_settings', foreignKey: 'user_id', sourceKey: 'id' });
CashlyUserProfileSettings.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });