import { UploadedFile } from 'express-fileupload';
import {
  HttpStatusCode
} from '../../_common/enums/http-codes.enum';
import {
  IUser,
  PlainObject,
} from '../../_common/interfaces/common.interface';
import {
  user_attrs_slim,
  allowedImages
} from '../../_common/common.chamber';
import { IStoreImage, store_image } from '../../../cloudinary-manager';
import * as NewsPostsRepo from '../repos/newsposts.repo';
import * as CommonRepo from '../../_common/repos/_common.repo';
import { Photos } from '../../_common/models/photo.model';
import { Users } from '../../_common/models/user.model';
import { NewsPosts, NewsPostPhotos } from '../models/newspost.model';
import { ServiceMethodAsyncResults, ServiceMethodResults } from 'src/apps/_common/types/common.types';
import { IMyModel } from 'src/apps/_common/models/common.model-types';

export class NewsPostsService {

  static async get_newspost_by_id(newspost_id: number): ServiceMethodAsyncResults {
    const newspost_model = await NewsPostsRepo.get_newspost_by_id(newspost_id);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: newspost_model
      }
    };
    return serviceMethodResults;
  }

  static async get_random_newsposts(): ServiceMethodAsyncResults {
    const newspost_models = await NewsPostsRepo.get_random_newsposts();
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: newspost_models
      }
    };
    return serviceMethodResults;
  }

  static async get_user_newsposts_all(user_id: number): ServiceMethodAsyncResults {
    const newsposts = await CommonRepo.getAll(
      NewsPosts,
      'owner_id',
      user_id,
      [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }, {
        model: NewsPostPhotos,
        as: 'photos',
        include: [{
          model: Photos,
          as: 'photo',
        }]
      }]
    );

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: newsposts
      }
    };
    return serviceMethodResults;
  }

  static async get_user_newsposts(user_id: number, newspost_id: number): ServiceMethodAsyncResults {
    const newsposts = await CommonRepo.paginateTable(
      NewsPosts,
      'owner_id',
      user_id,
      newspost_id,
      [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }, {
        model: NewsPostPhotos,
        as: 'photos',
        include: [{
          model: Photos,
          as: 'photo',
        }]
      }]
    );
    
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: newsposts
      }
    };
    return serviceMethodResults;
  }

  static async create_newspost(opts: {
    you: IUser,
    photo_files: UploadedFile | UploadedFile[] | undefined,
    data: {
      location: string,
      lat: number,
      lng: number,
      place_id: string,
      title: string,
      body: string,
      link: string,
      news_date: any,
      filesInfo: PlainObject[],
    },
  }): ServiceMethodAsyncResults {
    let { you, photo_files, data } = opts;
    let {
      location,
      lat,
      lng,
      place_id,
      title,
      body,
      link,
    } = data;
    let news_date: Date | undefined = data.news_date && new Date(data.news_date);
    if (!news_date) {
      news_date = undefined;
    }

    let filesInfo: PlainObject[] = data.filesInfo || [];

    const required_props: string[] = [
      'location',
      'lat',
      'lng',
      'place_id',
      'title',
      'body',
    ];
    for (const prop of required_props) {
      if (!(<any> data)[prop]) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `${prop} is required`
          }
        };
        return serviceMethodResults;
      }
    }

    const uploadedPhotos: { fileInfo: PlainObject; results: IStoreImage }[] = [];
    const failedFiles: any[] = [];

    if (photo_files) {
      let photos: UploadedFile[] = photo_files.constructor === Array
        ? photo_files // When many files are sent, it is array; when only 1 file is sent, it is an object
        : [photo_files] as UploadedFile[]; // when single file; make an array for consistency

      if (photos.length > 3) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `Maximum of photo files is 3`
          }
        };
        return serviceMethodResults;
      }
      
      for (const photo of photos) {
        const type: string = photo.mimetype.split('/')[1];
        const isInvalidType: boolean = !allowedImages.includes(type);
        if (isInvalidType) {
          const serviceMethodResults: ServiceMethodResults = {
            status: HttpStatusCode.BAD_REQUEST,
            error: true,
            info: {
              message: 'Invalid file type: jpg, jpeg or png required...'
            }
          };
          return serviceMethodResults;
        }
      }

      for (let i = 0; i < photos.length; i++) {
        const fileInfo = filesInfo[i];
        const results: IStoreImage = await store_image(photos[i]);
        if (!results.result) {
          failedFiles.push({ results, fileInfo });
        } else {
          uploadedPhotos.push({ results, fileInfo });
        }
      }
    }

    const newspost_model: IMyModel = await NewsPostsRepo.create_newspost({
      owner_id: you.id,
      location,
      lat,
      lng,
      place_id,
      title,
      body,
      link,
      icon_link: '',
      icon_id: '',
      news_date,
      uploadedPhotos,
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `NewsPost created successfully`,
        data: newspost_model
      }
    };
    return serviceMethodResults;
  }

  static async update_newspost(opts: {
    you: IUser,
    newspost_id: number,
    title: string,
    body: string,
    link: string,
  }): ServiceMethodAsyncResults {
    const { you, newspost_id, title, body, link } = opts;
    const checkObj: any = { title, body };
    
    const required_props: string[] = [
      'title',
      'body',
    ];
    for (const prop of required_props) {
      if (!checkObj[prop]) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `${prop} is required`,
          }
        };
        return serviceMethodResults;
      }
    }

    const updates: [number, IMyModel[]] = await NewsPostsRepo.update_newspost({ title, body, link }, newspost_id);
    const newspost: IMyModel | null = await NewsPostsRepo.get_newspost_by_id(newspost_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `NewsPost updated successfully`,
        data: {
          updates,
          newspost,
        }
      }
    };
    return serviceMethodResults;
  }

  static async delete_newspost(newspost_id: number): ServiceMethodAsyncResults {
    const deletes: number = await NewsPostsRepo.delete_newspost(newspost_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `NewsPost deleted successfully`,
        data: deletes
      }
    };
    return serviceMethodResults;
  }
}
