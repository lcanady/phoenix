<script lang="ts">
  import { env } from "$env/dynamic/public";
  import { io } from "socket.io-client";
  import Look from "../../components/client/Look.svelte";
  import { afterUpdate, onMount } from "svelte";
  import {
    cid,
    history,
    historyIndex,
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
  ];

  onMount(() => {
    $messages = JSON.parse(sessionStorage.getItem("messages") || "[]");

    if (
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission();
    }

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
        query: {
          cid: $cid,
        },
      });

      $socket.on("chat message", (msg: any) => {
        if (msg.data.cid) {
          $cid = msg.data.cid;
          sessionStorage.setItem("cid", msg.data.cid);
        }

        if (msg.data.token) {
          $token = msg.data.token;
          sessionStorage.setItem("token", msg.data.token);
        }

        if (msg.data.user) $user = msg.data.user;
        if (
          document.visibilityState !== "visible" &&
          Notification.permission == "granted"
        ) {
          msg.data ||= {};
          if (msg.data.html) {
            const temp = document.createElement("div");
            temp.innerHTML = msg.data?.html;
            let icon: string;
            try {
              icon =
                env.PUBLIC_BASE_URL + "uploads/" + msg.data?.enactor?.avatar;
            } catch {
              icon = "/default_avatar.png";
            }
            const noti = new Notification("New Message on Bridgetown!", {
              body: temp.innerText,
              icon,
            });

            noti.onclick = () => {
              window.focus();
              noti.close();
            };
          }
        }
        $messages = [...$messages, msg];
        sessionStorage.setItem("messages", JSON.stringify($messages));
      });

      $socket.on("disconnect", (reason) => {
        if (
          reason === "io server disconnect" ||
          reason === "io client disconnect"
        ) {
          sessionStorage.removeItem("cid");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("messages");
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
          e.currentTarget.innerText = "";
          e.currentTarget.innerHTML = "";
          $socket.emit("chat message", { msg: input.trim(), data: {} });

          // add to the histoy
          $history = [...$history, input.trim()];
          input = "";
        }

        // if ctrl + up or ctrl + down is pressed
        // then go through the history  if we reach the end of the history
        // then loop back through.
        if (e.key == "ArrowUp" && e.ctrlKey) {
          e.preventDefault();
          if ($history.length > 0) {
            if ($historyIndex == -1) {
              $historyIndex = $history.length - 1;
            } else if ($historyIndex > 0) {
              $historyIndex--;
            }
            e.currentTarget.innerText = $history[$historyIndex];
          }
        } else if (e.key == "ArrowDown" && e.ctrlKey) {
          e.preventDefault();
          if ($history.length > 0) {
            if ($historyIndex < $history.length - 1) {
              $historyIndex++;
            } else {
              $historyIndex = -1;
            }
            e.currentTarget.innerText = $history[$historyIndex] || "";
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
