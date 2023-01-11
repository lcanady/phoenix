<script>
  import SideMenu from "../components/SideMenu.svelte";
  import Nav from "../components/nav.svelte";
  import Toast from "../components/Toast.svelte";
</script>

<div class="wrapper">
  <Toast />
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
    width: 100%;
    z-index: 6000;
    color: white;
    font-family: "Roboto Mono", monospace;
  }

  @media screen and (max-width: 1050px) {
    .container {
      padding: 0 20px;
    }

    .content {
      left: 0;
    }
  }
</style>
