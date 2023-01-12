<script lang="ts">
  import {
    errorMsg,
    menuItems,
    preview,
    token,
    user,
    type IArticle,
  } from "../stores";
  import Button from "./Button.svelte";
  import { goto } from "$app/navigation";
  import Article from "./Article.svelte";
  import axios from "axios";
  import { onMount } from "svelte";
  import { env } from "$env/dynamic/public";
  import slug from "slug";
  import { nanoid } from "nanoid";

  export let article: IArticle;
  export let onSave: (article: IArticle) => void = (article) => {};
  export let onCancel: (article: IArticle) => void = (article) => {};
  export let onDelete: (article: IArticle) => void = (article) => {};

  $: if ($preview) {
    $menuItems = [
      {
        name: "View Your Article",
        title: true,
      },
      {
        name: "Preview",
        onClick: () => {
          preview.set(!$preview);
        },
        padding: true,
        alt: true,
      },

      {
        name: "edit",
        onClick: () => {
          preview.set(!$preview);
        },
        alt: false,
      },
    ];
  } else {
    $menuItems = [
      {
        name: "View Your Article",
        title: true,
      },
      {
        name: "Preview",
        onClick: () => {
          preview.set(!$preview);
        },
        padding: true,
        alt: false,
      },

      {
        name: "edit",
        onClick: () => {
          preview.set(!$preview);
        },
        alt: true,
      },
    ];
  }

  let title: string = article?.title;
  let category: string = article?.category;
  let lock: string = article?.lock || "";
  let body: string = article?.body;
  let theSlug: string = article?.slug || "";
  let landing: boolean = article?.landing || false;
  let featured: boolean = article?.featured || false,
    defaultArticle: boolean = article?.default || false;
  let uploader: HTMLInputElement;
  let longUploader: HTMLInputElement;
  let files: FileList | null;
  let longFiles: FileList | null;
  let short = article?.shortImg;
  let long = article?.longImg;

  onMount(async () => {
    if ($token) {
      try {
        const res = await axios.get(`${env.PUBLIC_BASE_URL}auth/user`, {
          headers: {
            Authorization: "Bearer " + $token,
            contentType: "application/json",
          },
        });

        if (res.data) $user = res.data.user;
        if (!res.data.user?.isAdmin) {
          goto("/wiki");
        }
      } catch (error: any) {
        $errorMsg = error.message;
      }
    }
  });

  // Handle file upload on file select (from the pop up)
  $: filledArticle = {
    title,
    category,
    lock,
    body,
    landing,
    featured,
    default: defaultArticle,
    shortImg: short,
    longImg: long,
    files,
    longFiles,
    slug: theSlug || slug(title, { lower: true }) + "-" + nanoid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    updatedBy: $user?.id,
    createdBy: $user?.id,
    shortFile: files,
    longFile: longFiles,
  } as IArticle;
</script>

{#if $preview}
  <Article
    longImage={longFiles?.length
      ? URL.createObjectURL(longFiles[0])
      : long
      ? env.PUBLIC_BASE_URL + "uploads/" + long
      : ""}
    {title}
    {body}
    image={files?.length
      ? URL.createObjectURL(files[0])
      : short
      ? env.PUBLIC_BASE_URL + "uploads/" + short
      : ""}
    updatedAt={new Date().toLocaleString()}
    updatedBy={$user.username}
  />
{:else}
  <div class="wrapper">
    <div class="left">
      {#if longFiles?.length || long}
        <div
          class="long-image"
          style={`background: url(${
            longFiles
              ? URL.createObjectURL(longFiles[0])
              : `${env.PUBLIC_BASE_URL}uploads/` + long
          }); background-repeat: no-repeat; background-position: center; background-size: cover; filter: saturate(0);`}
          on:click={() => longUploader.click()}
          on:keydown={(e) => {
            if (e.key === "Enter") {
              uploader.click();
            }
          }}
        >
          <button
            on:click={(e) => {
              longUploader.value = "";
              longFiles = null;
              long = "";
              e.stopPropagation();
            }}>Clear</button
          >
        </div>
      {:else}
        <div
          class="long-image"
          on:click={() => longUploader.click()}
          on:keydown={(e) => {
            if (e.key === "Enter") {
              uploader.click();
            }
          }}
        />
      {/if}
    </div>
    <div class="right">
      <input
        type="file"
        accept=".png, .jpg, .jpeg"
        bind:this={longUploader}
        bind:files={longFiles}
        style="display:none;"
      />

      <input
        type="file"
        accept=".png, .jpg, .jpeg"
        bind:this={uploader}
        bind:files
        style="display:none;"
      />

      {#if files?.length || short}
        <div
          class="feature"
          style={`background: url(${
            files?.length
              ? URL.createObjectURL(files[0])
              : `${env.PUBLIC_BASE_URL}uploads/` + short
          }); background-repeat: no-repeat; background-position: center; background-size: cover; filter: saturate(0);`}
          on:click={() => uploader.click()}
          on:keydown={(e) => {
            if (e.key === "Enter") {
              uploader.click();
            }
          }}
        >
          <button
            on:click={(e) => {
              uploader.value = "";
              files = null;
              short = "";
              e.stopPropagation();
            }}>Clear</button
          >
        </div>
      {:else}
        <div
          class="feature"
          on:click={() => uploader.click()}
          on:keydown={(e) => {
            if (e.key === "Enter") {
              uploader.click();
            }
          }}
        />
      {/if}

      <div class="inputs_stacked">
        <input placeholder="Article Title" bind:value={title} />
        <div class="inputs">
          <input placeholder="Category" bind:value={category} />
          <input placeholder="lock" bind:value={lock} />
        </div>
      </div>
      <div class="checkboxes">
        <div class="checkbox">
          <label for="featured">Featured</label><input
            name="featured"
            type="checkbox"
            bind:checked={featured}
          />
        </div>
        <div class="checkbox">
          <label for="default">Default</label><input
            name="default"
            type="checkbox"
            bind:checked={defaultArticle}
          />
        </div>
        <div class="checkbox">
          <label for="landing">Landing Page</label><input
            name="landing"
            type="checkbox"
            bind:checked={landing}
          />
        </div>
      </div>
      <textarea class="content" bind:value={body} placeholder="Article Body" />
      <div class="inputs">
        <Button label="Save" fullwidth onClick={() => onSave(filledArticle)} />
        <Button
          alt
          fullwidth
          label="Cancel"
          onClick={() => onCancel(filledArticle)}
        />
      </div>
      <div class="inputs">
        <button class="delete" on:click={() => onDelete(filledArticle)}
          >Delete</button
        >
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .wrapper {
    margin-left: 300px;
    max-height: 85vh;
    width: 100%;
    display: flex;
    gap: 20px;
    overflow-y: auto;
  }

  .wrapper::-webkit-scrollbar {
    display: none;
  }

  .right {
    display: flex;
    margin-left: 100px;
    gap: 20px;
    flex-direction: column;
    width: 100%;
  }

  .feature {
    margin-bottom: 20px;
    height: 500px;
    flex-shrink: 0;
    width: 100%;
    background: url("/Image.png"), #101010;
    border: 1px solid white;
    background-repeat: no-repeat;
    background-position: center;
  }

  .long-image {
    margin-bottom: 20px;
    height: 85vh;
    width: 300px;
    background: url("/Image.png"), #101010;
    border: 1px solid white;
    background-repeat: no-repeat;
    background-position: center;
  }

  .checkboxes {
    display: flex;
    gap: 20px;
  }

  .inputs {
    display: flex;
    gap: 20px;

    input {
      flex-grow: 1;
    }
  }

  .inputs_stacked {
    display: flex;
    flex-direction: column;
    gap: 20px;

    input {
      flex-grow: 1;
    }
  }

  input {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    height: 40px;
    font-family: "Roboto Mono", monospace;
    font-size: 16px;
    padding: 0 10px;
    margin-bottom: 5px;
    height: 48px;
    border-bottom: white 1px solid;
    outline: none;
  }

  label {
    margin-bottom: 5px;
    color: white;
    font-size: 16px;
  }

  .checkbox {
    display: flex;
    align-items: center;
    height: 32px;
    gap: 20px;
  }

  .content {
    background: #101010;
    height: 260px;
    font-family: "Roboto Mono", monospace;
    font-size: 16px;
    color: white;
    width: 100%;
    padding: 20px;
    border: 1px solid white;
    overflow-y: auto;
    outline: none;
    flex-shrink: 0;
  }

  .delete {
    background: #5f0000;
    color: white;
    border: none;
    height: 48px;
    font-family: "PunkType", monospace;
    font-size: 16px;
    padding-bottom: 10px;
    height: 48px;
    letter-spacing: 5px;

    outline: none;
    width: 100%;
    cursor: pointer;
  }

  @media screen and (max-width: 1290px) {
    .wrapper {
      width: 100%;
    }
  }

  @media screen and (max-width: 1024px) {
    .wrapper {
      margin-left: 0;
    }
    .inputs {
      flex-direction: column;
    }
  }

  @media screen and (max-width: 1350px) {
    .left {
      display: none;
    }
  }

  @media screen and (max-width: 1050px) {
    .inputs {
      flex-direction: column;
    }
  }

  @media screen and (max-width: 1024px) {
    .right {
      margin-left: 0;
      margin-bottom: 20px;
    }

    .feature {
      margin-top: 0;
      margin-bottom: 0;
      height: 500px;
    }
  }
</style>
