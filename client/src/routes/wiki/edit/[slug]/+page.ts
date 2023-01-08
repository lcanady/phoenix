import { error } from "@sveltejs/kit";
import axios from "axios";
import type { PageLoad } from "./$types";

export const load = (async ({ params }) => {
  const res = await axios.get(`http://localhost:4202/wiki/${params.slug}`);
  const article = await res.data;

  if (!article) return error(404, "Article not found");
  return { article };
}) satisfies PageLoad;
