import {
  WhereOptions,
  fn,
  col,
  cast
} from 'sequelize';
import { HotspotResourceInterests } from '../models/resource.model';

export async function get_resource_interests_count(resource_id: number) {
  const count = await HotspotResourceInterests.count({
    where: { resource_id },
  });
  return count;
}