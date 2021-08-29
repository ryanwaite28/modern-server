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
import { Audios } from '../../_common/models/audio.model';


/** Rent/Auction/Sell */

/** TODO (5/27/2021): add feature to lease at some point in the future */


export const Listings = <MyModelStatic> sequelize.define('blueworld_listings', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  title:               { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  desc:                { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  category:            { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  condition:           { type: Sequelize.STRING, allowNull: false },
  listing_type:        { type: Sequelize.STRING, allowNull: false }, // relates to the type-tables below
  start_datetime:      { type: Sequelize.DATE, allowNull: true },
  active:              { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  dispute:             { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  completed:           { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);



// listing types

export const ListingRentTypeDetails = <MyModelStatic> sequelize.define('blueworld_listing_rent_type_details', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  listing_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Listings, key: 'id' } },
  duration_type:       { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  duration_amount:     { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
  cost:                { type: Sequelize.INTEGER, allowNull: false },
  penalty:             { type: Sequelize.INTEGER, allowNull: false },
  completed:           { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);
export const ListingRentBorrowers = <MyModelStatic> sequelize.define('blueworld_listing_rent_borrowers', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  listing_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Listings, key: 'id' } },
  rent_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: ListingRentTypeDetails, key: 'id' } },
  borrower_id:         { type: Sequelize.INTEGER, allowNull: true, references: { model: Users, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);
export const ListingRentBorrowerRequests = <MyModelStatic> sequelize.define('blueworld_listing_rent_borrower_requests', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  listing_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Listings, key: 'id' } },
  rent_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: ListingRentTypeDetails, key: 'id' } },
  borrower_id:         { type: Sequelize.INTEGER, allowNull: true, references: { model: Users, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ListingAuctionTypeDetails = <MyModelStatic> sequelize.define('blueworld_listing_audtion_type_details', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  listing_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Listings, key: 'id' } },
  end_datetime:        { type: Sequelize.DATE, allowNull: false },
  starting_bid:        { type: Sequelize.INTEGER, allowNull: false },
  can_buy_now:         { type: Sequelize.BOOLEAN, allowNull: false },
  buy_now_price:       { type: Sequelize.INTEGER, allowNull: true, },
  completed:           { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);
export const ListingAuctionBids = <MyModelStatic> sequelize.define('blueworld_listing_auction_bids', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  listing_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Listings, key: 'id' } },
  auction_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: ListingAuctionTypeDetails, key: 'id' } },
  owner_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } }, // the user that submits the bid
  bid_price:           { type: Sequelize.INTEGER, allowNull: false },
  is_canceled:         { type: Sequelize.BOOLEAN, allowNull: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ListingSellTypeDetails = <MyModelStatic> sequelize.define('blueworld_listing_sell_type_details', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  listing_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Listings, key: 'id' } },
  price:               { type: Sequelize.INTEGER, allowNull: false },
  completed:           { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);
export const ListingSellBuyers = <MyModelStatic> sequelize.define('blueworld_listing_sell_buyers', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  listing_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Listings, key: 'id' } },
  sell_id:             { type: Sequelize.INTEGER, allowNull: false, references: { model: ListingSellTypeDetails, key: 'id' } },
  buyer_id:            { type: Sequelize.INTEGER, allowNull: true, references: { model: Users, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);



export const ListingPhotos = <MyModelStatic> sequelize.define('blueworld_post_comment_photos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  listing_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Listings, key: 'id' } },
  photo_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Photos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ListingVideos = <MyModelStatic> sequelize.define('blueworld_post_comment_videos', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  listing_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Listings, key: 'id' } },
  video_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Videos, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ListingAudios = <MyModelStatic> sequelize.define('blueworld_listing_audios', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  listing_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Listings, key: 'id' } },
  audio_id:            { type: Sequelize.INTEGER, allowNull: false, references: { model: Audios, key: 'id' } },
  date_created:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);




export const ListingsDisputes = <MyModelStatic> sequelize.define('blueworld_listing_disputes', {
  id:              { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  listing_id:      { type: Sequelize.INTEGER, allowNull: false, references: { model: Listings, key: 'id' } },
  issue_type:      { type: Sequelize.STRING, allowNull: false },
  issue_desc:      { type: Sequelize.STRING(1000), allowNull: false, defaultValue: '' },
  resolved:        { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  favored:         { type: Sequelize.STRING, allowNull: true },
  active:          { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  date_created:    { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:            { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);
export const ListingDisputeLogs = <MyModelStatic> sequelize.define('blueworld_listing_dispute_logs', {
  id:              { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  creator_id:      { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  user_id:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  listing_id:      { type: Sequelize.INTEGER, allowNull: false, references: { model: Listings, key: 'id' } },
  dispute_id:      { type: Sequelize.INTEGER, allowNull: false, references: { model: ListingsDisputes, key: 'id' } },
  body:            { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
  date_created:    { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  uuid:            { type: Sequelize.STRING, unique: true, defaultValue: Sequelize.UUIDV1 }
}, common_options);

export const ListingsFeedbacks = <MyModelStatic> sequelize.define('blueworld_listing_feedbacks', {
  id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  writer_id:           { type: Sequelize.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  listing_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: Listings, key: 'id' } },
  feedback_type:       { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
  feedback_desc:       { type: Sequelize.STRING(500), allowNull: false, defaultValue: '' },
  uuid:                { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
}, common_options);




Users.hasMany(Listings, {as: 'Lending', foreignKey: 'OwnerId', sourceKey: 'id'});
Users.hasMany(Listings, {as: 'Borrowing', foreignKey: 'BuyerId', sourceKey: 'id'});
Listings.belongsTo(Users, {as: 'Owner', foreignKey: 'OwnerId', targetKey: 'id'});


Listings.hasMany(ListingsDisputes, {as: 'Disputes', foreignKey: 'ListingId', sourceKey: 'id'});
Listings.hasMany(ListingsFeedbacks, {as: 'Feedback', foreignKey: 'ListingId', sourceKey: 'id'});

ListingsDisputes.belongsTo(Listings, {as: 'Listing', foreignKey: 'ListingId', targetKey: 'id'});
ListingsFeedbacks.belongsTo(Listings, {as: 'Listing', foreignKey: 'ListingId', targetKey: 'id'});