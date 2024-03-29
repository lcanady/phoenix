<script lang="ts">
  import {
    menuItems,
    preview,
    token,
    uploadFile,
    user,
    type IArticle,
  } from "../../../../stores";

  import { goto } from "$app/navigation";

  import axios from "axios";

  import type { PageData } from "./$types";
  import { onMount } from "svelte";
  import { env } from "$env/dynamic/public";

  import ArticleEditor from "../../../../components/ArticleEditor.svelte";
  export let data: PageData;

  onMount(async () => {
    token.set(localStorage.getItem("token") || "");

    if ($token) {
      const res = await axios.get(`${env.PUBLIC_BASE_URL}auth/user`, {
        headers: {
          Authorization: "Bearer " + $token,
        },
      });

      user.set(res.data.user);
    }

    if (!$user?.isAdmin) {
      goto("/");
    }
  });

  let title: string = data.article?.title;
  let category: string = data.article?.category;
  let lock: string = data.article?.lock;
  let body: string = data.article?.body;
  let landing: boolean = data.article?.landing;
  let featured: boolean = data.article?.featured,
    defaultArticle: boolean = data.article?.default;
  let short = data.article?.shortImg;
  let long = data.article?.longImg;

  const onSave = async (article: IArticle) => {
    if ($token) {
      if (article.shortFile)
        article.shortImg = await uploadFile(article.shortFile[0]);
      if (article.longFile)
        article.longImg = await uploadFile(article.longFile[0]);

      axios
        .post(
          `${env.PUBLIC_BASE_URL}wiki/article/${data.article?.slug}`,
          article,
          {
            headers: {
              Authorization: "Bearer " + $token,
            },
          }
        )
        .then((res) => {
          goto(`/wiki/${article.slug}`);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const onCancel = () => {
    goto(`/wiki/${data.article?.slug}`);
  };

  const onDelete = (article: IArticle) => {
    if ($token) {
      axios
        .delete(`${env.PUBLIC_BASE_URL}wiki/article/${article.slug}`, {
          headers: {
            Authorization: "Bearer " + $token,
          },
        })
        .then(() => {
          goto(`/wiki`);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
</script>

<ArticleEditor
  article={{
    title,
    body,
    category,
    lock,
    landing,
    featured,
    default: defaultArticle,
    shortImg: short,
    longImg: long,
    createdAt: data.article?.createdAt,
    createdBy: data.article?.createdBy,
    updatedAt: Date.now(),
    updatedBy: $user?.id,
    slug: data.article?.slug,
  }}
  {onSave}
  {onCancel}
  {onDelete}
/>
