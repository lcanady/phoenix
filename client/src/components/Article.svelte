<script lang="ts">
  import { marked } from "marked";
  import { errorMsg } from "../stores";
  export let longImage = "";
  export let image = "";
  export let title = "";
  export let body = "";
  export let updatedBy: string = "";
  export let updatedAt: string = "";

  errorMsg.set("");

  $: text = marked.parse(body);
</script>

{#if longImage}
  <div
    class="image"
    style={`background: url(${longImage});background-size: cover; background-position: center;`}
  />
{/if}
<div class="article" style={`margin-left: ${longImage ? "750px" : "350px"}`}>
  <div class="words">
    {#if image && longImage}
      <div
        class="image_top_mobile"
        style={` background: linear-gradient(180deg, rgba(0, 0, 0, 0) 2.6%, #000000 96.94%), url(${image});background-size: cover; background-position: center;`}
      />
    {/if}

    {#if !longImage && image}
      <div
        class="image_top"
        style={`background: linear-gradient(180deg, rgba(0, 0, 0, 0) 2.6%, #000000 96.94%), url(${image});background-size: cover; background-position: center;`}
      />
    {/if}
    <h1 style={`margin-top: 50px`}>{title}</h1>
    {#if updatedBy}
      <p class="subtitle">Last Update by {updatedBy} @ {updatedAt}</p>
    {/if}
    {@html text}

    <slot />
    <p class="error">{$errorMsg}</p>
  </div>
</div>

<style lang="scss">
  .image {
    position: absolute;
    z-index: 20;
    top: 0;
    left: 400px;
    width: 300px;
    height: 100%;
    min-height: 100vh;
    filter: saturate(0);
  }

  :global(.error) {
    color: red;
    font-size: 16px;
    margin-top: 20px;
  }

  .image_top {
    width: 100%;
    height: 500px;
    filter: saturate(0);
  }

  .image_top_mobile {
    display: none;
    width: 100%;
    height: 500px;
    filter: saturate(0);
  }

  .article {
    display: flex;
    flex-direction: column;
    margin-left: 750px;
    z-index: 1000;
    position: relative;
    width: 100%;
    height: 92vh !important;
  }
  .words {
    position: absolute;
    width: 100%;
    max-height: 100vh;
    max-height: -webkit-fill-available;
    overflow-y: auto;
    padding-bottom: 60px;
  }

  .words::-webkit-scrollbar {
    display: none;
  }

  .subtitle {
    margin-top: -5px;
    font-size: 14px;
    font-weight: lighter;
    opacity: 0.7;
  }

  @media screen and (max-width: 1350px) {
    .image {
      display: none;
    }

    .article {
      margin-left: 300px !important;
    }

    .image_top_mobile {
      display: block;
    }

    h1 {
      margin-top: 40px;
    }
  }

  @media screen and (max-width: 1024px) {
    .article {
      margin-left: 0 !important;
    }
  }
</style>
