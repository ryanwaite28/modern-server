import { UploadedFile } from 'express-fileupload';
import * as HotspotResourceRepo from '../../hotspot/repos/resources.repo';
import * as CommonRepo from '../../_common/repos/_common.repo';
import { fn, col, cast } from 'sequelize';
import { URL_REGEX, user_attrs_slim, createGenericServiceMethodSuccess, createGenericServiceMethodError, validateAndUploadImageFile } from '../../_common/common.chamber';
import { IUser, PlainObject } from '../../_common/interfaces/common.interface';
import { Users } from '../../_common/models/user.model';
import { HotspotResources, HotspotResourceInterests } from '../models/resource.model';
import { HOTSPOT_RESOURCE_TYPES } from '../enums/hotspot.enum';
import { ServiceMethodAsyncResults } from '../../_common/types/common.types';
import { IMyModel } from '../../_common/models/common.model-types';



export class ResourcesService {

  static async get_resource_by_id(resource_id: number): ServiceMethodAsyncResults<IMyModel | null> {
    const resource_model = await HotspotResourceRepo.get_resource_by_id(resource_id);

    return createGenericServiceMethodSuccess<IMyModel | null>(undefined, resource_model);
  }

  static async create_resource(opts: {
    you: IUser | {
      id: number,
    },
    icon_file: UploadedFile | undefined,
    data: PlainObject | {
      title: string,
      description: string,
      resource_type: string,
      link: string,
    }
  }): ServiceMethodAsyncResults {
    const { you, data, icon_file } = opts;
    const { title, description, resource_type, link } = data;

    if (!title || !title.trim()) {
      return createGenericServiceMethodError('title is required; it was empty...');
    }
    if (!description || !description.trim()) {
      return createGenericServiceMethodError('description cannot be empty');
    }
    if (!resource_type || !resource_type.trim()) {
      return createGenericServiceMethodError('resource_type cannot be empty');
    }
    if (!(<PlainObject> HOTSPOT_RESOURCE_TYPES)[resource_type]) {
      return createGenericServiceMethodError('resource_type is invalid');
    }
    if (link && !(URL_REGEX).test(link)) {
      return createGenericServiceMethodError('link is invalid');
    }

    const createObj: any = {
      title,
      description,
      link,
      resource_type,
      owner_id: you.id,
    };

    const imageValidation = await validateAndUploadImageFile(icon_file, {
      treatNotFoundAsError: false,
      mutateObj: createObj,
      id_prop: `icon_id`,
      link_prop: `icon_link`,
    });
    if (imageValidation.error) {
      return imageValidation;
    }

    const new_resource_model = await HotspotResourceRepo.create_resource(createObj);
    const resource_model = await HotspotResourceRepo.get_resource_by_id(
      new_resource_model.getDataValue('id')
    );

    return createGenericServiceMethodSuccess(`Resource created successfully!`, resource_model);
  }

  static async update_resource(opts: {
    you: IUser | {
      id: number,
    },
    resource_id: number,
    icon_file: UploadedFile | undefined,
    data: PlainObject | {
      title: string,
      description: string,
      resource_type: string,
      link: string,
    }
  }): ServiceMethodAsyncResults {
    const { you, data, icon_file, resource_id } = opts;
    const { title, description, resource_type, link } = data;

    if (!title || !title.trim()) {
      return createGenericServiceMethodError('title is required; it was empty...');
    }
    if (!description || !description.trim()) {
      return createGenericServiceMethodError('description cannot be empty');
    }
    if (!resource_type || !resource_type.trim()) {
      return createGenericServiceMethodError('resource_type cannot be empty');
    }
    if (!(<PlainObject> HOTSPOT_RESOURCE_TYPES)[resource_type]) {
      return createGenericServiceMethodError('resource_type is invalid');
    }
    if (link && !(URL_REGEX).test(link)) {
      return createGenericServiceMethodError('link is invalid');
    }

    const updateObj: any = {
      title,
      description,
      link,
      resource_type,
    };

    const imageValidation = await validateAndUploadImageFile(icon_file, {
      treatNotFoundAsError: false,
      mutateObj: updateObj,
      id_prop: `icon_id`,
      link_prop: `icon_link`,
    });
    if (imageValidation.error) {
      return imageValidation;
    }

    const where = { id: resource_id, owner_id: you.id };
    const updates = await HotspotResourceRepo.update_resource(updateObj, where);
    const resource_model = await HotspotResourceRepo.get_resource_by_id(resource_id);

    return createGenericServiceMethodSuccess(`Resource updated successfully!`, { updates, resource: resource_model });
  }

  static async delete_resource(resource_id: number): ServiceMethodAsyncResults {
    const deletes = await HotspotResourceRepo.delete_resource({ id: resource_id });

    return createGenericServiceMethodSuccess(`Resource deleted successfully!`, deletes);
  }

  static async get_user_resources(user_id: number, resource_id?: number): ServiceMethodAsyncResults {
    const resources = await CommonRepo.paginateTable(
      HotspotResources,
      'owner_id',
      user_id,
      resource_id,
      [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }]
    );

    return createGenericServiceMethodSuccess(undefined, resources);
  }

  static async get_user_resources_all(user_id: number): ServiceMethodAsyncResults {
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
    
    return createGenericServiceMethodSuccess(undefined, resources);
  }
}