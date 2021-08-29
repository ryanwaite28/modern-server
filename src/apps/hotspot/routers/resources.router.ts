import { Router } from 'express';

import { ResourcesService } from '../services/resources.service';
import { ResourceInterestsService } from '../services/resource-interests.service';
import { ResourceExists } from '../guards/resource.guard';
import { UserAuthorized } from '../../_common/guards/user.guard';

export const ResourcesRouter: Router = Router();

// GET Routes

ResourcesRouter.get('/:resource_id', ResourceExists, ResourcesService.get_resource);
ResourcesRouter.get('/:resource_id/interests/all', ResourceExists, ResourceInterestsService.get_resource_interests_all);
ResourcesRouter.get('/:resource_id/interests', ResourceExists, ResourceInterestsService.get_resource_interests);
ResourcesRouter.get('/:resource_id/interests/:interest_id', ResourceExists, ResourceInterestsService.get_resource_interests);

// POST Routes

ResourcesRouter.post('/owner/:you_id', UserAuthorized, ResourcesService.create_resource);
ResourcesRouter.post('/:resource_id/interests/user/:you_id', UserAuthorized, ResourceExists, ResourceInterestsService.show_interest);

// PUT Routes

ResourcesRouter.put('/:resource_id/owner/:you_id', UserAuthorized, ResourceExists, ResourcesService.update_resource);

// DELETE Routes

ResourcesRouter.delete('/:resource_id/owner/:you_id', UserAuthorized, ResourceExists, ResourcesService.delete_resource);
ResourcesRouter.delete('/:resource_id/interests/user/:you_id', UserAuthorized, ResourceExists, ResourceInterestsService.remove_interest);
