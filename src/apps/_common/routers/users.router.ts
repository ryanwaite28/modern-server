import { Router } from 'express';
import { ConversationExists, IsConversationOwner, IsNotConversationOwner } from '../guards/conversation.guard';
import { UserAuthorized, UserIdsAreDifferent } from '../guards/user.guard';
import { ConversationMembersService } from '../services/conversation-members.service';
import { ConversationMessagesService } from '../services/conversation-messages.service';
import { ConversationsService } from '../services/conversations.service';
import { FollowsService } from '../services/follows.service';
import { MessagesService } from '../services/messages.service';
import { MessagingsService } from '../services/messagings.service';
import { NotificationsService } from '../services/notifications.service';
import { UsersService } from '../services/users.service';

// Router
export const UsersRouter: Router = Router();

UsersRouter.get('/id/:id', UsersService.get_user_by_id);
UsersRouter.get('/phone/:phone', UsersService.get_user_by_phone);

UsersRouter.get('/random', UsersService.get_random_users);
UsersRouter.get('', UsersService.main);
UsersRouter.get('/sign-out', UsersService.sign_out);
UsersRouter.get('/check-session', UsersService.check_session);
UsersRouter.get('/verify-email/:verification_code', UsersService.verify_email);
UsersRouter.get('/send-sms-verification/:phone_number', UsersService.send_sms_verification);
UsersRouter.get('/verify-sms-code/request_id/:request_id/code/:code', UsersService.verify_sms_code);

UsersRouter.get('/:you_id/unseen-counts', UserAuthorized, UsersService.get_unseen_counts);

UsersRouter.get('/:you_id/notifications/all', UserAuthorized, NotificationsService.get_user_notifications_all);
UsersRouter.get('/:you_id/notifications', UserAuthorized, NotificationsService.get_user_notifications);
UsersRouter.get('/:you_id/notifications/:notification_id', UserAuthorized, NotificationsService.get_user_notifications);

UsersRouter.get('/:you_id/messagings/all', UserAuthorized, MessagingsService.get_user_messagings_all);
UsersRouter.get('/:you_id/messagings', UserAuthorized, MessagingsService.get_user_messagings);
UsersRouter.get('/:you_id/messagings/:messagings_timestamp', UserAuthorized, MessagingsService.get_user_messagings);

UsersRouter.get('/:you_id/messages/:user_id', UserAuthorized, UserIdsAreDifferent, MessagesService.get_user_messages);
UsersRouter.get('/:you_id/messages/:user_id/:min_id', UserAuthorized, UserIdsAreDifferent, MessagesService.get_user_messages);

UsersRouter.get('/:you_id/conversations/all', UserAuthorized, ConversationsService.get_user_conversations_all);
UsersRouter.get('/:you_id/conversations', UserAuthorized, ConversationsService.get_user_conversations);
UsersRouter.get('/:you_id/conversations/:conversation_timestamp', UserAuthorized, ConversationsService.get_user_conversations);

UsersRouter.get('/:you_id/conversations/:conversation_id/members/all', UserAuthorized, ConversationExists, ConversationMembersService.get_conversation_members_all);
UsersRouter.get('/:you_id/conversations/:conversation_id/members', UserAuthorized, ConversationExists, ConversationMembersService.get_conversation_members);
UsersRouter.get('/:you_id/conversations/:conversation_id/members/:member_id', UserAuthorized, ConversationExists, ConversationMembersService.get_conversation_members);

UsersRouter.get('/:you_id/conversations/:conversation_id/messages', UserAuthorized, ConversationMessagesService.get_conversation_messages);
UsersRouter.get('/:you_id/conversations/:conversation_id/messages/:message_id', UserAuthorized, ConversationMessagesService.get_conversation_messages);
UsersRouter.get('/:you_id/conversations/:conversation_id/search-users', UserAuthorized, ConversationExists, IsConversationOwner, ConversationMembersService.search_members);

// Public GET
UsersRouter.get('/:user_id/followers-count', FollowsService.get_user_followers_count);
UsersRouter.get('/:user_id/followings-count', FollowsService.get_user_followings_count);
UsersRouter.get('/:you_id/follows/:user_id', UserIdsAreDifferent, FollowsService.check_user_follows);

UsersRouter.get('/:user_id/get-followers/all', FollowsService.get_user_followers_all);
UsersRouter.get('/:user_id/get-followers', FollowsService.get_user_followers);
UsersRouter.get('/:user_id/get-followers/:follow_id', FollowsService.get_user_followers);

UsersRouter.get('/:user_id/get-followings/all', FollowsService.get_user_followings_all);
UsersRouter.get('/:user_id/get-followings', FollowsService.get_user_followings);
UsersRouter.get('/:user_id/get-followings/:follow_id', FollowsService.get_user_followings);

// POST
UsersRouter.post('/', UsersService.sign_up);
UsersRouter.post('/:you_id/feedback', UserAuthorized, UsersService.send_feedback);
UsersRouter.post('/:you_id/conversations', UserAuthorized, ConversationsService.create_conservation);
UsersRouter.post('/:you_id/conversations/:conversation_id/messages', UserAuthorized, ConversationMessagesService.create_conversation_message);
UsersRouter.post('/:you_id/notifications/update-last-opened', UserAuthorized, NotificationsService.update_user_last_opened);
UsersRouter.post('/:you_id/follows/:user_id', UserAuthorized, UserIdsAreDifferent, FollowsService.follow_user);
UsersRouter.post('/:you_id/send-message/:user_id', UserAuthorized, UserIdsAreDifferent, MessagesService.send_user_message);
UsersRouter.post('/:you_id/conversations/:conversation_id/messages/:message_id/mark-as-seen', UserAuthorized, ConversationExists, ConversationMessagesService.mark_message_as_seen);
UsersRouter.post('/:you_id/conversations/:conversation_id/members/:user_id', UserAuthorized, UserIdsAreDifferent, ConversationExists, IsConversationOwner, ConversationMembersService.add_conversation_member);

UsersRouter.put('/', UsersService.sign_in);
UsersRouter.put('/:you_id/info', UserAuthorized, UsersService.update_info);
UsersRouter.put('/:you_id/password', UserAuthorized, UsersService.update_password);
UsersRouter.put('/:you_id/phone', UserAuthorized, UsersService.update_phone);
UsersRouter.put('/:you_id/icon', UserAuthorized, UsersService.update_icon);
UsersRouter.put('/:you_id/wallpaper', UserAuthorized, UsersService.update_wallpaper);
UsersRouter.put('/:you_id/conversations/:conversation_id/update-last-opened', UserAuthorized, ConversationMessagesService.update_conversation_last_opened);
UsersRouter.put('/:you_id/conversations/:conversation_id', UserAuthorized, ConversationsService.update_conservation);

// DELETE
UsersRouter.delete('/:you_id/follows/:user_id', UserAuthorized, UserIdsAreDifferent, FollowsService.unfollow_user);
UsersRouter.delete('/:you_id/conversations/:conversation_id', UserAuthorized, IsConversationOwner, ConversationsService.delete_conservation);
UsersRouter.delete('/:you_id/conversations/:conversation_id/members', UserAuthorized, ConversationExists, IsNotConversationOwner, ConversationMembersService.leave_conversation);
UsersRouter.delete('/:you_id/conversations/:conversation_id/members/:user_id', UserAuthorized, UserIdsAreDifferent, ConversationExists, IsConversationOwner, ConversationMembersService.remove_conversation_member);