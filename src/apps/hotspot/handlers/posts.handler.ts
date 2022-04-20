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
  allowedImages
} from '../../_common/common.chamber';
import { IStoreImage, store_image } from '../../../cloudinary-manager';
import { Photos } from '../../_common/models/photo.model';
import { HotspotPosts, HotspotPostPhotos } from '../models/post.model';
import { Users } from '../../_common/models/user.model';
import { ExpressResponse, ServiceMethodResults } from '../../_common/types/common.types';
import { PostsService } from '../services/posts.service';



export class PostsRequestHandler {
  /** Request Handlers */

  static async get_post_by_id(request: Request, response: Response): ExpressResponse {
    const post_model = response.locals.post_model;
    return response.status(HttpStatusCode.OK).json({
      data: post_model
    });
  }

  static async get_user_posts_all(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);

    const serviceMethodResults: ServiceMethodResults = await PostsService.get_user_posts_all(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_posts(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const post_id = parseInt(request.params.post_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await PostsService.get_user_posts(user_id, post_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async create_post(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const data: PlainObject = JSON.parse(request.body.payload);
    const filesInfo: PlainObject[] = data.filesInfo || [];
    const photo_files: UploadedFile | undefined = request.files && (<UploadedFile> request.files.photos);
    const video_files: UploadedFile | undefined = request.files && (<UploadedFile> request.files.videos);
    const audio_files: UploadedFile | undefined = request.files && (<UploadedFile> request.files.audios);
    const options = {
      you_id: you.id,
      data,
      filesInfo,
      photo_files,
      video_files,
      audio_files,
    }

    const serviceMethodResults: ServiceMethodResults = await PostsService.create_post(options);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async update_post(request: Request, response: Response): ExpressResponse {
    const post_id = parseInt(request.params.post_id, 10);
    const you: IUser = response.locals.you;
    const data: PlainObject = JSON.parse(request.body.payload);
    const filesInfo: PlainObject[] = data.filesInfo || [];
    const photo_files: UploadedFile | undefined = request.files && (<UploadedFile> request.files.photos);
    const video_files: UploadedFile | undefined = request.files && (<UploadedFile> request.files.videos);
    const audio_files: UploadedFile | undefined = request.files && (<UploadedFile> request.files.audios);
    const options = {
      you_id: you.id,
      post_id,
      data,
      filesInfo,
      photo_files,
      video_files,
      audio_files,
    }

    const serviceMethodResults: ServiceMethodResults = await PostsService.update_post(options);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async delete_post(request: Request, response: Response): ExpressResponse {
    const post_id = parseInt(request.params.post_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await PostsService.delete_post(post_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}