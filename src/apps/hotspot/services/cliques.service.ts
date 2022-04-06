import { UploadedFile } from 'express-fileupload';
import { Request, Response } from 'express';
import { 
  allowedImages,
  createGenericServiceMethodError,
  createGenericServiceMethodSuccess,
  user_attrs_slim,
  validateAndUploadImageFile
} from '../../_common/common.chamber';
import {
  HttpStatusCode
} from '../../_common/enums/http-codes.enum';
import {
  PlainObject,
  IUser,
  IRequest
} from '../../_common/interfaces/common.interface';

import * as CliquesRepo from '../repos/cliques.repo';
import * as CommonRepo from '../../_common/repos/_common.repo';
import { fn, col, cast, Op } from 'sequelize';
import { CliqueMembers, Cliques, CliqueInterests } from '../models/clique.model';
import { Users } from '../../_common/models/user.model';
import { ServiceMethodAsyncResults } from '../../_common/types/common.types';
import { IMyModel } from '../../_common/models/common.model-types';



export class CliquesService {

  static async get_clique_by_id(clique_id: number): ServiceMethodAsyncResults {
    const clique_model = await CliquesRepo.get_clique_by_id(clique_id);
    
    return createGenericServiceMethodSuccess(undefined, clique_model);
  }

  static async create_clique(options: {
    you: IUser,
    title: string,
    summary: string,
    icon_file: UploadedFile | undefined,
  }): ServiceMethodAsyncResults {
    const { you, title, summary, icon_file } = options;

    if (!title) {
      return createGenericServiceMethodError('title is required; it was empty...');
    }
    if (!summary) {
      return createGenericServiceMethodError('summary is required; it was empty...');
    }

    const createObj: any = {
      title,
      summary,
      creator_id: you.id,
    };

    const imageValidation = await validateAndUploadImageFile(icon_file, {
      treatNotFoundAsError: false,
      mutateObj: createObj,
      id_prop: 'icon_id',
      link_prop: 'icon_link',
    });
    if (imageValidation.error) {
      return imageValidation;
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

    return createGenericServiceMethodSuccess(`Clique created successfully!`, clique_model);
  }

  static async update_clique(options: {
    you: IUser,
    clique_id: number,
    title: string,
    summary: string,
    icon_file: UploadedFile | undefined,
  }): ServiceMethodAsyncResults {
    const { you, title, summary, clique_id, icon_file } = options;

    if (!title) {
      return createGenericServiceMethodError('title is required; it was empty...');
    }
    if (!summary) {
      return createGenericServiceMethodError('summary is required; it was empty...');
    }

    const updateObj: any = {
      title,
      summary,
    };

    const imageValidation = await validateAndUploadImageFile(icon_file, {
      treatNotFoundAsError: false,
      mutateObj: updateObj,
      id_prop: 'icon_id',
      link_prop: 'icon_link',
    });
    if (imageValidation.error) {
      return imageValidation;
    }

    const where = { id: clique_id, owner_id: you.id };
    const updates = await CliquesRepo.update_clique(updateObj, where);
    const clique_model = await CliquesRepo.get_clique_by_id(clique_id);

    return createGenericServiceMethodSuccess(`Clique updated successfully!`, { updates, clique: clique_model });
  }

  static async delete_clique(clique_id: number): ServiceMethodAsyncResults {
    const deletes = await CliquesRepo.delete_clique({ id: clique_id });

    return createGenericServiceMethodSuccess(`Clique deleted successfully!`, deletes);
  }

  static async get_user_cliques(user_id: number, clique_id?: number): ServiceMethodAsyncResults {
    const cliques = await CommonRepo.paginateTable(
      Cliques,
      'creator_id',
      user_id,
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
    
    return createGenericServiceMethodSuccess(undefined, cliques);
  }

  static async get_user_cliques_all(user_id: number): ServiceMethodAsyncResults {
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
    
    return createGenericServiceMethodSuccess(undefined, cliques);
  }
}