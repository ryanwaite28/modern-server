import {
  WhereOptions,
  fn,
  col,
  cast
} from 'sequelize';
import { user_attrs_slim } from '../../_common/common.chamber';
import { Users } from '../../_common/models/user.model';
import { HotspotResources, HotspotResourceInterests } from '../models/resource.model';

export async function get_resource_by_id(id: number) {
  const resource = await HotspotResources.findOne({
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
      model: HotspotResourceInterests,
      as: 'interests',
      attributes: [],
    }],
    group: ['HotspotResources.id', 'owner.id']
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
  const resource = await HotspotResources.create(<any> params);
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
    const resource_update = await HotspotResources.update(
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
    const resource_destroy = await HotspotResources.destroy(
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
