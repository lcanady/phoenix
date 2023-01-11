<script lang="ts">
  import { env } from "$env/dynamic/public";
  import Article from "../../../components/Article.svelte";
  import { menuItems, user } from "../../../stores";
  import type { PageData } from "./$types";

  export let data: PageData;

  if (data.featured.length > 0) {
    $menuItems = [
      {
        name: "Featured Articles",
        title: true,
      },
    ];
    $menuItems = [...$menuItems, ...data.featured];
  }

  $: if ($user) {
    $menuItems = [];
    const staff = [
      {
        name: "Staff Commands",
        title: true,
      },
      {
        name: "Edit",
        path: "/wiki/edit/" + data.article.slug,
      },
      {
        name: "Delete",
        path: "/wiki/delete/" + data.article.slug,
      },
      { name: "Create", path: "/wiki/new/" },
    ];

    if (data.featured.length > 0) {
      $menuItems = [
        {
          name: "Featured Articles",
          title: true,
        },
      ];
      $menuItems = [...$menuItems, ...data.featured];
    }

    if ($user.isAdmin) {
      $menuItems = [...$menuItems, ...staff];
    }
  }
</script>

<Article
  title={data.article?.title}
  image={data.article?.shortImg &&
    `${env.PUBLIC_BASE_URL}uploads/${data.article?.shortImg}`}
  longImage={data.article.longImg &&
    `${env.PUBLIC_BASE_URL}uploads/${data.article?.longImg}`}
  body={data.article?.body}
  updatedAt={new Date(data.article?.updatedAt).toLocaleString()}
  updatedBy={data.article?.updatedBy}
/>
