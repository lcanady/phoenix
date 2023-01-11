<script>
  import { page } from "$app/stores";
  import { menuItems } from "../stores";
  import Button from "./Button.svelte";

  $menuItems = [];
</script>

<div class="menu">
  <ul>
    {#each $menuItems as item}
      {#if item.title}
        <li class:padding={item.padding}><h2>{item.name}</h2></li>
      {:else if item.onClick}
        <li class:padding={item.padding}>
          <Button label={item.name} alt={item.alt} onClick={item.onClick} />
        </li>
      {:else}
        <li class:padding={item.padding}>
          <a
            href={item.path || "#"}
            class:active={item.path === $page.url.pathname}>{item.name}</a
          >
        </li>
      {/if}
    {/each}
  </ul>
</div>

<style lang="scss">
  .menu {
    width: 300px;
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 250px;
    left: 0;
    z-index: 7000;
  }
  .active {
    color: white;
  }

  ul {
    list-style: none;
    color: white;

    li {
      font-family: "Roboto Mono", monospace;
      font-size: 16px;
      line-height: 24px;
      text-align: right;
      padding-bottom: 15px;
      h2 {
        font-family: "Punktype", monospace;
        font-weight: normal;
        font-size: 20px;
        letter-spacing: 5px;
        margin-top: 20px;
        margin-bottom: 10px;
      }

      a {
        color: rgba(255, 255, 255, 0.5);
        text-decoration: none;
        border: hidden;
        font-family: "Roboto Mono", monospace;
      }
    }
  }

  .padding {
    padding-top: 20px;
    padding-bottom: 20px;
  }

  @media screen and (max-width: 1460px) {
    .menu {
      margin-left: 50px;
      width: 250px;
    }
  }

  @media screen and (max-width: 1024px) {
    .menu {
      display: none;
    }
  }
</style>
