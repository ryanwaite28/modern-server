import { HttpStatusCode } from "../../_common/enums/http-codes.enum";
import { ServiceMethodResults } from "../../_common/types/common.types";
import { IMechanic, IMechanicServiceRequest } from "../interfaces/car-master.interface";
import {
  create_mechanic_from_user_id,
  get_mechanic_by_id,
  get_mechanic_by_user_id,
  get_service_request_by_id
} from "../repos/car-master.repo";



export class CarMasterService {
  static async get_mechanic_by_id(mechanic_id: number): Promise<ServiceMethodResults> {
    const result: IMechanic | null = await get_mechanic_by_id(mechanic_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: result,
      }
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
      }
    };
    return serviceMethodResults;
  }

  static async create_mechanic_profile(user_id: number): Promise<ServiceMethodResults> {
    const check: IMechanic | null = await get_mechanic_by_user_id(user_id);
    if (check) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: false,
        info: {
          message: `User already has a mechanic profile`,
        }
      };
      return serviceMethodResults;
    }

    const result: IMechanic = await create_mechanic_from_user_id(user_id);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: result,
      }
    };
    return serviceMethodResults;
  }

  static async get_service_request_by_id(id: number): Promise<ServiceMethodResults> {
    const result: IMechanicServiceRequest | null = await get_service_request_by_id(id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: result,
      }
    };
    return serviceMethodResults;
  }
}