import { env } from "$env/dynamic/public";
import axios from "axios";
import type { IArticle } from "src/stores";
import type { PageLoad } from "./$types";

export const load = (async ({ params }) => {
  let res = await axios.get(`${env.PUBLIC_BASE_URL}wiki/categories`);
  let categories = await res.data;

  res = await axios.get(`${env.PUBLIC_BASE_URL}wiki/`);
  params.category = params.category || categories[0];

  let articles = await res.data.filter(
    (article: IArticle) =>
      article.category.toLocaleLowerCase() ===
      params.category.toLocaleLowerCase()
  );

  return { articles, categories };
}) satisfies PageLoad;
