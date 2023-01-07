<script lang="ts">
  import Article from "../../components/Article.svelte";
  import { menuItems } from "../../stores";
  import type { PageData } from "./$types";

  interface PageParams extends PageData {
    article: any;
    featured: any[];
  }

  export let data: PageParams;
  console.log(data);
  $menuItems = [
    {
      name: "Featured Articles",
      title: true,
    },
  ];

  $menuItems = [...$menuItems, ...data.featured];
</script>

<Article
  image={data.article[0].shortImg &&
    `http://localhost:4202/uploads/${data.article[0].shortImg}`}
  longImage={data.article[0].longImg &&
    `http://localhost:4202/uploads/${data.article[0].longImg}`}
  title={data.article[0].title}
  body={data.article[0].body}
/>
