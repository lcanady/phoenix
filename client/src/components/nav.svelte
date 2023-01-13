<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { env } from "$env/dynamic/public";
  import axios from "axios";
  import { onMount } from "svelte";
  import { errorMsg, menuItems, menuToggle, token, user } from "../stores";
  import Button from "./Button.svelte";

  onMount(async () => {
    $errorMsg = "";
    const tkn = localStorage.getItem("token");
    if (tkn) {
      token.set(tkn);
      try {
        const res = await axios.get(`${env.PUBLIC_BASE_URL}auth/user`, {
          headers: {
            authorization: "Bearer " + tkn,
            contentType: "application/json",
          },
        });
        if (res && res.data) user.set(res.data.user);
      } catch (error: any) {
        $errorMsg = error.message;
      }
    }
  });

  let visible = false;
</script>

<nav>
  <div class="logo">
    <a href="/" class="title">BRIDGETOWN</a>
    <p class="subtitle">an Anita Blake MU*</p>
  </div>

  <div class="mobile_menu_content" class:hidden={!$menuToggle}>
    <div class="mobile_menu_context_inner">
      <div class="mobile_menu_background" />
      <div class="links_mobile">
        <h2>Links</h2>
        <a
          href="/wiki"
          on:click={(e) => {
            e.preventDefault();
            goto("/wiki");
            menuToggle.set(false);
          }}>WIKI</a
        >

        {#if $user}
          <a
            href="/profile"
            on:click={(e) => {
              e.preventDefault();
              console.log($user);
              goto("/profile/" + $user.id);
              menuToggle.set(false);
            }}>PROFILE</a
          >
          <Button label="LOG OUT" alt mobile onClick={() => goto("/")} />
        {:else}
          <Button label="LOGIN" alt mobile onClick={() => goto("/")} />
        {/if}

        <div class="mobile_menu_extra">
          <ul>
            {#each $menuItems as item}
              {#if item.title}
                <li
                  class:padding={item.padding}
                  style={"background: transparent;"}
                >
                  <h2>{item.name}</h2>
                </li>
              {:else if item.onClick}
                <li class:padding={item.padding}>
                  <Button
                    label={item.name}
                    alt={item.alt}
                    onClick={() => {
                      menuToggle.set(false);
                      if (item.onClick) item.onClick();
                    }}
                  />
                </li>
              {:else}
                <li class:padding={item.padding}>
                  <a
                    href={item.path || "#"}
                    class:active={$page.url.pathname === item.path}
                    on:click={(e) => {
                      e.preventDefault();
                      goto(item.path || "#");
                      menuToggle.set(false);
                    }}>{item.name}</a
                  >
                </li>
              {/if}
            {/each}
          </ul>
        </div>
      </div>
    </div>
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
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    height: 120px;
    align-items: center;
    justify-content: space-between;
    z-index: 70000;
    width: 100%;
    gap: 20px;
    padding: 0 100px;

    a {
      color: white;
      text-decoration: none;
      border-bottom: hidden;
      font-family: "Roboto Mono", monospace;
      font-size: 16px;
      margin-left: 20px;
      cursor: pointer;
      letter-spacing: 5px;
    }
  }

  .active {
    border-bottom: 1px solid white !important;
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
      border-bottom: hidden;
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
    display: flex;
    height: 60px;
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
      background: black;
      border: none;
      cursor: pointer;
    }
  }

  .mobile_menu_content {
    top: 0;
    left: 0;
    z-index: -1;
    position: absolute;
    background-color: #000;
    width: 100%;
    height: 100vh;
    overflow-y: auto;
  }

  .mobile_menu_context_inner {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 100vh;
    width: 100%;
  }

  .mobile_menu_background {
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 2.6%, #000000 96.94%),
      url("/bg_image.png");
    width: 100vw;
    height: 400px;
    background-size: cover;
    background-position: bottom;
  }

  .links_mobile {
    display: flex;
    flex-direction: column;
    margin-top: 200px;
    gap: 20px;
    width: 100%;
    height: 100vh;
    padding: 20px;
    box-sizing: border-box;
    text-align: right;
    overflow: none;

    a {
      letter-spacing: normal;
      font-size: 20px;
      font-weight: lighter;
      border-bottom: hidden;
    }

    li {
      padding: 10px 0;
    }

    li:nth-child(even) {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
  h2 {
    font-size: 24px;
    color: white;
    font-family: "Punktype", monospace;
    letter-spacing: 5px;
    margin: 0;
    margin-top: 20px;
    border-bottom: 1px solid white;
  }

  img {
    width: 30px;
    height: 30px;
    cursor: pointer;
  }

  @media screen and (max-width: 1024px) {
    .links {
      display: none;
    }

    nav {
      padding: 0 20px;
    }

    .logo {
      background: black;
    }

    .mobile_menu {
      display: block;
    }
  }

  @media screen and (min-width: 1025px) {
    .mobile_menu_content {
      display: none;
    }
  }
</style>
