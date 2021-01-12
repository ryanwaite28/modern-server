import { UploadedFile } from 'express-fileupload';
import * as bcrypt from 'bcrypt-nodejs';
import {
  Request,
  Response,
} from 'express';

import { 
  validateName,
  validateAccountType,
  validateEmail,
  validatePassword,
  uniqueValue,
  capitalize,
  allowedImages,
  languagesList,
  validateUsername,
  validateGender,
  generateJWT,
  AuthorizeJWT,
  user_attrs_slim, RESOURCE_TYPES, URL_REGEX
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
  send_verify_sms_request, check_verify_sms_request
} from '../sms-client';
import {
  VerifyEmail_EMAIL, SignedUp_EMAIL
} from '../template-engine';
import {
  send_email
} from '../email-client';
import {
  delete_image,
  store_image
} from '../cloudinary-manager';

import * as UserRepo from '../repos/users.repo';
import * as TokenRepo from '../repos/tokens.repo';
import * as EmailVerfRepo from '../repos/email-verification.repo';
import * as PhoneVerfRepo from '../repos/phone-verification.repo';
import * as ResourceRepo from '../repos/resources.repo';
import * as CommonRepo from '../repos/_common.repo';
import { fn, col, cast, Op } from 'sequelize';
import { Resources, ResourceInterests } from '../models/resource.model';
import { Users } from '../models/user.model';

export class ResourcesService {
  /** Request Handlers */

  static async main(request: Request, response: Response) {
    return response.status(HttpStatusCode.OK).json({
      msg: 'business plans router'
    });
  }

  static async get_resource(request: Request, response: Response) {
    const resource_model = response.locals.resource_model;
    return response.status(HttpStatusCode.OK).json({
      data: resource_model
    });
  }

  static async create_resource(request: Request, response: Response) {
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
    if (!(<PlainObject> RESOURCE_TYPES)[resource_type]) {
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

    const new_resource_model = await ResourceRepo.create_resource(createObj);
    const resource_model = await ResourceRepo.get_resource_by_id(
      new_resource_model.getDataValue('id')
    );
    return response.status(HttpStatusCode.OK).json({
      message: `Resource created successfully!`,
      data: resource_model!.toJSON()
    });
  }

  static async update_resource(request: Request, response: Response) {
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
    if (!(<PlainObject> RESOURCE_TYPES)[resource_type]) {
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
    const updates = await ResourceRepo.update_resource(updateObj, where);
    const resource_model = await ResourceRepo.get_resource_by_id(resource_id);

    return response.status(HttpStatusCode.OK).json({
      updates,
      message: `Resource updated successfully!`,
      data: resource_model!.toJSON()
    });
  }

  static async delete_resource(request: Request, response: Response) {
    const you: IUser = response.locals.you;

    const deletes = await response.locals.resource_model.destroy();
    
    return response.status(HttpStatusCode.OK).json({
      deletes,
      message: `Resource deleted successfully!`,
    });
  }

  static async get_user_resources(request: Request, response: Response) {
    const you: IUser = response.locals.you; 
    const resource_id = parseInt(request.params.resource_id, 10);
    const resources = await CommonRepo.paginateTable(
      Resources,
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

  static async get_user_resources_all(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    const resources = await CommonRepo.getAll(
      Resources,
      'owner_id',
      user_id,
      [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }, {
        model: ResourceInterests,
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