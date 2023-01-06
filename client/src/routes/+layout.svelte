<script>
  import SideMenu from "../components/SideMenu.svelte";
  import Nav from "../components/nav.svelte";
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
  }

  .wrapper {
    display: flex;
    position: relative;
    flex-direction: column;
    height: 100%;
    width: 100vw;
    background: black;
    padding: 0;
    margin: 0;
    align-items: center;
  }

  .container {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: 1460px;
    width: 100%;
    position: relative;
    background: black;
    padding: 0 100px;
    margin: 0;
  }

  .background {
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    background: url("/bg_image.png");
    width: 100vw;
    height: 400px;
    background-size: cover;
    background-position: bottom;
  }

  .content {
    display: flex;
    top: 0;
    left: 400px;
    height: 100%;
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
