<script lang="ts">
  import axios from "axios";
  import Login from "../components/Login.svelte";
  import { onMount } from "svelte";
  import Article from "../components/Article.svelte";
  import { menuItems, token, user } from "../stores";
  import type { PageData } from "./$types";

  export let data: PageData;

  onMount(() => {
    if ($token)
      axios
        .get("http://localhost:4202/auth/user", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((res) => user.set(res.data.user));
  });

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
        path: "/wiki/edit/" + data.article[0].slug,
      },
      {
        name: "Delete",
        path: "/wiki/delete/" + data.article[0].slug,
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
    } else {
      $menuItems = [...$menuItems];
    }
  }
</script>

<Article
  title={data.article[0]?.title}
  image={data.article[0]?.shortImg &&
    `http://localhost:4202/uploads/${data.article[0]?.shortImg}`}
  longImage={data.article[0].longImg &&
    `http://localhost:4202/uploads/${data.article[0]?.longImg}`}
  body={data.article[0].body}
>
  <Login />
</Article>
