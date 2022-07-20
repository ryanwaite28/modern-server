
import { Model, DataTypes } from 'sequelize';
import { Users } from '../../_common/models/user.model';
import { common_options } from '../../_common/models/_def.model';


export class SafestarUsersInfo extends Model {}
SafestarUsersInfo.init({
  // required at creation
  // id and user_id shoulod match since this should be created along with a new user
  id:                                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:                             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } }, 

  // defaults; not required at creation
  latest_lat:                          { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
  latest_lng:                          { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
  latlng_last_updated:                 { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  is_public:                           { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  
  allow_messaging:                     { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  allow_conversations:                 { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  allow_watches:                       { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  allow_text_pulse_updates:            { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  pulses_last_opened:                  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  checkpoints_last_opened:             { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  date_created:                        { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  uuid:                                { type: DataTypes.STRING, unique: true, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_options,
  tableName: 'safestar_users_info',
  modelName: 'user',
  indexes: [{ unique: true, fields: ['uuid']} ],
});

export class SafestarUserLocationUpdates extends Model {}
SafestarUserLocationUpdates.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:              { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  automated:            { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  device:               { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
  ip_addr:              { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
  user_agent:           { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
  lat:                  { type: DataTypes.FLOAT, allowNull: false, },
  lng:                  { type: DataTypes.FLOAT, allowNull: false },
  uuid:                 { type: DataTypes.STRING, unique: true, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_options,
  tableName: 'safestar_user_location_updates',
  modelName: 'userLocationUpdate',
});


export class SafestarAppFeedbacks extends Model {}
SafestarAppFeedbacks.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  rating:              { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 },
  title:               { type: DataTypes.TEXT, allowNull: true, defaultValue: '' },
  summary:             { type: DataTypes.TEXT, allowNull: true, defaultValue: '' },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_options,
  tableName: 'safestar_app_feedbacks',
  modelName: 'appFeedback',
});



Users.hasOne(SafestarUsersInfo, { as: 'safestar_info', foreignKey: 'user_id', sourceKey: 'id' });
SafestarUsersInfo.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });

Users.hasMany(SafestarUserLocationUpdates, { as: 'location_updates', foreignKey: 'user_id', sourceKey: 'id' });
SafestarUserLocationUpdates.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });

