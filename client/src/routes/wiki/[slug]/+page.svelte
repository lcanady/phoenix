<script lang="ts">
  import Article from "../../../components/Article.svelte";
  import { menuItems } from "../../../stores";
  import type { PageData } from "./$types";

  interface PageParams extends PageData {
    article: any;
    featured: any[];
  }

  export let data: PageParams;

  $menuItems = [
    {
      name: "Featured Articles",
      title: true,
    },
  ];

  $menuItems = [...$menuItems, ...data.featured];
</script>

<Article
  title={data.article.title}
  image={data.article.shortImg &&
    `http://localhost:4202/uploads/${data.article.shortImg}`}
  longImage={data.article.longImg &&
    `http://localhost:4202/uploads/${data.article.longImg}`}
  body={data.article.body}
/>
