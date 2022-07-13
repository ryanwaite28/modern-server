import { Users } from '../../_common/models/user.model';
import { common_options } from '../../_common/models/_def.model';
import { Model, DataTypes } from 'sequelize';



export class SafestarMessagings extends Model {}
SafestarMessagings.init({
  id:                 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:            { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  sender_id:          { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  uuid:               { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_options,
  tableName: 'safestar_messagings',
  modelName: 'messaging',
});



export class SafestarMessagingRequests extends Model {}
SafestarMessagingRequests.init({
  id:                 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:            { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  sender_id:          { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  status:             { type: DataTypes.INTEGER, allowNull: true }, // null = pending, 1 = accepted, 0 = rejected
  uuid:               { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_options,
  tableName: 'safestar_messaging_requests',
  modelName: 'messagingRequest',
});



export class SafestarMessages extends Model {}
SafestarMessages.init({
  id:                 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  from_id:            { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  to_id:              { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  body:               { type: DataTypes.TEXT, allowNull: true, defaultValue: '' },
  lat:                { type: DataTypes.FLOAT, allowNull: true, defaultValue: null },
  lng:                { type: DataTypes.FLOAT, allowNull: true, defaultValue: null },
  opened:             { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  uuid:               { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_options,
  tableName: 'safestar_messages',
  modelName: 'message',
});



export class SafestarMessagePhotos extends Model {}
SafestarMessagePhotos.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  message_id:          { type: DataTypes.INTEGER, allowNull: false, references: { model: SafestarMessages, key: 'id' } },
  photo_id:            { type: DataTypes.STRING, allowNull: false },
  photo_link:          { type: DataTypes.STRING, allowNull: false },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_options,
  tableName: 'safestar_message_photos',
  modelName: 'messagePhoto',
});



export class SafestarMessageVideos extends Model {}
SafestarMessageVideos.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  message_id:           { type: DataTypes.INTEGER, allowNull: false, references: { model: SafestarMessages, key: 'id' } },
  s3object_bucket:      { type: DataTypes.STRING, allowNull: false },
  s3object_key:         { type: DataTypes.STRING, allowNull: false },
  uuid:                 { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_options,
  tableName: 'safestar_message_videos',
  modelName: 'messageVideo',
});



export class SafestarMessageAudios extends Model {}
SafestarMessageAudios.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  message_id:           { type: DataTypes.INTEGER, allowNull: false, references: { model: SafestarMessages, key: 'id' } },
  s3object_bucket:      { type: DataTypes.STRING, allowNull: false },
  s3object_key:         { type: DataTypes.STRING, allowNull: false },
  uuid:                 { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_options,
  tableName: 'safestar_message_audios',
  modelName: 'messageAudio',
});



Users.hasMany(SafestarMessagings, { as: 'safestar_message_sendings', foreignKey: 'sender_id', sourceKey: 'id' });
SafestarMessagings.belongsTo(Users, { as: 'sender', foreignKey: 'sender_id', targetKey: 'id' });
Users.hasMany(SafestarMessagings, { as: 'safestar_message_receivings', foreignKey: 'user_id', sourceKey: 'id' });
SafestarMessagings.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });

Users.hasMany(SafestarMessages, { as: 'safestar_messages_sent', foreignKey: 'from_id', sourceKey: 'id' });
SafestarMessages.belongsTo(Users, { as: 'from', foreignKey: 'from_id', targetKey: 'id' });
Users.hasMany(SafestarMessages, { as: 'safestar_messages_received', foreignKey: 'to_id', sourceKey: 'id' });
SafestarMessages.belongsTo(Users, { as: 'to', foreignKey: 'to_id', targetKey: 'id' });