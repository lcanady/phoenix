<script lang="ts">
  import { env } from "$env/dynamic/public";
  import axios from "axios";
  import { onDestroy, onMount } from "svelte";
  import Article from "../../components/Article.svelte";
  import { errorMsg, menuItems, token, usefulLinks, user } from "../../stores";
  import type { PageData } from "./$types";

  interface PageParams extends PageData {
    article: any;
    featured: any[];
  }

  export let data: PageParams;

  onMount(async () => {
    $errorMsg = "";
    const tkn = localStorage.getItem("token");
    if (tkn) {
      token.set(tkn);
      try {
        const res = await axios.get(`${env.PUBLIC_BASE_URL}auth/user`, {
          headers: {
            authorization: "Bearer " + tkn,
            contentType: "application/json",
          },
        });
        if (res && res.data) user.set(res.data.user);
      } catch (error: any) {
        $errorMsg = error.message;
      }
    }
  });

  $menuItems = [
    {
      name: "Featured Articles",
      title: true,
    },
  ];

  $menuItems = [...$menuItems, ...data.featured, ...$usefulLinks];

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
      $menuItems = [...$menuItems, ...$usefulLinks, ...staff];
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
