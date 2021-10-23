import { genericTextValidator, numberValidator, user_attrs_slim, getUserFullName } from "../_common/common.chamber";
import { IModelValidator, IUser } from "../_common/interfaces/common.interface";
import { Users } from "../_common/models/user.model";
import { CHEFCITY_EVENT_TYPES } from "./enums/chefcity.enum";
import { get_recipe_by_id } from "./repos/recipes.repo";



export const create_recipe_required_props: IModelValidator[] = [
  
];

export const populate_chefcity_notification_obj = async (notification_model: any) => {
  const notificationObj = notification_model.toJSON();
  const user_model = await Users.findOne({
    where: { id: notificationObj.from_id },
    attributes: user_attrs_slim
  });
  const full_name = getUserFullName(<IUser> user_model!.toJSON());
  let message = '';
  let mount_prop_key = '';
  let mount_value = null;

  switch (notificationObj.event) {
    case CHEFCITY_EVENT_TYPES.NEW_RECIPE_COMMENT: {
      const recipe_model = await get_recipe_by_id(notificationObj.target_id, true);
      message = `${full_name} commented on your recipe: ${recipe_model!.get('title')}`;
      mount_prop_key = 'recipe';
      mount_value = recipe_model!.toJSON();
      break;
    }
  }

  notificationObj.from = user_model!.toJSON();
  notificationObj.message = message;
  notificationObj[mount_prop_key] = mount_value;

  return notificationObj;
}