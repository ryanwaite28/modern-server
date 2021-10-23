import { Router } from 'express';
import { IsResourceOwner, ResourceExists } from '../guards/resource.guard';
import { YouAuthorized } from '../../_common/guards/user.guard';
import { ResourceInterestsRequestHandler } from '../handlers/resource-interests.handler';
import { ResourcesRequestHandler } from '../handlers/resources.handler';

export const ResourcesRouter: Router = Router();

// GET Routes

ResourcesRouter.get('/:resource_id', ResourceExists, ResourcesRequestHandler.get_resource_by_id);
ResourcesRouter.get('/:resource_id/interests/all', ResourceExists, ResourceInterestsRequestHandler.get_resource_interests_all);
ResourcesRouter.get('/:resource_id/interests', ResourceExists, ResourceInterestsRequestHandler.get_resource_interests);
ResourcesRouter.get('/:resource_id/interests/:interest_id', ResourceExists, ResourceInterestsRequestHandler.get_resource_interests);

// POST Routes

ResourcesRouter.post('/owner/:you_id', YouAuthorized, ResourcesRequestHandler.create_resource);
ResourcesRouter.post('/:resource_id/interests/user/:you_id', YouAuthorized, ResourceExists, ResourceInterestsRequestHandler.show_interest);

// PUT Routes

ResourcesRouter.put('/:resource_id/owner/:you_id', YouAuthorized, ResourceExists, IsResourceOwner, ResourcesRequestHandler.update_resource);

// DELETE Routes

ResourcesRouter.delete('/:resource_id/owner/:you_id', YouAuthorized, ResourceExists, ResourcesRequestHandler.delete_resource);
ResourcesRouter.delete('/:resource_id/interests/user/:you_id', YouAuthorized, ResourceExists, ResourceInterestsRequestHandler.remove_interest);
