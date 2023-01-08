<script lang="ts">
  import axios from "axios";

  import { onMount } from "svelte";
  import Article from "../../../components/Article.svelte";
  import { menuItems, user } from "../../../stores";
  import type { PageData } from "./$types";

  export let data: PageData;

  onMount(() =>
    axios
      .get("http://localhost:4202/auth/user", {
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
        path: "/wiki/edit/" + data.article.slug,
      },
      {
        name: "Delete",
        path: "/wiki/delete/" + data.article.slug,
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
  title={data.article?.title}
  image={data.article?.shortImg &&
    `http://localhost:4202/uploads/${data.article?.shortImg}`}
  longImage={data.article.longImg &&
    `http://localhost:4202/uploads/${data.article?.longImg}`}
  body={data.article?.body}
/>
