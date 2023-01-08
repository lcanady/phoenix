import { error } from "@sveltejs/kit";
import axios from "axios";
import type { PageLoad } from "./$types";

export const load = (async () => {
  const res = await axios.get(`http://localhost:4202/wiki/landing`);
  const article = await res.data;

  const feat = await axios.get(`http://localhost:4202/wiki/featured`);
  const featured = (await feat.data).map((a: any) => ({
    name: a.title,
    path: `/wiki/${a.slug}`,
  }));

  if (!article) return error(404, "Article not found");
  return { article, featured };
}) satisfies PageLoad;
