import {
  WhereOptions,
  fn,
  col,
  cast
} from 'sequelize';
import { ResourceInterests } from '../models/resource.model';

export async function get_resource_interests_count(resource_id: number) {
  const count = await ResourceInterests.count({
    where: { resource_id },
  });
  return count;
}