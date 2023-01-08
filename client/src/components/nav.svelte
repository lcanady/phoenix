<script>
  import { goto } from "$app/navigation";
  import axios from "axios";
  import { onMount } from "svelte";
  import { menuItems, menuToggle, token, user } from "../stores";
  import Button from "./Button.svelte";

  onMount(() => {
    const tkn = localStorage.getItem("token");
    if (tkn) {
      token.set(tkn);
    }
  });

  $: if ($token) {
    axios
      .get("http://localhost:4202/auth/user", {
        headers: {
          Authorization: "Bearer " + $token,
        },
      })
      .then((res) => user.set(res.data.user));
  }

  let visible = false;
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

    {#if $token}
      <img
        src="/avatar.png"
        alt="user"
        on:click={(e) => {
          e.preventDefault();
          visible = !visible;
        }}
        on:keypress={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            visible = !visible;
          }
        }}
      />

      <div class="context" class:hidden={!visible}>
        <p class="user">{`${$user?.username}(${$user?.dbref})`}</p>
        <ul class="context_menu">
          <li>
            <a
              href="/"
              on:click={(e) => {
                e.preventDefault();
                localStorage.removeItem("token");
                token.set("");
                user.set(null);

                window.location.reload();
              }}>Logout</a
            >
          </li>
        </ul>
      </div>
    {:else}
      <Button label="LOGIN" alt onClick={() => goto("/")} />
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

  .hidden {
    display: none;
  }

  .context {
    background: #000;
    padding: 5px;
    position: absolute;
    right: 90px;
    top: 60px;
    text-align: right;
    font-family: "Roboto Mono", monospace;
    font-size: 14px;
    color: white;
    a {
      font-size: 12px;
      letter-spacing: 0;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
    }
  }

  .user {
    font-family: "Punktype", monospace;
    letter-spacing: 5px;
    margin-bottom: 0;
  }

  .logo {
    margin-top: 30px;
    display: flex;
    align-items: flex-start;
    flex-direction: column;
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

  @media screen and (max-width: 1024px) {
    .links {
      display: none;
    }

    .mobile_menu {
      display: block;
    }
  }
</style>
