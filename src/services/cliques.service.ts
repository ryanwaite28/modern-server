import { UploadedFile } from 'express-fileupload';
import {
  Request,
  Response,
} from 'express';

import { 
  allowedImages,
  user_attrs_slim
} from '../chamber';

import {
  HttpStatusCode
} from '../enums/http-codes.enum';
import {
  PlainObject,
  IUser,
  IRequest
} from '../interfaces/all.interface';
import {
  delete_image,
  store_image
} from '../cloudinary-manager';

import * as CliquesRepo from '../repos/cliques.repo';
import * as CommonRepo from '../repos/_common.repo';
import { fn, col, cast, Op } from 'sequelize';
import { CliqueMembers, Cliques, CliqueInterests } from '../models/clique.model';
import { Users } from '../models/user.model';

export class CliquesService {
  /** Request Handlers */

  static async main(request: Request, response: Response) {
    return response.status(HttpStatusCode.OK).json({
      msg: 'cliques router'
    });
  }

  static async get_clique(request: Request, response: Response) {
    const clique_model = response.locals.clique_model;
    return response.status(HttpStatusCode.OK).json({
      data: clique_model
    });
  }

  static async create_clique(request: Request, response: Response) {
    const you: IUser = response.locals.you;

    const title = request.body.title && request.body.title.trim();
    const summary = request.body.summary;
    const industry = request.body.industry;

    if (!title) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: 'title is required; it was empty...'
      });
    }
    if (!summary) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: 'summary is required; it was empty...'
      });
    }

    const createObj: any = {
      title,
      summary,
      industry,
      creator_id: you.id,
    };

    const icon_file: UploadedFile | undefined = request.files && (<UploadedFile> request.files.icon);
    if (icon_file) {
      const type = icon_file.mimetype.split('/')[1];
      const isInvalidType = !allowedImages.includes(type);
      if (isInvalidType) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          error: true,
          message: 'Invalid file type: jpg, jpeg or png required...'
        });
      }

      const results = await store_image(icon_file);
      if (!results.result) {
        return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
          error: true,
          message: 'Could not upload file...'
        });
      }

      createObj.icon_id = results.result.public_id,
      createObj.icon_link = results.result.secure_url
    }

    const new_clique_model = await CliquesRepo.create_clique(createObj);
    const clique_model = await CliquesRepo.get_clique_by_id(
      new_clique_model.getDataValue('id')
    );

    // add creator as a member of their own clique 
    const new_clique_member_model = await CliqueMembers.create({
      clique_id: new_clique_model.getDataValue('id'),
      user_id: you.id
    });

    return response.status(HttpStatusCode.OK).json({
      message: `Clique created successfully!`,
      data: clique_model!.toJSON(),
    });
  }

  static async update_clique(request: Request, response: Response) {
    const you: IUser = response.locals.you;

    const title = request.body.title && request.body.title.trim();
    const summary = request.body.summary;
    const industry = request.body.industry;

    if (!title) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: 'title is required; it was empty...'
      });
    }
    if (!summary) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: 'summary is required; it was empty...'
      });
    }

    const clique_id: number = parseInt(request.params.clique_id, 10);
    const updateObj: any = {
      title,
      summary,
      industry,
    };

    const icon_file: UploadedFile | undefined = request.files && (<UploadedFile> request.files.icon);
    if (icon_file) {
      const type = icon_file.mimetype.split('/')[1];
      const isInvalidType = !allowedImages.includes(type);
      if (isInvalidType) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          error: true,
          message: 'Invalid file type: jpg, jpeg or png required...'
        });
      }

      const results = await store_image(icon_file, response.locals.clique_model.get('icon_id'));
      if (!results.result) {
        return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
          error: true,
          message: 'Could not upload file...'
        });
      }

      updateObj.icon_id = results.result.public_id,
      updateObj.icon_link = results.result.secure_url
    }

    const where = { id: clique_id, owner_id: you.id };
    const updates = await CliquesRepo.update_clique(updateObj, where);
    const clique_model = await CliquesRepo.get_clique_by_id(clique_id);

    return response.status(HttpStatusCode.OK).json({
      updates,
      message: `Clique updated successfully!`,
      data: clique_model!.toJSON()
    });
  }

  static async delete_clique(request: Request, response: Response) {
    const you: IUser = response.locals.you;

    const deletes = await response.locals.clique_model.destroy();
    
    return response.status(HttpStatusCode.OK).json({
      deletes,
      message: `Clique deleted successfully!`,
    });
  }

  static async get_user_cliques(request: Request, response: Response) {
    const you: IUser = response.locals.you; 
    const clique_id = parseInt(request.params.clique_id, 10);
    const cliques = await CommonRepo.paginateTable(
      Cliques,
      'creator_id',
      you.id,
      clique_id,
      [{
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
      {
        include: [
          [cast(fn('COUNT', col('interests.clique_id')), 'integer') ,'interests_count'],
          [cast(fn('COUNT', col('members.clique_id')), 'integer') ,'members_count'],
        ]
      },
      ['cliques.id', 'creator.id']
    );
    return response.status(HttpStatusCode.OK).json({
      data: cliques
    });
  }

  static async get_user_cliques_all(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    const cliques = await CommonRepo.getAll(
      Cliques,
      'creator_id',
      user_id,
      [{
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
      {
        include: [
          [cast(fn('COUNT', col('interests.clique_id')), 'integer') ,'interests_count'],
          [cast(fn('COUNT', col('members.clique_id')), 'integer') ,'members_count'],
        ]
      },
      ['cliques.id', 'creator.id']
    );
    return response.status(HttpStatusCode.OK).json({
      data: cliques
    });
  }
}