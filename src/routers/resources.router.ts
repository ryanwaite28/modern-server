import { Router } from 'express';

import { ResourcesService } from '../services/resources.service';
import { ResourceInterestsService } from '../services/resource-interests.service';
import { ResourceExists } from '../guards/resource.guard';

export const ResourcesRouter: Router = Router();

// GET Routes

ResourcesRouter.get('/:resource_id', ResourceExists, ResourcesService.get_resource);
ResourcesRouter.get('/:resource_id/interests/all', ResourceExists, ResourceInterestsService.get_resource_interests_all);
ResourcesRouter.get('/:resource_id/interests', ResourceExists, ResourceInterestsService.get_resource_interests);
ResourcesRouter.get('/:resource_id/interests/:interest_id', ResourceExists, ResourceInterestsService.get_resource_interests);

// POST Routes



// PUT Routes



// DELETE Routes


