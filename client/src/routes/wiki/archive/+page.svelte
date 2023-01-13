<script lang="ts">
  import ArticlePreview from "../../../components/ArticlePreview.svelte";
  import { menuItems, usefulLinks, user, type IArticle } from "../../../stores";
  import type { PageData } from "./$types";
  export let data: PageData;

  $menuItems = [
    {
      name: "Categories",
      title: true,
    },
  ];

  data?.categories?.forEach((c: string) => {
    $menuItems.push({
      name: c,
      path: "/wiki/archive/" + c.toLowerCase(),
    });
  });

  $menuItems = [...$menuItems, ...$usefulLinks];

  $: if ($user) {
    const staff = [
      {
        name: "Staff Commands",
        title: true,
      },

      { name: "Create", path: "/wiki/new/" },
    ];

    if ($user.isAdmin) {
      $menuItems = [...$menuItems, ...staff];
    }
  }

  $: list = data.articles?.sort((a: IArticle, b: IArticle) => {
    if (a.updatedAt > b.updatedAt) {
      return -1;
    } else if (a.updatedAt < b.updatedAt) {
      return 1;
    } else {
      return 0;
    }
  });
</script>

<div class="wrapper">
  <h1>The Archives</h1>
  {#each list as article}
    <ArticlePreview {article} />
  {/each}
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    position: relative;
    flex-direction: column;
    min-height: 100vh;
    width: 100vw;
    background: black;
    padding: 0;
    margin: 0;
    margin-left: 350px;
    margin-top: 20px;
    min-height: -webkit-fill-available;
    overflow-y: auto;
    gap: 40px;
  }

  ::-webkit-scrollbar {
    display: none;
  }

  @media screen and (max-width: 1024px) {
    .wrapper {
      margin-left: 0;
    }
  }
</style>
