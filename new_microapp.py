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

app_cli_name = cli_args.pop(0)
split = app_cli_name.split('-')
for i, s in enumerate(split):
  split[i] = s[0].upper() + s[1:].lower()

app = ''.join(split)
print("split", split)
print("App", app)

if not app or app == '':
  print('An app name needs to be specified; exiting...')
  sys.exit(1)

app_path = os.path.join(CWD, 'src/apps/' + app_cli_name)
app_dir_exists = os.path.isdir(app_path)
if app_dir_exists:
  print('A directory with the app name \"' + app_cli_name + '\" already exists; exiting...')
  sys.exit(1)




GUARDS_PATH = os.path.join(CWD,  'src/apps/' + app_cli_name + '/guards')
HANDLERS_PATH = os.path.join(CWD,  'src/apps/' + app_cli_name + '/handlers')
INTERFACES_PATH = os.path.join(CWD,  'src/apps/' + app_cli_name + '/interfaces')
MODELS_PATH = os.path.join(CWD,  'src/apps/' + app_cli_name + '/models')
REPOS_PATH = os.path.join(CWD,  'src/apps/' + app_cli_name + '/repos')
ROUTERS_PATH = os.path.join(CWD,  'src/apps/' + app_cli_name + '/routers')
SERVICES_PATH = os.path.join(CWD,  'src/apps/' + app_cli_name + '/services')

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


f = open('./src/apps/' + app_cli_name + '/' + app_cli_name + '.app.ts', "w")
f.write(
  '''import { Router, Request, Response } from 'express';
import { corsMiddleware } from '../_common/common.chamber';
import * as bodyParser from 'body-parser';

export const %sRouter: Router = Router({ mergeParams: true });
%sRouter.use(bodyParser.json());
%sRouter.options(`*`, corsMiddleware);

/** Mount Routers */

// %sRouter.use('/users', corsMiddleware, UsersRouter);
  ''' % (app, app, app, app,)
)
f.close()


f = open('./src/apps/' + app_cli_name + '/' + app_cli_name + '.chamber.ts', "w")
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