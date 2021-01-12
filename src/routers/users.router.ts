import { Router } from 'express';

// services
import { UsersService } from '../services/users.service';
import { NotificationsService } from '../services/notifications.service';
import { ConversationsService } from '../services/conversations.service';
import { FollowsService } from '../services/follows.service';
import { MessagingsService } from '../services/messagings.service';
import { MessagesService } from '../services/messages.service';
import { PostsService } from '../services/posts.service';
import { ConversationMessagesService } from '../services/conversation-messages.service';
import { ConversationMembersService } from '../services/conversation-members.service';
import { ResourcesService } from '../services/resources.service';
import { ResourceInterestsService } from '../services/resource-interests.service';
import { CliquesService } from '../services/cliques.service';
import { CliqueInterestsService } from '../services/clique-interests.service';
import { CliqueMembersService } from '../services/clique-members.service';

// guards
import { ConversationExists, IsConversationOwner, IsNotConversationOwner } from '../guards/conversation.guard';
import { ResourceExists } from '../guards/resource.guard';
import { CliqueExists, IsCliqueCreator, IsNotCliqueCreator } from '../guards/clique.guard';
import { UserAuthorized, UserIdsAreDifferent, UserIdsAreDifferentWithModel } from '../guards/user.guard';

// Router
export const UserRouter: Router = Router();

// GET Routes

UserRouter.get('', UsersService.main);
UserRouter.get('/sign-out', UsersService.sign_out);
UserRouter.get('/check-session', UsersService.check_session);
UserRouter.get('/random', UsersService.get_random_users);
UserRouter.get('/verify-email/:verification_code', UsersService.verify_email);
UserRouter.get('/send-sms-verification/:phone_number', UsersService.send_sms_verification);
UserRouter.get('/verify-sms-code/request_id/:request_id/code/:code', UsersService.verify_sms_code);

UserRouter.get('/:you_id/notifications/all', UserAuthorized, NotificationsService.get_user_notifications_all);
UserRouter.get('/:you_id/notifications', UserAuthorized, NotificationsService.get_user_notifications);
UserRouter.get('/:you_id/notifications/:notification_id', UserAuthorized, NotificationsService.get_user_notifications);

UserRouter.get('/:you_id/member-requests/all', UserAuthorized, CliqueMembersService.get_clique_member_requests_all);
UserRouter.get('/:you_id/member-requests', UserAuthorized, CliqueMembersService.get_clique_member_requests);
UserRouter.get('/:you_id/member-requests/:member_request_id', UserAuthorized, CliqueMembersService.get_clique_member_requests);

UserRouter.get('/:you_id/unseen-counts', UserAuthorized, UsersService.get_unseen_counts);

UserRouter.get('/:you_id/feed', UserAuthorized, UsersService.get_user_feed);
UserRouter.get('/:you_id/feed/:min_id', UserAuthorized, UsersService.get_user_feed);
UserRouter.get('/:you_id/random', UserAuthorized, UsersService.get_random_models);
UserRouter.get('/:you_id/random/:min_id', UserAuthorized, UsersService.get_random_models);
UserRouter.get('/:you_id/search', UserAuthorized, UsersService.get_search_results);

UserRouter.get('/:you_id/messagings/all', UserAuthorized, MessagingsService.get_user_messagings_all);
UserRouter.get('/:you_id/messagings', UserAuthorized, MessagingsService.get_user_messagings);
UserRouter.get('/:you_id/messagings/:messagings_timestamp', UserAuthorized, MessagingsService.get_user_messagings);

UserRouter.get('/:you_id/messages/:user_id', UserAuthorized, UserIdsAreDifferent, MessagesService.get_user_messages);
UserRouter.get('/:you_id/messages/:user_id/:min_id', UserAuthorized, UserIdsAreDifferent, MessagesService.get_user_messages);

UserRouter.get('/:you_id/conversations/all', UserAuthorized, ConversationsService.get_user_conversations_all);
UserRouter.get('/:you_id/conversations', UserAuthorized, ConversationsService.get_user_conversations);
UserRouter.get('/:you_id/conversations/:conversation_timestamp', UserAuthorized, ConversationsService.get_user_conversations);

UserRouter.get('/:you_id/conversations/:conversation_id/members/all', UserAuthorized, ConversationExists, ConversationMembersService.get_conversation_members_all);
UserRouter.get('/:you_id/conversations/:conversation_id/members', UserAuthorized, ConversationExists, ConversationMembersService.get_conversation_members);
UserRouter.get('/:you_id/conversations/:conversation_id/members/:member_id', UserAuthorized, ConversationExists, ConversationMembersService.get_conversation_members);

UserRouter.get('/:you_id/conversations/:conversation_id/messages', UserAuthorized, ConversationMessagesService.get_conversation_messages);
UserRouter.get('/:you_id/conversations/:conversation_id/messages/:message_id', UserAuthorized, ConversationMessagesService.get_conversation_messages);
UserRouter.get('/:you_id/conversations/:conversation_id/search-users', UserAuthorized, ConversationExists, IsConversationOwner, ConversationMembersService.search_members);

UserRouter.get('/:you_id/resources/:resource_id/interests', UserAuthorized, ResourceInterestsService.check_interest);
UserRouter.get('/:you_id/resources/all', UserAuthorized, ResourcesService.get_user_resources_all);
UserRouter.get('/:you_id/resources', UserAuthorized, ResourcesService.get_user_resources);
UserRouter.get('/:you_id/resources/:resource_id', UserAuthorized, ResourcesService.get_user_resources);

UserRouter.get('/:you_id/cliques/:clique_id/interests', UserAuthorized, CliqueInterestsService.check_interest);
UserRouter.get('/:you_id/cliques/:clique_id/membership', UserAuthorized, CliqueInterestsService.check_membership);
UserRouter.get('/:you_id/cliques/all', UserAuthorized, CliquesService.get_user_cliques_all);
UserRouter.get('/:you_id/cliques', UserAuthorized, CliquesService.get_user_cliques);
UserRouter.get('/:you_id/cliques/:clique_id', UserAuthorized, CliquesService.get_user_cliques);

UserRouter.get('/:you_id/cliques/:clique_id/members/all', UserAuthorized, CliqueExists, CliqueMembersService.get_clique_members_all);
UserRouter.get('/:you_id/cliques/:clique_id/members', UserAuthorized, CliqueExists, CliqueMembersService.get_clique_members);
UserRouter.get('/:you_id/cliques/:clique_id/members/:member_id', UserAuthorized, CliqueExists, CliqueMembersService.get_clique_members);
UserRouter.get('/:you_id/cliques/:clique_id/search-users', UserAuthorized, CliqueExists, IsCliqueCreator, CliqueMembersService.search_members);

/** Public GET */

UserRouter.get('/id/:id', UsersService.get_user_by_id);
UserRouter.get('/phone/:phone', UsersService.get_user_by_phone);

UserRouter.get('/:user_id/followers-count', FollowsService.get_user_followers_count);
UserRouter.get('/:user_id/followings-count', FollowsService.get_user_followings_count);
UserRouter.get('/:you_id/follows/:user_id', UserIdsAreDifferent, FollowsService.check_user_follows);

UserRouter.get('/:user_id/get-followers/all', FollowsService.get_user_followers_all);
UserRouter.get('/:user_id/get-followers', FollowsService.get_user_followers);
UserRouter.get('/:user_id/get-followers/:follow_id', FollowsService.get_user_followers);

UserRouter.get('/:user_id/get-followings/all', FollowsService.get_user_followings_all);
UserRouter.get('/:user_id/get-followings', FollowsService.get_user_followings);
UserRouter.get('/:user_id/get-followings/:follow_id', FollowsService.get_user_followings);

UserRouter.get('/:user_id/get-posts/all', PostsService.get_user_posts_all);
UserRouter.get('/:user_id/get-posts', PostsService.get_user_posts);
UserRouter.get('/:user_id/get-posts/:post_id', PostsService.get_user_posts);

UserRouter.get('/:user_id/get-resources/all', ResourcesService.get_user_resources_all);
UserRouter.get('/:user_id/get-resources', ResourcesService.get_user_resources);
UserRouter.get('/:user_id/get-resources/:resource_id', ResourcesService.get_user_resources);

UserRouter.get('/:user_id/get-resource-interests/all', ResourceInterestsService.get_user_resource_interests_all);
UserRouter.get('/:user_id/get-resource-interests', ResourceInterestsService.get_user_resource_interests);
UserRouter.get('/:user_id/get-resource-interests/:interest_id', ResourceInterestsService.get_user_resource_interests);

UserRouter.get('/:user_id/get-cliques/all', CliquesService.get_user_cliques_all);
UserRouter.get('/:user_id/get-cliques', CliquesService.get_user_cliques);
UserRouter.get('/:user_id/get-cliques/:clique_id', CliquesService.get_user_cliques);

UserRouter.get('/:user_id/get-clique-interests/all', CliqueInterestsService.get_user_clique_interests_all);
UserRouter.get('/:user_id/get-clique-interests', CliqueInterestsService.get_user_clique_interests);
UserRouter.get('/:user_id/get-clique-interests/:interest_id', CliqueInterestsService.get_user_clique_interests);

UserRouter.get('/:user_id/get-clique-memberships/all', CliqueMembersService.get_user_clique_members_all);
UserRouter.get('/:user_id/get-clique-memberships', CliqueMembersService.get_user_clique_members);
UserRouter.get('/:user_id/get-clique-memberships/:member_id', CliqueMembersService.get_user_clique_members);

/** END Public GET */

// POST Routes

UserRouter.post('/', UsersService.sign_up);
UserRouter.post('/:you_id/feedback', UserAuthorized, UsersService.send_feedback);
UserRouter.post('/:you_id/resources', UserAuthorized, ResourcesService.create_resource);
UserRouter.post('/:you_id/cliques', UserAuthorized, CliquesService.create_clique);
UserRouter.post('/:you_id/conversations', UserAuthorized, ConversationsService.create_conservation);
UserRouter.post('/:you_id/conversations/:conversation_id/messages', UserAuthorized, ConversationMessagesService.create_conversation_message);
UserRouter.post('/:you_id/notifications/update-last-opened', UserAuthorized, NotificationsService.update_user_last_opened);
UserRouter.post('/:you_id/follows/:user_id', UserAuthorized, UserIdsAreDifferent, FollowsService.follow_user);
UserRouter.post('/:you_id/send-message/:user_id', UserAuthorized, UserIdsAreDifferent, MessagesService.send_user_message);
UserRouter.post('/:you_id/conversations/:conversation_id/messages/:message_id/mark-as-seen', UserAuthorized, ConversationExists, ConversationMessagesService.mark_message_as_seen);
UserRouter.post('/:you_id/conversations/:conversation_id/members/:user_id', UserAuthorized, UserIdsAreDifferent, ConversationExists, IsConversationOwner, ConversationMembersService.add_conversation_member);
UserRouter.post('/:you_id/resources/:resource_id/interests', UserAuthorized, ResourceExists, ResourceInterestsService.show_interest);
UserRouter.post('/:you_id/cliques/:clique_id/interests', UserAuthorized, CliqueExists, CliqueInterestsService.show_interest);
UserRouter.post('/:you_id/cliques/:clique_id/member-requests/:user_id', UserAuthorized, UserIdsAreDifferent, CliqueExists, IsCliqueCreator, CliqueMembersService.send_clique_member_request);

// PUT Routes

UserRouter.put('/', UsersService.sign_in);
UserRouter.put('/:you_id/info', UserAuthorized, UsersService.update_info);
UserRouter.put('/:you_id/password', UserAuthorized, UsersService.update_password);
UserRouter.put('/:you_id/phone', UserAuthorized, UsersService.update_phone);
UserRouter.put('/:you_id/icon', UserAuthorized, UsersService.update_icon);
UserRouter.put('/:you_id/wallpaper', UserAuthorized, UsersService.update_wallpaper);
UserRouter.put('/:you_id/resources/:resource_id', UserAuthorized, ResourceExists, ResourcesService.update_resource);
UserRouter.put('/:you_id/cliques/:clique_id', UserAuthorized, CliqueExists, CliquesService.update_clique);
UserRouter.put('/:you_id/conversations/:conversation_id/update-last-opened', UserAuthorized, ConversationMessagesService.update_conversation_last_opened);
UserRouter.put('/:you_id/conversations/:conversation_id', UserAuthorized, ConversationsService.update_conservation);
UserRouter.put('/:you_id/cliques/:clique_id/member-requests/:member_request_id/accept', UserAuthorized, CliqueExists, IsNotCliqueCreator, CliqueMembersService.accept_clique_member_request);

// DELETE Routes

// UserRouter.delete('/:you_id', UserAuthorized, UsersService.delete_user_);

UserRouter.delete('/:you_id/resources/:resource_id', UserAuthorized, ResourceExists, ResourcesService.delete_resource);
UserRouter.delete('/:you_id/cliques/:clique_id', UserAuthorized, CliqueExists, CliquesService.delete_clique);
UserRouter.delete('/:you_id/follows/:user_id', UserAuthorized, UserIdsAreDifferent, FollowsService.unfollow_user);
UserRouter.delete('/:you_id/conversations/:conversation_id', UserAuthorized, IsConversationOwner, ConversationsService.delete_conservation);
UserRouter.delete('/:you_id/conversations/:conversation_id/members', UserAuthorized, ConversationExists, IsNotConversationOwner, ConversationMembersService.leave_conversation);
UserRouter.delete('/:you_id/conversations/:conversation_id/members/:user_id', UserAuthorized, UserIdsAreDifferent, ConversationExists, IsConversationOwner, ConversationMembersService.remove_conversation_member);
UserRouter.delete('/:you_id/resources/:resource_id/interests', UserAuthorized, ResourceExists, ResourceInterestsService.remove_interest);
UserRouter.delete('/:you_id/cliques/:clique_id/interests', UserAuthorized, CliqueExists, CliqueInterestsService.remove_interest);
UserRouter.delete('/:you_id/cliques/:clique_id/members/leave', UserAuthorized, CliqueExists, IsNotCliqueCreator, CliqueMembersService.leave_clique);
UserRouter.delete('/:you_id/cliques/:clique_id/members/:user_id', UserAuthorized, UserIdsAreDifferent, CliqueExists, IsCliqueCreator, CliqueMembersService.remove_clique_member);
UserRouter.delete('/:you_id/cliques/:clique_id/member-requests/:member_request_id/cancel', UserAuthorized, CliqueExists, IsCliqueCreator, CliqueMembersService.cancel_clique_member_request);
UserRouter.delete('/:you_id/cliques/:clique_id/member-requests/:member_request_id/decline', UserAuthorized, CliqueExists, IsNotCliqueCreator, CliqueMembersService.decline_clique_member_request);