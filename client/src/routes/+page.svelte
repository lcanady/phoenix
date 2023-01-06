<script>
  import Login from "../components/Login.svelte";
  import { menuItems } from "../stores";
  import { defaultLinks } from "../stores";

  $menuItems = defaultLinks;
</script>

<div class="image" />
<div class="article">
  <div class="intro">
    <div class="image_mobile" />
    <h1>Welcome to Bridgetown</h1>
    <p>
      A text-based roleplaying game set in the world of the bestselling novels
      by Laurel K. Hamilton. In this immersive and interactive environment, you
      will have the opportunity to explore the dark and dangerous city of
      Bridgetown, where the supernatural and the mundane collide.
    </p>
    <p>
      As a player, you will be able to create and play as a wide range of
      characters, from humans and vampires to werewolves and other preternatural
      creatures. The possibilities are endless as you navigate the shadows and
      secrets of Bridgetown and beyond.
    </p>
    <p>
      Are you ready to step into the role of a hunter or the hunted? Join us and
      see where the story takes you. Experience the thrill of roleplaying in the
      Anita Blake universe and see what adventures await you in Bridgetown.
    </p>

    <Login />
  </div>
</div>

<style lang="scss">
  .image {
    position: absolute;
    z-index: 20;
    top: 0;
    left: 400px;
    width: 300px;
    height: 100%;
    min-height: 100vh;
    background: url("/portland.png");
    background-size: cover;
    background-position: center;
  }

  .article {
    margin-left: 400px;
    z-index: 1000;
    position: relative;

    h1 {
      font-size: 32px;
      font-weight: normal;
      font-family: "Punktype", monospace;
      letter-spacing: 5px;
      margin-bottom: 10px;
    }

    p {
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 20px;
    }
  }

  .intro {
    margin-top: 150px;
    margin-left: 300px;
    z-index: 500;
    margin-bottom: 20px;
  }

  .image_mobile {
    display: none;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 92.62%),
      url("/portland2.png");
    background-size: cover;
    background-position: center;
    width: 100%;
    height: 400px;

    margin-bottom: 40px;
  }

  @media screen and (max-width: 1240px) {
    .image {
      display: none;
    }

    .intro {
      margin-top: 0;
    }

    .image_mobile {
      display: block;
    }

    .article {
      margin-left: 0;
    }
  }

  @media screen and (max-width: 1050px) {
    .intro {
      margin-top: 0;
      margin-left: 0;
    }
  }
</style>
