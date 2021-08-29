import { user_attrs_slim } from "../../_common/common.chamber";
import { Users } from "../../_common/models/user.model";
import { Recipes, RecipeIngredients } from "../models/recipe.model";


export async function get_recipe_by_id(id: number, slim: boolean = false) {
  const recipe = slim 
  ? await Recipes.findByPk(id)
  : await Recipes.findOne({
      where: { id },
      include: [{
        model: Users,
        as: 'creator',
        attributes: user_attrs_slim
      }, {
        model: RecipeIngredients,
        as: 'ingredients'
      }]
    });
  return recipe;
}

export async function create_recipe(createObj: {
  creator_id:          number;
  title:               string;
  description:         string;
  youtube_link:        string;
  tags:                string[];
  image_link:          string;
  image_id:            string;
  visibility:          string;
  ingredients:         {
    name: string;
    notes: string;
  }[];
}) {
  const new_recipe_model = await Recipes.create(<any> {
    creator_id: createObj.creator_id,
    title: createObj.title,
    description: createObj.description,
    image_link: createObj.image_link,
    youtube_link: createObj.youtube_link,
    image_id: createObj.image_id,
    tags: createObj.tags.join(`,`),
    visibility: createObj.visibility,
  });
  const recipe_id: number = <number> new_recipe_model.get('id');
  for (const ingredient of createObj.ingredients) {
    const newIngredient = await RecipeIngredients.create({
      ...ingredient,
      recipe_id,
      creator_id: createObj.creator_id,
    });
  }
  const recipe = await get_recipe_by_id(recipe_id);
  return recipe;
}

export async function update_recipe(
  updatesObj: {
    title:               string;
    description:         string;
    tags:                string[];
    image_link:          string;
    image_id:            string;
    visibility:          string;
    youtube_link:        string;
    ingredients:         {
      name: string;
      notes: string;
      id?: number;
    }[];
  },
  id: number,
  you_id: number,
) {
  const updates = await Recipes.update({
    title: updatesObj.title,
    description: updatesObj.description,
    image_link: updatesObj.image_link,
    image_id: updatesObj.image_id,
    youtube_link: updatesObj.youtube_link,
    tags: updatesObj.tags.join(`,`),
    visibility: updatesObj.visibility,
  }, { where: { id } });
  for (const ingredient of updatesObj.ingredients) {
    if (ingredient.id) {
      continue;
    }
    const newIngredient = await RecipeIngredients.create({
      ...ingredient,
      creator_id: you_id,
      recipe_id: id
    });
  }
  return updates;
}

export async function update_recipe_ingredient(
  updatesObj: {
    name: string;
    notes: string;
  },
  id: number
) {
  const updates = await RecipeIngredients.update(updatesObj, { where: { id } });
  return updates;
}

export async function delete_recipe(id: number) {
  const deletes = await Recipes.destroy({ where: { id } });
  return deletes;
}

export async function delete_recipe_ingredient(id: number) {
  const deletes = await RecipeIngredients.destroy({ where: { id } });
  return deletes;
}