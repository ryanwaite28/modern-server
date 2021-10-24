import { getUserFullName, user_attrs_slim } from "../_common/common.chamber";
import { IUser } from "../_common/interfaces/common.interface";
import { Users } from "../_common/models/user.model";
import { WORLDNEWS_EVENT_TYPES } from "./enum/world-news.enum";



export const populate_worldnews_notification_obj = async (notification_model: any) => {
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
    case WORLDNEWS_EVENT_TYPES.NEW_NEWSPOST_COMMENT: {
      // const conversation_model = await Conversations.findOne({
      //   where: { id: notificationObj.target_id }
      // });
      // message = `${full_name} added you to a conversation: ${conversation_model!.get('title')}`;
      // mount_prop_key = 'conversation';
      // mount_value = conversation_model!.toJSON();
      break;
    }
  }

  notificationObj.from = user_model!.toJSON();
  notificationObj.message = message;
  notificationObj[mount_prop_key] = mount_value;

  return notificationObj;
}