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
import { PlainObject } from '../interfaces/all.interface';

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