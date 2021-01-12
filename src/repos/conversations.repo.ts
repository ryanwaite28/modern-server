import {
  fn,
  Op,
  cast,
  col,
  WhereOptions,
  FindOptions,
  Includeable,
  Model,
  FindAttributeOptions,
  GroupOption,
  Order
} from 'sequelize';
import { ConversationMembers, Conversations, ConversationLastOpeneds, ConversationMessages } from '../models/conversations.model';
import { PlainObject } from '../interfaces/all.interface';

export async function get_user_unread_conversations_messages_count(user_id: number) {
  const conversations_member_models = await ConversationMembers.findAll({
    where: { user_id },
    include: [{
      model: Conversations,
      as: 'conversation',
    }],
    order: [['id', 'DESC']],
  });

  let count = 0;

  for (const conversation_member of conversations_member_models) {
    const conversationMemberObj: PlainObject = conversation_member.toJSON();
    const conversation_id = conversationMemberObj.conversation_id;
    // when a user is added to a conversation, a record for last opened is also created; assume there is a record
    const last_opened_model = await ConversationLastOpeneds.findOne({
      where: { conversation_id, user_id }
    });
    const you_last_opened = last_opened_model!.get('last_opened');
    // find how many messages are in the conversation since the user last opened it
    const unseen_messages_count = await ConversationMessages.count({
      where: { conversation_id, created_at: { [Op.gt]: you_last_opened }, user_id: { [Op.not]: user_id } }
    });
    // conversationMemberObj.unseen_messages_count = unseen_messages_count;
    count = count + unseen_messages_count;
  }

  return count;
}