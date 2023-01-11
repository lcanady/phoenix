<script>
  import { page } from "$app/stores";
  import axios from "axios";
  import { menuItems, user } from "../stores";
  import { onMount } from "svelte";
  import Login from "../components/Login.svelte";
  import { env } from "$env/dynamic/public";

  onMount(() =>
    axios
      .get(`${env.PUBLIC_BASE_URL}auth/user`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
      .then((res) => user.set(res.data.user))
  );

  $menuItems = [];
</script>

<div class="wrapper">
  <div class="container">
    <h1>{$page.status}</h1>
    <div class="text">
      <p>{$page.error?.message}</p>
      {#if $user?.isAdmin && $page.status === 404}
        <p>
          Maybe you need to <a href="/wiki/new">create</a> it?
        </p>
      {/if}
    </div>
  </div>
  {#if !$user}
    <div class="login">
      <Login />
    </div>
  {/if}
</div>

<style lang="scss">
  .wrapper {
    top: 0;
    left: 0;
    position: fixed;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
  }

  a {
    color: white;
  }

  .container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  h1 {
    font-family: "Roboto Mono", monospace;
    font-size: 10rem;
    font-weight: lighter;
    border-right: 1px solid white;
    padding-right: 10px;
  }

  p {
    font-family: "Roboto Mono", monospace;
    font-size: 1rem;
    padding-left: 20px;
  }

  @media screen and (max-width: 1024px) {
    .wrapper {
      flex-direction: column;
    }

    .container {
      flex-direction: column;
    }

    h1 {
      font-size: 5rem;
      border-right: none;

      padding-bottom: 10px;
      padding-right: 0;
    }

    p {
      padding-left: 0;
      text-align: center;
    }
  }
</style>
