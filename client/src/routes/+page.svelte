<script lang="ts">
  import axios from "axios";
  import Login from "../components/Login.svelte";
  import { onMount } from "svelte";
  import Article from "../components/Article.svelte";
  import { errorMsg, menuItems, token, usefulLinks, user } from "../stores";
  import type { PageData } from "./$types";
  import { env } from "$env/dynamic/public";

  export let data: PageData;

  onMount(() => {
    $errorMsg = "";
    if ($token) {
      axios
        .get(`${env.PUBLIC_BASE_URL}auth/user`, {
          headers: {
            Authorization: "Bearer " + $token,
          },
        })
        .then((res) => user.set(res.data.user))
        .catch((err) => errorMsg.set(err.message));
    }
  });

  if (data.featured.length > 0) {
    $menuItems = [
      {
        name: "Featured Articles",
        title: true,
      },
    ];
    $menuItems = [...$menuItems, ...data.featured, ...$usefulLinks];
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
        path: "/wiki/edit/" + data.article[0].slug,
      },

      { name: "Create", path: "/wiki/new/" },
    ];

    if (data.featured.length > 0) {
      $menuItems = [
        {
          name: "Featured Articles",
          title: true,
        },
        ...data.featured,
      ];
    }

    if ($user.isAdmin) {
      $menuItems = [...$menuItems, ...$usefulLinks, ...staff];
    } else {
      $menuItems = [...$menuItems, ...$usefulLinks];
    }
  }
</script>

<Article
  title={data.article[0]?.title}
  image={data.article[0]?.shortImg &&
    `${env.PUBLIC_BASE_URL}uploads/${data.article[0]?.shortImg}`}
  longImage={data.article[0]?.longImg &&
    `${env.PUBLIC_BASE_URL}uploads/${data.article[0]?.longImg}`}
  body={data.article[0]?.body}
  updatedAt={new Date(data.article[0]?.updatedAt).toLocaleString()}
  updatedBy={data.article[0]?.updatedBy}
>
  <Login />
</Article>
