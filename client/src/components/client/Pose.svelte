<script lang="ts">
  import { env } from "$env/dynamic/public";

  export let data: any = {};
</script>

<div class="container">
  <img
    class="avatar"
    src={data.enactor.avatar
      ? env.PUBLIC_BASE_URL + "uploads/" + data.enactor.avatar
      : "/default_avatar.png"}
    alt="avatar"
  />
  <p>{@html data.html}</p>
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 20px;
    align-items: center;
    margin: 10px 0;
  }

  .avatar {
    height: 80px;
    width: 80px;
    border-radius: 50%;
    object-fit: cover;
    object-position: center center;
    filter: saturate(0);
    border: 1px solid #fff;
    margin-right: 20px;
  }

  p {
    margin: 0;
    flex-shrink: 1;
    font-size: 16px;
    max-width: 85%;
    font-family: "Roboto Mono", sans-serif;
  }

  @media screen and (max-width: 1360px) {
    p {
      max-width: 75%;
    }
  }

  @media screen and (max-width: 530px) {
    p {
      max-width: 55%;
    }
  }
</style>
