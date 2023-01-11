<script lang="ts">
  import { env } from "$env/dynamic/public";
  import axios from "axios";
  import { onMount } from "svelte";
  import Article from "../../components/Article.svelte";
  import { menuItems, user } from "../../stores";
  import type { PageData } from "./$types";

  interface PageParams extends PageData {
    article: any;
    featured: any[];
  }

  export let data: PageParams;

  onMount(() =>
    axios
      .get(`${env.PUBLIC_BASE_URL}auth/user`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
      .then((res) => user.set(res.data.user))
  );

  $menuItems = [
    {
      name: "Featured Articles",
      title: true,
    },
  ];

  $menuItems = [...$menuItems, ...data.featured];

  $: if ($user) {
    $menuItems = [];
    const staff = [
      {
        name: "Staff Commands",
        title: true,
      },
      {
        name: "Edit",
        path: "/wiki/edit/" + data.article[0]?.slug,
      },
      {
        name: "Delete",
        path: "/wiki/delete/" + data.article[0]?.slug,
      },
      { name: "Create", path: "/wiki/new/" },
    ];

    $menuItems = [
      {
        name: "Featured Articles",
        title: true,
      },
      ...data.featured,
    ];

    if ($user.isAdmin) {
      $menuItems = [...$menuItems, ...staff];
    }
  }
</script>

<Article
  image={data.article[0]?.shortImg &&
    `${env.PUBLIC_BASE_URL}uploads/${data.article[0]?.shortImg}`}
  longImage={data.article[0]?.longImg &&
    `${env.PUBLIC_BASE_URL}uploads/${data.article[0]?.longImg}`}
  title={data.article[0]?.title}
  body={data.article[0]?.body}
  updatedBy={data.article[0]?.updatedBy}
  updatedAt={new Date(data.article[0]?.updatedAt).toLocaleString()}
/>
