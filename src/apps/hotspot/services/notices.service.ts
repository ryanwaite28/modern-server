import { Request, Response } from 'express';
import {
  HttpStatusCode
} from '../../_common/enums/http-codes.enum';
import {
  IUser, PlainObject,
} from '../../_common/interfaces/common.interface';
import * as CommonRepo from '../../_common/repos/_common.repo';
import {
  allowedImages,
  createGenericServiceMethodError,
  createGenericServiceMethodSuccess,
  user_attrs_slim
} from '../../_common/common.chamber';
import { Users } from '../../_common/models/user.model';
import { IMyModel } from '../../_common/models/common.model-types';
import { NoticeVisibility } from '../enums/hotspot.enum';
import { IStoreImage, store_image } from '../../../cloudinary-manager';
import { UploadedFile } from 'express-fileupload';
import { ServiceMethodAsyncResults } from '../../_common/types/common.types';
import {
  get_notice_by_id,
  get_notices_sub_all,
  get_notices_sub,
  get_notice_stats,
  create_notice,
  delete_notice
} from '../repos/notices.repo';



export class NoticesService {

  static async get_notice_by_id(notice_id: number): ServiceMethodAsyncResults {
    const notice_model: IMyModel | null = await get_notice_by_id(notice_id);
    return createGenericServiceMethodSuccess(undefined, notice_model);
  }

  static async get_notice_stats(notice_id: number): ServiceMethodAsyncResults {
    const results = await get_notice_stats(notice_id);
    return createGenericServiceMethodSuccess(undefined, results);
  }

  static async get_notice_replies_all(notice_id: number): ServiceMethodAsyncResults {
    const results = await get_notices_sub_all(notice_id, `parent_id`);
    return createGenericServiceMethodSuccess(undefined, results);
  }

  static async get_notice_replies(notice_id: number, reply_notice_id: number): ServiceMethodAsyncResults {
    const results = await get_notices_sub(notice_id, `parent_id`, reply_notice_id);
    return createGenericServiceMethodSuccess(undefined, results);
  }

  static async get_notice_quotes_all(notice_id: number): ServiceMethodAsyncResults {
    const results = await get_notices_sub_all(notice_id, `quoting_id`);
    return createGenericServiceMethodSuccess(undefined, results);
  }

  static async get_notice_quotes(notice_id: number, quote_notice_id: number): ServiceMethodAsyncResults {
    const results = await get_notices_sub(notice_id, `quoting_id`, quote_notice_id);
    return createGenericServiceMethodSuccess(undefined, results);
  }

  static async get_notice_shares_all(notice_id: number): ServiceMethodAsyncResults {
    const results = await get_notices_sub_all(notice_id, `share_id`);
    return createGenericServiceMethodSuccess(undefined, results);
  }

  static async get_notice_shares(notice_id: number, share_notice_id: number): ServiceMethodAsyncResults {
    const results = await get_notices_sub(notice_id, `share_id`, share_notice_id);
    return createGenericServiceMethodSuccess(undefined, results);
  }

  static async create_notice(options: {
    you_id: number,
    data: PlainObject | {
      parent_id: number,
      quote_id: number,
      share_id: number,
      body: string,
      tags: string[],
      visibility?: string,
      is_explicit?: boolean,
      is_private?: boolean,
    },
    photo_files: UploadedFile | undefined,
    filesInfo: PlainObject[],
  }): ServiceMethodAsyncResults {
    const { you_id, data, photo_files, filesInfo } = options;

    // a notice can only reply to, quote, or share one other notice.
    // make sure only one of the following props have value: parent_id, quote_id, share_id
    const invalid_count = ['parent_id', 'quote_id', 'share_id']
      .map((key: string) => ((key in data) ? 1 : 0) as number)
      .reduce((acc: number, cur: number) => acc + cur, 0);
    if (invalid_count > 1) {
      return createGenericServiceMethodError(`A notice can only reply to, quote, or share one other notice.`);
    }

    if (!(/(.*){3,}/).test(data.body)) {
      return createGenericServiceMethodError(`New notice must be at least 3 characters.`);
    }

    const all_tags_valid = data.tags.length === 0 || data.tags.every((tag: any) => (typeof (tag) === 'string') && tag.length <= 30);
    if (!all_tags_valid) {
      return createGenericServiceMethodError(`All elements in tags list must be a string`);
    }
    if (data.tags && data.tags.length > 20) {
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

    const createNoticeObj = {
      owner_id: you_id,
      parent_id: data.parent_id,
      quote_id: data.quote_id,
      share_id: data.share_id,
      body: data.body,
      tags: data.tags,
      visibility: data.visibility in NoticeVisibility ? data.visibility : NoticeVisibility.PUBLIC,
      is_explicit: data.hasOwnProperty('is_explicit') && data.is_explicit || false,
      is_private: data.hasOwnProperty('is_private') && data.is_private || false,
      uploadedPhotos: uploadedPhotos,
    };

    const new_notice_model = await create_notice(createNoticeObj);
    return createGenericServiceMethodSuccess(undefined, new_notice_model);
  }

  static async delete_notice(notice_id: number): ServiceMethodAsyncResults {
    const deletes = await delete_notice(notice_id);
    return createGenericServiceMethodSuccess(`Notice deleted.`, deletes);
  }

}