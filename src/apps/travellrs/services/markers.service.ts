import { UploadedFile } from 'express-fileupload';
import {
  HttpStatusCode
} from '../../_common/enums/http-codes.enum';
import {
  IAppService,
  IUser,
} from '../../_common/interfaces/common.interface';
import * as MarkersRepo from '../repos/markers.repo';
import {
  allowedImages, validateAndUploadImageFile, validateData
} from '../../_common/common.chamber';
import { store_image } from '../../../cloudinary-manager';
import { Markers, MarkerPhotos, MarkerReactions, MarkerAudios, MarkerVideos } from '../models/marker.model';
import { COMMON_REACTION_TYPES } from '../../_common/enums/common.enum';
import { ServiceMethodResults } from '../../_common/types/common.types';
import { create_marker_required_props } from '../travellrs.chamber';

export class MarkersService {
  static async get_marker_by_id(id: number) {
    const marker_model = await MarkersRepo.get_marker_by_id(id);
    
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: marker_model
      }
    };
    return serviceMethodResults;
  }

  static async get_random_markers() {
    const marker_models = MarkersRepo.get_random_markers();
    
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: marker_models
      }
    };
    return serviceMethodResults;
  }

  static async get_user_markers_all(user_id: number) {
    const markers = await MarkersRepo.get_user_markers_all(user_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: markers
      }
    };
    return serviceMethodResults;
  }

  static async get_user_markers(user_id: number, marker_id: number) {
    const markers = await MarkersRepo.get_user_markers(user_id, marker_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: markers
      }
    };
    return serviceMethodResults;
  }

  static async get_user_reaction(user_id: number, marker_id: number) {
    const marker_reaction = await MarkersRepo.get_user_reaction(user_id, marker_id);
    
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: marker_reaction
      }
    };
    return serviceMethodResults;
  }

  static async toggle_user_reaction(options: {
    you: IUser,
    marker_id: number,
    reaction: string,
  }) {
    const { you, marker_id, reaction } = options;

    if (!reaction) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Reaction type is required`
        }
      };
      return serviceMethodResults;
    }
    if (!(typeof (reaction) === 'string')) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Reaction type is invalid`
        }
      };
      return serviceMethodResults;
    }
    if (!(reaction in COMMON_REACTION_TYPES)) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Reaction type is invalid`
        }
      };
      return serviceMethodResults;
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

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Toggled marker reaction`,
        data: marker_reaction
      }
    };
    return serviceMethodResults;
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

    const serviceMethodResults: ServiceMethodResults = {
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
    return serviceMethodResults;
  }

  static async get_marker_reactions_all(marker_id: number) {
    const marker_reactions = await MarkersRepo.get_marker_reactions_all(marker_id);
    
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: marker_reactions
      }
    };
    return serviceMethodResults;
  }

  static async get_marker_reactions(marker_id: number, reaction_id: number) {
    const marker_reactions = await MarkersRepo.get_marker_reactions(marker_id, reaction_id);
    
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: marker_reactions
      }
    };
    return serviceMethodResults;
  }

  static async create_marker(options: {
    data: any,
    you: IUser,
    marker_icon?: UploadedFile
  }) {
    const { you, data, marker_icon } = options;
    
    let date_traveled: any = data.date_traveled;
    let time_traveled: any = data.time_traveled;
    let datetime_traveled: Date | null = date_traveled && time_traveled  && new Date(`${date_traveled}T${time_traveled}`);
    if (!datetime_traveled) {
      datetime_traveled = null;
    }
    
    const createObj: any = {
      owner_id: you.id as number,
      caption: (data.caption || '') as string,
      date_traveled: datetime_traveled || null,
    };

    const dataValidation = validateData({
      data, 
      validators: create_marker_required_props,
      mutateObj: createObj
    });
    if (dataValidation.error) {
      return dataValidation;
    }

    const imageValidation = await validateAndUploadImageFile(marker_icon, {
      treatNotFoundAsError: false,
      mutateObj: createObj,
      id_prop: 'image_id',
      link_prop: 'image_link',
    });
    if (imageValidation.error) {
      return imageValidation;
    }

    const marker_model = await MarkersRepo.create_marker(createObj);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: marker_model,
        message: `Marker created successfully`,
      }
    };
    return serviceMethodResults;
  }

  static async update_marker(marker_id: number, caption: string) {
    if (!caption) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: false,
        info: {
          message: `Marker body is required`
        }
      };
      return serviceMethodResults;
    }

    const updates = await MarkersRepo.update_marker({ caption }, marker_id);
    const marker = await MarkersRepo.get_marker_by_id(marker_id);

    const serviceMethodResults: ServiceMethodResults = {
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
    return serviceMethodResults;
  }

  static async delete_marker(marker_id: number) {
    const deletes = await MarkersRepo.delete_marker(marker_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Marker deleted successfully`,
        data: deletes
      }
    };
    return serviceMethodResults;
  }
}