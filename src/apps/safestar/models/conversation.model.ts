import { Users } from '../../_common/models/user.model';
import { common_options } from '../../_common/models/_def.model';
import { Model, DataTypes } from 'sequelize';



export class SafestarConversations extends Model {}
SafestarConversations.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:          { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  is_public:           { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  title:               { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
  icon_link:           { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
  icon_id:             { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_options,
  tableName: 'safestar_conversations',
  modelName: 'conversation',
});

export class SafestarConversationMembers extends Model {}
SafestarConversationMembers.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  conversation_id:     { type: DataTypes.INTEGER, allowNull: false, references: { model: SafestarConversations, key: 'id' } },
  user_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  role:                { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_options,
  tableName: 'safestar_conversation_members',
  modelName: 'conversationMember',
});

export class SafestarConversationMemberRequests extends Model {}
SafestarConversationMemberRequests.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  conversation_id:     { type: DataTypes.INTEGER, allowNull: false, references: { model: SafestarConversations, key: 'id' } },
  user_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  status:              { type: DataTypes.INTEGER, allowNull: true, defaultValue: null }, // null = pending, 1 = accepted, 0 = rejected
  role:                { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_options,
  tableName: 'safestar_conversation_member_requests',
  modelName: 'conversationMemberRequest',
});

export class SafestarConversationLastOpeneds extends Model {}
SafestarConversationLastOpeneds.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  conversation_id:     { type: DataTypes.INTEGER, allowNull: false, references: { model: SafestarConversations, key: 'id' } },
  user_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  last_opened:         { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_options,
  tableName: 'safestar_conversation_last_openeds',
  modelName: 'conversationLastOpened',
});

export class SafestarConversationMessages extends Model {}
SafestarConversationMessages.init({
  id:                 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  conversation_id:    { type: DataTypes.INTEGER, allowNull: false, references: { model: SafestarConversations, key: 'id' } },
  parent_message_id:  { type: DataTypes.INTEGER, allowNull: true },
  owner_id:            { type: DataTypes.INTEGER, allowNull: true, references: { model: Users, key: 'id' } },
  body:               { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
  uuid:               { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_options,
  tableName: 'safestar_conversation_messages',
  modelName: 'conversationMessage',
});

export class SafestarConversationMessageSeens extends Model {}
SafestarConversationMessageSeens.init({
  id:                 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  conversation_id:    { type: DataTypes.INTEGER, allowNull: false, references: { model: SafestarConversations, key: 'id' } },
  message_id:         { type: DataTypes.INTEGER, allowNull: false, references: { model: SafestarConversationMessages, key: 'id' } },
  user_id:            { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  seen:               { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  uuid:               { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_options,
  tableName: 'safestar_conversation_message_seens',
  modelName: 'conversationMessageSeen',
});

export class SafestarConversationMessagePhotos extends Model {}
SafestarConversationMessagePhotos.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  message_id:          { type: DataTypes.INTEGER, allowNull: false, references: { model: SafestarConversationMessages, key: 'id' } },
  photo_id:            { type: DataTypes.STRING, allowNull: false },
  photo_link:          { type: DataTypes.STRING, allowNull: false },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_options,
  tableName: 'safestar_conversation_message_photos',
  modelName: 'conversationMessagePhoto',
});

export class SafestarConversationMessageVideos extends Model {}
SafestarConversationMessageVideos.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  message_id:          { type: DataTypes.INTEGER, allowNull: false, references: { model: SafestarConversationMessages, key: 'id' } },
  s3object_bucket:     { type: DataTypes.STRING, allowNull: false },
  s3object_key:        { type: DataTypes.STRING, allowNull: false },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_options,
  tableName: 'safestar_conversation_message_videos',
  modelName: 'conversationMessageVideo',
});

export class SafestarConversationMessageAudios extends Model {}
SafestarConversationMessageAudios.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  message_id:          { type: DataTypes.INTEGER, allowNull: false, references: { model: SafestarConversationMessages, key: 'id' } },
  s3object_bucket:     { type: DataTypes.STRING, allowNull: false },
  s3object_key:        { type: DataTypes.STRING, allowNull: false },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_options,
  tableName: 'safestar_conversation_message_audios',
  modelName: 'conversationMessageAudio',
});




Users.hasMany(SafestarConversations, { as: 'safestar_owned_conversations', foreignKey: 'owner_id', sourceKey: 'id' });
SafestarConversations.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });

Users.hasMany(SafestarConversationLastOpeneds, { as: 'safestar_conversations_opened', foreignKey: 'user_id', sourceKey: 'id' });
SafestarConversationLastOpeneds.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });
SafestarConversations.hasMany(SafestarConversationLastOpeneds, { as: 'conversations_opened', foreignKey: 'conversation_id', sourceKey: 'id' });
SafestarConversationLastOpeneds.belongsTo(SafestarConversations, { as: 'conversation', foreignKey: 'conversation_id', targetKey: 'id' });

Users.hasMany(SafestarConversationMembers, { as: 'safestar_conversations', foreignKey: 'user_id', sourceKey: 'id' });
SafestarConversationMembers.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });
SafestarConversations.hasMany(SafestarConversationMembers, { as: 'members', foreignKey: 'conversation_id', sourceKey: 'id' });
SafestarConversationMembers.belongsTo(SafestarConversations, { as: 'conversation', foreignKey: 'conversation_id', targetKey: 'id' });

Users.hasMany(SafestarConversationMessages, { as: 'safestar_conversation_messages', foreignKey: 'owner_id', sourceKey: 'id' });
SafestarConversationMessages.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
SafestarConversations.hasMany(SafestarConversationMessages, { as: 'messages', foreignKey: 'conversation_id', sourceKey: 'id' });
SafestarConversationMessages.belongsTo(SafestarConversations, { as: 'conversation', foreignKey: 'conversation_id', targetKey: 'id' });

Users.hasMany(SafestarConversationMessageSeens, { as: 'safestar_conversation_messages_seen', foreignKey: 'user_id', sourceKey: 'id' });
SafestarConversationMessageSeens.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });
SafestarConversationMessages.hasMany(SafestarConversationMessageSeens, { as: 'viewers', foreignKey: 'message_id', sourceKey: 'id' });
SafestarConversationMessageSeens.belongsTo(SafestarConversationMessages, { as: 'message', foreignKey: 'message_id', targetKey: 'id' });
