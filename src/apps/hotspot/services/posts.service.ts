import { UploadedFile } from 'express-fileupload';
import {
  Request,
  Response,
} from 'express';
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
  allowedImages
} from '../../_common/common.chamber';
import { IStoreImage, store_image } from '../../../cloudinary-manager';
import { Photos } from '../../_common/models/photo.model';
import { HotspotPosts, HotspotPostPhotos, HotspotPostReactions } from '../models/post.model';
import { Users } from '../../_common/models/user.model';
import { COMMON_REACTION_TYPES } from '../../_common/enums/common.enum';

export class PostsService {
  /** Request Handlers */

  static async get_post_by_id(request: Request, response: Response) {
    const post_model = response.locals.post_model;
    return response.status(HttpStatusCode.OK).json({
      data: post_model
    });
  }

  static async get_user_posts_all(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
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
    return response.status(HttpStatusCode.OK).json({
      data: posts
    });
  }

  static async get_user_posts(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    const post_id = parseInt(request.params.post_id, 10);
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
    return response.status(HttpStatusCode.OK).json({
      data: posts
    });
  }

  static async create_post(request: Request, response: Response) {
    const you: IUser = response.locals.you;
    const data: PlainObject = JSON.parse(request.body.payload);
    
    let title: string = data.title;
    let body: string = data.body;
    let tags: string[] = data.tags;
    let filesInfo: PlainObject[] = data.filesInfo || [];
    const photo_files: UploadedFile | undefined = request.files && (<UploadedFile> request.files.photos);
    const video_files: UploadedFile | undefined = request.files && (<UploadedFile> request.files.videos);
    const audio_files: UploadedFile | undefined = request.files && (<UploadedFile> request.files.audios);

    console.log({ files: request.files });

    // console.log({
    //   body: request.body,
    //   files: request.files,
    //   photo_files,
    //   photo_files_cstr: photo_files && photo_files.constructor,
    // });

    // return response.status(HttpStatusCode.BAD_REQUEST).json({
    //   message: `HotspotPost body is required`
    // });

    if (!body) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `HotspotPost body is required`
      });
    }
    if (!tags) {
      tags = [];
    }
    const all_tags_valid = tags.length === 0 || tags.every(tag => (typeof (tag) === 'string') && tag.length <= 30);
    if (!all_tags_valid) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `All elements in tags list must be a string`
      });
    }
    if (tags.length > 20) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Maximum of tags list is 20`
      });
    }

    const uploadedPhotos: { fileInfo: PlainObject; results: IStoreImage }[] = [];
    const failedFiles: any[] = [];

    if (photo_files) {
      let photos = photo_files.constructor === Array
        ? photo_files // When many files are sent, it is array; when only 1 file is sent, it is an object
        : [photo_files]; // when single file; make an array for consistency

      if (photos.length > 3) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `Maximum of photo files is 3`
        });
      }
      
      for (const photo of photos) {
        const type = photo.mimetype.split('/')[1];
        const isInvalidType = !allowedImages.includes(type);
        if (isInvalidType) {
          return response.status(HttpStatusCode.BAD_REQUEST).json({
            error: true,
            message: 'Invalid file type: jpg, jpeg or png required...'
          });
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
      title,
      body,
      tags,
      uploadedPhotos,
      owner_id: you.id
    });

    return response.status(HttpStatusCode.OK).json({
      message: `HotspotPost created successfully`,
      data: post_model
    });
  }

  static async update_post(request: Request, response: Response) {
    const post_id = parseInt(request.params.post_id, 10);
    const you: IUser = response.locals.you; 
    let body: string = request.body.body;
    let tags: string[] = request.body.tags;
    let industry: string[] = request.body.industry;
    if (!body) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `HotspotPost body is required`
      });
    }
    if (!tags) {
      tags = [];
    }
    if (!industry) {
      industry = [];
    }
    const all_tags_valid = tags.length === 0 || tags.every(tag => (typeof (tag) === 'string'));
    if (!all_tags_valid) {
      if (!body) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `All elements in tags list must be a string`
        });
      }
    }
    if (tags.length > 20) {
      if (!body) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `Maximum of tags list is 20`
        });
      }
    }
    const updates = await HotspotPostsRepo.update_post({ body, industry, tags }, post_id);
    const post = await HotspotPostsRepo.get_post_by_id(post_id);
    return response.status(HttpStatusCode.OK).json({
      message: `HotspotPost updated successfully`,
      updates: updates,
      data: post
    });
  }

  static async delete_post(request: Request, response: Response) {
    const post_id = parseInt(request.params.post_id, 10);
    const deletes = await HotspotPostsRepo.delete_post(post_id);
    return response.status(HttpStatusCode.OK).json({
      message: `HotspotPost deleted successfully`,
      deletes
    });
  }
}