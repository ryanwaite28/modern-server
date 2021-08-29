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
import { CliqueMembers, CliqueMemberRequests } from '../models/clique.model';

export async function get_is_clique_member(clique_id: number, user_id: number) {
  const count = await CliqueMembers.count({
    where: { clique_id, user_id },
  });
  const is_member = count === 1;
  return is_member;
}

export async function get_clique_members_count(clique_id: number) {
  const count = await CliqueMembers.count({
    where: { clique_id },
  });
  return count;
}

export async function get_clique_member_requests_count(user_id: number) {
  const count = await CliqueMemberRequests.count({
    where: { user_id },
  });
  return count;
}