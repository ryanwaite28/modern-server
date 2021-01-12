import {
  Model,
  BuildOptions,
} from 'sequelize/types';
import {
  IUser,
  IResetPasswordRequest,
  INotification,
  IContentSubscription,
  IToken,
  IAudio,
  IPhoto,
  IPost,
  IPostComment,
  IPostCommentReaction,
  IPostCommentReply,
  IPostCommentReplyReaction,
  IPostReaction,
  IPostViewer,
  IVideo,
  IResource,
  IClique,
  IRecipe
} from './interfaces/all.interface';

/**
 * @see: https://sequelize.org/master/manual/typescript
 */


/** Model Class Type */

export interface IMyModel extends Model<any> {
  readonly id: number;
  [key: string]: any;
}

/**

new model definition template line
---

export interface Model extends Model<>, null {}

*/

export interface IUserModel extends Model<IUser>, IUser {}
export interface ICliqueModel extends Model<IClique>, IClique {}
export interface IRecipeModel extends Model<IRecipe>, IRecipe {}
export interface IResourceModel extends Model<IResource>, IResource {}
export interface IPhotoModel extends Model<IPhoto>, IPhoto {}
export interface IVideoModel extends Model<IVideo>, IVideo {}
export interface IAudioModel extends Model<IAudio>, IAudio {}
export interface IPostModel extends Model<IPost>, IPost {}
export interface IPostViewerModel extends Model<IPostViewer>, IPostViewer {}
export interface IPostReactionModel extends Model<IPostReaction>, IPostReaction {}
export interface IPostCommentModel extends Model<IPostComment>, IPostComment {}
export interface IPostCommentReactionModel extends Model<IPostCommentReaction>, IPostCommentReaction {}
export interface IPostCommentReplyModel extends Model<IPostCommentReply>, IPostCommentReply {}
export interface IPostCommentReplyReactionModel extends Model<IPostCommentReplyReaction>, IPostCommentReplyReaction {}
export interface IResetPasswordRequestModel extends Model<IResetPasswordRequest>, IResetPasswordRequest {}
export interface INotificationModel extends Model<INotification>, INotification {}
export interface IContentSubscriptionModel extends Model<IContentSubscription>, IContentSubscription {}
export interface ITokenModel extends Model<IToken>, IToken {}

/** Model Define Type */

export type MyModelStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): IMyModel;
};

export type MyModelStaticGeneric<T> = typeof Model & {
  new (values?: object, options?: BuildOptions): T;
};