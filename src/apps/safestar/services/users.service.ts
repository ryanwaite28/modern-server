import { Request } from 'express';
import { UploadedFile } from 'express-fileupload';
import * as bcrypt from 'bcrypt-nodejs';
import {
  fn,
  Op,
  col,
  cast
} from 'sequelize';
import { get_user_unread_watches_messages_count } from '../repos/watches.repo';
import { get_user_unread_conversations_messages_count } from '../repos/conversations.repo';
import { get_user_unread_personal_messages_count } from '../repos/messagings.repo';
import { AuthorizeJWT, validateData, create_user_required_props, capitalize, validatePassword, validateAndUploadImageFile, newUserJwtToken, validateEmail, validateUsername, populate_notification_obj } from '../safestar.chamber';
import { IUserLocationUpdate } from '../interfaces/safestar.interface';
import { TrackingsService } from './trackings.service';
import { SAFESTAR_EVENT_TYPES, SAFESTAR_NOTIFICATION_TARGET_TYPES } from '../enums/safestar.enum';
import { get_user_checkpoints_received_all_pending_count, get_user_checkpoints_received_count, get_user_checkpoints_sent_count } from '../repos/checkpoints.repo';
import { get_user_trackers_count, get_user_tracker_requests_pending_count, get_user_trackings_count } from '../repos/trackings.repo';
import {
  create_user,
  create_user_location_update,
  find_users_by_name,
  find_users_by_name_or_username,
  find_users_by_username,
  find_users_within_radius_of_point,
  get_random_users,
  get_recent_users,
  get_user_by_email,
  get_user_by_id,
  get_user_by_phone,
  update_user
} from '../repos/users.repo';
import { get_user_pulses_count } from '../repos/pulses.repo';
import { ServiceMethodAsyncResults, ServiceMethodResults } from '../../_common/types/common.types';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { IUser, PlainObject } from '../../_common/interfaces/common.interface';
import { SafestarAppFeedbacks } from '../models/user.model';
import { create_notification, get_user_unseen_notifications_count } from '../../_common/repos/notifications.repo';
import { create_email_verification } from '../../_common/repos/email-verification.repo';
import { SignedUp_EMAIL, VerifyEmail_EMAIL } from '../../../template-engine';
import { send_email } from '../../../email-client';
import { check_verify_sms_request } from '../../../sms-client';
import { delete_cloudinary_image } from '../../../cloudinary-manager';
import { MODERN_APP_NAMES } from '../../_common/enums/common.enum';
import { CommonSocketEventsHandler } from '../../_common/services/socket-events-handlers-by-app/common.socket-event-handler';



export class UsersService {

  /** Request Handlers */



  static async get_user_by_id(user_id: number): ServiceMethodAsyncResults {
    const user: IUser | null = await get_user_by_id(user_id);
    
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: user
      }
    };
    return serviceMethodResults;
  }

  static async get_recent_users(you_id: number) {
    const users: IUser[] = await get_recent_users(you_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: users
      }
    };
    return serviceMethodResults;
  }

  static async get_user_by_phone(phone: string): ServiceMethodAsyncResults {
    const user: IUser | null = await get_user_by_phone(phone);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: user
      }
    };
    return serviceMethodResults;
  }

  static async send_feedback(opts: {
    you: IUser,
    rating: number,
    title: string,
    summary: string,
  }): ServiceMethodAsyncResults {
    let { you, rating, title, summary } = opts;

    if (!rating) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `rating is required`
        }
      };
      return serviceMethodResults;
    }
    if (!title) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `title is required`
        }
      };
      return serviceMethodResults;
    }
    if (!summary) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `summary is required`
        }
      };
      return serviceMethodResults;
    }

    const new_feedback_model = await SafestarAppFeedbacks.create({
      rating,
      title,
      summary,
      user_id: you.id
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: {
          message: `Feedback submitted successfully`,
          feedback: new_feedback_model,
          success: true
        }
      }
    };
    return serviceMethodResults;
  }

  static async get_unseen_counts(user: IUser): ServiceMethodAsyncResults {
    try {
      const unseen_messages = await get_user_unread_personal_messages_count(user.id);
      const unseen_conversations = await get_user_unread_conversations_messages_count(user.id);
      const unseen_watches = await get_user_unread_watches_messages_count(user.id);
      const unseen_checkpoints = await get_user_checkpoints_received_all_pending_count(user.id);
      const unseen_trackings = await get_user_tracker_requests_pending_count(user.id);
      const unseen_notifications = await get_user_unseen_notifications_count(user.id, user.notifications_last_opened);

      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: {
            unseen_messages,
            unseen_conversations,
            unseen_watches,
            unseen_checkpoints,
            unseen_trackings,
            unseen_notifications,
          }
        }
      };
      return serviceMethodResults;
    } catch (e) {
      console.log(`get_unseen_counts error:`, e);
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        error: true,
        info: {
          error: e,
        }
      };
      return serviceMethodResults;
    }
  }

  static async update_info(opts: {
    you: IUser,
    email: string,
    username: string,
    bio: string,
    is_public: boolean,
    allow_messaging: boolean,
    allow_conversations: boolean,
    host: string,
  }): ServiceMethodAsyncResults {
    let {
      you,
      email,
      username,
      bio,
      is_public,
      allow_messaging,
      allow_conversations,
      host,
    } = opts;

    let email_changed = false;

    const updatesObj: { [key:string]: any; } = {
      allow_messaging,
      allow_conversations,
      is_public,
      bio: bio || '',
    };

    // check request data

    if (email) {
      const emailIsDifferent = you.email !== email;
      if (emailIsDifferent) {
        const check_email = await get_user_by_email(email);
        if (check_email) {
          const serviceMethodResults: ServiceMethodResults = {
            status: HttpStatusCode.FORBIDDEN,
            error: true,
            info: {
              message: `Email is taken`
            }
          };
          return serviceMethodResults;
        } 
        else if (!validateEmail(email)) {
          const serviceMethodResults: ServiceMethodResults = {
            status: HttpStatusCode.BAD_REQUEST,
            error: true,
            info: {
              message: `Email is in bad format`
            }
          };
          return serviceMethodResults;
        }
        else {
          updatesObj.email = email;
          updatesObj.email_verified = false;
          email_changed = true;
        }
      }
    }

    if (username) {
      const usernameIsDifferent = you.username !== username;
      if (usernameIsDifferent) {
        const check_username = await get_user_by_email(username);
        if (check_username) {
          const serviceMethodResults: ServiceMethodResults = {
            status: HttpStatusCode.FORBIDDEN,
            error: true,
            info: {
              message: 'Username already in use'
            }
          };
          return serviceMethodResults;
        }
        else if (!validateUsername(username)) {
          const serviceMethodResults: ServiceMethodResults = {
            status: HttpStatusCode.BAD_REQUEST,
            error: true,
            info: {
              message: 'Username must be: at least 2 characters, alphanumeric, dashes, underscores, periods'
            }
          };
          return serviceMethodResults;
        }
        else {
          updatesObj.username = username;
        }
      }
    }

    const updates = await update_user(updatesObj, { id: you.id });
    const newYouModel = await get_user_by_id(you.id);
    const newYou = newYouModel!;
    delete (<any> newYou).password;

    // check if phone/email changed

    if (email_changed) {
      const new_email_verf_model = await create_email_verification({
        user_id: you.id,
        email: you.email
      });
      const new_email_verf: PlainObject = new_email_verf_model.get({ plain: true });
  
      const verify_link = (<string> host).endsWith('/')
        ? (host + 'verify-email/' + new_email_verf.verification_code)
        : (host + '/verify-email/' + new_email_verf.verification_code);
      const email_subject = `${process.env.APP_NAME} - Email Changed`;
      const userName = you.firstname;
      const email_html = VerifyEmail_EMAIL({
        ...you,
        name: userName,
        verify_link,
        appName: process.env.APP_NAME
      });
  
      // don't "await" for email response.
      const send_email_params = {
        to: you.email,
        name: userName,
        subject: email_subject,
        html: email_html
      };
      send_email(send_email_params)
        .then((email_results) => {
          console.log({ email_results: email_results });
        })
        .catch((error: any) => {
          console.log({ email_error: error });
        }); 
    }

    const jwt = newUserJwtToken(newYou);
    
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Info updated successfully`,
        data: {
          you: newYou,
          updates,
          token: jwt,
          email_changed,
        }
      }
    };
    return serviceMethodResults;
  }

  static async update_phone(opts: {
    you: IUser,
    request_id: string,
    code: string,
    phone: string,
    sms_results: PlainObject,
  }): ServiceMethodAsyncResults {
    try {
      let { you, request_id, code, phone, sms_results } = opts;

      if (!sms_results) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `no sms verification in progress...`
          }
        };
        return serviceMethodResults;
      }
      if (sms_results.request_id !== request_id) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `sms request_id is invalid...`
          }
        };
        return serviceMethodResults;
      }

      // try to verify phone
      const sms_verify_results: PlainObject = await check_verify_sms_request({ request_id, code });
      console.log(sms_verify_results);
      if (sms_verify_results.error_text) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `Invalid sms verification code`,
            data: {
              sms_verify_results
            }
          }
        };
        return serviceMethodResults;
      }

      const updates = await update_user({ phone }, { id: you.id });
      const newYouModel = await get_user_by_id(you.id);
      const newYou = newYouModel!;
      delete (<any> newYou).password;

      const jwt = newUserJwtToken(newYou);

      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          message: `Phone number updated successfully`,
          data: {
            sms_verify_results,
            updates,
            you: newYou,
            token: jwt,
          }
        }
      };
      return serviceMethodResults;
    } catch (e) {
      console.log('error:', e);
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        error: true,
        info: {
          message: 'Could not update phone...',
          error: e,
        }
      };
      return serviceMethodResults;
    }
  }

  static async update_password(opts: {
    you: IUser,
    currentPassword: string,
    password: string,
    confirmPassword: string,
  }): ServiceMethodAsyncResults {
    try {
      let { you, currentPassword, password, confirmPassword } = opts;
      const YouModel: IUser | null = await get_user_by_id(you.id, []);
      const You: IUser = YouModel!;

      if (!currentPassword) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: 'Current Password is required'
          }
        };
        return serviceMethodResults;
      }
      if (!password) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `Password field is required.`
          }
        };
        return serviceMethodResults;
      }
      if (!confirmPassword) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `Confirm Password field is required.`
          }
        };
        return serviceMethodResults;
      }
      if (!validatePassword(password)) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: 'Password must be: at least 7 characters, upper and/or lower case alphanumeric'
          }
        };
        return serviceMethodResults;
      }
      if (password !== confirmPassword) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: 'Passwords must match'
          }
        };
        return serviceMethodResults;
      }
      const checkOldPassword = bcrypt.compareSync(currentPassword, You.password!);
      const currentPasswordIsBad = checkOldPassword === false;
      if (currentPasswordIsBad) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.UNAUTHORIZED,
          error: true,
          info: {
            message: 'Current Password is incorrect'
          }
        };
        return serviceMethodResults;
      }
  
      const hash = bcrypt.hashSync(password);
      const updatesObj = { password: hash };
      
      const updates = await update_user(updatesObj, { id: you.id });
      const newYouModel = await get_user_by_id(you.id);
      const newYou = newYouModel!;
      delete (<any> newYou).password;

      const jwt = newUserJwtToken(newYou);

      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          message: 'Password updated successfully',
          data: {
            updates,
            you: newYou,
            token: jwt,
          }
        }
      };
      return serviceMethodResults;
    } catch (e) {
      console.log('error:', e);
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        error: true,
        info: {
          message: 'Could not update password...',
          error: e,
        }
      };
      return serviceMethodResults;
    }
  }

  static async update_icon(opts: {
    you: IUser,
    icon_file: UploadedFile | undefined,
    should_delete: boolean,
  }): ServiceMethodAsyncResults {
    try {
      const { you, icon_file, should_delete } = opts;
      const updatesObj = {
        icon_id: '',
        icon_link: ''
      };
      
      if (!icon_file) {
        // clear icon
        if (!should_delete) {
          const serviceMethodResults: ServiceMethodResults = {
            status: HttpStatusCode.BAD_REQUEST,
            error: true,
            info: {
              message: `Picture file is required`,
            }
          };
          return serviceMethodResults;
        }

        delete_cloudinary_image(you.icon_id);
    
        const updates = await update_user(updatesObj, { id: you.id });
        const newYouModel = await get_user_by_id(you.id);
        const newYou = newYouModel!;
        delete (<any> newYou).password;

        const jwt = newUserJwtToken(newYou);

        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.OK,
          error: false,
          info: {
            message: 'Icon cleared successfully.',
            data: {
              you: newYou,
              updates,
              token: jwt,
            }
          }
        };
        return serviceMethodResults;
      }

      const imageValidation = await validateAndUploadImageFile(icon_file, {
        treatNotFoundAsError: true,
        mutateObj: updatesObj,
        id_prop: 'icon_id',
        link_prop: 'icon_link',
      });
      if (imageValidation.error) {
        return imageValidation;
      }
  
      const updates = await update_user(updatesObj, { id: you.id });
      const newYouModel = await get_user_by_id(you.id);
      const newYou = newYouModel!;
      delete (<any> newYou).password;

      const jwt = newUserJwtToken(newYou);

      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          message: 'Icon updated successfully.' ,
          data: {
            updates,
            you: newYou,
            token: jwt,
          }
        }
      };
      return serviceMethodResults;
    } catch (e) {
      console.log('error:', e);
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        error: true,
        info: {
          message: 'Could not update icon...' ,
        }
      };
      return serviceMethodResults;
    }
  }

  static async update_wallpaper(opts: {
    you: IUser,
    wallpaper_file: UploadedFile | undefined,
    should_delete: boolean,
  }): ServiceMethodAsyncResults {
    try {
      const { you, wallpaper_file, should_delete } = opts;
      const updatesObj = {
        wallpaper_id: '',
        wallpaper_link: ''
      };

      if (!wallpaper_file) {
        // clear wallpaper
        if (!should_delete) {
          const serviceMethodResults: ServiceMethodResults = {
            status: HttpStatusCode.BAD_REQUEST,
            error: true,
            info: {
              message: `Picture file is required`
            }
          };
          return serviceMethodResults;
        }
        
        delete_cloudinary_image(you.wallpaper_id);
    
        const updates = await update_user(updatesObj, { id: you.id });
        const newYouModel = await get_user_by_id(you.id);
        const newYou = newYouModel!;
        delete (<any> newYou).password;

        const jwt = newUserJwtToken(newYou);

        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.OK,
          error: false,
          info: {
            message: 'Wallpaper cleared successfully.',
            data: {
              updates,
              you: newYou,
              token: jwt,
            }
          }
        };
        return serviceMethodResults;
      }
  
      const imageValidation = await validateAndUploadImageFile(wallpaper_file, {
        treatNotFoundAsError: true,
        mutateObj: updatesObj,
        id_prop: 'wallpaper_id',
        link_prop: 'wallpaper_link',
      });
      if (imageValidation.error) {
        return imageValidation;
      }
      
      const updates = await update_user(updatesObj, { id: you.id });
      const newYouModel = await get_user_by_id(you.id);
      const newYou = newYouModel!;
      delete (<any> newYou).password;

      const jwt = newUserJwtToken(newYou);

      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: 'Wallpaper updated successfully.',
          data: {
            updates,
            you: newYou,
            token: jwt,
          }
        }
      };
      return serviceMethodResults;
    } catch (e) {
      console.log('error:', e);
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        error: true,
        info: {
          message: 'Could not update wallpaper...',
          error: e,
        }
      };
      return serviceMethodResults;
    }
  }

  static async update_latest_coordinates(opts: {
    user_id: number,
    lat: number,
    lng: number,
    device: string,
    ip_addr: string,
    user_agent: string,
    automated: boolean,
  }): ServiceMethodAsyncResults {
    const { user_id, lat, lng } = opts;
    const updatesObj = {
      latest_lat: lat,
      latest_lng: lng,
      latlng_last_updated: fn('NOW'),
    };

    const updates = await update_user(updatesObj, { id: user_id });
    const newYouModel = await get_user_by_id(user_id);
    const newYou = newYouModel!;
    delete (<any> newYou).password;

    // don't block request completion
    // create location update
    create_user_location_update(opts).then(async (location_update: IUserLocationUpdate) => {
      // emit socket event to all user's trackers of location update; create notification IF the update was not automated (user manually updated location)
      const results = await TrackingsService.get_user_trackers_all(user_id);
      const users_tracking_you = results.info.data || [];
      // console.log({ user_id, users_tracking_you });

      if (!users_tracking_you.length) {
        return;
      }
      
      if (!opts.automated) {
        for (const tracker of users_tracking_you) {
          create_notification({
            from_id: user_id,
            to_id: tracker.user_id,
            micro_app: MODERN_APP_NAMES.SAFESTAR,
            event: SAFESTAR_EVENT_TYPES.NEW_USER_LOCATION_UPDATE,
            target_type: SAFESTAR_NOTIFICATION_TARGET_TYPES.USER,
            target_id: tracker.user_id
          }).then(async (notification_model) => {
            const notification = await populate_notification_obj(notification_model);
            CommonSocketEventsHandler.emitEventToUserSockets({
              user_id: tracker.user_id,
              event: SAFESTAR_EVENT_TYPES.NEW_USER_LOCATION_UPDATE,
              event_data: {
                notification,
                location_update,
              }
            });
          });
        }
      }
      else {
        for (const tracker of users_tracking_you) {
          CommonSocketEventsHandler.emitEventToUserSockets({
            user_id: tracker.user_id,
            event: SAFESTAR_EVENT_TYPES.NEW_USER_LOCATION_UPDATE,
            event_data: {
              location_update,
            }
          });
        }
      }
    });

    const jwt = newUserJwtToken(newYou);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: 'Location updated successfully.' ,
        data: {
          updates,
          you: newYou,
          token: jwt,
        }
      }
    };
    return serviceMethodResults;
  }

  static async find_users_by_name(query_term: string) {
    if (!query_term) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `No query term found`,
        }
      };
      return serviceMethodResults;
    }

    const results = await find_users_by_name(query_term);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }

  static async find_users_by_username(query_term: string) {
    if (!query_term) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `No query term found`,
        }
      };
      return serviceMethodResults;
    }

    const results = await find_users_by_username(query_term);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }

  static async find_users_by_name_or_username(query_term: string) {
    if (!query_term) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `No query term found`,
        }
      };
      return serviceMethodResults;
    }

    const results = await find_users_by_name_or_username(query_term);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }

  static async get_user_home_page_stats(user_id: number) {
    const pulses_count: number = await get_user_pulses_count(user_id);
    const trackers_count: number = await get_user_trackers_count(user_id);
    const trackings_count: number = await get_user_trackings_count(user_id);
    const checkpoints_received_count: number = await get_user_checkpoints_received_count(user_id);
    const checkpoints_sent_count: number = await get_user_checkpoints_sent_count(user_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: {
          pulses_count,
          trackers_count,
          trackings_count,
          checkpoints_received_count,
          checkpoints_sent_count,
        }
      }
    };
    return serviceMethodResults;
  }
}
