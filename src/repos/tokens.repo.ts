import {
  fn,
  Op,
} from 'sequelize';
import {
  IUser,
  IToken
} from '../interfaces/all.interface';
import { Where } from 'sequelize/types/lib/utils';
import { Tokens } from '../models/user.model';

export async function createToken(
  params: {
    user_id: number;
    device: string;
    token: string;
    ip_address: string;
    user_agent: string;
  }
) {
  const new_token = await Tokens.create(params);
  return new_token;
}

export async function searchToken(
  params: {
    user_id?: number;
    device?: string;
    token?: string;
    ip_address?: string;
    user_agent?: string;
  }
) {
  const new_token = await Tokens.findOne({
    where: (<Where> params)
  });
  return new_token;
}