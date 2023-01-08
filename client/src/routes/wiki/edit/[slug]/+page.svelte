<script lang="ts">
  import { menuItems, preview, user } from "../../../../stores";
  import Button from "../../../../components/Button.svelte";
  import { goto } from "$app/navigation";
  import Article from "../../../../components/Article.svelte";
  import axios from "axios";
  import slug from "slug";
  import type { PageData } from "./$types";
  import { onMount } from "svelte";

  export let data: PageData;

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

  let title: string = data.article.title;
  let category: string = data.article.category;
  let lock: string = data.article.lock;
  let body: string = data.article.body;
  let landing: boolean = data.article.landing;
  let featured: boolean = data.article.featured,
    defaultArticle: boolean = data.article.default;
  let uploader: HTMLInputElement;
  let longUploader: HTMLInputElement;
  let files: FileList | null;
  let longFiles: FileList | null;
  let short = data.article.shortImg;
  let long = data.article.longImg;

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("img", file);
    const res = await axios.post("http://localhost:4202/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return res.data.file;
  };

  const handleSave = async () => {
    let filenames: string[] = [];

    if (files) filenames[0] = await uploadFile(files[0]);
    if (longFiles) filenames[1] = await uploadFile(longFiles[0]);

    try {
      const res = await axios.post(
        "http://localhost:4202/wiki/" + data.article.slug,
        {
          title,
          slug: slug(title),
          category,
          lock,
          body,
          landing,
          featured,
          default: defaultArticle,
          shortImg: filenames[0] || short,
          longImg: filenames[1] || long,
        },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      goto(`/wiki/${data.article.slug}`);
    } catch (error) {
      console.log(error);
    }
  };

  onMount(() => {
    if (!$user?.isAdmin) {
      goto("/");
    }
  });
</script>

{#if $preview}
  <Article
    longImage={longFiles
      ? URL.createObjectURL(longFiles[0])
      : long
      ? "http://localhost:4202/uploads/" + long
      : ""}
    {title}
    {body}
    image={files
      ? URL.createObjectURL(files[0])
      : short
      ? "http://localhost:4202/uploads/" + short
      : ""}
  />
{:else}
  <div class="wrapper">
    <div class="left">
      {#if longFiles || long}
        <div
          class="long-image"
          style={`background: url(${
            longFiles
              ? URL.createObjectURL(longFiles[0])
              : `http://localhost:4202/uploads/` + long
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

      {#if files || short}
        <div
          class="feature"
          style={`background: url(${
            files
              ? URL.createObjectURL(files[0])
              : `http://localhost:4202/uploads/` + short
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

      <input placeholder="Article Title" bind:value={title} />
      <div class="inputs">
        <input placeholder="Category" bind:value={category} />
        <input placeholder="lock" bind:value={lock} />
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
        <Button label="Save" fullwidth onClick={() => handleSave()} />
        <Button
          alt
          fullwidth
          label="Cancel"
          onClick={() => {
            console.log("Cancel");
            goto("/wiki");
          }}
        />
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .wrapper {
    margin-left: 300px;
    width: 100%;
    display: flex;

    gap: 20px;
  }

  .checkboxes {
    display: flex;
    gap: 20px;
  }

  .right {
    display: flex;
    margin-left: 100px;
    gap: 20px;
    flex-direction: column;
    width: 100%;
  }

  .feature {
    margin-top: 100px;
    margin-bottom: 20px;
    height: 400px;
    width: 100%;
    background: url("/Image.png"), #101010;
    border: 1px solid white;
    background-repeat: no-repeat;
    background-position: center;
  }

  .long-image {
    margin-top: 100px;
    margin-bottom: 20px;
    height: 90%;
    width: 300px;
    background: url("/Image.png"), #101010;
    border: 1px solid white;
    background-repeat: no-repeat;
    background-position: center;
  }

  .inputs {
    display: flex;
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
    height: 300px;
    font-family: "Roboto Mono", monospace;
    font-size: 16px;
    color: white;
    width: 100%;
    padding: 20px;
    border: 1px solid white;
    overflow-y: auto;
    outline: none;
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
  }
</style>
