<script lang="ts">
  export let data: any = {};
  if (data?.data?.welcome) {
    data = data.data.welcome;
  }
</script>

<div class="container" />
<div class="text">
  <h1>Welcome To Bridgetown.</h1>
  <p class="sub">An Anita Blake MU*</p>
  <blockquote>
    <p class="instruct">
      To connect, type 'connect &lt;name&gt; &lt;password&gt;'
    </p>
    <p class="instruct">
      To create, type 'create &lt;name&gt; &lt;password&gt;'
    </p>
    <p class="instruct space">To quit type 'QUIT'</p>
  </blockquote>
</div>

<style lang="scss">
  .container {
    display: flex;
    max-width: 100%;
    height: 500px;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 2.6%, #000000 96.94%),
      url("/welcome.jpg");
    background-repeat: no-repeat !important;
    background-size: cover;
    background-position: center center;
    filter: saturate(0);
  }

  .instruct {
    margin: 0;
    margin-top: 2px;
    font-family: "Roboto Mono", sans-serif;
    font-size: 18px;
    font-weight: lighter;
  }

  .text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    color: white;
    font-family: "Roboto Mono", monospace;
  }

  h1 {
    margin: 0;
    margin-top: 20px;
  }

  .sub {
    font-family: "Roboto Mono", sans-serif;
    font-size: 18px;
    font-weight: lighter;
    margin: 0;
    margin-top: -5px;
    margin-bottom: 10px;
  }

  @media screen and (max-width: 1024px) {
    .text {
      margin: 10px 20px;
    }

    blockquote {
      width: 93%;
    }
  }
</style>
