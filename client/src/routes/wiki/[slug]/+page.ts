import { env } from "$env/dynamic/public";
import { error } from "@sveltejs/kit";
import axios from "axios";
import type { PageLoad } from "./$types";

export const load = (async ({ params }) => {
  const res = await axios.get(
    `${env.PUBLIC_BASE_URL}wiki/article/${params.slug}`
  );
  const article = await res.data;

  const feat = await axios.get(`${env.PUBLIC_BASE_URL}wiki/featured`);
  const featured = (await feat.data).map((a: any) => ({
    name: a.title,
    path: `/wiki/${a.slug}`,
  }));

  if (!article || !article.slug) throw error(404, "Article not found");
  return { article, featured };
}) satisfies PageLoad;
