import { env } from "$env/dynamic/public";
import axios from "axios";
import type { PageLoad } from "./$types";

export const load = (async () => {
  let res = await axios.get(`${env.PUBLIC_BASE_URL}wiki/categories`);
  let categories = await res.data;

  res = await axios.get(`${env.PUBLIC_BASE_URL}wiki/`);

  let articles = await res.data;

  return { articles, categories };
}) satisfies PageLoad;
