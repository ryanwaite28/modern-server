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
import { Follows, Users } from '../models/user.model';
import { user_attrs_slim } from '../chamber';
import { PlainObject } from '../interfaces/all.interface';

export async function get_user_followers_count(
  id: number
) {
  try {
    const count = await Follows.count({
      where: { follows_id: id },
    });
    return count;
  } catch (e) {
    console.log({
      errorMessage: `get_user_followers_count error - `,
      e,
      id
    });
    return null;
  }
}

export async function get_user_followings_count(
  id: number
) {
  try {
    const count = await Follows.count({
      where: { user_id: id },
    });
    return count;
  } catch (e) {
    console.log({
      errorMessage: `get_user_followings_count error - `,
      e,
      id
    });
    return null;
  }
}

export async function get_user_followers_all(
  id: number
) {
  try {
    const results = await Follows.findAll({
      where: { follows_id: id },
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    });
    return results;
  } catch (e) {
    console.log({
      errorMessage: `get_user_followers_all error - `,
      e,
      id
    });
    return null;
  }
}

export async function get_user_followings_all(
  id: number
) {
  try {
    const results = await Follows.findAll({
      where: { user_id: id },
      include: [{
        model: Users,
        as: 'following',
        attributes: user_attrs_slim
      }]
    });
    return results;
  } catch (e) {
    console.log({
      errorMessage: `get_user_followings_all error - `,
      e,
      id
    });
    return null;
  }
}
