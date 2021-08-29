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
import * as MarkersRepo from '../repos/markers.repo';
import {
  user_attrs_slim,
  allowedImages
} from '../../_common/common.chamber';
import { IStoreImage, store_image } from '../../../cloudinary-manager';
import { Photos } from '../../_common/models/photo.model';
import { Markers, MarkerPhotos, MarkerReactions } from '../models/marker.model';
import { Users } from '../../_common/models/user.model';
import { COMMON_REACTION_TYPES } from '../../_common/enums/common.enum';

export class MarkersService {
  /** Request Handlers */

  static async main(request: Request, response: Response) {
    return response.status(HttpStatusCode.OK).json({
      msg: 'markers router'
    });
  }

  static async get_marker_by_id(request: Request, response: Response) {
    const marker_model = response.locals.marker_model;
    return response.status(HttpStatusCode.OK).json({
      data: marker_model
    });
  }

  static async get_random_markers(request: Request, response: Response) {
    const marker_models = MarkersRepo.get_random_markers();
    return response.status(HttpStatusCode.OK).json({
      data: marker_models
    });
  }

  static async get_user_markers_all(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    const markers = await CommonRepo.getAll(
      Markers,
      'owner_id',
      user_id,
      [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }, {
        model: MarkerPhotos,
        as: 'photos',
        include: [{
          model: Photos,
          as: 'photo',
        }]
      }]
    );
    return response.status(HttpStatusCode.OK).json({
      data: markers
    });
  }

  static async get_user_markers(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    const marker_id = parseInt(request.params.marker_id, 10);
    const markers = await CommonRepo.paginateTable(
      Markers,
      'owner_id',
      user_id,
      marker_id,
      [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }, {
        model: MarkerPhotos,
        as: 'photos',
        include: [{
          model: Photos,
          as: 'photo',
        }]
      }]
    );
    return response.status(HttpStatusCode.OK).json({
      data: markers
    });
  }

  static async get_user_reaction(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    const marker_id: number = parseInt(request.params.marker_id, 10);
    const marker_reaction = await MarkerReactions.findOne({
      where: {
        marker_id,
        owner_id: user_id
      }
    });
    return response.status(HttpStatusCode.OK).json({
      data: marker_reaction
    });
  }

  static async toggle_user_reaction(request: Request, response: Response) {
    const you: IUser = response.locals.you;
    const marker_id: number = parseInt(request.params.marker_id, 10);

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

    let marker_reaction = await MarkerReactions.findOne({
      where: {
        marker_id,
        owner_id: you.id
      }
    });

    if (!marker_reaction) {
      // user has no reaction to marker; create it
      marker_reaction = await MarkerReactions.create(<any> {
        reaction,
        marker_id,
        owner_id: you.id
      });
    } else if (marker_reaction.get('reaction') === reaction) {
      // user's reaction is same to request; they intended to undo the reaction
      await marker_reaction.destroy();
      marker_reaction = null;
    } else {
      // user's reaction is different to request; they intended to change the reaction
      marker_reaction.reaction = reaction;
      await marker_reaction.save({ fields: ['reaction'] });
    }


    return response.status(HttpStatusCode.OK).json({
      message: `Toggled marker reaction`,
      data: marker_reaction
    });
  }

  static async get_marker_reactions_counts(request: Request, response: Response) {
    const marker_id: number = parseInt(request.params.marker_id, 10);

    const like_count = await MarkerReactions.count({ where: { marker_id, reaction: COMMON_REACTION_TYPES.LIKE } });
    const love_count = await MarkerReactions.count({ where: { marker_id, reaction: COMMON_REACTION_TYPES.LOVE } });
    const idea_count = await MarkerReactions.count({ where: { marker_id, reaction: COMMON_REACTION_TYPES.IDEA } });
    const confused_count = await MarkerReactions.count({ where: { marker_id, reaction: COMMON_REACTION_TYPES.CONFUSED } });

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

  static async get_marker_reactions_all(request: Request, response: Response) {
    const marker_id: number = parseInt(request.params.marker_id, 10);
    const marker_reactions = await CommonRepo.getAll(
      MarkerReactions,
      'marker_id',
      marker_id,
      [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }]
    );
    return response.status(HttpStatusCode.OK).json({
      data: marker_reactions
    });
  }

  static async get_marker_reactions(request: Request, response: Response) {
    const marker_id = parseInt(request.params.marker_id, 10);
    const marker_reaction_id: number = parseInt(request.params.marker_reaction_id, 10);
    const marker_reactions = await CommonRepo.paginateTable(
      MarkerReactions,
      'marker_id',
      marker_id,
      marker_reaction_id,
      [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }]
    );
    return response.status(HttpStatusCode.OK).json({
      data: marker_reactions
    });
  }

  static async create_marker(request: Request, response: Response) {
    const you: IUser = response.locals.you;
    const data: PlainObject = JSON.parse(request.body.payload);
    
    let location: string = data.location;
    let lat: number = data.lat;
    let lng: number = data.lng;
    let place_id: string = data.place_id;
    let caption: string = data.caption;
    let date_traveled: any = data.date_traveled && new Date(data.date_traveled);
    if (!date_traveled) {
      date_traveled = null;
    }

    let filesInfo: PlainObject[] = data.filesInfo || [];
    const photo_files: UploadedFile | undefined = request.files && (<UploadedFile> request.files.photos);

    // console.log({
    //   body: request.body,
    //   files: request.files,
    //   photo_files,
    //   photo_files_cstr: photo_files && photo_files.constructor,
    // });

    // return response.status(HttpStatusCode.BAD_REQUEST).json({
    //   message: `Marker body is required`
    // });

    let props = ['location', 'lat', 'lng', 'place_id', 'caption', 'date_traveled'];
    for (const prop of props) {
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

    const marker_model = await MarkersRepo.create_marker({
      owner_id: you.id,
      location,
      lat,
      lng,
      caption,
      place_id,
      date_traveled,
      uploadedPhotos,
    });

    return response.status(HttpStatusCode.OK).json({
      message: `Marker created successfully`,
      data: marker_model
    });
  }

  static async update_marker(request: Request, response: Response) {
    const marker_id = parseInt(request.params.marker_id, 10);
    const you: IUser = response.locals.you; 
    let caption: string = request.body.caption;
    
    if (!caption) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Marker body is required`
      });
    }

    const updates = await MarkersRepo.update_marker({ caption }, marker_id);
    const marker = await MarkersRepo.get_marker_by_id(marker_id);
    return response.status(HttpStatusCode.OK).json({
      message: `Marker updated successfully`,
      updates: updates,
      data: marker
    });
  }

  static async delete_marker(request: Request, response: Response) {
    const marker_id = parseInt(request.params.marker_id, 10);
    const deletes = await MarkersRepo.delete_marker(marker_id);
    return response.status(HttpStatusCode.OK).json({
      message: `Marker deleted successfully`,
      deletes
    });
  }
}