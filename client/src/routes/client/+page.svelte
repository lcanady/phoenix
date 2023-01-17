<script lang="ts">
  import { env } from "$env/dynamic/public";
  import { io } from "socket.io-client";
  import Look from "../../components/client/Look.svelte";
  import { afterUpdate, onMount } from "svelte";
  import { cid, menuItems, messages, socket, token } from "../../stores";
  import Welcome from "../../components/client/Welcome.svelte";
  import Default from "../../components/client/Default.svelte";
  import Pose from "../../components/client/Pose.svelte";

  $: input = "";
  let output: HTMLDivElement;
  let scroll: HTMLDivElement;

  afterUpdate(() => {
    console.log(output.scrollHeight - output.offsetHeight, output.scrollTop);
    if (
      output &&
      output?.scrollTop - (output?.scrollHeight - output?.offsetHeight) > -100
    ) {
      output.scrollTop = output.scrollHeight;
    }
  });

  const whichComponent = (cmd: any) => {
    switch (cmd?.toLowerCase()) {
      case "welcome":
        return Welcome;
      case "look":
        return Look;
      case "say":
        return Pose;
      case "pose":
        return Pose;
      default:
        return Default;
    }
  };

  onMount(() => {
    if (!$socket) {
      $socket = io(env.PUBLIC_BASE_URL, {
        auth: {
          token: $token,
        },
        transports: ["websocket"],
        query: {
          cid: $cid,
        },
      });

      $menuItems = [
        {
          name: "Commands",
          title: true,
        },
      ];

      $socket.on("chat message", (msg: any) => {
        if (msg.data.cid) localStorage.setItem("cid", msg.data.cid);
        if (msg.data.token) localStorage.setItem("token", msg.data.token);
        $messages = [...$messages, msg];
      });
    }
  });
</script>

<div class="wrapper">
  <div class="container">
    <div class="output" id="scroller" bind:this={output}>
      {#each $messages as message}
        <div>
          <svelte:component
            this={whichComponent(message.data?.cmd)}
            data={message.data}
          />
        </div>
      {/each}
      <div id="scroll" bind:this={scroll} />
    </div>
    <div
      placeholder="Type Something..."
      class="input"
      contenteditable="true"
      on:paste={(e) => {
        e.preventDefault();
        const text = e.clipboardData?.getData("text/plain");
        document.execCommand("insertText", false, text);
      }}
      on:keydown={(e) => {
        if (e.key == "Enter" && input.trim() != "") {
          e.preventDefault();
          $socket.emit("chat message", { msg: input.trim(), data: {} });
          input = "";
          e.currentTarget.innerText = "";
          e.currentTarget.innerHTML = "";
        }
      }}
      on:input={(e) => {
        input = e.currentTarget.innerText;
      }}
    />
  </div>
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    height: 90vh;
    max-height: webkit-fill-available;
    width: 100vw;
  }
  .container {
    margin-top: auto;
    margin-left: 350px;
    margin-right: 10px;
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    max-height: webkit-fill-available;
  }

  :global(#scroller *) {
    overflow-anchor: none;
  }

  #scroller::-webkit-scrollbar {
    display: none;
  }

  #scroll {
    overflow-anchor: auto !important;
    height: 1px;
  }

  .input {
    border-top: 1px solid white;
    margin-top: 20px;
    padding: 20px;
    font-size: 16px;
    min-height: 100px;
    color: white;
    outline: none;
    background-color: rgba(255, 255, 255, 0.01);
    word-wrap: break-word;
    word-break: normal;
  }

  .input:empty:before {
    content: attr(placeholder);
    opacity: 0.4;
    color: white;
  }

  .output {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: auto;
    overflow-y: auto;
  }

  @media screen and (max-width: 1024px) {
    .container {
      margin-left: 0;
    }
  }
</style>
