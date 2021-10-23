import {
  WhereOptions,
  fn,
  col,
  cast
} from 'sequelize';
import { user_attrs_slim } from '../../_common/common.chamber';
import { Users } from '../../_common/models/user.model';
import { Cliques, CliqueInterests, CliqueMembers } from '../models/clique.model';

export async function get_clique_by_id(id: number) {
  const clique = await Cliques.findOne({
    where: { id },
    attributes: {
      include: [
        [cast(fn('COUNT', col('interests.clique_id')), 'integer') ,'interests_count'],
        [cast(fn('COUNT', col('members.clique_id')), 'integer') ,'members_count'],
      ]
    },
    include: [{
      model: Users,
      as: 'creator',
      attributes: user_attrs_slim
    }, {
      model: CliqueInterests,
      as: 'interests',
      attributes: [],
    }, {
      model: CliqueMembers,
      as: 'members',
      attributes: [],
    }],
    group: ['cliques.id', 'creator.id']
  });
  return clique;
}

export async function create_clique(
  params: {
    title: string;
    summary: string;
    owner_id: number;
    icon_link?: string;
    icon_id?: string;
  }
) {
  const clique = await Cliques.create(<any> params);
  return clique;
}

export async function update_clique(
  newState: Partial<{
    title: string;
    summary: string;
    icon_link?: string;
    icon_id?: string;
  }>,
  whereClause: WhereOptions
) {
  try {
    const clique_update = await Cliques.update(
      newState,
      { where: whereClause }
    );
    return clique_update;
  } catch (e) {
    console.log({
      errorMessage: `update_clique error - `,
      e,
      newState,
      whereClause
    });
    throw e;
  }
}

export async function delete_clique(
  whereClause: WhereOptions
) {
  try {
    const clique_destroy = await Cliques.destroy(
      { where: whereClause }
    );
    return clique_destroy;
  } catch (e) {
    console.log({
      e,
      whereClause,
      errorMessage: `delete_clique error - `,
    });
    throw e;
  }
}
