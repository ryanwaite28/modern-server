import { HttpStatusCode } from "src/apps/_common/enums/http-codes.enum";
import { ServiceMethodResults } from "src/apps/_common/types/common.types";
import { IMechanic, IMechanicServiceRequest } from "../interfaces/car-master.interface";
import {
  get_mechanic_by_id,
  get_service_request_by_id
} from "../repos/car-master.repo";



export class CarMasterService {
  static async get_mechanic_by_id(id: number): Promise<ServiceMethodResults> {
    const result: IMechanic | null = await get_mechanic_by_id(id);

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