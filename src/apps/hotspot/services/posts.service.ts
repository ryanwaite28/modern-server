import { UploadedFile } from 'express-fileupload';
import { Request, Response } from 'express';
import {
  HttpStatusCode
} from '../../_common/enums/http-codes.enum';
import {
  IUser, PlainObject,
} from '../../_common/interfaces/common.interface';
import * as CommonRepo from '../../_common/repos/_common.repo';
import * as HotspotPostsRepo from '../repos/posts.repo';
import {
  user_attrs_slim,
  allowedImages,
  createGenericServiceMethodSuccess,
  createGenericServiceMethodError
} from '../../_common/common.chamber';
import { IStoreImage, store_image } from '../../../cloudinary-manager';
import { Photos } from '../../_common/models/photo.model';
import { HotspotPosts, HotspotPostPhotos, HotspotPostReactions } from '../models/post.model';
import { Users } from '../../_common/models/user.model';
import { COMMON_REACTION_TYPES } from '../../_common/enums/common.enum';
import { ServiceMethodAsyncResults } from '../../_common/types/common.types';



export class PostsService {
  /** Request Handlers */

  static async get_post_by_id(post_id: number): ServiceMethodAsyncResults {
    const post_model = await HotspotPostsRepo.get_post_by_id(post_id);

    return createGenericServiceMethodSuccess(undefined, post_model);
  }

  static async get_user_posts_all(user_id: number): ServiceMethodAsyncResults {
    const posts = await CommonRepo.getAll(
      HotspotPosts,
      'owner_id',
      user_id,
      [{
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
      }]
    );

    return createGenericServiceMethodSuccess(undefined, posts);
  }

  static async get_user_posts(user_id: number, post_id?: number): ServiceMethodAsyncResults {
    const posts = await CommonRepo.paginateTable(
      HotspotPosts,
      'owner_id',
      user_id,
      post_id,
      [{
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
      }]
    );

    return createGenericServiceMethodSuccess(undefined, posts);
  }

  static async create_post(options: {
    you_id: number,
    photo_files: UploadedFile | undefined,
    video_files: UploadedFile | undefined,
    audio_files: UploadedFile | undefined,
    filesInfo: PlainObject[],
    data: PlainObject | {
      title: string,
      body: string,
      tags: string[],
    }
  }): ServiceMethodAsyncResults {
    const { you_id, photo_files, video_files, audio_files, filesInfo, data } = options;
    let { body, title, tags } = data;

    if (!body) {
      return createGenericServiceMethodError(`HotspotPost body is required`);
    }
    if (!tags) {
      tags = [];
    }
    const all_tags_valid = tags.length === 0 || tags.every((tag: string | any) => (typeof (tag) === 'string') && tag.length <= 30);
    if (!all_tags_valid) {
      return createGenericServiceMethodError(`All elements in tags list must be a string`);
    }
    if (tags.length > 20) {
      return createGenericServiceMethodError(`Maximum of tags list is 20`);
    }

    const uploadedPhotos: { fileInfo: PlainObject; results: IStoreImage }[] = [];
    const failedFiles: any[] = [];

    if (photo_files) {
      let photos = photo_files.constructor === Array
        ? photo_files // When many files are sent, it is array; when only 1 file is sent, it is an object
        : [photo_files]; // when single file; make an array for consistency

      if (photos.length > 3) {
        return createGenericServiceMethodError(`Maximum of photo files is 3`);
      }
      
      for (const photo of photos) {
        const type = photo.mimetype.split('/')[1];
        const isInvalidType = !allowedImages.includes(type);
        if (isInvalidType) {
          return createGenericServiceMethodError('Invalid file type: jpg, jpeg or png required...');
        }
      }

      for (let i = 0; i < photos.length; i++) {
        const fileInfo = filesInfo[i];
        const results = await store_image(photos[i]);
        if (!results.result) {
          failedFiles.push({ results, fileInfo });
        } else {
          uploadedPhotos.push({ results, fileInfo });
        }
      }
    }

    const post_model = await HotspotPostsRepo.create_post({
      owner_id: you_id,
      title,
      body,
      tags,
      uploadedPhotos,
    });

    return createGenericServiceMethodSuccess(`HotspotPost created successfully`, post_model);
  }

  static async update_post(options: {
    post_id: number,
    photo_files: UploadedFile | undefined,
    video_files: UploadedFile | undefined,
    audio_files: UploadedFile | undefined,
    filesInfo: PlainObject[],
    data: PlainObject | {
      title: string,
      body: string,
      tags: string[],
    }
  }): ServiceMethodAsyncResults {
    const { post_id, photo_files, video_files, audio_files, filesInfo, data } = options;
    let { body, title, tags } = data;

    if (!body) {
      return createGenericServiceMethodError(`body is required`);
    }
    if (!tags) {
      tags = [];
    }

    const all_tags_valid = tags.length === 0 || tags.every((tag: string | any) => (typeof (tag) === 'string') && tag.length <= 30);
    if (!all_tags_valid) {
      return createGenericServiceMethodError(`All elements in tags list must be a string`);
    }
    if (tags.length > 20) {
      return createGenericServiceMethodError(`Maximum of tags list is 20`);
    }

    const updates = await HotspotPostsRepo.update_post({ body, title, tags }, post_id);
    const post = await HotspotPostsRepo.get_post_by_id(post_id);

    return createGenericServiceMethodSuccess(`Post updated successfully`, { updates, post });
  }

  static async delete_post(post_id: number): ServiceMethodAsyncResults {
    const deletes = await HotspotPostsRepo.delete_post(post_id);

    return createGenericServiceMethodSuccess(`Post deleted successfully`, deletes);
  }
}