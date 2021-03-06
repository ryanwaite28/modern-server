export enum CHEFCITY_EVENT_TYPES {
  NEW_RECIPE = 'NEW_RECIPE',

  NEW_RECIPE_REACTION = 'NEW_RECIPE_REACTION',
  NEW_RECIPE_UNREACTION = 'NEW_RECIPE_UNREACTION',
  NEW_RECIPE_CHANGED_REACTION = 'NEW_RECIPE_CHANGED_REACTION',

  NEW_RECIPE_COMMENT = 'NEW_RECIPE_COMMENT',
  NEW_RECIPE_COMMENT_REACTION = 'NEW_RECIPE_COMMENT_REACTION',
  NEW_RECIPE_COMMENT_UNREACTION = 'NEW_RECIPE_COMMENT_UNREACTION',
  NEW_RECIPE_COMMENT_CHANGED_REACTION = 'NEW_RECIPE_COMMENT_CHANGED_REACTION',

  NEW_RECIPE_COMMENT_REPLY = 'NEW_RECIPE_COMMENT_REPLY',
  NEW_RECIPE_COMMENT_REPLY_REACTION = 'NEW_RECIPE_COMMENT_REPLY_REACTION',
  NEW_RECIPE_COMMENT_REPLY_UNREACTION = 'NEW_RECIPE_COMMENT_REPLY_UNREACTION',
  NEW_RECIPE_COMMENT_REPLY_CHANGED_REACTION = 'NEW_RECIPE_COMMENT_REPLY_CHANGED_REACTION',
}

export enum CHEFCITY_NOTIFICATION_TARGET_TYPES {
  RECIPE = 'RECIPE',
  RECIPE_COMMENT = 'RECIPE_COMMENT',
  RECIPE_COMMENT_REPLY = 'RECIPE_COMMENT_REPLY',
}

export enum CHEFCITY_SUBSCRIPTION_TARGET_ACTIONS {
  
}

export enum CHEFCITY_SUBSCRIPTION_TARGET_ACTIONS_INFO {
  
}

export enum RecipeVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}