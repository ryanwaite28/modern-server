import {
  DB_ENV,
  sequelizeInst as sequelize
} from './_def.model';

import { Audios } from "./audio.model";
import {
  Cliques,
  CliqueInterests,
  CliqueMembers,
  CliqueMemberRequests,
} from "../../hotspot/models/clique.model";
import { SavedPosts } from "./saves.model";
import { Users, Notifications, Follows } from "./user.model";
import { Videos } from "./video.model";
import {
  RecipeCommentReactions,
  RecipeCommentReplies,
  RecipeCommentReplyReactions,
  RecipeComments,
  RecipeIngredients,
  RecipeReactions,
  Recipes
} from '../../chef-city/models/recipe.model';
import {
  Conversations,
  ConversationLastOpeneds,
  ConversationMembers,
  ConversationMessages,
  ConversationMessageSeens
} from './conversations.model';
import {
  Posts,
  PostComments,
  PostCommentReplies,
  PostReactions,
  PostCommentReactions,
  PostCommentReplyReactions,
  PostViewers,
  PostPhotos,
  PostVideos,
  PostAudios,
  PostCommentPhotos,
  PostCommentVideos,
  PostCommentAudios,
  PostCommentReplyPhotos,
  PostCommentReplyVideos,
  PostCommentReplyAudios
} from '../../hotspot/models/post.model';
import { Resources, ResourceInterests } from '../../hotspot/models/resource.model';
import { Photos } from './photo.model';
import { Messagings, Messages } from './messages.model';


/** Relationships */

Users.hasMany(Notifications, { as: 'to_notifications', foreignKey: 'to_id', sourceKey: 'id' });
Notifications.belongsTo(Users, { as: 'to', foreignKey: 'to_id', targetKey: 'id' });
Users.hasMany(Notifications, { as: 'from_notifications', foreignKey: 'from_id', sourceKey: 'id' });
Notifications.belongsTo(Users, { as: 'from', foreignKey: 'from_id', targetKey: 'id' });

Users.hasMany(Follows, { as: 'followers', foreignKey: 'follows_id', sourceKey: 'id' });
Follows.belongsTo(Users, { as: 'following', foreignKey: 'follows_id', targetKey: 'id' });
Users.hasMany(Follows, { as: 'followings', foreignKey: 'user_id', sourceKey: 'id' });
Follows.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });

Users.hasMany(Messagings, { as: 'message_sendings', foreignKey: 'sender_id', sourceKey: 'id' });
Messagings.belongsTo(Users, { as: 'sender', foreignKey: 'sender_id', targetKey: 'id' });
Users.hasMany(Messagings, { as: 'message_receivings', foreignKey: 'user_id', sourceKey: 'id' });
Messagings.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });

Users.hasMany(Messages, { as: 'messages_sent', foreignKey: 'from_id', sourceKey: 'id' });
Messages.belongsTo(Users, { as: 'from', foreignKey: 'from_id', targetKey: 'id' });
Users.hasMany(Messages, { as: 'messages_received', foreignKey: 'to_id', sourceKey: 'id' });
Messages.belongsTo(Users, { as: 'to', foreignKey: 'to_id', targetKey: 'id' });

Users.hasMany(Cliques, { as: 'cliques_owned', foreignKey: 'creator_id', sourceKey: 'id' });
Cliques.belongsTo(Users, { as: 'creator', foreignKey: 'creator_id', targetKey: 'id' });
Users.hasMany(CliqueInterests, { as: 'clique_interests', foreignKey: 'user_id', sourceKey: 'id' });
CliqueInterests.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });
Cliques.hasMany(CliqueInterests, { as: 'interests', foreignKey: 'clique_id', sourceKey: 'id' });
CliqueInterests.belongsTo(Cliques, { as: 'clique', foreignKey: 'clique_id', targetKey: 'id' });

Users.hasMany(CliqueMembers, { as: 'cliques', foreignKey: 'user_id', sourceKey: 'id' });
CliqueMembers.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });
Cliques.hasMany(CliqueMembers, { as: 'members', foreignKey: 'clique_id', sourceKey: 'id' });
CliqueMembers.belongsTo(Cliques, { as: 'clique', foreignKey: 'clique_id', targetKey: 'id' });

Users.hasMany(CliqueMemberRequests, { as: 'clique_member_requests', foreignKey: 'user_id', sourceKey: 'id' });
CliqueMemberRequests.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });
Cliques.hasMany(CliqueMemberRequests, { as: 'member_requests', foreignKey: 'clique_id', sourceKey: 'id' });
CliqueMemberRequests.belongsTo(Cliques, { as: 'clique', foreignKey: 'clique_id', targetKey: 'id' });

Users.hasMany(Resources, { as: 'resources', foreignKey: 'owner_id', sourceKey: 'id' });
Resources.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Resources.hasMany(ResourceInterests, { as: 'interests', foreignKey: 'resource_id', sourceKey: 'id' });
ResourceInterests.belongsTo(Resources, { as: 'resource', foreignKey: 'resource_id', targetKey: 'id' });
Users.hasMany(ResourceInterests, { as: 'resource_interests', foreignKey: 'user_id', sourceKey: 'id' });
ResourceInterests.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });

Users.hasMany(Recipes, { as: 'user_recipes', foreignKey: 'creator_id', sourceKey: 'id' });
Users.hasMany(Recipes, { as: 'user_helping', foreignKey: 'helper_id', sourceKey: 'id' });
Recipes.belongsTo(Users, { as: 'creator', foreignKey: 'creator_id', targetKey: 'id' });
Recipes.belongsTo(Users, { as: 'helper', foreignKey: 'helper_id', targetKey: 'id' });

Recipes.hasMany(RecipeIngredients, { as: 'ingredients', foreignKey: 'recipe_id', sourceKey: 'id' });
RecipeIngredients.belongsTo(Recipes, { as: 'recipe', foreignKey: 'recipe_id', targetKey: 'id' });

Users.hasMany(Posts, { as: 'posts', foreignKey: 'owner_id', sourceKey: 'id' });
Posts.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
SavedPosts.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });
Users.hasMany(PostComments, { as: 'comments', foreignKey: 'owner_id', sourceKey: 'id' });
PostComments.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Users.hasMany(PostCommentReplies, { as: 'replies', foreignKey: 'owner_id', sourceKey: 'id' });
PostCommentReplies.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });

Users.hasMany(PostReactions, { as: 'post_reactions', foreignKey: 'owner_id', sourceKey: 'id' });
PostReactions.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Users.hasMany(PostCommentReactions, { as: 'comment_reactions', foreignKey: 'owner_id', sourceKey: 'id' });
PostCommentReactions.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Users.hasMany(PostCommentReplyReactions, { as: 'reply_reactions', foreignKey: 'owner_id', sourceKey: 'id' });
PostCommentReplyReactions.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });

Users.hasMany(RecipeComments, { as: 'recipe_comments', foreignKey: 'owner_id', sourceKey: 'id' });
RecipeComments.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Users.hasMany(RecipeCommentReplies, { as: 'recipe_comment_replies', foreignKey: 'owner_id', sourceKey: 'id' });
RecipeCommentReplies.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });

Users.hasMany(RecipeReactions, { as: 'recipe_reactions', foreignKey: 'owner_id', sourceKey: 'id' });
RecipeReactions.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Users.hasMany(RecipeCommentReactions, { as: 'recipe_comment_reactions', foreignKey: 'owner_id', sourceKey: 'id' });
RecipeCommentReactions.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Users.hasMany(RecipeCommentReplyReactions, { as: 'recipe_comment_reply_reactions', foreignKey: 'owner_id', sourceKey: 'id' });
RecipeCommentReplyReactions.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });

Posts.hasMany(PostViewers, { as: 'viewers', foreignKey: 'post_id', sourceKey: 'id' });
PostViewers.belongsTo(Posts, { as: 'post', foreignKey: 'post_id', targetKey: 'id' });
Users.hasMany(PostViewers, { as: 'viewings', foreignKey: 'user_id', sourceKey: 'id' });
PostViewers.belongsTo(Users, { as: 'viewer', foreignKey: 'user_id', targetKey: 'id' });

Posts.hasMany(PostPhotos, { as: 'photos', foreignKey: 'post_id', sourceKey: 'id' });
PostPhotos.belongsTo(Posts, { as: 'post', foreignKey: 'post_id', targetKey: 'id' });
Photos.hasMany(PostPhotos, { as: 'post_photos', foreignKey: 'photo_id', sourceKey: 'id' });
PostPhotos.belongsTo(Photos, { as: 'photo', foreignKey: 'photo_id', targetKey: 'id' });

Posts.hasMany(PostVideos, { as: 'post_videos', foreignKey: 'post_id', sourceKey: 'id' });
PostVideos.belongsTo(Posts, { as: 'post', foreignKey: 'post_id', targetKey: 'id' });
Videos.hasMany(PostVideos, { as: 'post_videos', foreignKey: 'video_id', sourceKey: 'id' });
PostVideos.belongsTo(Videos, { as: 'video_post', foreignKey: 'video_id', targetKey: 'id' });

Posts.hasMany(PostAudios, { as: 'post_audios', foreignKey: 'post_id', sourceKey: 'id' });
PostAudios.belongsTo(Posts, { as: 'post', foreignKey: 'post_id', targetKey: 'id' });
Photos.hasMany(PostAudios, { as: 'post_audios', foreignKey: 'audio_id', sourceKey: 'id' });
PostAudios.belongsTo(Photos, { as: 'audio_post', foreignKey: 'audio_id', targetKey: 'id' });

Posts.hasMany(PostComments, { as: 'comments', foreignKey: 'post_id', sourceKey: 'id' });
PostComments.belongsTo(Posts, { as: 'post', foreignKey: 'post_id', targetKey: 'id' });
Posts.hasMany(PostReactions, { as: 'reactions', foreignKey: 'post_id', sourceKey: 'id' });
PostReactions.belongsTo(Posts, { as: 'comment_post', foreignKey: 'post_id', targetKey: 'id' });

PostComments.hasMany(PostCommentPhotos, { as: 'comment_photos', foreignKey: 'comment_id', sourceKey: 'id' });
PostCommentPhotos.belongsTo(PostComments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });
Photos.hasMany(PostCommentPhotos, { as: 'comment_photos', foreignKey: 'photo_id', sourceKey: 'id' });
PostCommentPhotos.belongsTo(Photos, { as: 'photo_comment', foreignKey: 'photo_id', targetKey: 'id' });

PostComments.hasMany(PostCommentVideos, { as: 'comment_videos', foreignKey: 'comment_id', sourceKey: 'id' });
PostCommentVideos.belongsTo(PostComments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });
Videos.hasMany(PostCommentVideos, { as: 'comment_videos', foreignKey: 'video_id', sourceKey: 'id' });
PostCommentVideos.belongsTo(Videos, { as: 'video_comment', foreignKey: 'video_id', targetKey: 'id' });

PostComments.hasMany(PostCommentAudios, { as: 'comment_audios', foreignKey: 'comment_id', sourceKey: 'id' });
PostCommentAudios.belongsTo(PostComments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });
Audios.hasMany(PostCommentAudios, { as: 'comment_audios', foreignKey: 'audio_id', sourceKey: 'id' });
PostCommentAudios.belongsTo(Audios, { as: 'audio_comment', foreignKey: 'audio_id', targetKey: 'id' });

PostCommentReplies.hasMany(PostCommentReplyPhotos, { as: 'reply_photos', foreignKey: 'reply_id', sourceKey: 'id' });
PostCommentReplyPhotos.belongsTo(PostCommentReplies, { as: 'reply', foreignKey: 'reply_id', targetKey: 'id' });
Photos.hasMany(PostCommentReplyPhotos, { as: 'reply_photos', foreignKey: 'photo_id', sourceKey: 'id' });
PostCommentReplyPhotos.belongsTo(Photos, { as: 'photo_reply', foreignKey: 'photo_id', targetKey: 'id' });

PostCommentReplies.hasMany(PostCommentReplyVideos, { as: 'reply_videos', foreignKey: 'reply_id', sourceKey: 'id' });
PostCommentReplyVideos.belongsTo(PostCommentReplies, { as: 'reply', foreignKey: 'reply_id', targetKey: 'id' });
Videos.hasMany(PostCommentReplyVideos, { as: 'reply_videos', foreignKey: 'video_id', sourceKey: 'id' });
PostCommentReplyVideos.belongsTo(Videos, { as: 'video_reply', foreignKey: 'video_id', targetKey: 'id' });

PostCommentReplies.hasMany(PostCommentReplyAudios, { as: 'reply_audios', foreignKey: 'reply_id', sourceKey: 'id' });
PostCommentReplyAudios.belongsTo(PostCommentReplies, { as: 'reply', foreignKey: 'reply_id', targetKey: 'id' });
Audios.hasMany(PostCommentReplyAudios, { as: 'reply_audios', foreignKey: 'audio_id', sourceKey: 'id' });
PostCommentReplyAudios.belongsTo(Audios, { as: 'audio_reply', foreignKey: 'audio_id', targetKey: 'id' });

PostComments.hasMany(PostCommentReplies, { as: 'replies', foreignKey: 'comment_id', sourceKey: 'id' });
PostCommentReplies.belongsTo(PostComments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });
PostComments.hasMany(PostCommentReactions, { as: 'reactions', foreignKey: 'comment_id', sourceKey: 'id' });
PostCommentReactions.belongsTo(PostComments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });

PostCommentReplies.hasMany(PostCommentReplyReactions, { as: 'reactions', foreignKey: 'reply_id', sourceKey: 'id' });
PostCommentReplyReactions.belongsTo(PostCommentReplies, { as: 'reply', foreignKey: 'reply_id', targetKey: 'id' });

/** Init Database */

export const db_init = () => {
  return sequelize.sync({ force: false })
    .then(() => {
      console.log('\n\nDatabase Initialized! ENV: ' + DB_ENV);
    })
    .catch((error) => {
      console.log('\n\nDatabase Failed!', error);
      throw error;
    });
};