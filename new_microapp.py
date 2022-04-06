import os, sys


'''
Python script for creating new microapp.

it reads the command line arguments for the app name and creates an app structure with it
'''



CWD = os.getcwd()
cli_args = sys.argv[1:]

if len(cli_args) < 1:
  print("Not enough args given; exiting...")
  sys.exit(1)

app = cli_args.pop(0)
print("App", app)

if not app or app == '':
  print('An app name needs to be specified; exiting...')
  sys.exit(1)

app_path = os.path.join(CWD, './src/' + app)
app_dir_exists = os.path.isdir(app_path)
if app_dir_exists:
  print('A directory with the app name \"' + app + '\" already exists; exiting...')
  sys.exit(1)




GUARDS_PATH = os.path.join(CWD,  './src/' + app + '/guards')
HANDLERS_PATH = os.path.join(CWD,  './src/' + app + '/handlers')
INTERFACES_PATH = os.path.join(CWD,  './src/' + app + '/interfaces')
MODELS_PATH = os.path.join(CWD,  './src/' + app + '/models')
REPOS_PATH = os.path.join(CWD,  './src/' + app + '/repos')
ROUTERS_PATH = os.path.join(CWD,  './src/' + app + '/routers')
SERVICES_PATH = os.path.join(CWD,  './src/' + app + '/services')

paths_to_create = [
  GUARDS_PATH,
  HANDLERS_PATH,
  INTERFACES_PATH,
  MODELS_PATH,
  REPOS_PATH,
  ROUTERS_PATH,
  SERVICES_PATH,
]

for create_path in paths_to_create:
  print("Creating directory:", create_path)
  os.makedirs(create_path)


f = open('./src/' + app + '/' + app + '.app.ts', "w")
f.write(
  '''import { Router, Request, Response } from 'express';
import { corsMiddleware } from '../_common/common.chamber';
import * as bodyParser from 'body-parser';

export const {app}Router: Router = Router({ mergeParams: true });
{app}Router.use(bodyParser.json());
{app}Router.options(`*`, corsMiddleware);

/** Mount Routers */

// {app}Router.use('/users', corsMiddleware, UsersRouter);
  '''.format(app = app[0].upper() + app[1:])
)
f.close()


f = open('./src/' + app + '/' + app + '.chamber.ts', "w")
f.write(
  '''import { cities_map } from "../_common/assets/cities";
import { countries_by_name_map } from "../_common/assets/countries";
import { states_map } from "../_common/assets/states";
import { zipcodes_map } from "../_common/assets/zipcodes";
import {
  genericTextValidator,
  booleanValidator,
  numberValidator,
  validatePersonName,
  phoneValidator,
  validateEmail,
  getUserFullName,
  user_attrs_slim,
  stripeValidators,
} from "../_common/common.chamber";
import { IModelValidator, INotification, IUser } from "../_common/interfaces/common.interface";
import { IMyModel } from "../_common/models/common.model-types";
import { Users } from "../_common/models/user.model";
import { get_user_by_id } from "../_common/repos/users.repo";
  '''
)
f.close()


print('Create app structure for \"' + app + '\"')