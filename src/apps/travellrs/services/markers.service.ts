import { UploadedFile } from 'express-fileupload';
import {
  HttpStatusCode
} from '../../_common/enums/http-codes.enum';
import {
  IUser,
} from '../../_common/interfaces/common.interface';
import * as MarkersRepo from '../repos/markers.repo';
import {
  allowedImages
} from '../../_common/common.chamber';
import { store_image } from '../../../cloudinary-manager';
import { Markers, MarkerPhotos, MarkerReactions, MarkerAudios, MarkerVideos } from '../models/marker.model';
import { COMMON_REACTION_TYPES } from '../../_common/enums/common.enum';
import { ServiceMethodResult } from 'src/apps/_common/types/common.types';

export class MarkersService {
  static async get_marker_by_id(id: number) {
    const marker_model = await MarkersRepo.get_marker_by_id(id);
    
    const results: ServiceMethodResult = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: marker_model
      }
    };
    return results;
  }

  static async get_random_markers() {
    const marker_models = MarkersRepo.get_random_markers();
    
    const results: ServiceMethodResult = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: marker_models
      }
    };
    return results;
  }

  static async get_user_markers_all(user_id: number) {
    const markers = await MarkersRepo.get_user_markers_all(user_id);

    const results: ServiceMethodResult = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: markers
      }
    };
    return results;
  }

  static async get_user_markers(user_id: number, marker_id: number) {
    const markers = await MarkersRepo.get_user_markers(user_id, marker_id);

    const results: ServiceMethodResult = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: markers
      }
    };
    return results;
  }

  static async get_user_reaction(user_id: number, marker_id: number) {
    const marker_reaction = await MarkersRepo.get_user_reaction(user_id, marker_id);
    
    const results: ServiceMethodResult = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: marker_reaction
      }
    };
    return results;
  }

  static async toggle_user_reaction(opts: {
    you: IUser,
    marker_id: number,
    reaction: string,
  }) {
    const { you, marker_id, reaction } = opts;

    if (!reaction) {
      const results: ServiceMethodResult = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Reaction type is required`
        }
      };
      return results;
    }
    if (!(typeof (reaction) === 'string')) {
      const results: ServiceMethodResult = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Reaction type is invalid`
        }
      };
      return results;
    }
    if (!(reaction in COMMON_REACTION_TYPES)) {
      const results: ServiceMethodResult = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Reaction type is invalid`
        }
      };
      return results;
    }

    let marker_reaction = await MarkersRepo.get_user_reaction(you.id, marker_id);

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

    const results: ServiceMethodResult = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Toggled marker reaction`,
        data: marker_reaction
      }
    };
    return results;
  }

  static async get_marker_reactions_counts(marker_id: number) {
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

    const results: ServiceMethodResult = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: {
          total_count,
          like_count,
          love_count,
          idea_count,
          confused_count,
        }
      }
    };
    return results;
  }

  static async get_marker_reactions_all(marker_id: number) {
    const marker_reactions = await MarkersRepo.get_marker_reactions_all(marker_id);
    
    const results: ServiceMethodResult = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: marker_reactions
      }
    };
    return results;
  }

  static async get_marker_reactions(marker_id: number, reaction_id: number) {
    const marker_reactions = await MarkersRepo.get_marker_reactions(marker_id, reaction_id);
    
    const results: ServiceMethodResult = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: marker_reactions
      }
    };
    return results;
  }

  static async create_marker(opts: {
    data: any,
    you: IUser,
    marker_icon?: UploadedFile
  }) {
    const { you, data, marker_icon } = opts;

    let location: string = data.location;
    let lat: number = data.lat;
    let lng: number = data.lng;
    let place_id: string = data.place_id;
    let caption: string = data.caption || '';
    
    let date_traveled: any = data.date_traveled;
    let time_traveled: any = data.time_traveled;
    let datetime_traveled: Date | null = date_traveled && time_traveled  && new Date(`${date_traveled}T${time_traveled}`);
    if (!datetime_traveled) {
      datetime_traveled = null;
    }

    let props = ['location', 'lat', 'lng', 'place_id'];
    for (const prop of props) {
      if (!data[prop]) {
        const results: ServiceMethodResult = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `${prop} is required`
          }
        };
        return results;
      }
    }

    let image_id = '';
    let image_link = '';
    if (marker_icon) {
      const type = marker_icon.mimetype.split('/')[1];
      const isInvalidType = !allowedImages.includes(type);
      if (isInvalidType) {
        const results: ServiceMethodResult = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: 'Invalid file type: jpg, jpeg or png required...'
          }
        };
        return results;
      }

      const results = await store_image(marker_icon);
      if (!results.result) {
        const results: ServiceMethodResult = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: 'Could not upload file...'
          }
        };
        return results;
      }

      image_id = results.result.public_id,
      image_link = results.result.secure_url
    }

    const marker_model = await MarkersRepo.create_marker({
      owner_id: you.id,
      location,
      lat,
      lng,
      caption,
      place_id,
      image_id,
      image_link,
      date_traveled: datetime_traveled || null,
    });

    const results: ServiceMethodResult = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: marker_model,
        message: `Marker created successfully`,
      }
    };
    return results;
  }

  static async update_marker(marker_id: number, caption: string) {
    if (!caption) {
      const results: ServiceMethodResult = {
        status: HttpStatusCode.BAD_REQUEST,
        error: false,
        info: {
          message: `Marker body is required`
        }
      };
      return results;
    }

    const updates = await MarkersRepo.update_marker({ caption }, marker_id);
    const marker = await MarkersRepo.get_marker_by_id(marker_id);

    const results: ServiceMethodResult = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Marker updated successfully`,
        data: {
          updates,
          marker
        }
      }
    };
    return results;
  }

  static async delete_marker(marker_id: number) {
    const deletes = await MarkersRepo.delete_marker(marker_id);

    const results: ServiceMethodResult = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Marker deleted successfully`,
        data: deletes
      }
    };
    return results;
  }
}