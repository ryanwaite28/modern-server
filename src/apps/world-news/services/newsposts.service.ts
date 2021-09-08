import { UploadedFile } from 'express-fileupload';
import {
  Request,
  Response,
} from 'express';
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
import { COMMON_REACTION_TYPES } from '../../_common/enums/common.enum';
import * as NewsPostsRepo from '../repos/newsposts.repo';
import * as CommonRepo from '../../_common/repos/_common.repo';
import { Photos } from '../../_common/models/photo.model';
import { Users } from '../../_common/models/user.model';
import { NewsPosts, NewsPostPhotos, NewsPostReactions } from '../models/newspost.model';

export class NewsPostsService {
  /** Request Handlers */

  static async main(request: Request, response: Response) {
    return response.status(HttpStatusCode.OK).json({
      msg: 'newsposts router'
    });
  }

  static async get_newspost_by_id(request: Request, response: Response) {
    const newspost_model = response.locals.newspost_model;
    return response.status(HttpStatusCode.OK).json({
      data: newspost_model
    });
  }

  static async get_random_newsposts(request: Request, response: Response) {
    const newspost_models = NewsPostsRepo.get_random_newsposts();
    return response.status(HttpStatusCode.OK).json({
      data: newspost_models
    });
  }

  static async get_user_newsposts_all(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
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
    return response.status(HttpStatusCode.OK).json({
      data: newsposts
    });
  }

  static async get_user_newsposts(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    const newspost_id = parseInt(request.params.newspost_id, 10);
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
    return response.status(HttpStatusCode.OK).json({
      data: newsposts
    });
  }

  static async get_user_reaction(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    const newspost_id: number = parseInt(request.params.newspost_id, 10);
    const newspost_reaction = await NewsPostReactions.findOne({
      where: {
        newspost_id,
        owner_id: user_id
      }
    });
    return response.status(HttpStatusCode.OK).json({
      data: newspost_reaction
    });
  }

  static async toggle_user_newspost_reaction(request: Request, response: Response) {
    const you: IUser = response.locals.you;
    const newspost_id: number = parseInt(request.params.newspost_id, 10);

    const reaction = request.body.reaction;
    if (!reaction) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Reaction type is required`
      });
    }
    if (!(typeof (reaction) === 'string')) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Reaction type is invalid`
      });
    }
    if (!(reaction in COMMON_REACTION_TYPES)) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Reaction type is invalid`
      });
    }

    let newspost_reaction = await NewsPostReactions.findOne({
      where: {
        newspost_id,
        owner_id: you.id
      }
    });

    if (!newspost_reaction) {
      // user has no reaction to newspost; create it
      newspost_reaction = await NewsPostReactions.create(<any> {
        reaction,
        newspost_id,
        owner_id: you.id
      });
    } else if (newspost_reaction.get('reaction') === reaction) {
      // user's reaction is same to request; they intended to undo the reaction
      await newspost_reaction.destroy();
      newspost_reaction = null;
    } else {
      // user's reaction is different to request; they intended to change the reaction
      newspost_reaction.reaction = reaction;
      await newspost_reaction.save({ fields: ['reaction'] });
    }


    return response.status(HttpStatusCode.OK).json({
      message: `Toggled newspost reaction`,
      data: newspost_reaction
    });
  }

  static async get_newspost_reactions_counts(request: Request, response: Response) {
    const newspost_id: number = parseInt(request.params.newspost_id, 10);

    const like_count = await NewsPostReactions.count({ where: { newspost_id, reaction: COMMON_REACTION_TYPES.LIKE } });
    const love_count = await NewsPostReactions.count({ where: { newspost_id, reaction: COMMON_REACTION_TYPES.LOVE } });
    const idea_count = await NewsPostReactions.count({ where: { newspost_id, reaction: COMMON_REACTION_TYPES.IDEA } });
    const confused_count = await NewsPostReactions.count({ where: { newspost_id, reaction: COMMON_REACTION_TYPES.CONFUSED } });

    const total_count: number = [
      like_count,
      love_count,
      idea_count,
      confused_count,
    ].reduce((acc, cur) => (acc + cur));

    return response.status(HttpStatusCode.OK).json({
      data: {
        total_count,
        like_count,
        love_count,
        idea_count,
        confused_count,
      }
    });
  }

  static async get_newspost_reactions_all(request: Request, response: Response) {
    const newspost_id: number = parseInt(request.params.newspost_id, 10);
    const newspost_reactions = await CommonRepo.getAll(
      NewsPostReactions,
      'newspost_id',
      newspost_id,
      [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }]
    );
    return response.status(HttpStatusCode.OK).json({
      data: newspost_reactions
    });
  }

  static async get_newspost_reactions(request: Request, response: Response) {
    const newspost_id = parseInt(request.params.newspost_id, 10);
    const newspost_reaction_id: number = parseInt(request.params.newspost_reaction_id, 10);
    const newspost_reactions = await CommonRepo.paginateTable(
      NewsPostReactions,
      'newspost_id',
      newspost_id,
      newspost_reaction_id,
      [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }]
    );
    return response.status(HttpStatusCode.OK).json({
      data: newspost_reactions
    });
  }

  static async create_newspost(request: Request, response: Response) {
    const you: IUser = response.locals.you;
    const data: PlainObject = JSON.parse(request.body.payload);
    
    let location: string = data.location;
    let lat: number = data.lat;
    let lng: number = data.lng;
    let place_id: string = data.place_id;
    let title: string = data.caption;
    let body: string = data.caption;
    let icon_link: string = data.caption;
    let icon_id: string = data.caption;
    let link: string = data.caption;
    let news_date: any = data.news_date && new Date(data.news_date);
    if (!news_date) {
      news_date = null;
    }

    let filesInfo: PlainObject[] = data.filesInfo || [];
    const photo_files: UploadedFile | undefined = request.files && (<UploadedFile> request.files.photos);

    const required_props = [
      'location',
      'lat',
      'lng',
      'place_id',
      'title',
      'body',
      'icon_link',
      'icon_id',
    ];
    for (const prop of required_props) {
      if (!data[prop]) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `${prop} is required`
        });
      }
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

    const newspost_model = await NewsPostsRepo.create_newspost({
      owner_id: you.id,
      location,
      lat,
      lng,
      place_id,
      title,
      body,
      link,
      icon_link,
      icon_id,
      news_date,
      uploadedPhotos,
    });

    return response.status(HttpStatusCode.OK).json({
      message: `NewsPost created successfully`,
      data: newspost_model
    });
  }

  static async update_newspost(request: Request, response: Response) {
    const newspost_id = parseInt(request.params.newspost_id, 10);
    const you: IUser = response.locals.you; 
    let title: string = request.body.caption;
    let body: string = request.body.caption;
    let link: string = request.body.caption;
    
    const required_props = [
      'title',
      'body',
    ];
    for (const prop of required_props) {
      if (!request.body[prop]) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `${prop} is required`
        });
      }
    }

    const updates = await NewsPostsRepo.update_newspost({ title, body, link }, newspost_id);
    const newspost = await NewsPostsRepo.get_newspost_by_id(newspost_id);
    return response.status(HttpStatusCode.OK).json({
      message: `NewsPost updated successfully`,
      updates: updates,
      data: newspost
    });
  }

  static async delete_newspost(request: Request, response: Response) {
    const newspost_id = parseInt(request.params.newspost_id, 10);
    const deletes = await NewsPostsRepo.delete_newspost(newspost_id);
    return response.status(HttpStatusCode.OK).json({
      message: `NewsPost deleted successfully`,
      deletes
    });
  }
}
