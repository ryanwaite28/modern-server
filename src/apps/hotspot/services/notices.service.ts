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
import * as NoticesRepo from '../repos/notices.repo';
import {
  allowedImages,
  user_attrs_slim
} from '../../_common/common.chamber';
import { Users } from '../../_common/models/user.model';
import { IMyModel } from '../../_common/models/common.model-types';
import { NoticeVisibility } from '../enums/hotspot.enum';
import { IStoreImage, store_image } from '../../../cloudinary-manager';
import { UploadedFile } from 'express-fileupload';

export class NoticesService {

  static async get_notice_by_id(request: Request, response: Response) {
    const notice_model: IMyModel = response.locals.notice_model;
    return response.status(HttpStatusCode.OK).json({
      data: notice_model
    });
  }

  static async create_notice(request: Request, response: Response) {
    const you: IUser = response.locals.you;
    const data: PlainObject = request.body;

    // a notice can only reply to, quote, or share one other notice.
    // make sure only one of the following props have value: parent_id, quote_id, share_id
    const invalid_count = ['parent_id', 'quote_id', 'share_id']
      .map((key: string) => (data[key] ? 1 : 0) as number)
      .reduce((acc: number, cur: number) => acc + cur);
    if (invalid_count > 1) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `A notice can only reply to, quote, or share one other notice.`
      }); 
    }

    if (!(/(.*){3,}/).test(data.body)) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `New notice must be at least 3 characters.`
      }); 
    }

    const all_tags_valid = data.tags.length === 0 || data.tags.every((tag: any) => (typeof (tag) === 'string') && tag.length <= 30);
    if (!all_tags_valid) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `All elements in tags list must be a string`
      });
    }
    if (data.tags && data.tags.length > 20) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Maximum of tags list is 20`
      });
    }

    const uploadedPhotos: { fileInfo: PlainObject; results: IStoreImage }[] = [];
    const failedFiles: any[] = [];
    
    const photo_files: UploadedFile | undefined = request.files && (<UploadedFile> request.files.photos);
    let filesInfo: PlainObject[] = data.filesInfo || [];
    
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

    const createNoticeObj = {
      owner_id: you.id,
      parent_id: data.parent_id,
      quote_id: data.quote_id,
      share_id: data.share_id,
      body: data.body,
      tags: data.tags,
      visibility: data.visibility in NoticeVisibility && data.visibility || NoticeVisibility.PUBLIC,
      is_explicit: data.hasOwnProperty('is_explicit') && data.is_explicit || false,
      is_private: data.hasOwnProperty('is_private') && data.is_private || false,
      uploadedPhotos: uploadedPhotos,
    };
    const new_notice_model = await NoticesRepo.create_notice(createNoticeObj);

    return response.status(HttpStatusCode.OK).json({
      data: new_notice_model
    });
  }

  static async delete_notice(request: Request, response: Response) {
    const notice_model: IMyModel = response.locals.notice_model;
    const deletes = await notice_model.destroy();
    return response.status(HttpStatusCode.OK).json({
      data: deletes
    });
  }

}