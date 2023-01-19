<script lang="ts">
  import { env } from "$env/dynamic/public";
  import { io } from "socket.io-client";
  import Look from "../../components/client/Look.svelte";
  import { afterUpdate, onMount } from "svelte";
  import {
    cid,
    history,
    menuItems,
    messages,
    socket,
    token,
    user,
  } from "../../stores";
  import Welcome from "../../components/client/Welcome.svelte";
  import Default from "../../components/client/Default.svelte";
  import Pose from "../../components/client/Pose.svelte";

  $: input = "";
  let output: HTMLDivElement;
  let scroll: HTMLDivElement;

  afterUpdate(() => {
    if (
      output &&
      output?.scrollTop - (output?.scrollHeight - output?.offsetHeight) >= -500
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

  $menuItems = [
    {
      name: "Commands",
      title: true,
    },
    {
      name: "Reconnect",
      path: "#",
      onClick: () => {
        $socket?.disconnect();
        $socket?.connect();
      },
    },
    // mail
    //jobs
    //sheet
    //help

    {
      name: "mail",
      path: "#",
      onClick: () => {
        $socket.emit("chat message", { msg: "@mail", data: {} });
      },
    },
    {
      name: "jobs",
      path: "#",
      onClick: () => {
        $socket?.emit("chat message", {
          mag: "jobs",
          data: {
            cmd: "jobs",
          },
        });
      },
    },
    {
      name: "sheet",
      path: "#",
      onClick: () => {
        $socket?.emit("chat message", {
          mag: "sheet",
          data: {
            cmd: "sheet",
          },
        });
      },
    },
    {
      name: "help",
      path: "#",
      onClick: () => {
        $socket?.emit("chat message", {
          mag: "help",
          data: {
            cmd: "help",
          },
        });
      },
    },
  ];

  onMount(() => {
    $messages = JSON.parse(localStorage.getItem("messages") || "[]");

    setTimeout(() => {
      if (output.scrollTop == 0) {
        output.scrollTop = output.scrollHeight;
      }
    }, 200);

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

      $socket.on("chat message", (msg: any) => {
        if (msg.data.cid) {
          $cid = msg.data.cid;
          localStorage.setItem("cid", msg.data.cid);
        }

        if (msg.data.token) {
          $token = msg.data.token;
          localStorage.setItem("token", msg.data.token);
        }

        if (msg.data.user) $user = msg.data.user;

        $messages = [...$messages, msg];
        localStorage.setItem("messages", JSON.stringify($messages));
      });

      $socket.on("disconnect", (reason) => {
        if (
          reason === "io server disconnect" ||
          reason === "io client disconnect"
        ) {
          localStorage.removeItem("cid");
          localStorage.removeItem("token");
          localStorage.removeItem("messages");
          $messages = [];
          $cid = "";
          $token = "";
          $user = "";
        }
      });
    }
  });
</script>

<div class="wrapper">
  <div class="container">
    <div
      class="output"
      id="scroller"
      bind:this={output}
      on:change={(e) => console.log("Changed!")}
    >
      {#each $messages as message}
        <div>
          <svelte:component
            this={whichComponent(message.data?.cmd)}
            data={message.data || {}}
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
          $history = [...$history, input.trim()];
          $socket.emit("chat message", { msg: input.trim(), data: {} });
          input = "";
          e.currentTarget.innerText = "";
          e.currentTarget.innerHTML = "";
        }

        if (e.key == "ArrowUp") {
          e.preventDefault();
          if ($history.length > 0) {
            input = $history[$history.length - 1];
            e.currentTarget.innerText = input;
          }
        }

        if (e.key == "ArrowDown") {
          e.preventDefault();
          if ($history.length > 0) {
            input = $history[0];
            e.currentTarget.innerText = input;
          }
        }
      }}
      on:input={(e) => {
        input = e.currentTarget.innerText
          .replace(/[\u2014]/g, "--") // emdash
          .replace(/[\u2022]/g, "*") // bullet
          .replace(/[\u2018\u2019]/g, "'") // smart single quotes
          .replace(/[\u201C\u201D]/g, '"'); // smart double quotes;
      }}
    />
  </div>
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    max-height: 100vh;
    max-height: -webkit-fill-available;
    width: 100vw;
  }
  .container {
    margin-top: auto;
    margin-left: 350px;
    margin-right: 10px;
    display: flex;
    flex-direction: column;
    max-height: 100vh;
    padding-bottom: 40px;
    max-height: -webkit-fill-available;
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
      margin-right: 0;
      padding-bottom: 0;
    }
  }
</style>
