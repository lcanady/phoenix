<script lang="ts">
  import Button from "./Button.svelte";
  import { username, password, token, user, loginError } from "../stores";
  import axios from "axios";
  import { env } from "$env/dynamic/public";

  const handleLogin = async () => {
    try {
      $loginError = "";
      const res = await axios.post(`${env.PUBLIC_BASE_URL}auth/`, {
        username: $username,
        password: $password,
      });
      $username = "";
      $password = "";
      const data = await res.data;
      token.set(data.token);
      localStorage.setItem("token", data.token);
      $user = data.user;
    } catch (error: any) {
      console.log(error);
      $loginError = "Invalid username or password";
    }
  };
</script>

{#if !$token}
  <h3>Login or Register</h3>
  <div class="inputs">
    <input placeholder="Username" bind:value={$username} />
    <input
      placeholder="Password"
      type="password"
      bind:value={$password}
      on:keypress={(e) => {
        if (e.key === "Enter") {
          handleLogin();
        }
      }}
    />
  </div>
  <div class="buttons">
    <Button label="LOGIN" alt fullwidth onClick={handleLogin} />
    <Button label="REGISTER" fullwidth />
  </div>
  <p class="error">{$loginError}</p>
{/if}

<style lang="scss">
  h3 {
    font-size: 20px;
    font-weight: normal;
    font-family: "Punktype", monospace;
    letter-spacing: 5px;
    margin-top: 50px;
    margin-bottom: 10px;
  }
  .inputs {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .buttons {
    margin-top: 20px;
    display: flex;
    gap: 20px;
  }

  input {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    height: 40px;
    letter-spacing: 5px;
    font-size: 16px;
    padding: 0 10px;
    margin-bottom: 5px;
    border-bottom: white 1px solid;
    outline: none;
  }

  .error {
    margin-top: 20px;
    color: red;
  }

  @media screen and (max-width: 1050px) {
    .buttons {
      flex-direction: column;
      gap: 20px;
    }
  }
</style>
