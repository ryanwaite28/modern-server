import {
  fn,
  Op,
  WhereOptions,
  FindOptions,
  Includeable,
  Model,
  FindAttributeOptions,
  GroupOption,
  Order
} from 'sequelize';
import { PlainObject } from '../../_common/interfaces/common.interface';
import { Users } from '../../_common/models/user.model';
import { SafestarConversationMembers } from '../models/conversation.model';
import { SafestarUsersInfo } from '../models/user.model';
import { user_attrs_slim } from '../safestar.chamber';



export async function get_conversation_members_all(conversation_id: number) {
  const results = await SafestarConversationMembers.findAll({
    where: { conversation_id },
    include: [{
      model: Users,
      as: 'user',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }]
    }]
  });

  return results;
}

export async function get_conversation_members(conversation_id: number, member_id?: number) {
  const whereClause: PlainObject = member_id
    ? { conversation_id, id: { [Op.lt]: member_id } }
    : { conversation_id };

  const results = await SafestarConversationMembers.findAll({
    where: whereClause,
    include: [{
      model: Users,
      as: 'user',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }]
    }],
    limit: 10,
    order: [['id', 'DESC']]
  });

  return results;
}

export async function get_conversation_member_by_user_id(user_id: number) {
  const member_model = await SafestarConversationMembers.findOne({
    where: { user_id }
  });

  return member_model;
}

export async function get_conversation_member_by_conversation_id(conversation_id: number) {
  const member_model = await SafestarConversationMembers.findOne({
    where: { conversation_id }
  });

  return member_model;
}

export async function get_conversation_member_by_user_id_and_conversation_id(user_id: number, conversation_id: number) {
  const member_model = await SafestarConversationMembers.findOne({
    where: { conversation_id, user_id }
  });

  return member_model;
}

export async function find_or_create_conversation_member(user_id: number, conversation_id: number) {
  // get all the conversations that the user is a part of via when they last opened it
  let member = await SafestarConversationMembers.findOne({
    where: {
      conversation_id,
      user_id
    },
    include: [{
      model: Users,
      as: 'user',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }]
    }]
  });

  if (!member) {
    await SafestarConversationMembers.create({ conversation_id, user_id });
    member = await SafestarConversationMembers.findOne({
      where: {
        conversation_id,
        user_id
      },
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim,
        include: [{ model: SafestarUsersInfo, as: 'safestar_info' }]
      }]
    }); 
  }

  return member!;
}

export async function remove_conversation_member(user_id: number, conversation_id: number) {
  // get all the conversations that the user is a part of via when they last opened it
  return SafestarConversationMembers.destroy({
    where: {
      conversation_id,
      user_id
    }
  });
}