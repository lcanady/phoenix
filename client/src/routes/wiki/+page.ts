import axios from "axios";
import type { PageLoad } from "./$types";
import { env } from "$env/dynamic/public";
import { error } from "@sveltejs/kit";

export const load = (async () => {
  const res = await axios.get(`${env.PUBLIC_BASE_URL}wiki/`);
  const article = await res.data;
  const feat = await axios.get(`${env.PUBLIC_BASE_URL}wiki/featured`);
  const featured = (await feat.data).map((a: any) => ({
    name: a.title,
    path: `/wiki/${a.slug}`,
  }));

  if (!article.length) throw error(404, "Not found");

  return { article, featured };
}) satisfies PageLoad;
