<script lang="ts">
  import { env } from "$env/dynamic/public";
  import { cid, user } from "../../stores";
  export let data: any = {};
</script>

<div class="container" class:right={$cid === data.enactor._id}>
  <img
    class="avatar"
    class:right={$cid === data.enactor._id}
    src={data.enactor.avatar
      ? env.PUBLIC_BASE_URL + "uploads/" + data.enactor.avatar
      : "/default_avatar.png"}
    alt="avatar"
  />
  <p>{@html data.html}</p>
</div>

<style lang="scss">
  .container {
    position: relative;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 20px;
    align-items: center;
    margin: 15px 0;
  }

  .avatar {
    height: 60px;
    width: 60px;
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

  @media screen and (max-width: 1024px) {
    .container.right {
      margin-right: 40px;
      margin-left: 10%;
    }

    .avatar.right {
      right: -30px;
      left: inherit;
    }
    .avatar {
      height: 48px;
      width: 48px;
      position: absolute;
      left: -30px;
      bottom: -30px;
    }

    .container {
      background-color: #1e1e1e;
      margin: 0;
      max-width: 100%;
      border-radius: 5px;
      margin-left: 60px;
      margin-right: 10%;
      margin-bottom: 40px;
      margin-top: 40px;
      padding: 20px;
    }

    p {
      max-width: 100%;
    }
  }
</style>
