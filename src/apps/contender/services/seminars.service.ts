import { Request, Response } from 'express';
import { createGenericServiceMethodSuccess } from '../../_common/common.chamber';
import { IMyModel } from '../../_common/models/common.model-types';
import { ServiceMethodAsyncResults } from '../../_common/types/common.types';
import {
  get_seminar_by_id,
} from '../repos/seminars.repo';

export class ContenderSeminarsService {
  
  static async get_seminar_by_id(seminar_id: number): ServiceMethodAsyncResults {
    const seminar_model: IMyModel | null = await get_seminar_by_id(seminar_id);
    return createGenericServiceMethodSuccess(undefined, seminar_model);
  }

}