import {
  DB_ENV,
  sequelizeInst as sequelize
} from './_def.model';


import {
  Cliques,
  CliqueInterests,
  CliqueMembers,
  CliqueMemberRequests,
} from "../../hotspot/models/clique.model";
import { Users, Notifications, Follows } from "./user.model";
import { Messagings, Messages } from './messages.model';
import { Photos } from './photo.model';
import { Videos } from './video.model';
import { Audios } from './audio.model';


/** Relationships */

Users.hasMany(Notifications, { as: 'to_notifications', foreignKey: 'to_id', sourceKey: 'id' });
Notifications.belongsTo(Users, { as: 'to', foreignKey: 'to_id', targetKey: 'id' });
Users.hasMany(Notifications, { as: 'from_notifications', foreignKey: 'from_id', sourceKey: 'id' });
Notifications.belongsTo(Users, { as: 'from', foreignKey: 'from_id', targetKey: 'id' });

Users.hasMany(Follows, { as: 'followers', foreignKey: 'follows_id', sourceKey: 'id' });
Follows.belongsTo(Users, { as: 'following', foreignKey: 'follows_id', targetKey: 'id' });
Users.hasMany(Follows, { as: 'followings', foreignKey: 'user_id', sourceKey: 'id' });
Follows.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });

Users.hasMany(Messagings, { as: 'message_sendings', foreignKey: 'sender_id', sourceKey: 'id' });
Messagings.belongsTo(Users, { as: 'sender', foreignKey: 'sender_id', targetKey: 'id' });
Users.hasMany(Messagings, { as: 'message_receivings', foreignKey: 'user_id', sourceKey: 'id' });
Messagings.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });

Users.hasMany(Messages, { as: 'messages_sent', foreignKey: 'from_id', sourceKey: 'id' });
Messages.belongsTo(Users, { as: 'from', foreignKey: 'from_id', targetKey: 'id' });
Users.hasMany(Messages, { as: 'messages_received', foreignKey: 'to_id', sourceKey: 'id' });
Messages.belongsTo(Users, { as: 'to', foreignKey: 'to_id', targetKey: 'id' });

Users.hasMany(Cliques, { as: 'cliques_owned', foreignKey: 'creator_id', sourceKey: 'id' });
Cliques.belongsTo(Users, { as: 'creator', foreignKey: 'creator_id', targetKey: 'id' });
Users.hasMany(CliqueInterests, { as: 'clique_interests', foreignKey: 'user_id', sourceKey: 'id' });
CliqueInterests.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });
Cliques.hasMany(CliqueInterests, { as: 'interests', foreignKey: 'clique_id', sourceKey: 'id' });
CliqueInterests.belongsTo(Cliques, { as: 'clique', foreignKey: 'clique_id', targetKey: 'id' });

Users.hasMany(CliqueMembers, { as: 'cliques', foreignKey: 'user_id', sourceKey: 'id' });
CliqueMembers.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });
Cliques.hasMany(CliqueMembers, { as: 'members', foreignKey: 'clique_id', sourceKey: 'id' });
CliqueMembers.belongsTo(Cliques, { as: 'clique', foreignKey: 'clique_id', targetKey: 'id' });

Users.hasMany(CliqueMemberRequests, { as: 'clique_member_requests', foreignKey: 'user_id', sourceKey: 'id' });
CliqueMemberRequests.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });
Cliques.hasMany(CliqueMemberRequests, { as: 'member_requests', foreignKey: 'clique_id', sourceKey: 'id' });
CliqueMemberRequests.belongsTo(Cliques, { as: 'clique', foreignKey: 'clique_id', targetKey: 'id' });





/** Init Database */

export const db_init = async () => {  
  const sequelize_db_sync_options = {
    force: false,
    // alter: !process.env.DATABASE_URL,
    // alter: true,
    alter: false,
  };
  
  console.log({
    DB_ENV,
    sequelize_db_sync_options,
  });

  return sequelize.sync(sequelize_db_sync_options)
    .then(() => {
      console.log('\n\nDatabase Initialized! ENV: ' + DB_ENV);
    })
    .catch((error) => {
      console.log('\n\nDatabase Failed!', error);
      throw error;
    });
};