import { UploadedFile } from 'express-fileupload';
import { Request, Response } from 'express';
import { ExpressResponse, ServiceMethodResults } from '../../_common/types/common.types';
import { CliquesService } from '../services/cliques.service';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { IUser } from '../../_common/interfaces/common.interface';



export class CliquesRequestHandler {

  static async get_clique_by_id(request: Request, response: Response): ExpressResponse {
    const clique_model = response.locals.clique_model;
    return response.status(HttpStatusCode.OK).json({
      data: clique_model
    });
  }

  static async create_clique(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const icon_file: UploadedFile | undefined = request.files && (<UploadedFile> request.files.icon);
    const options = {
      you,
      icon_file,
      title: request.body.title,
      summary: request.body.title,
    };

    const serviceMethodResults: ServiceMethodResults = await CliquesService.create_clique(options);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async update_clique(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const clique_id: number = parseInt(request.params.clique_id, 10);
    const icon_file: UploadedFile | undefined = request.files && (<UploadedFile> request.files.icon);
    const options = {
      you,
      icon_file,
      clique_id,
      title: request.body.title,
      summary: request.body.title,
    };

    const serviceMethodResults: ServiceMethodResults = await CliquesService.update_clique(options);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async delete_clique(request: Request, response: Response): ExpressResponse {
    const clique_id: number = parseInt(request.params.clique_id, 10);

    const serviceMethodResults: ServiceMethodResults = await CliquesService.delete_clique(clique_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_cliques(request: Request, response: Response): ExpressResponse {
    const user_id = parseInt(request.params.user_id, 10);
    const clique_id = parseInt(request.params.clique_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await CliquesService.get_user_cliques(user_id, clique_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_cliques_all(request: Request, response: Response): ExpressResponse {
    const user_id = parseInt(request.params.user_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await CliquesService.get_user_cliques_all(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}