<script lang="ts">
  import SideMenu from "../components/SideMenu.svelte";
  import Nav from "../components/nav.svelte";
  import { onMount } from "svelte";
  import { cid, token } from "../stores";

  onMount(() => {
    const id = localStorage.getItem("cid");
    const tkn = localStorage.getItem("token");
    if (id) $cid = id;
    if (tkn) $token = tkn;
  });
</script>

<div class="wrapper">
  <div class="background" />
  <div class="container">
    <Nav />
    <SideMenu />
    <div class="content">
      <slot />
    </div>
  </div>
</div>

<style lang="scss">
  :global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(body) {
    background: black;
    min-height: 100vh;
    min-height: -webkit-fill-available;
  }

  :global(html) {
    height: webkit-fill-available;
    overflow: hidden;
  }

  :global(ul) {
    margin-left: 40px;
    list-style: disc;
  }

  :global(ol) {
    margin-left: 40px;
  }

  :global(blockquote) {
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-left: 2px solid white;
    padding: 10px 10px 10px 20px;
  }

  .wrapper {
    display: flex;
    position: relative;
    flex-direction: column;
    min-height: 100vh;
    width: 100vw;
    background: black;
    padding: 0;
    margin: 0;
    align-items: center;

    /* mobile viewport bug fix */
    min-height: -webkit-fill-available;
  }

  .container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-width: 1700px;
    width: 100%;
    position: relative;
    background: black;
    padding: 0 100px;
    margin: 0 80px;
  }

  .background {
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 2.6%, #000000 96.94%),
      url("/bg_image.png");
    width: 100vw;
    height: 400px;
    background-size: cover;
    background-position: bottom;
  }

  .content {
    display: flex;
    top: 0;
    left: 400px;
    height: 100vh;
    padding-top: 100px;
    width: 100%;
    z-index: 6000;
    color: white;
    font-family: "Roboto Mono", monospace;
  }

  :global(h1) {
    font-size: 32px;
    font-weight: normal;
    font-family: "Punktype", monospace;
    letter-spacing: 5px;
    margin-bottom: 10px;
  }

  :global(a) {
    color: white;
    text-decoration: none;
    border-bottom: 1px solid white;
    transition: all 0.2s ease-in-out;
  }

  :global(h2) {
    font-size: 24px;
    font-weight: normal;
    font-family: "Punktype", monospace;
    letter-spacing: 5px;
    margin: 20px 0 10px 0;
  }

  :global(p) {
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 20px;
  }

  @media screen and (max-width: 1050px) {
    .content {
      left: 0;
    }

    .container {
      padding: 0 20px;
      margin: 0 20px;
    }
  }
</style>
