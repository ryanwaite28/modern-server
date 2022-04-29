import {
  fn,
  Op,
  WhereOptions
} from 'sequelize';
import { Users } from '../models/user.model';
import { convertModel, convertModelCurry, convertModelsCurry, user_attrs_slim } from '../common.chamber';
import { ApiKeys } from '../models/other.model';
import { IMyModel } from '../models/common.model-types';
import { IApiKey, IUser } from '../interfaces/common.interface';



const convertUserModel = convertModelCurry<IUser>();
const convertUserModels = convertModelsCurry<IUser>();

export async function get_user_by_where(
  whereClause: WhereOptions
) {
  const user_model = await Users.findOne({
    where: whereClause,
    attributes: user_attrs_slim
  })
  .then(convertUserModel);
  return user_model;
}

export async function create_user(
  params: {
    firstname: string;
    middlename: string;
    lastname: string;
    // gender?: number;
    username: string;
    displayname: string;
    email: string;
    password: string;
  }
) {
  const new_user_model = await Users.create(<any> params);
  const user = await get_user_by_id(new_user_model.get('id'));
  return user!;
}

export async function get_random_users(
  limit: number
) {
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
  })
  .then(convertUserModels);
  return users;
}

export async function get_user_by_email(
  email: string
) {
  try {
    const userModel = await Users.findOne({
      where: { email },
      attributes: user_attrs_slim
    })
    .then(convertUserModel);
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
    })
    .then(convertUserModel);
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
    })
    .then(convertUserModel);
    return userModel;
  } catch (e) {
    console.log(`get_user_by_phone error - `, e);
    return null;
  }
}



export async function get_user_by_id(id: number) {
  const user_model = await Users.findOne({
    where: { id },
    include: [],
    attributes: {
      exclude: ['password']
    }
  })
  .then(convertUserModel);
  return user_model;
}

export async function get_user_by_stripe_customer_account_id(stripe_customer_account_id: string) {
  const user_model = await Users.findOne({
    where: { stripe_customer_account_id },
    include: [],
    attributes: {
      exclude: ['password']
    }
  })
  .then(convertUserModel)
  .catch((err) => {
    console.log(`could not get user by stripe_customer_account_id`, { stripe_customer_account_id }, err);
    throw err;
  })
  return user_model;
}

export async function get_user_by_username(
  username: string
) {
  const user_model = await Users.findOne({
    where: { username },
  })
  .then(convertUserModel);
  return user_model;
}

export async function get_user_by_uuid(
  uuid: string
) {
  try {
    const user_model = await Users.findOne({
      where: { uuid },
    })
    .then(convertUserModel);
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
    phone: string | null;
    bio: string;
    location: string;
    password: string;
    icon_link: string;
    icon_id: string;
    wallpaper_link: string;
    wallpaper_id: string;
    email_verified: boolean;
    phone_verified: boolean;
    stripe_account_verified: boolean;
    stripe_account_id: string;
    stripe_customer_account_id: string;
    platform_subscription_id: string,
  }>,
  whereClause: WhereOptions
) {
  try {
    const user_model_update = await Users.update(
      newState as any,
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
    throw e;
  }
}

export function get_api_key(key: string) {
  return ApiKeys.findOne({
    where: { key },
    include: [{
      model: Users,
      as: 'user',
      attributes: user_attrs_slim
    }]
  })
  .then((model: IMyModel | null) => convertModel<IApiKey>(model));
}

export function get_user_api_key(user_id: number) {
  return ApiKeys.findOne({
    where: { user_id },
    include: [{
      model: Users,
      as: 'user',
      attributes: user_attrs_slim
    }]
  })
  .then((model: IMyModel | null) => convertModel<IApiKey>(model));
}

export async function create_user_api_key(params: {
  user_id:             number,
  firstname:           string,
  middlename:          string,
  lastname:            string,
  email:               string,
  phone:               string,
  website:             string,
  subscription_plan:   string,
}) {
  const new_key = await ApiKeys.create(params).then((model: IMyModel | null) => convertModel<IApiKey>(model));
  return new_key!;
}