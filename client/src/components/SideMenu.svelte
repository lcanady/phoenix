<script>
  import { menuItems } from "../stores";
  import Button from "./Button.svelte";

  $menuItems = [
    { name: "Featured Articles", title: true },
    { name: "Link", path: "#" },
    { name: "Link Two", path: "#" },
    { name: "Link Three", path: "#" },
    {
      name: "Link Four",
      onClick: () => {
        console.log("Clicked");
      },
      alt: true,
    },
    { name: "Staff", title: true },
    { name: "Link Four", path: "#" },
  ];
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
          <a href={item.path || "#"}>{item.name}</a>
        </li>
      {/if}
    {/each}
  </ul>
</div>

<style lang="scss">
  .menu {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 250px;
    left: 20px;
    z-index: 7000;
  }

  ul {
    list-style: none;
    color: white;

    li {
      font-family: "Roboto Mono", monospace;
      font-size: 16px;
      text-align: right;
      line-height: 32px;

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
      margin-left: 20px;
      width: 250px;
    }
  }

  @media screen and (max-width: 1024px) {
    .menu {
      display: none;
    }
  }
</style>
