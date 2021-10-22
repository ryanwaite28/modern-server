import { UploadedFile } from 'express-fileupload';
import * as bcrypt from 'bcrypt-nodejs';
import {
  Request,
  Response,
} from 'express';

import * as UserRepo from '../../_common/repos/users.repo';
import * as EmailVerfRepo from '../../_common/repos/email-verification.repo';
import * as PhoneVerfRepo from '../../_common/repos/phone-verification.repo';
import * as HotspotResourceRepo from '../../hotspot/repos/resources.repo';
import * as CommonRepo from '../../_common/repos/_common.repo';
import { fn, col, cast, Op } from 'sequelize';
import { URL_REGEX, allowedImages, user_attrs_slim } from '../../_common/common.chamber';
import { store_image } from '../../../cloudinary-manager';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { IUser, PlainObject } from '../../_common/interfaces/common.interface';
import { Users } from '../../_common/models/user.model';
import { HotspotResources, HotspotResourceInterests } from '../models/resource.model';
import { HOTSPOT_RESOURCE_TYPES } from '../enums/hotspot.enum';
import { ExpressResponse } from '../../_common/types/common.types';



export class ResourcesRequestHandler {
  /** Request Handlers */

  static async main(request: Request, response: Response): ExpressResponse {
    return response.status(HttpStatusCode.OK).json({
      msg: 'business plans router'
    });
  }

  static async get_resource(request: Request, response: Response): ExpressResponse {
    const resource_model = response.locals.resource_model;
    return response.status(HttpStatusCode.OK).json({
      data: resource_model
    });
  }

  static async create_resource(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;

    const title = request.body.title && request.body.title.trim();
    const description = request.body.description;
    const resource_type: string = request.body.resource_type;
    const industry = request.body.industry;
    const link = request.body.link;

    if (!title) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: 'title is required; it was empty...'
      });
    }
    if (!description) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: 'description cannot be empty'
      });
    }
    if (!resource_type) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: 'resource_type cannot be empty'
      });
    }
    if (!(<PlainObject> HOTSPOT_RESOURCE_TYPES)[resource_type]) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: 'resource_type is invalid'
      });
    }
    if (link && !(URL_REGEX).test(link)) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: 'link is invalid'
      });
    }

    const createObj: any = {
      title,
      description,
      industry,
      link,
      resource_type,
      owner_id: you.id,
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

    const new_resource_model = await HotspotResourceRepo.create_resource(createObj);
    const resource_model = await HotspotResourceRepo.get_resource_by_id(
      new_resource_model.getDataValue('id')
    );
    return response.status(HttpStatusCode.OK).json({
      message: `HotspotResource created successfully!`,
      data: resource_model!.toJSON()
    });
  }

  static async update_resource(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;

    const title = request.body.title && request.body.title.trim();
    const description = request.body.description;
    const resource_type: string = request.body.resource_type;
    const industry = request.body.industry;
    const link = request.body.link;

    if (!title) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: 'title is required; it was empty...'
      });
    }
    if (!description) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: 'description cannot be empty'
      });
    }
    if (!resource_type) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: 'resource_type cannot be empty'
      });
    }
    if (!(<PlainObject> HOTSPOT_RESOURCE_TYPES)[resource_type]) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: 'resource_type is invalid'
      });
    }
    if (link && !(URL_REGEX).test(link)) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: 'link is invalid'
      });
    }

    const resource_id: number = parseInt(request.params.resource_id, 10);
    const updateObj: any = {
      title,
      description,
      industry,
      link,
      resource_type,
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

      const results = await store_image(icon_file, response.locals.resource_model.get('icon_id'));
      if (!results.result) {
        return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
          error: true,
          message: 'Could not upload file...'
        });
      }

      updateObj.icon_id = results.result.public_id,
      updateObj.icon_link = results.result.secure_url
    }

    const where = { id: resource_id, owner_id: you.id };
    const updates = await HotspotResourceRepo.update_resource(updateObj, where);
    const resource_model = await HotspotResourceRepo.get_resource_by_id(resource_id);

    return response.status(HttpStatusCode.OK).json({
      updates,
      message: `HotspotResource updated successfully!`,
      data: resource_model!.toJSON()
    });
  }

  static async delete_resource(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;

    const deletes = await response.locals.resource_model.destroy();
    
    return response.status(HttpStatusCode.OK).json({
      deletes,
      message: `HotspotResource deleted successfully!`,
    });
  }

  static async get_user_resources(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you; 
    const resource_id = parseInt(request.params.resource_id, 10);
    const resources = await CommonRepo.paginateTable(
      HotspotResources,
      'owner_id',
      you.id,
      resource_id,
      [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }]
    );
    return response.status(HttpStatusCode.OK).json({
      data: resources
    });
  }

  static async get_user_resources_all(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const resources = await CommonRepo.getAll(
      HotspotResources,
      'owner_id',
      user_id,
      [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }, {
        model: HotspotResourceInterests,
        as: 'interests',
        attributes: [],
      }],
      {
        include: [
          [cast(fn('COUNT', col('interests.resource_id')), 'integer') ,'interests_count']
        ]
      },
      ['resources.id', 'owner.id']
    );
    return response.status(HttpStatusCode.OK).json({
      data: resources
    });
  }
}