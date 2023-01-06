<script>
  import { menuItems } from "../../../stores";
  import Button from "../../../components/Button.svelte";
  import { goto } from "$app/navigation";

  $menuItems = [
    {
      name: "View Your Article",
      title: true,
    },
    {
      name: "Preview",
      onClick: () => {
        console.log("Preview");
      },
      padding: true,
      alt: true,
    },

    {
      name: "edit",
      onClick: () => {
        console.log("Preview");
      },
      alt: true,
    },
  ];
</script>

<div class="wrapper">
  <div class="feature" />
  <input placeholder="Article Title" />
  <div class="inputs">
    <input placeholder="Category" />
    <input placeholder="lock" />
  </div>
  <div class="checkbox">
    <label for="featured">Featured</label><input
      name="featured"
      type="checkbox"
    />
  </div>
  <div class="checkbox">
    <label for="default">Default</label><input name="default" type="checkbox" />
  </div>
  <div class="content" contenteditable="true" placeholder="Article Body" />
  <div class="inputs">
    <Button label="Save" fullwidth />
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

<style lang="scss">
  .wrapper {
    margin-left: 300px;
    width: 780px;
    display: flex;
    flex-direction: column;
    gap: 20px;
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
    letter-spacing: 5px;
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

  /* placeholder code */
  .content:empty:before {
    content: attr(placeholder);
    color: white;
    opacity: 0.4;
    font-family: "Roboto Mono", monospace;
    font-weight: lighter;
  }

  .content {
    background: #101010;
    height: 300px;
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
</style>
