import { Router } from 'express';
import { ConversationExists, IsConversationOwner, IsNotConversationOwner } from '../guards/conversation.guard';
import { YouAuthorized, YouAuthorizedSlim, UserIdsAreDifferent } from '../guards/user.guard';
import { ConversationMembersRequestHandler } from '../handlers/conversation-members.handler';
import { ConversationMessagesRequestHandler } from '../handlers/conversation-messages.handler';
import { ConversationsRequestHandler } from '../handlers/conversations.handler';
import { FollowsRequestHandler } from '../handlers/follows.handler';
import { MessagesRequestHandler } from '../handlers/messages.handler';
import { MessagingsRequestHandler } from '../handlers/messagings.handler';
import { NotificationsRequestHandler } from '../handlers/notifications.handler';
import { UsersRequestHandler } from '../handlers/users.handler';

// Router
export const UsersRouter: Router = Router();

UsersRouter.get('/id/:id', UsersRequestHandler.get_user_by_id);
UsersRouter.get('/phone/:phone', UsersRequestHandler.get_user_by_phone);

UsersRouter.get('/random', UsersRequestHandler.get_random_users);
UsersRouter.get('/check-session', UsersRequestHandler.check_session);
UsersRouter.get('/verify-email/:verification_code', UsersRequestHandler.verify_email);
UsersRouter.get('/send-sms-verification/:phone_number', YouAuthorizedSlim, UsersRequestHandler.send_sms_verification);
UsersRouter.get('/verify-sms-code/request_id/:request_id/code/:code', YouAuthorizedSlim, UsersRequestHandler.verify_sms_code);

UsersRouter.get('/:you_id/unseen-counts', YouAuthorized, UsersRequestHandler.get_unseen_counts);

UsersRouter.get('/:you_id/notifications/all', YouAuthorized, NotificationsRequestHandler.get_user_notifications_all);
UsersRouter.get('/:you_id/notifications', YouAuthorized, NotificationsRequestHandler.get_user_notifications);
UsersRouter.get('/:you_id/notifications/:notification_id', YouAuthorized, NotificationsRequestHandler.get_user_notifications);

UsersRouter.get('/:you_id/messagings/all', YouAuthorized, MessagingsRequestHandler.get_user_messagings_all);
UsersRouter.get('/:you_id/messagings', YouAuthorized, MessagingsRequestHandler.get_user_messagings);
UsersRouter.get('/:you_id/messagings/:messagings_timestamp', YouAuthorized, MessagingsRequestHandler.get_user_messagings);

UsersRouter.get('/:you_id/messages/:user_id', YouAuthorized, UserIdsAreDifferent, MessagesRequestHandler.get_user_messages);
UsersRouter.get('/:you_id/messages/:user_id/:min_id', YouAuthorized, UserIdsAreDifferent, MessagesRequestHandler.get_user_messages);

UsersRouter.get('/:you_id/conversations/all', YouAuthorized, ConversationsRequestHandler.get_user_conversations_all);
UsersRouter.get('/:you_id/conversations', YouAuthorized, ConversationsRequestHandler.get_user_conversations);
UsersRouter.get('/:you_id/conversations/:conversation_timestamp', YouAuthorized, ConversationsRequestHandler.get_user_conversations);

UsersRouter.get('/:you_id/conversations/:conversation_id/members/all', YouAuthorized, ConversationExists, ConversationMembersRequestHandler.get_conversation_members_all);
UsersRouter.get('/:you_id/conversations/:conversation_id/members', YouAuthorized, ConversationExists, ConversationMembersRequestHandler.get_conversation_members);
UsersRouter.get('/:you_id/conversations/:conversation_id/members/:member_id', YouAuthorized, ConversationExists, ConversationMembersRequestHandler.get_conversation_members);

UsersRouter.get('/:you_id/conversations/:conversation_id/messages', YouAuthorized, ConversationMessagesRequestHandler.get_conversation_messages);
UsersRouter.get('/:you_id/conversations/:conversation_id/messages/:message_id', YouAuthorized, ConversationMessagesRequestHandler.get_conversation_messages);
UsersRouter.get('/:you_id/conversations/:conversation_id/search-users', YouAuthorized, ConversationExists, IsConversationOwner, ConversationMembersRequestHandler.search_members);

// Public GET
UsersRouter.get('/:user_id/followers-count', FollowsRequestHandler.get_user_followers_count);
UsersRouter.get('/:user_id/followings-count', FollowsRequestHandler.get_user_followings_count);
UsersRouter.get('/:you_id/follows/:user_id', UserIdsAreDifferent, FollowsRequestHandler.check_user_follows);

UsersRouter.get('/:user_id/get-followers/all', FollowsRequestHandler.get_user_followers_all);
UsersRouter.get('/:user_id/get-followers', FollowsRequestHandler.get_user_followers);
UsersRouter.get('/:user_id/get-followers/:follow_id', FollowsRequestHandler.get_user_followers);

UsersRouter.get('/:user_id/get-followings/all', FollowsRequestHandler.get_user_followings_all);
UsersRouter.get('/:user_id/get-followings', FollowsRequestHandler.get_user_followings);
UsersRouter.get('/:user_id/get-followings/:follow_id', FollowsRequestHandler.get_user_followings);

// POST
UsersRouter.post('/', UsersRequestHandler.sign_up);
UsersRouter.post('/:you_id/feedback', YouAuthorized, UsersRequestHandler.send_feedback);
UsersRouter.post('/:you_id/conversations', YouAuthorized, ConversationsRequestHandler.create_conservation);
UsersRouter.post('/:you_id/conversations/:conversation_id/messages', YouAuthorized, ConversationMessagesRequestHandler.create_conversation_message);
UsersRouter.post('/:you_id/notifications/update-last-opened', YouAuthorized, NotificationsRequestHandler.update_user_last_opened);
UsersRouter.post('/:you_id/follows/:user_id', YouAuthorized, UserIdsAreDifferent, FollowsRequestHandler.follow_user);
UsersRouter.post('/:you_id/send-message/:user_id', YouAuthorized, UserIdsAreDifferent, MessagesRequestHandler.send_user_message);
UsersRouter.post('/:you_id/conversations/:conversation_id/messages/:message_id/mark-as-seen', YouAuthorized, ConversationExists, ConversationMessagesRequestHandler.mark_message_as_seen);
UsersRouter.post('/:you_id/conversations/:conversation_id/members/:user_id', YouAuthorized, UserIdsAreDifferent, ConversationExists, IsConversationOwner, ConversationMembersRequestHandler.add_conversation_member);

// PUT
UsersRouter.put('/', UsersRequestHandler.sign_in);
UsersRouter.put('/:you_id/info', YouAuthorized, UsersRequestHandler.update_info);
UsersRouter.put('/:you_id/password', YouAuthorized, UsersRequestHandler.update_password);
UsersRouter.put('/:you_id/phone', YouAuthorized, UsersRequestHandler.update_phone);
UsersRouter.put('/:you_id/icon', YouAuthorized, UsersRequestHandler.update_icon);
UsersRouter.put('/:you_id/wallpaper', YouAuthorized, UsersRequestHandler.update_wallpaper);
UsersRouter.put('/:you_id/create-stripe-account', YouAuthorized, UsersRequestHandler.create_stripe_account);
UsersRouter.put('/:you_id/verify-stripe-account', YouAuthorized, UsersRequestHandler.verify_stripe_account);
UsersRouter.put('/:you_id/conversations/:conversation_id/update-last-opened', YouAuthorized, ConversationMessagesRequestHandler.update_conversation_last_opened);
UsersRouter.put('/:you_id/conversations/:conversation_id', YouAuthorized, ConversationsRequestHandler.update_conservation);

// DELETE
UsersRouter.delete('/:you_id/follows/:user_id', YouAuthorized, UserIdsAreDifferent, FollowsRequestHandler.unfollow_user);
UsersRouter.delete('/:you_id/conversations/:conversation_id', YouAuthorized, IsConversationOwner, ConversationsRequestHandler.delete_conservation);
UsersRouter.delete('/:you_id/conversations/:conversation_id/members', YouAuthorized, ConversationExists, IsNotConversationOwner, ConversationMembersRequestHandler.leave_conversation);
UsersRouter.delete('/:you_id/conversations/:conversation_id/members/:user_id', YouAuthorized, UserIdsAreDifferent, ConversationExists, IsConversationOwner, ConversationMembersRequestHandler.remove_conversation_member);