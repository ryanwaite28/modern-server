import {
  fn,
  Op,
  WhereOptions
} from 'sequelize';
import { Users } from '../models/user.model';
import { user_attrs_slim } from '../chamber';

export async function get_user_by_where(
  whereClause: WhereOptions
) {
  const user_model = await Users.findOne({ where: whereClause });
  return user_model;
}

export async function create_user(
  params: {
    // firstname: string;
    // lastname: string;
    // gender?: number;
    username: string;
    displayname: string;
    email: string;
    password: string;
  }
) {
  const new_user_model = await Users.create(params);
  return new_user_model;
}

export async function get_random_users(
  limit: number
) {
  try {
    const users = await Users.findAll({
      limit,
      order: [fn( 'RANDOM' )],
      attributes: [
        'id',
        'firstname',
        'lastname',
        'username',
        'icon_link',
        'uuid',
        'created_at',
        'updated_at',
        'deleted_at',
      ]
    });
    return users;
  } catch (e) {
    console.log(`get_random_users error - `, e);
    return null;
  }
}

export async function get_user_by_email(
  email: string
) {
  try {
    const userModel = await Users.findOne({
      where: { email },
      attributes: user_attrs_slim
    });
    return userModel;
  } catch (e) {
    console.log(`get_user_by_email error - `, e);
    return null;
  }
}

export async function get_user_by_paypal(
  paypal: string
) {
  try {
    const userModel = await Users.findOne({
      where: { paypal },
      attributes: user_attrs_slim
    });
    return userModel;
  } catch (e) {
    console.log(`get_user_by_paypal error - `, e);
    return null;
  }
}

export async function get_user_by_phone(
  phone: string
) {
  try {
    const userModel = await Users.findOne({
      where: { phone },
      attributes: user_attrs_slim
    });
    return userModel;
  } catch (e) {
    console.log(`get_user_by_phone error - `, e);
    return null;
  }
}



export async function get_user_by_id(
  id: number
) {
  try {
    const user_model = await Users.findOne({
      where: { id },
    });
    return user_model;
  } catch (e) {
    console.log({
      errorMessage: `get_user_by_id error - `,
      e,
      id
    });
    return null;
  }
}

export async function get_user_by_username(
  username: string
) {
  try {
    const user_model = await Users.findOne({
      where: { username },
    });
    return user_model;
  } catch (e) {
    console.log({
      errorMessage: `get_user_by_username error - `,
      e,
      username
    });
    return null;
  }
}

export async function get_user_by_uuid(
  uuid: string
) {
  try {
    const user_model = await Users.findOne({
      where: { uuid },
    });
    return user_model;
  } catch (e) {
    console.log({
      errorMessage: `get_user_by_uuid error - `,
      e,
      uuid
    });
    return null;
  }
}

export async function update_user(
  newState: Partial<{
    email: string;
    paypal: string;
    username: string;
    phone: string;
    bio: string;
    location: string;
    password: string;
    icon_link: string;
    icon_id: string;
    wallpaper_link: string;
    wallpaper_id: string;
    email_verified: boolean;
    phone_verified: boolean;
  }>,
  whereClause: WhereOptions
) {
  try {
    const user_model_update = await Users.update(
      newState,
      { where: whereClause }
    );
    return user_model_update;
  } catch (e) {
    console.log({
      errorMessage: `update_user error - `,
      e,
      newState,
      whereClause
    });
    return null;
  }
}