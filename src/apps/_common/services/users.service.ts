import { UploadedFile } from 'express-fileupload';
import * as bcrypt from 'bcrypt-nodejs';
import {
  Request,
  Response,
} from 'express';
import {
  HttpStatusCode
} from '../enums/http-codes.enum';
import {
  PlainObject,
  IUser,
  IRequest
} from '../interfaces/common.interface';
import {
  fn,
  Op,
  col,
  cast
} from 'sequelize';
import * as UserRepo from '../repos/users.repo';
import * as EmailVerfRepo from '../repos/email-verification.repo';
import * as PhoneVerfRepo from '../repos/phone-verification.repo';
import { TokensService } from './tokens.service';
import { Cliques, CliqueInterests, CliqueMembers } from '../../hotspot/models/clique.model';
import { Resources, ResourceInterests } from '../../hotspot/models/resource.model';
import { get_clique_member_requests_count } from '../../hotspot/repos/clique-members.repo';
import {
  AuthorizeJWT,
  user_attrs_slim,
  validateUsername,
  validateDisplayName,
  validateEmail,
  validatePassword,
  uniqueValue,
  allowedImages,
  validateName,
  capitalize
} from '../common.chamber';
import { delete_cloudinary_image, store_image } from '../../../cloudinary-manager';
import { send_email } from '../../../email-client';
import { send_verify_sms_request, cancel_verify_sms_request, check_verify_sms_request } from '../../../sms-client';
import { SignedUp_EMAIL, VerifyEmail_EMAIL } from '../../../template-engine';
import { SiteFeedbacks, Users } from '../models/user.model';
import { get_user_unseen_notifications_count } from '../repos/notifications.repo';
import { get_user_unread_conversations_messages_count } from '../repos/conversations.repo';
import { get_user_unread_personal_messages_count } from '../repos/messagings.repo';

export class UsersService {

  /** Request Handlers */

  static async main(request: Request, response: Response) {
    return response.status(HttpStatusCode.OK).json({
      msg: 'users router'
    });
  }

  static async sign_out(request: Request, response: Response) {
    return response.status(HttpStatusCode.OK).json({
      online: false,
      successful: true
    });
  }

  static async check_session(request: Request, response: Response) {
    try {
      const auth = AuthorizeJWT(request, false);
      response.status(auth.status).json(auth);
    } catch (e) {
      console.log('error: ', e);
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        e,
        error: true,
        message: `could not check session`
      });
    }
  }

  static async get_user_by_id(request: Request, response: Response) {
    const id = parseInt(request.params.id, 10);
    const user = await UserRepo.get_user_by_id(id);
    return response.status(HttpStatusCode.OK).json({
      user
    });
  }

  static async get_user_by_phone(request: Request, response: Response) {
    const phone = request.params.phone;
    const user = await UserRepo.get_user_by_phone(phone);
    return response.status(HttpStatusCode.OK).json({
      user
    });
  }

  static async send_feedback(request: Request, response: Response) {
    const you: IUser = response.locals.you;
    const rating = request.body.rating;
    const title = request.body.title;
    const summary = request.body.rating;

    if (!rating) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `rating is required`
      });
    }
    if (!title) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `title is required`
      });
    }
    if (!summary) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `summary is required`
      });
    }

    const new_feedback_model = await SiteFeedbacks.create({
      rating,
      title,
      summary,
      user_id: you.id
    });

    return response.status(HttpStatusCode.OK).json({
      message: `Feedback submitted successfully`,
      data: new_feedback_model,
      success: true
    });
  }

  static async get_unseen_counts(request: Request, response: Response) {
    try {
      const you: IUser = response.locals.you; 
      const unseen_messages = await get_user_unread_personal_messages_count(you.id);
      const unseen_conversations = await get_user_unread_conversations_messages_count(you.id);
      const unseen_notifications = await get_user_unseen_notifications_count(you.id, you.notifications_last_opened);
      const unseen_clique_member_requests = await get_clique_member_requests_count(you.id);


      response.status(HttpStatusCode.OK).json({
        data: {
          unseen_messages,
          unseen_conversations,
          unseen_notifications,
          unseen_clique_member_requests,
        }
      });
    } catch (e) {
      console.log(`get_unseen_counts error:`, e);
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        error: e
      });
    }
  }
  
  static async get_random_users(request: Request, response: Response) {
    const limit = request.params.limit
    const limitIsValid = (/[0-9]+/).test(limit);
    const useLimit = limitIsValid
      ? parseInt(request.params.limit, 10)
      : 10;
    const users = await UserRepo.get_random_users(useLimit);
    return response.status(HttpStatusCode.OK).json({
      data: users
    });
  }

  static async get_random_models(request: Request, response: Response) {
    const you: IUser = response.locals.you;

    const tag = String(request.query.tag || '');
    const tag_like = { [Op.like]: '%' + tag + '%' };

    const model_name = String(request.query.model_name || '');
    if (!model_name) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `model_name query param is required`
      });
    }

    const limit = request.query.limit || '';
    const limitIsValid = (/[0-9]+/).test(<string> limit);
    const useLimit = limitIsValid
      ? parseInt(request.params.limit, 10)
      : 10;
    let results;

    switch (model_name) {
      case 'users': {
        results = await Users.findAll({
          where: {
            tags: tag_like,
            id: { [Op.ne]: you.id }
          },
          limit: useLimit,
          order: [fn( 'RANDOM' )],
          attributes: user_attrs_slim
        });
        break;
      }
      case 'cliques': {
        results = await Cliques.findAll({
          where: { tags: tag_like, creator_id: { [Op.ne]: you.id } },
          limit: useLimit,
          order: [fn( 'RANDOM' )],
          include: [{
            model: Users,
            as: 'creator',
            attributes: user_attrs_slim,
          }, {
            model: CliqueInterests,
            as: 'interests',
            duplicating: false,
            attributes: [],
          }, {
            model: CliqueMembers,
            as: 'members',
            duplicating: false,
            attributes: [],
          }],
          attributes: {
            include: [
              [cast(fn('COUNT', col('interests.clique_id')), 'integer') ,'interests_count'],
              [cast(fn('COUNT', col('members.clique_id')), 'integer') ,'members_count'],
            ]
          },
          group: ['cliques.id', 'creator.id']
        });
        break;
      }
      case 'resources': {
        results = await Resources.findAll({
          where: { tags: tag_like, owner_id: { [Op.ne]: you.id } },
          limit: useLimit,
          order: [fn( 'RANDOM' )],
          include: [{
            model: Users,
            as: 'owner',
            attributes: user_attrs_slim
          }, {
            model: ResourceInterests,
            as: 'interests',
            duplicating: false,
            attributes: [],
          }],
          attributes: {
            include: [
              [cast(fn('COUNT', col('interests.resource_id')), 'integer') ,'interests_count']
            ]
          },
          group: ['resources.id', 'owner.id']
        });
        break;
      }
      default: {
        results = null;
      }
    }

    if (results) {
      return response.status(HttpStatusCode.OK).json({
        data: results
      });
    } else {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `model_name query param is invalid`
      });
    }
    
  }

  static async sign_up(request: Request, response: Response) {
    const {
      firstname,
      lastname,
      username,
      displayname,

      email,
      password,
      confirmPassword,
    } = request.body;

    /**
     * index description:
     * 0 - the property to look up on the response body
     * 1 - the label of the property/field
     * 2 - a validation function
     * 3 - a validation message
    */
    const required_fields: [
      string, string, (arg: any) => boolean, string
    ][] = [
      // ['gender', 'Gender', validateGender, 'must be a 0, 1 or 2'],
      // ['type', 'Type', validateAccountType, 'please choose an account type'],
      ['username', 'Username', validateUsername, 'must be: at least 2 characters, alphanumeric, dashes, underscores, periods'],
      ['displayname', 'DisplayName', validateDisplayName, 'must be: at least 2 characters, alphanumeric, dashes, underscores, periods, spaces'],
      ['firstname', 'First Name', validateName, 'must be: at least 2 characters, letters only'],
      ['lastname', 'Last Name', validateUsername, 'must be: at least 2 characters, letters only'],

      ['email', 'Email', validateEmail, 'is in bad format'],
      ['password', 'Password', validatePassword, 'Password must be: at least 7 characters, upper and/or lower case alphanumeric'],
      ['confirmPassword', 'Confirm Password', validatePassword, 'Password must be: at least 7 characters, upper and/or lower case alphanumeric'],
    ];

    required_fields.forEach((field) => {
      const value = request.body[field[0]];
      if (!value) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `${field[1]} field is required`
        });
      }
      const check_validation = field[2](value);
      if (!check_validation) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `${field[1]} ${field[3]}`
        });
      }
    });

    if (password !== confirmPassword) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        error: true,
        message: 'Passwords must match'
      });
    }

    const check_email = await UserRepo.get_user_by_email(email);
    if (check_email) {
      return response.status(HttpStatusCode.FORBIDDEN).json({
        error: true,
        message: 'Email already in use'
      });
    }

    const check_username = await UserRepo.get_user_by_email(username);
    if (check_username) {
      return response.status(HttpStatusCode.FORBIDDEN).json({
        error: true,
        message: 'Username already in use'
      });
    }
  
    /* Data Is Valid */
  
    const createInfo = {
      firstname: capitalize(firstname),
      middlename: request.body.middlename && capitalize(request.body.middlename),
      lastname: capitalize(lastname),
      // gender: parseInt(gender, 10),
      username: username.toLowerCase(),
      displayname,
      email: email.toLowerCase(),
      password: bcrypt.hashSync(password)
    };
    const new_user_model = await UserRepo.create_user(createInfo);
    const new_user = <IUser> new_user_model.toJSON();
    delete new_user.password;

    // create JWT
    const jwt = TokensService.newJwtToken(request, new_user, true);

    response.status(HttpStatusCode.OK).json({
      online: true,
      you: new_user,
      message: 'Signed Up!',
      token: jwt,
    });
  
    try {
      /** Email Sign up and verify */
      const new_email_verf_model = await EmailVerfRepo.create_email_verification({
        user_id: new_user.id,
        email: new_user.email
      });
      const new_email_verf: PlainObject = new_email_verf_model.get({ plain: true });

      const host: string = request.get('origin')!;
      const verify_link = (<string> host).endsWith('/')
        ? (host + 'verify-email/' + new_email_verf.verification_code)
        : (host + '/verify-email/' + new_email_verf.verification_code);
      const email_subject = `${process.env.APP_NAME} - Signed Up!`;
      const userName = `${new_user.firstname} ${new_user.lastname}`;
      const email_html = SignedUp_EMAIL({
        ...new_user,
        name: userName,
        verify_link,
        appName: process.env.APP_NAME
      });

      // don't "await" for email response.
      const send_email_params = {
        to: new_user.email,
        name: userName,
        subject: email_subject,
        html: email_html
      };
      send_email(send_email_params)
        .then((email_results) => {
          console.log(`sign up email sent successfully to:`, email);
        })
        .catch((error) => {
          console.log({ email_error: error });
        });
    } catch (e) {
      console.log(`could not sent sign up email:`, e, { new_user });
    }
  }

  static async sign_in(request: Request, response: Response) {
    try {
      let { email, password } = request.body;
      if (email) { email = email.toLowerCase(); }
      if (!email) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          error: true,
          message: 'Email Address field is required'
        });
      }
      if (!password) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          error: true,
          message: 'Password field is required'
        });
      }

      const check_account_model = await Users.findOne({ where: { email } });
      if (!check_account_model) {
        return response.status(HttpStatusCode.UNAUTHORIZED).json({
          error: true,
          message: 'Invalid credentials.'
        });
      }
      try {
        const checkPassword = <string> check_account_model.get('password');
        const badPassword = bcrypt.compareSync(password, checkPassword!) === false;
        if (badPassword) {
          return response.status(HttpStatusCode.UNAUTHORIZED).json({
            error: true,
            message: 'Invalid credentials.'
          });
        }
      } catch (e) {
        const errorObj = {
          e,
          check_account_model,
          error: true,
          message: `could not process authentication/credentials, something went wrong...`
        };
        console.log(errorObj);
        return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(errorObj);
      }

      const you = <IUser> check_account_model.get({ plain: true });
      delete you.password;
      
      // create JWT
      const jwt = TokensService.newJwtToken(request, you, true);
      
      return response.status(HttpStatusCode.OK).json({
        online: true,
        you: you,
        message: 'Signed In!',
        token: jwt,
      });
    } catch (e) {
      const errorObj = {
        e,
        error: true,
        message: `could not sign in, something went wrong...`
      };
      console.log(errorObj);
      response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(errorObj);
    }
  }

  static async send_sms_verification(request: Request, response: Response) {
    try {
      const phone = request.params.phone_number;
      if (!phone) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          error: true,
          message: `Phone number is required`
        });
      }
      const phoneNumberIsOutOfRange = !(/^[0-9]{10,12}$/).test(phone);
      if (phoneNumberIsOutOfRange) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          error: true,
          message: `Phone number is out of range; must be between 10-12 digits`
        });
      }

      // check if there is a pending code
      const check_sms_verf = await PhoneVerfRepo.query_phone_verification({ phone });
      // if there is a result, delete it and make a new one
      if (check_sms_verf) {
        await check_sms_verf.destroy();
      }
      // send a new verification code
      const sms_results: PlainObject = await send_verify_sms_request(phone);
      console.log('sms_results', sms_results);
      if (sms_results.error_text) {
        try {
          console.log('canceling...', sms_results);
          await cancel_verify_sms_request(sms_results.request_id);
        } catch (e) {
          console.log(`could not cancel...`, sms_results, e);
        }
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          sms_results,
          message: `Could not send sms...`
        });
      } else {
        // sms sent successfully; store it on the request session
        (<IRequest> request).session.sms_verification = sms_results;
        (<IRequest> request).session.sms_phone = phone;
        return response.status(HttpStatusCode.OK).json({
          sms_results,
          sms_request_id: sms_results.request_id,
          message: `SMS verification sent, check your phone!`
        });
      }
    } catch (e) {
      console.log(`send_sms_verification error; something went wrong...`, e);
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        e,
        error: true,
        message: `send_sms_verification error; something went wrong...`
      });
    }
  }

  static async verify_sms_code(request: Request, response: Response) {
    try {
      const { request_id, code } = request.params;
      const sms_results = (<IRequest> request).session.sms_verification;
      if (!sms_results) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          error: true,
          message: `no sms verification in progress...`
        });
      }
      if (sms_results.request_id !== request_id) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          error: true,
          message: `sms request_id is invalid...`
        });
      }

      // try to verify phone
      const sms_verify_results: PlainObject = await check_verify_sms_request({ request_id, code });
      console.log(sms_verify_results);
      if (sms_verify_results.error_text) {
        // successful, notify user
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          sms_verify_results,
          message: `Invalid sms verification code`
        });
      }
      // successful, notify user
      (<IRequest> request).session.sms_verification = undefined;

      const responseObj: PlainObject = {
        sms_verify_results,
        message: `Phone number verified!`
      };
      const setUserSession: string = (<string> request.query.setUserSession) || '';
      const shouldSetNewSession = setUserSession && !(<IRequest> request).session.you;
      if (shouldSetNewSession) {
        try {
          const user_model = await UserRepo.get_user_by_phone((<IRequest> request).session.sms_phone.substr(1));
          if (user_model) {
            const user = <IUser> user_model.toJSON();
            (<IRequest> request).session.id = uniqueValue();
            (<IRequest> request).session.you = user;
            responseObj.you = user;
          } else {
            responseObj.warning = `No user found by phone number: ${(<IRequest> request).session.sms_phone}`;
          }
        } catch (e) {
          console.log(`could not find user by phone:`, (<IRequest> request).session.sms_phone);
          console.log(e);
        }
        delete (<IRequest> request).session.sms_phone;
      }

      return response.status(HttpStatusCode.OK).json(responseObj);
    } catch (e) {
      console.log(`verify_sms_code error; something went wrong...`, e);
      (<IRequest> request).session.sms_verification = undefined;
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        e,
        error: true,
        message: `verify_sms_code error; something went wrong...`
      });
    }
  }

  static async verify_email(request: Request, response: Response) {
    const verification_code = request.params.verification_code;

    const email_verf_model = await EmailVerfRepo.query_email_verification({ verification_code });
    if (!email_verf_model) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        error: true,
        message: `Invalid verification code.`
      });
    }

    const email_verf: PlainObject = email_verf_model.get({ plain: true });
    const user_model = await UserRepo.get_user_by_id(email_verf.user_id);
    if (!user_model) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        error: true,
        message: `Verification code corrupted: could not fetch user from code`
      });
    }

    const user = <IUser> user_model.get({ plain: true });
    if (user.email_verified) {
      return response.status(HttpStatusCode.OK).json({
        message: `Already verified!`
      });
    }

    const updates = await UserRepo.update_user(
      { email_verified: true },
      { id: email_verf.user_id }
    );
    const email_verf_updates = await EmailVerfRepo.update_email_verification(
      { verified: true },
      { verification_code }
    );

    user.email_verified = true;
    const jwt = TokensService.newJwtToken(request, user, true);
    
    return response.status(HttpStatusCode.OK).json({
      updates,
      email_verf_updates,
      message: `Email successfully verified!`,
      token: jwt
    });
  }

  static async update_info(request: Request, response: Response) {
    let {
      email,
      username,
      paypal,
      bio,
      headline,
      tags,

      city, state, country, zipcode,
      location,
      lat, lng,

      can_message,
      can_converse,
    } = request.body;

    let email_changed = false;
    let paypal_changed = false;

    const you: IUser = response.locals.you;
    const updatesObj: { [key:string]: any; } = {
      can_message,
      can_converse,
      bio: bio || '',
      headline: headline || '',
      tags: tags || '',

      city: city || '',
      state: state || '',
      country: country || '',
      zipcode: zipcode || '',
      location: location || '',
      lat: lat || null,
      lng: lng || null,
    };

    // check request data

    if (email) {
      const emailIsDifferent = you.email !== email;
      if (emailIsDifferent) {
        const check_email = await UserRepo.get_user_by_email(email);
        if (check_email) {
          return response.status(HttpStatusCode.BAD_REQUEST).json({
            error: true,
            message: `Email is taken`
          });
        } else {
          updatesObj.email = email;
          updatesObj.email_verified = false;
          email_changed = true;
        }
      }
    }

    if (username) {
      const usernameIsDifferent = you.username !== username;
      if (usernameIsDifferent) {
        const check_username = await UserRepo.get_user_by_email(username);
        if (check_username) {
          return response.status(HttpStatusCode.FORBIDDEN).json({
            error: true,
            message: 'Username already in use'
          });
        } else {
          updatesObj.username = username;
        }
      }
    } else if (username === '') {
      updatesObj.username = '';
    }

    if (paypal) {
      const paypalIsDifferent = you.paypal !== paypal;
      if (paypalIsDifferent) {
        const check_paypal = await UserRepo.get_user_by_paypal(paypal);
        if (check_paypal) {
          return response.status(HttpStatusCode.BAD_REQUEST).json({
            error: true,
            message: `Paypal Email is taken`
          });
        } else {
          updatesObj.paypal = paypal;
          updatesObj.paypal_verified = false;
          paypal_changed = true;
        }
      }
    }

    const updates = await UserRepo.update_user(updatesObj, { id: you.id });
    const newYou = { ...you, ...updatesObj };
    delete newYou.password;

    // check if phone/email changed

    if (email_changed) {
      const new_email_verf_model = await EmailVerfRepo.create_email_verification({
        user_id: you.id,
        email: you.email
      });
      const new_email_verf: PlainObject = new_email_verf_model.get({ plain: true });
  
      const host: string = request.get('origin')!;
      const verify_link = (<string> host).endsWith('/')
        ? (host + 'verify-email/' + new_email_verf.verification_code)
        : (host + '/verify-email/' + new_email_verf.verification_code);
      const email_subject = `${process.env.APP_NAME} - Signed Up!`;
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
        .catch((error) => {
          console.log({ email_error: error });
        }); 
    }

    const jwt = TokensService.newJwtToken(request, newYou, true);
    
    // send the response

    return response.status(HttpStatusCode.OK).json({
      updates,
      data: newYou,
      token: jwt,
      email_changed,
      message: `Info updated successfully`
    });
  }

  static async update_phone(request: Request, response: Response) {
    try {
      const you_model = await UserRepo.get_user_by_id(response.locals.you.id);
      const you: IUser = <IUser> you_model!.toJSON();
      const { phone, request_id, code } = request.body.phone;

      const sms_results = (<IRequest> request).session.sms_verification;
      if (!sms_results) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          error: true,
          message: `no sms verification in progress...`
        });
      }
      if (sms_results.request_id !== request_id) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          error: true,
          message: `sms request_id is invalid...`
        });
      }

      // try to verify phone
      const sms_verify_results: PlainObject = await check_verify_sms_request({ request_id, code });
      console.log(sms_verify_results);
      if (sms_verify_results.error_text) {
        // successful, notify user
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          sms_verify_results,
          message: `Invalid sms verification code`
        });
      }
      // successful, update user
      (<IRequest> request).session.sms_verification = undefined;

      const updates = await UserRepo.update_user({ phone }, { id: you.id });
      Object.assign(you, { phone });
      const newYou = { ...you };
      delete newYou.password;

      const jwt = TokensService.newJwtToken(request, newYou, true);

      return response.status(HttpStatusCode.OK).json({
        sms_verify_results,
        updates,
        data: newYou,
        token: jwt,
        message: `Phone number updated successfully`
      });
    } catch (e) {
      console.log('error:', e);
      response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        e,
        error: true,
        message: 'Could not update phone...'
      });
      throw e;
    }
  }

  static async update_password(request: Request, response: Response) {
    try {
      const you_model = await UserRepo.get_user_by_id(response.locals.you.id);
      const you: IUser = <IUser> you_model!.toJSON();
      // const oldPassword = request.body.oldPassword;
      const password = request.body.password;
      const confirmPassword = request.body.confirmPassword;
  
      // if (!oldPassword) {
      //   return response.status(HttpStatusCode.BAD_REQUEST).json({
      //     error: true,
      //     message: `Current password field is required.`
      //   });
      // }
      if (!password) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          error: true,
          message: `Password field is required.`
        });
      }
      if (!confirmPassword) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          error: true,
          message: `Confirm Password field is required.`
        });
      }
      if (!validatePassword(password)) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          error: true,
          message: 'Password must be: at least 7 characters, upper and/or lower case alphanumeric'
        });
      }
      if (password !== confirmPassword) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({ error: true, message: 'Passwords must match' });
      }
      // const checkOldPassword = bcrypt.compareSync(oldPassword, youModel!.get('password'));
      // const currentPasswordIsBad = checkOldPassword === false;
      // if (currentPasswordIsBad) {
      //   return response.status(HttpStatusCode.UNAUTHORIZED).json({
      //     error: true,
      //     message: 'Old password is incorrect.'
      //   });
      // }
  
      const hash = bcrypt.hashSync(password);
      const updatesObj = { password: hash };
      const updates = await UserRepo.update_user(updatesObj, { id: you.id });
      Object.assign(you, updatesObj);

      const jwt = TokensService.newJwtToken(request, you, true);

      return response.status(HttpStatusCode.OK).json({
        updates,
        data: you,
        token: jwt,
        message: 'Password updated successfully'
      });
    } catch (e) {
      console.log('error:', e);
      response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        e,
        error: true,
        message: 'Could not update password...'
      });
      throw e;
    }
  }

  static async update_icon(request: Request, response: Response) {
    try {
      const you: IUser = response.locals.you;
      const updatesObj = {
        icon_id: '',
        icon_link: ''
      };
      
      const icon_file: UploadedFile | undefined = request.files && (<UploadedFile> request.files.icon);
      console.log(request.body, icon_file);
      if (!icon_file) {
        // clear icon
        if (!request.body.should_delete) {
          return response.status(HttpStatusCode.BAD_REQUEST).json({
            error: true,
            message: `Picture file is required`
          });
        }

        const whereClause = { id: you.id };
        const updates = await UserRepo.update_user(updatesObj, whereClause);
        delete_cloudinary_image(you.icon_id);
    
        Object.assign(you, updatesObj);
        const user = { ...you };
        const jwt = TokensService.newJwtToken(request, user, true);
        delete user.password;
        return response.status(HttpStatusCode.OK).json({
          updates,
          token: jwt,
          data: user,
          message: 'Icon cleared successfully.' 
        });
      }
  
      const type = icon_file.mimetype.split('/')[1];
      const isInvalidType = !allowedImages.includes(type);
      if (isInvalidType) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          error: true,
          message: 'Invalid file type: jpg, jpeg or png required...'
        });
      }
  
      const results = await store_image(icon_file, you.icon_id);
      if (!results.result) {
        return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
          error: true,
          message: 'Could not upload file...'
        });
      }

      updatesObj.icon_id = results.result.public_id,
      updatesObj.icon_link = results.result.secure_url
      const updates = await UserRepo.update_user(updatesObj, { id: you.id });
  
      const user = { ...you, ...updatesObj };
      // console.log({ updates, results, user });
      delete user.password;
      const jwt = TokensService.newJwtToken(request, user, true);
      return response.status(HttpStatusCode.OK).json({
        updates,
        token: jwt,
        data: user,
        message: 'Icon updated successfully.' 
      });
    } catch (e) {
      console.log('error:', e);
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: 'Could not update icon...' 
      });
    }
  }

  static async update_wallpaper(request: Request, response: Response) {
    try {
      const you: IUser = response.locals.you;
      const updatesObj = {
        wallpaper_id: '',
        wallpaper_link: ''
      };

      const wallpaper_file: UploadedFile | undefined = request.files && (<UploadedFile> request.files.wallpaper);
      console.log(request.body, wallpaper_file);
      if (!wallpaper_file) {
        // clear wallpaper
        if (!request.body.should_delete) {
          return response.status(HttpStatusCode.BAD_REQUEST).json({
            error: true,
            message: `Picture file is required`
          });
        }

        const whereClause = { id: you.id };
        const updates = await UserRepo.update_user(updatesObj, whereClause);
        delete_cloudinary_image(you.wallpaper_id);
    
        Object.assign(you, updatesObj);
        const user = { ...you };
        delete user.password;
        const jwt = TokensService.newJwtToken(request, user, true);
        return response.status(HttpStatusCode.OK).json({
          updates,
          token: jwt,
          data: user,
          message: 'Wallpaper cleared successfully.' 
        });
      }
  
      const type = wallpaper_file.mimetype.split('/')[1];
      const isInvalidType = !allowedImages.includes(type);
      if (isInvalidType) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          error: true,
          message: 'Invalid file type: jpg, jpeg or png required...'
        });
      }
  
      const results = await store_image(wallpaper_file, you.icon_id);
      if (!results.result) {
        return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
          error: true,
          message: 'Could not upload file...'
        });
      }

      updatesObj.wallpaper_id = results.result.public_id,
      updatesObj.wallpaper_link = results.result.secure_url
      const whereClause = { id: you.id };
      const updates = await UserRepo.update_user(updatesObj, whereClause);
  
      Object.assign(you, updatesObj);
      const user = { ...you };
      delete user.password;
      const jwt = TokensService.newJwtToken(request, you, true);
      return response.status(HttpStatusCode.OK).json({
        updates,
        token: jwt,
        data: user,
        message: 'Wallpaper updated successfully.' 
      });
    } catch (e) {
      console.log('error:', e);
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: 'Could not update wallpaper...' 
      });
    }
  }
}