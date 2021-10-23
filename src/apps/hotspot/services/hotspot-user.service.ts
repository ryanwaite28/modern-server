import { Op, where, fn, col } from 'sequelize';
import { createGenericServiceMethodError, createGenericServiceMethodSuccess, user_attrs_med, user_attrs_slim } from '../../_common/common.chamber';
import { Photos } from '../../_common/models/photo.model';
import { Users } from '../../_common/models/user.model';
import { Cliques } from '../models/clique.model';
import { HotspotPosts, HotspotPostPhotos } from '../models/post.model';
import { HotspotResources } from '../models/resource.model';
import { ServiceMethodAsyncResults } from '../../_common/types/common.types';
import { HotspotUserFollowingTags } from '../models/hotspot.model';
import { IMyModel } from '../../_common/models/common.model-types';



export class HotspotUsersService {

  static async get_search_results(opts: {
    model: string,
    query: string,
    min_id?: number,
  }): ServiceMethodAsyncResults {
    const { model, query, min_id } = opts;

    if (!model) {
      return createGenericServiceMethodError(`model query param is required`);
    }
    if (!query) {
      return createGenericServiceMethodError(`q query param is required`);
    }

    const partialWhereClause: any = min_id
      ? { id: { [Op.lt]: min_id } }
      : { };

    switch(model) {
      case 'users': {
        const results = await Users.findAll({
          where: { 
            ...partialWhereClause,
            [Op.or]: [
              { displayname: where(fn('LOWER', col('displayname')), 'LIKE', '%' + query + '%'), },
              { username: where(fn('LOWER', col('username')), 'LIKE', '%' + query + '%'), },
            ]
          },
          attributes: user_attrs_med,
          limit: 10,
          order: [['id', 'DESC']]
        });

        return createGenericServiceMethodSuccess(undefined, results);
      }
      case 'cliques': {
        const results = await Cliques.findAll({
          where: { 
            ...partialWhereClause,
            [Op.or]: [
              { title: where(fn('LOWER', col('title')), 'LIKE', '%' + query + '%'), },
              { summary: where(fn('LOWER', col('summary')), 'LIKE', '%' + query + '%'), },
              { industry: where(fn('LOWER', col('industry')), 'LIKE', '%' + query + '%'), },
            ]
          },
          include: [{
            model: Users,
            as: 'creator',
            attributes: user_attrs_med,
          }],
          limit: 10,
          order: [['id', 'DESC']]
        });

        return createGenericServiceMethodSuccess(undefined, results);
      }
      case 'resources': {
        const results = await HotspotResources.findAll({
          where: { 
            ...partialWhereClause,
            [Op.or]: [
              { title: where(fn('LOWER', col('title')), 'LIKE', '%' + query + '%'), },
              { description: where(fn('LOWER', col('description')), 'LIKE', '%' + query + '%'), },
              { industry: where(fn('LOWER', col('industry')), 'LIKE', '%' + query + '%'), },
            ]
          },
          include: [{
            model: Users,
            as: 'owner',
            attributes: user_attrs_med,
          }],
          limit: 10,
          order: [['id', 'DESC']]
        });

        return createGenericServiceMethodSuccess(undefined, results);
      }
      default: {
        return createGenericServiceMethodError(`unknown model passed...`);
      }
    }
  }

  static async get_user_feed(opts: {
    user_id: number,
    min_id: number,
    feed_type: string,
    limit?: number | string
  }): ServiceMethodAsyncResults {
    const { user_id, min_id, feed_type, limit } = opts;

    if (!feed_type) {
      return createGenericServiceMethodError(`feed_type query param is required`);
    }

    const you_tags_models = await HotspotUserFollowingTags.findAll({
      where: {
        user_id,
      }
    });

    const you_tags = you_tags_models.map((tag_model: IMyModel) => tag_model.get('tag_name') as string);

    const you_tags_like_list_curry = (prop: string) => you_tags.map((tag: string) => ({ [prop]: { [Op.like]: '%' + tag + '%' } }));

    const limitIsValid = (/[0-9]+/).test(<string> limit);
    const useLimit = limitIsValid
      ? parseInt(<any>limit, 10)
      : 10;

    const partialWhere: any = (prop: string) => min_id
      ? { [Op.and]: [{ id: { [Op.lt]: min_id } }, { [prop]: { [Op.ne]: user_id  }}] }
      : { [prop]: { [Op.ne]: user_id } };
    let results;

    const useTagsOr = you_tags.length
      ? you_tags_like_list_curry('tags')
      : {};

    console.log({
      useTagsOr,
      w: { ...partialWhere('id'), ...useTagsOr },
      w2: { ...partialWhere('owner_id'), ...useTagsOr },
    });

    switch (feed_type) {
      case 'new-users': {
        results = await Users.findAll({
          where: { ...partialWhere('id'), ...useTagsOr },
          attributes: user_attrs_med,
          limit: useLimit,
          order: [['id', 'DESC']]
        });
        break;
      }
      case 'new-posts': {
        results = await HotspotPosts.findAll({
          where: { ...partialWhere('owner_id'), ...useTagsOr },
          limit: useLimit,
          include: [{
            model: Users,
            as: 'owner',
            attributes: user_attrs_slim
          }, {
            model: HotspotPostPhotos,
            as: 'photos',
            include: [{
              model: Photos,
              as: 'photo',
            }]
          }],
          order: [['id', 'DESC']]
        });
        break;
      }
    }

    return createGenericServiceMethodSuccess(undefined, results);
  }
}
