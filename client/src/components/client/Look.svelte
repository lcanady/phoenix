<script lang="ts">
  import { env } from "$env/dynamic/public";
  import { socket } from "../../stores";

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
          <td class="name" style="width: 30%">{item.name}</td>
          <td class="idle" style="width: 10%"
            >{@html item.idle.replace("color:#000", "color:grey")}</td
          >
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

  {#if data.exits.length > 0}
    <h2>Exits</h2>
    <table style="table-layout:fixed;">
      <tr class="exits">
        {#each data.exits as item}
          <td
            class="exit_name"
            style="width: 30%"
            on:click={() => {
              console.log(item.dest);
              $socket.emit("chat message", { msg: item.dest, data: {} });
            }}
            on:keydown={(e) => {
              if (e.key === "Enter") {
                $socket.emit("chat message", { msg: item.dest, data: {} });
              }
            }}>{@html item.name}</td
          >
        {/each}
      </tr>
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
      word-break: break-word;
    }
  }

  tr.exits {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    td {
      width: calc(100% / 3);
      margin-bottom: 10px;
    }

    td {
      cursor: pointer;
      text-decoration: underline;
    }
  }

  h1 {
    margin-top: 20px;
    margin-bottom: 0;
  }

  .name {
    color: #fff;
    cursor: pointer;
    &:hover {
      color: #fff;
      text-decoration: underline;
    }
  }

  .idle {
    color: #fff;
  }

  h2 {
    margin-top: 20px;
    margin-bottom: 0;
  }

  .desc {
    color: white;
    white-space: pre-wrap;
    line-height: 1.5;
    margin: 0;
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .desc2 {
    color: white;
    white-space: pre-wrap;
    line-height: 1.5;
    margin: 0;
    margin-top: 10px;
    margin-bottom: 10px;
    padding: 0 20px;
    font-size: 1.2rem;
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

  @media screen and (max-width: 1024px) {
    .avatar {
      height: 300px;
    }

    h2 {
      margin-left: 20px;
    }

    .name {
      padding: 5px 20px;
    }

    h1 {
      padding: 0 20px;
    }

    .avatar_container {
      margin-top: -100px;
      flex-direction: column;
      text-align: center;
      padding: 0 20px;
      h1 {
        font-size: 2rem;
      }
    }

    tr.exits {
      display: flex;
      flex-direction: column;
      td {
        width: 100% !important;
        margin: 0 20px;
      }
    }

    h2 {
      margin-left: 20px;
    }

    .desc {
      padding: 0 20px;
    }

    p {
      font-size: 1rem;
      padding: 0 20px;
    }
  }
</style>
