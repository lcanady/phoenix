import { error } from "@sveltejs/kit";
import axios from "axios";
import type { PageLoad } from "./$types";
import { env } from "$env/dynamic/public";
export const load = (async ({ params }) => {
  const res = await axios.get(`${env.PUBLIC_BASE_URL}wiki/${params.slug}`);
  const article = await res.data;

  if (!article) return error(404, "Article not found");
  return { article };
}) satisfies PageLoad;
