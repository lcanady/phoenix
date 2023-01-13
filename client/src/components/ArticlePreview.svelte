<script lang="ts">
  import { goto } from "$app/navigation";
  import { env } from "$env/dynamic/public";
  import type { IArticle } from "src/stores";

  export let article: IArticle;
</script>

<div
  class="wrapper"
  on:click={() => goto("/wiki/" + article?.slug)}
  on:keydown={() => {}}
>
  <div class="container">
    <div class="author">
      <p>{article?.updatedBy}</p>
      <p>{new Date(article?.updatedAt).toLocaleString()}</p>
    </div>
    <h2>
      {`${article?.title.slice(0, 45)} ${
        article?.title.length > 45 ? "..." : ""
      }`}
    </h2>
    <p class="content">
      {`${article?.body.slice(0, 200)}${
        article?.body.length > 200 ? "..." : ""
      }`}
    </p>
  </div>
  <div
    class="preview"
    style={`background: url(${
      article?.shortImg
        ? env.PUBLIC_BASE_URL + "/uploads/" + article?.shortImg
        : "/placeholder.png"
    }); background-size: cover; background-position: center; background-repeat: no-repeat; filter: saturate(0);`}
  />
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding-bottom: 20px;
    border-bottom: rgba(255, 255, 255, 0.2) 1px solid;
  }

  .author {
    display: flex;
    align-items: center;

    p {
      margin: 0;
      margin-right: 20px;
      margin-bottom: 0;
      font-weight: normal;
      color: rgba(255, 255, 255, 0.5);
    }
  }

  h2 {
    margin-bottom: 10px;
  }

  .preview {
    width: 136px;
    height: 136px;
    flex-shrink: 0;
    margin-left: 50px;
    background-color: rgba(255, 255, 255, 0.5);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  @media screen and (max-width: 1390px) {
    .wrapper {
      flex-direction: column;
    }

    .preview {
      width: 100%;
      height: 200px;
      margin-left: 0;
      margin-top: 20px;
    }
  }
</style>
