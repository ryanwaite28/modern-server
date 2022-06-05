import { UploadedFile } from "express-fileupload";
import { StripeService } from "../../_common/services/stripe.service";
import { UsersService } from "../../_common/services/users.service";
import {
  validateData,
  validateAndUploadImageFile,
} from "../../_common/common.chamber";
import { HttpStatusCode } from "../../_common/enums/http-codes.enum";
import { ServiceMethodResults } from "../../_common/types/common.types";
import {
  create_mechanic_credential_required_props,
  create_mechanic_expertise_required_props,
  create_mechanic_field_required_props,
  create_mechanic_rating_edit_required_props,
  create_mechanic_rating_required_props,
  create_mechanic_service_required_props,
  update_mechanic_credential_required_props,
  update_mechanic_expertise_required_props,
  update_mechanic_fields,
  update_mechanic_field_required_props,
  update_mechanic_service_required_props,
} from "../car-master.chamber";
import {
  IMechanic,
  IMechanicServiceRequest,
} from "../interfaces/car-master.interface";
import {
  create_mechanic_credential,
  create_mechanic_expertise,
  create_mechanic_field,
  create_mechanic_from_user_id,
  create_mechanic_rating,
  create_mechanic_rating_edit,
  create_mechanic_service,
  delete_mechanic_credential,
  delete_mechanic_expertise,
  delete_mechanic_field,
  delete_mechanic_service,
  get_mechanic_by_id,
  get_mechanic_by_user_id,
  get_service_request_by_id,
  search_mechanics,
  update_mechanic_credential,
  update_mechanic_expertise,
  update_mechanic_field,
  update_mechanic_profile,
  update_mechanic_service,
} from "../repos/car-master.repo";

export class CarMasterService {
  // mechanic profile
  
  static async get_mechanic_by_id(mechanic_id: number): Promise<ServiceMethodResults> {
    const result: IMechanic | null = await get_mechanic_by_id(mechanic_id);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: result,
      },
    };
    return serviceMethodResults;
  }

  static async get_mechanic_by_user_id(user_id: number): Promise<ServiceMethodResults> {
    const result: IMechanic | null = await get_mechanic_by_user_id(user_id);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: result,
      },
    };
    return serviceMethodResults;
  }
  
  static async create_mechanic_profile(user_id: number): Promise<ServiceMethodResults<IMechanic>> {
    const check: IMechanic | null = await get_mechanic_by_user_id(user_id);
    if (check) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `User already has a mechanic profile`,
        },
      };
      return serviceMethodResults;
    }
    const result: IMechanic = await create_mechanic_from_user_id(user_id);
    const serviceMethodResults: ServiceMethodResults<IMechanic> = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic profile created successfully!`,
        data: result,
      },
    };
    return serviceMethodResults;
  }

  static async update_mechanic_profile(mechanic_id: number, data: any): Promise<ServiceMethodResults> {
    if (!data) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `No updates date given.`,
        },
      };
      return serviceMethodResults;
    }
    const updatesObj: any = {};
    for (const field of update_mechanic_fields) {
      if (data.hasOwnProperty(field)) {
        updatesObj[field] = data[field];
      }
    }
    const updates = await update_mechanic_profile(mechanic_id, updatesObj);
    // console.log({ mechanic_id, updatesObj, updates });
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic profile updated successfully!`,
        data: updates,
      },
    };
    return serviceMethodResults;
  }
  
  static async search_mechanics(data: any): Promise<ServiceMethodResults> {
    const results = await search_mechanics(data);
    // console.log(`search_mechanics`, { results });

    // filter those who are active
    const filtered = [];
    for (const mechanic of results) {
      const is_subscription_active = await StripeService.is_subscription_active(mechanic.user!.platform_subscription_id);
      if (is_subscription_active) {
        filtered.push(mechanic);
      }
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: filtered,
      },
    };
    return serviceMethodResults;
  }
  
  
  // mechanic field

  static async create_mechanic_field(mechanic_id: number, data: any): Promise<ServiceMethodResults> {
    const createObj: any = { mechanic_id };
    const dataValidation = validateData({
      data,
      validators: create_mechanic_field_required_props,
      mutateObj: createObj,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    const field = await create_mechanic_field(createObj);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic field created successfully`,
        data: field,
      },
    };
    return serviceMethodResults;
  }

  static async update_mechanic_field(field_id: number, data: any): Promise<ServiceMethodResults> {
    const updatesObj: any = {};
    const dataValidation = validateData({
      data,
      validators: update_mechanic_field_required_props,
      mutateObj: updatesObj,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    const updates = await update_mechanic_field(field_id, updatesObj);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic field updated successfully`,
        data: updates,
      },
    };
    return serviceMethodResults;
  }

  static async delete_mechanic_field(field_id: number): Promise<ServiceMethodResults> {
    const deletes = await delete_mechanic_field(field_id);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic field deleted successfully`,
        data: deletes,
      },
    };
    return serviceMethodResults;
  }


  // mechanic credential

  static async create_mechanic_credential(mechanic_id: number, data: any, credential_image?: UploadedFile): Promise<ServiceMethodResults> {
    const createObj: any = { mechanic_id };
    const dataValidation = validateData({
      data,
      validators: create_mechanic_credential_required_props,
      mutateObj: createObj,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    const imageValidation = await validateAndUploadImageFile(credential_image, {
      treatNotFoundAsError: false,
      mutateObj: createObj,
      id_prop: "image_id",
      link_prop: "image_link",
    });
    if (imageValidation.error) {
      return imageValidation;
    }
    const credential = await create_mechanic_credential(createObj);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic credential created successfully`,
        data: credential,
      },
    };
    return serviceMethodResults;
  }

  static async update_mechanic_credential(credential_id: number, data: any, credential_image?: UploadedFile): Promise<ServiceMethodResults> {
    const updatesObj: any = {};
    const dataValidation = validateData({
      data,
      validators: update_mechanic_credential_required_props,
      mutateObj: updatesObj,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    const imageValidation = await validateAndUploadImageFile(credential_image, {
      treatNotFoundAsError: false,
      mutateObj: updatesObj,
      id_prop: "image_id",
      link_prop: "image_link",
    });
    if (imageValidation.error) {
      return imageValidation;
    }
    const updates = await update_mechanic_credential(credential_id, updatesObj);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic credential updated successfully`,
        data: updates,
      },
    };
    return serviceMethodResults;
  }

  static async delete_mechanic_credential(credential_id: number): Promise<ServiceMethodResults> {
    const deletes = await delete_mechanic_credential(credential_id);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic credential deleted successfully`,
        data: deletes,
      },
    };
    return serviceMethodResults;
  }



  // mechanic expertise

  static async create_mechanic_expertise(mechanic_id: number, data: any): Promise<ServiceMethodResults> {
    const createObj: any = { mechanic_id };
    const dataValidation = validateData({
      data,
      validators: create_mechanic_expertise_required_props,
      mutateObj: createObj,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    const expertise = await create_mechanic_expertise(createObj);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic experise created successfully`,
        data: expertise,
      },
    };
    return serviceMethodResults;
  }

  static async update_mechanic_expertise(expertise_id: number, data: any): Promise<ServiceMethodResults> {
    const updatesObj: any = {};
    const dataValidation = validateData({
      data,
      validators: update_mechanic_expertise_required_props,
      mutateObj: updatesObj,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    const updates = await update_mechanic_expertise(expertise_id, updatesObj);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic expertise updated successfully`,
        data: updates,
      },
    };
    return serviceMethodResults;
  }

  static async delete_mechanic_expertise(expertise_id: number): Promise<ServiceMethodResults> {
    const deletes = await delete_mechanic_expertise(expertise_id);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic expertise deleted successfully`,
        data: deletes,
      },
    };
    return serviceMethodResults;
  }




  // mechanic service

  static async create_mechanic_service(mechanic_id: number, data: any): Promise<ServiceMethodResults> {
    const createObj: any = { mechanic_id };
    const dataValidation = validateData({
      data,
      validators: create_mechanic_service_required_props,
      mutateObj: createObj,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    const service = await create_mechanic_service(createObj);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic service created successfully`,
        data: service,
      },
    };
    return serviceMethodResults;
  }

  static async update_mechanic_service(service_id: number, data: any): Promise<ServiceMethodResults> {
    const updatesObj: any = {};
    const dataValidation = validateData({
      data,
      validators: update_mechanic_service_required_props,
      mutateObj: updatesObj,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    const updates = await update_mechanic_service(service_id, updatesObj);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic service updated successfully`,
        data: updates,
      },
    };
    return serviceMethodResults;
  }

  static async delete_mechanic_service(service_id: number): Promise<ServiceMethodResults> {
    const deletes = await delete_mechanic_service(service_id);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic service deleted successfully`,
        data: deletes,
      },
    };
    return serviceMethodResults;
  }
  



  // mechanic rating

  static async create_mechanic_rating(mechanic_id: number, data: any): Promise<ServiceMethodResults> {
    const createObj: any = { mechanic_id };
    const dataValidation = validateData({
      data,
      validators: create_mechanic_rating_required_props,
      mutateObj: createObj,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    const rating = await create_mechanic_rating(createObj);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic rating created successfully`,
        data: rating,
      },
    };
    return serviceMethodResults;
  }

  static async create_mechanic_rating_edit(rating_id: number, data: any): Promise<ServiceMethodResults> {
    const createObj: any = { rating_id };
    const dataValidation = validateData({
      data,
      validators: create_mechanic_rating_edit_required_props,
      mutateObj: createObj,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    const rating_edit = await create_mechanic_rating_edit(createObj);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic rating edit created successfully`,
        data: rating_edit,
      },
    };
    return serviceMethodResults;
  }
  

  

  

  

  
}
