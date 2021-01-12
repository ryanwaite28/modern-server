import {
  WhereOptions,
  fn,
  col,
  cast
} from 'sequelize';
import { Resources, ResourceInterests } from '../models/resource.model';
import { Users } from '../models/user.model';
import { user_attrs_slim } from '../chamber';

export async function get_resource_by_id(id: number) {
  const resource = await Resources.findOne({
    where: { id },
    attributes: {
      include: [
        [cast(fn('COUNT', col('interests.resource_id')), 'integer') ,'interests_count']
      ]
    },
    include: [{
      model: Users,
      as: 'owner',
      attributes: user_attrs_slim
    }, {
      model: ResourceInterests,
      as: 'interests',
      attributes: [],
    }],
    group: ['resources.id', 'owner.id']
  });
  return resource;
}

export async function create_resource(
  params: {
    title: string;
    description: string;
    industry: string;
    link: string;
    resource_type: string;
    owner_id: number;
    icon_link?: string;
    icon_id?: string;
  }
) {
  const resource = await Resources.create(params);
  return resource;
}

export async function update_resource(
  newState: Partial<{
    title: string;
    description: string;
    industry: string;
    link: string;
    resource_type: string;
    icon_link?: string;
    icon_id?: string;
  }>,
  whereClause: WhereOptions
) {
  try {
    const resource_update = await Resources.update(
      newState,
      { where: whereClause }
    );
    return resource_update;
  } catch (e) {
    console.log({
      errorMessage: `update_resource error - `,
      e,
      newState,
      whereClause
    });
    throw e;
  }
}

export async function delete_resource(
  whereClause: WhereOptions
) {
  try {
    const resource_destroy = await Resources.destroy(
      { where: whereClause }
    );
    return resource_destroy;
  } catch (e) {
    console.log({
      e,
      whereClause,
      errorMessage: `delete_resource error - `,
    });
    throw e;
  }
}
