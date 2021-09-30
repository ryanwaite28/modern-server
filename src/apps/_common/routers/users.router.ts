import { Router } from 'express';
import { ConversationExists, IsConversationOwner, IsNotConversationOwner } from '../guards/conversation.guard';
import { YouAuthorized, YouAuthorizedSlim, UserIdsAreDifferent } from '../guards/user.guard';
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
UsersRouter.get('/send-sms-verification/:phone_number', YouAuthorizedSlim, UsersService.send_sms_verification);
UsersRouter.get('/verify-sms-code/request_id/:request_id/code/:code', YouAuthorizedSlim, UsersService.verify_sms_code);

UsersRouter.get('/:you_id/unseen-counts', YouAuthorized, UsersService.get_unseen_counts);

UsersRouter.get('/:you_id/notifications/all', YouAuthorized, NotificationsService.get_user_notifications_all);
UsersRouter.get('/:you_id/notifications', YouAuthorized, NotificationsService.get_user_notifications);
UsersRouter.get('/:you_id/notifications/:notification_id', YouAuthorized, NotificationsService.get_user_notifications);

UsersRouter.get('/:you_id/messagings/all', YouAuthorized, MessagingsService.get_user_messagings_all);
UsersRouter.get('/:you_id/messagings', YouAuthorized, MessagingsService.get_user_messagings);
UsersRouter.get('/:you_id/messagings/:messagings_timestamp', YouAuthorized, MessagingsService.get_user_messagings);

UsersRouter.get('/:you_id/messages/:user_id', YouAuthorized, UserIdsAreDifferent, MessagesService.get_user_messages);
UsersRouter.get('/:you_id/messages/:user_id/:min_id', YouAuthorized, UserIdsAreDifferent, MessagesService.get_user_messages);

UsersRouter.get('/:you_id/conversations/all', YouAuthorized, ConversationsService.get_user_conversations_all);
UsersRouter.get('/:you_id/conversations', YouAuthorized, ConversationsService.get_user_conversations);
UsersRouter.get('/:you_id/conversations/:conversation_timestamp', YouAuthorized, ConversationsService.get_user_conversations);

UsersRouter.get('/:you_id/conversations/:conversation_id/members/all', YouAuthorized, ConversationExists, ConversationMembersService.get_conversation_members_all);
UsersRouter.get('/:you_id/conversations/:conversation_id/members', YouAuthorized, ConversationExists, ConversationMembersService.get_conversation_members);
UsersRouter.get('/:you_id/conversations/:conversation_id/members/:member_id', YouAuthorized, ConversationExists, ConversationMembersService.get_conversation_members);

UsersRouter.get('/:you_id/conversations/:conversation_id/messages', YouAuthorized, ConversationMessagesService.get_conversation_messages);
UsersRouter.get('/:you_id/conversations/:conversation_id/messages/:message_id', YouAuthorized, ConversationMessagesService.get_conversation_messages);
UsersRouter.get('/:you_id/conversations/:conversation_id/search-users', YouAuthorized, ConversationExists, IsConversationOwner, ConversationMembersService.search_members);

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
UsersRouter.post('/:you_id/feedback', YouAuthorized, UsersService.send_feedback);
UsersRouter.post('/:you_id/conversations', YouAuthorized, ConversationsService.create_conservation);
UsersRouter.post('/:you_id/conversations/:conversation_id/messages', YouAuthorized, ConversationMessagesService.create_conversation_message);
UsersRouter.post('/:you_id/notifications/update-last-opened', YouAuthorized, NotificationsService.update_user_last_opened);
UsersRouter.post('/:you_id/follows/:user_id', YouAuthorized, UserIdsAreDifferent, FollowsService.follow_user);
UsersRouter.post('/:you_id/send-message/:user_id', YouAuthorized, UserIdsAreDifferent, MessagesService.send_user_message);
UsersRouter.post('/:you_id/conversations/:conversation_id/messages/:message_id/mark-as-seen', YouAuthorized, ConversationExists, ConversationMessagesService.mark_message_as_seen);
UsersRouter.post('/:you_id/conversations/:conversation_id/members/:user_id', YouAuthorized, UserIdsAreDifferent, ConversationExists, IsConversationOwner, ConversationMembersService.add_conversation_member);

// PUT
UsersRouter.put('/', UsersService.sign_in);
UsersRouter.put('/:you_id/info', YouAuthorized, UsersService.update_info);
UsersRouter.put('/:you_id/password', YouAuthorized, UsersService.update_password);
UsersRouter.put('/:you_id/phone', YouAuthorized, UsersService.update_phone);
UsersRouter.put('/:you_id/icon', YouAuthorized, UsersService.update_icon);
UsersRouter.put('/:you_id/wallpaper', YouAuthorized, UsersService.update_wallpaper);
UsersRouter.put('/:you_id/create-stripe-account', YouAuthorized, UsersService.create_stripe_account);
UsersRouter.put('/:you_id/verify-stripe-account', YouAuthorized, UsersService.verify_stripe_account);
UsersRouter.put('/:you_id/conversations/:conversation_id/update-last-opened', YouAuthorized, ConversationMessagesService.update_conversation_last_opened);
UsersRouter.put('/:you_id/conversations/:conversation_id', YouAuthorized, ConversationsService.update_conservation);

// DELETE
UsersRouter.delete('/:you_id/follows/:user_id', YouAuthorized, UserIdsAreDifferent, FollowsService.unfollow_user);
UsersRouter.delete('/:you_id/conversations/:conversation_id', YouAuthorized, IsConversationOwner, ConversationsService.delete_conservation);
UsersRouter.delete('/:you_id/conversations/:conversation_id/members', YouAuthorized, ConversationExists, IsNotConversationOwner, ConversationMembersService.leave_conversation);
UsersRouter.delete('/:you_id/conversations/:conversation_id/members/:user_id', YouAuthorized, UserIdsAreDifferent, ConversationExists, IsConversationOwner, ConversationMembersService.remove_conversation_member);