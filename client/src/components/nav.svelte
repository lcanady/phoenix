<script>
  import { onMount } from "svelte";
  import { menuToggle, token } from "../stores";
  import Button from "./Button.svelte";

  onMount(() => {
    const tkn = localStorage.getItem("token");
    if (tkn) {
      token.set(tkn);
    }
  });
</script>

<nav>
  <div class="logo">
    <a href="/" class="title">BRIDGETOWN</a>
    <p class="subtitle">an Anita Blake MU*</p>
  </div>

  <div class="mobile_menu">
    <button on:click={() => menuToggle.set(!$menuToggle)}>
      <img
        src={`${$menuToggle ? "/close.png" : "/hamburger.png"}`}
        alt="menu"
      />
    </button>
  </div>

  <div class="links">
    <a href="/wiki">WIKI</a>
    <a href="/">PLAY</a>

    {#if $token}
      <img src="/avatar.png" alt="user" />
    {:else}
      <Button label="LOGIN" alt />
    {/if}
  </div>
</nav>

<style lang="scss">
  nav {
    display: flex;
    height: 80px;
    align-items: center;
    justify-content: space-between;
    z-index: 70000;
    width: 100%;
    gap: 20px;

    a {
      color: white;
      text-decoration: none;
      font-family: "Roboto Mono", monospace;
      font-size: 16px;
      margin-left: 20px;
      cursor: pointer;
      letter-spacing: 5px;
    }
  }

  .logo {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .title {
    font-size: 24px;
    color: white;
    font-family: "Punktype", monospace;
    letter-spacing: 5px;
    margin: 0;
  }

  .subtitle {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    font-family: "Roboto Mono", monospace;
    font-size: 14px;
  }

  .links {
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: flex-end;
    gap: 20px;
  }

  .mobile_menu {
    display: none;

    button {
      background: none;
      border: none;
      cursor: pointer;
    }
  }

  @media screen and (max-width: 900px) {
    .links {
      display: none;
    }

    .mobile_menu {
      display: block;
    }
  }
</style>
