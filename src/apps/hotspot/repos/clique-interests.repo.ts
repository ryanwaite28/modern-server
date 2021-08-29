import {
  WhereOptions,
  fn,
  col,
  cast
} from 'sequelize';
import { CliqueInterests } from '../models/clique.model';

export async function get_clique_interests_count(clique_id: number) {
  const count = await CliqueInterests.count({
    where: { clique_id },
  });
  return count;
}