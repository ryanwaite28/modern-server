import { Router } from 'express';

// services
import { UsersService } from '../../_common/services/users.service';
import { PostsService } from '../services/posts.service';
import { ResourcesService } from '../services/resources.service';
import { ResourceInterestsService } from '../services/resource-interests.service';
import { CliquesService } from '../services/cliques.service';
import { CliqueInterestsService } from '../services/clique-interests.service';
import { CliqueMembersService } from '../services/clique-members.service';

// guards
import { ResourceExists } from '../guards/resource.guard';
import { CliqueExists, IsCliqueCreator, IsNotCliqueCreator } from '../guards/clique.guard';
import { UserAuthorized, UserIdsAreDifferent } from '../../_common/guards/user.guard';

// Router
export const UsersRouter: Router = Router();

// GET Routes
UsersRouter.get('/:you_id/member-requests/all', UserAuthorized, CliqueMembersService.get_clique_member_requests_all);
UsersRouter.get('/:you_id/member-requests', UserAuthorized, CliqueMembersService.get_clique_member_requests);
UsersRouter.get('/:you_id/member-requests/:member_request_id', UserAuthorized, CliqueMembersService.get_clique_member_requests);

UsersRouter.get('/:you_id/unseen-counts', UserAuthorized, UsersService.get_unseen_counts);

// UsersRouter.get('/:you_id/feed', UserAuthorized, UsersService.get_user_feed);
// UsersRouter.get('/:you_id/feed/:min_id', UserAuthorized, UsersService.get_user_feed);
// UsersRouter.get('/:you_id/random', UserAuthorized, UsersService.get_random_models);
// UsersRouter.get('/:you_id/random/:min_id', UserAuthorized, UsersService.get_random_models);
// UsersRouter.get('/:you_id/search', UserAuthorized, UsersService.get_search_results);

UsersRouter.get('/:you_id/resources/:resource_id/interests', UserAuthorized, ResourceInterestsService.check_interest);
UsersRouter.get('/:you_id/resources/all', UserAuthorized, ResourcesService.get_user_resources_all);
UsersRouter.get('/:you_id/resources', UserAuthorized, ResourcesService.get_user_resources);
UsersRouter.get('/:you_id/resources/:resource_id', UserAuthorized, ResourcesService.get_user_resources);

UsersRouter.get('/:you_id/cliques/:clique_id/interests', UserAuthorized, CliqueInterestsService.check_interest);
UsersRouter.get('/:you_id/cliques/:clique_id/membership', UserAuthorized, CliqueInterestsService.check_membership);
UsersRouter.get('/:you_id/cliques/all', UserAuthorized, CliquesService.get_user_cliques_all);
UsersRouter.get('/:you_id/cliques', UserAuthorized, CliquesService.get_user_cliques);
UsersRouter.get('/:you_id/cliques/:clique_id', UserAuthorized, CliquesService.get_user_cliques);

UsersRouter.get('/:you_id/cliques/:clique_id/members/all', UserAuthorized, CliqueExists, CliqueMembersService.get_clique_members_all);
UsersRouter.get('/:you_id/cliques/:clique_id/members', UserAuthorized, CliqueExists, CliqueMembersService.get_clique_members);
UsersRouter.get('/:you_id/cliques/:clique_id/members/:member_id', UserAuthorized, CliqueExists, CliqueMembersService.get_clique_members);
UsersRouter.get('/:you_id/cliques/:clique_id/search-users', UserAuthorized, CliqueExists, IsCliqueCreator, CliqueMembersService.search_members);

/** Public GET */

UsersRouter.get('/id/:id', UsersService.get_user_by_id);
UsersRouter.get('/phone/:phone', UsersService.get_user_by_phone);

UsersRouter.get('/:user_id/get-posts/all', PostsService.get_user_posts_all);
UsersRouter.get('/:user_id/get-posts', PostsService.get_user_posts);
UsersRouter.get('/:user_id/get-posts/:post_id', PostsService.get_user_posts);

// UsersRouter.get('/:user_id/get-recipes/all', RecipesService.get_user_recipes_all);
// UsersRouter.get('/:user_id/get-recipes', RecipesService.get_user_recipes);
// UsersRouter.get('/:user_id/get-recipes/:recipe_id', RecipesService.get_user_recipes);

UsersRouter.get('/:user_id/get-resources/all', ResourcesService.get_user_resources_all);
UsersRouter.get('/:user_id/get-resources', ResourcesService.get_user_resources);
UsersRouter.get('/:user_id/get-resources/:resource_id', ResourcesService.get_user_resources);

UsersRouter.get('/:user_id/get-resource-interests/all', ResourceInterestsService.get_user_resource_interests_all);
UsersRouter.get('/:user_id/get-resource-interests', ResourceInterestsService.get_user_resource_interests);
UsersRouter.get('/:user_id/get-resource-interests/:interest_id', ResourceInterestsService.get_user_resource_interests);

UsersRouter.get('/:user_id/get-cliques/all', CliquesService.get_user_cliques_all);
UsersRouter.get('/:user_id/get-cliques', CliquesService.get_user_cliques);
UsersRouter.get('/:user_id/get-cliques/:clique_id', CliquesService.get_user_cliques);

UsersRouter.get('/:user_id/get-clique-interests/all', CliqueInterestsService.get_user_clique_interests_all);
UsersRouter.get('/:user_id/get-clique-interests', CliqueInterestsService.get_user_clique_interests);
UsersRouter.get('/:user_id/get-clique-interests/:interest_id', CliqueInterestsService.get_user_clique_interests);

UsersRouter.get('/:user_id/get-clique-memberships/all', CliqueMembersService.get_user_clique_members_all);
UsersRouter.get('/:user_id/get-clique-memberships', CliqueMembersService.get_user_clique_members);
UsersRouter.get('/:user_id/get-clique-memberships/:member_id', CliqueMembersService.get_user_clique_members);

/** END Public GET */

// POST Routes

// PUT Routes

// DELETE Routes

// UsersRouter.delete('/:you_id', UserAuthorized, UsersService.delete_user_);


