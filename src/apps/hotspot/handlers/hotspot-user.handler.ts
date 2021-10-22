import {
  Request,
  Response,
} from 'express';
import { Op, where, fn, col } from 'sequelize';
import { user_attrs_med, user_attrs_slim } from '../../_common/common.chamber';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { IUser } from '../../_common/interfaces/common.interface';
import { Photos } from '../../_common/models/photo.model';
import { Users } from '../../_common/models/user.model';
import { Cliques } from '../models/clique.model';
import { HotspotPosts, HotspotPostPhotos } from '../models/post.model';
import { HotspotResources } from '../models/resource.model';
import { ExpressResponse } from '../../_common/types/common.types';



export class HotspotUsersRequestHandler {

  /** Request Handlers */

  static async main(request: Request, response: Response): ExpressResponse {
    return response.status(HttpStatusCode.OK).json({
      msg: 'hotspot app router'
    });
  }

  static async get_search_results(request: Request, response: Response): ExpressResponse {
    const model = String(request.query.model || '');
    const q = String(request.query.q || '');
    const min_id = String(request.query.feed_type || '') || null;
    
    if (!model) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `model query param is required`
      });
    }
    if (!q) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `q query param is required`
      });
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
              { displayname: where(fn('LOWER', col('displayname')), 'LIKE', '%' + q + '%'), },
              { username: where(fn('LOWER', col('username')), 'LIKE', '%' + q + '%'), },
            ]
          },
          attributes: user_attrs_med,
          limit: 10,
          order: [['id', 'DESC']]
        });
        return response.status(HttpStatusCode.OK).json({
          data: results
        });
      }
      case 'cliques': {
        const results = await Cliques.findAll({
          where: { 
            ...partialWhereClause,
            [Op.or]: [
              { title: where(fn('LOWER', col('title')), 'LIKE', '%' + q + '%'), },
              { summary: where(fn('LOWER', col('summary')), 'LIKE', '%' + q + '%'), },
              { industry: where(fn('LOWER', col('industry')), 'LIKE', '%' + q + '%'), },
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
        return response.status(HttpStatusCode.OK).json({
          data: results
        });
      }
      case 'resources': {
        const results = await HotspotResources.findAll({
          where: { 
            ...partialWhereClause,
            [Op.or]: [
              { title: where(fn('LOWER', col('title')), 'LIKE', '%' + q + '%'), },
              { description: where(fn('LOWER', col('description')), 'LIKE', '%' + q + '%'), },
              { industry: where(fn('LOWER', col('industry')), 'LIKE', '%' + q + '%'), },
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
        return response.status(HttpStatusCode.OK).json({
          data: results
        });
      }
      default: {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `unknown model passed...`
        });
      }
    }
  }

  static async get_user_feed(request: Request, response: Response): ExpressResponse {
    const min_id = parseInt(request.params.min_id, 10);
    const you: IUser = response.locals.you;
    const feed_type = String(request.query.feed_type || '');
    if (!feed_type) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `feed_type query param is required`
      });
    }

    const you_tags = you.tags.split(',').filter((tag: string) => !!tag);

    const you_tags_like_list_curry = (prop: string) => you_tags.map((tag: string) => ({ [prop]: { [Op.like]: '%' + tag + '%' } }));

    const limit_str = request.query.limit || '';
    const limitIsValid = (/[0-9]+/).test(<string> limit_str);
    const limit = limitIsValid
      ? parseInt(request.params.limit, 10)
      : 10;

    const partialWhere: any = (prop: string) => min_id
      ? { [Op.and]: [{ id: { [Op.lt]: min_id } }, { [prop]: { [Op.ne]: you.id  }}] }
      : { [prop]: { [Op.ne]: you.id } };
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
          limit,
          order: [['id', 'DESC']]
        });
        break;
      }
      case 'new-posts': {
        results = await HotspotPosts.findAll({
          where: { ...partialWhere('owner_id'), ...useTagsOr },
          limit,
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

    return response.status(HttpStatusCode.OK).json({
      data: results
    });
  }
}
