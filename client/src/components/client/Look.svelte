<script lang="ts">
  import { env } from "$env/dynamic/public";

  export let data: any = {};
</script>

<div class="container">
  {#if data.header || data.avatar}
    <div
      class="avatar"
      style="background:  linear-gradient(180deg, rgba(0, 0, 0, 0) 2.6%, #000000 96.94%), url({env.PUBLIC_BASE_URL +
        'uploads/' +
        (data.header || data.avatar)});"
    />
  {/if}

  {#if data.flags.includes("player")}
    <div class="avatar_container">
      <img
        class="avatar2"
        src={data.avatar
          ? env.PUBLIC_BASE_URL + "uploads/" + data.avatar
          : "/default_avatar.png"}
        alt="avatar"
      />
      <div class="text">
        <h1>{data.target}</h1>
        <p class="sub">{data.shortdesc}</p>
      </div>
    </div>
  {:else}
    <h1>{data.target}</h1>
    <p class="sub">{data.shortdesc}</p>
  {/if}

  {#if data.flags.includes("player")}
    <p class="desc2">{@html data.desc}</p>
  {:else}
    <p class="desc">{@html data.desc}</p>
  {/if}
  {#if data.contents.length > 0}
    <h2>Characters</h2>
    <table style="table-layout:fixed;">
      {#each data.contents as item}
        <tr>
          <td style="width: 30%">{item.name}</td>
          <td class="hide" style="width: 10%">{@html item.idle}</td>
          <td
            class="hide"
            style="max-width: 40%; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;"
          >
            {item.shortdesc}</td
          >
        </tr>
      {/each}
    </table>
  {/if}
</div>

<style lang="scss">
  .avatar_container {
    display: flex;
    margin-bottom: 20px;
    align-items: center;
  }

  .container {
    border-bottom: rgba(255, 255, 255, 0.3) 1px solid;
    margin-bottom: 10px;
  }

  .avatar2 {
    height: 80px;
    width: 80px;
    border-radius: 50%;
    filter: saturate(0);
    border: 1px solid #fff;
    margin-right: 20px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;

    tr:nth-child(even) {
      background-color: rgba(255, 255, 255, 0.05);
    }

    td {
      padding: 5px;
      vertical-align: center;
      word-break: break-all;
    }
  }

  h1 {
    margin-top: 20px;
    margin-bottom: 0;
  }

  .sub {
    font-family: "Roboto Mono", sans-serif;
    font-size: 18px;
    font-weight: lighter;
    margin: 0;
    margin-top: -5px;
    margin-bottom: 10px;
  }

  .avatar {
    margin-top: 20px;
    height: 500px;
    width: 100%;
    background-repeat: no-repeat !important;
    background-origin: border-box Im !important;
    background-position: center center !important;
    background-size: cover !important;
    filter: saturate(0);
  }

  p {
    color: white;
    white-space: pre-wrap;
    line-height: 1.5;
  }

  @media screen and (max-width: 1360px) {
    .hide {
      display: none;
    }
  }
</style>
