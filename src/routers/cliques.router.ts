import { Router } from 'express';
import { CliquesService } from '../services/cliques.service';
import { CliqueInterestsService } from '../services/clique-interests.service';
import { CliqueExists } from '../guards/clique.guard';



export const CliquesRouter: Router = Router();

// GET Routes

CliquesRouter.get('/:clique_id', CliqueExists, CliquesService.get_clique);
CliquesRouter.get('/:clique_id/interests/all', CliqueExists, CliqueInterestsService.get_clique_interests_all);
CliquesRouter.get('/:clique_id/interests', CliqueExists, CliqueInterestsService.get_clique_interests);
CliquesRouter.get('/:clique_id/interests/:interest_id', CliqueExists, CliqueInterestsService.get_clique_interests);

// POST Routes



// PUT Routes



// DELETE Routes


