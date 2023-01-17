<script lang="ts">
  export const data: any = {};
</script>

<div class="container">
  <div class="text">
    <h1>Welcome To Bridgetown.</h1>
    <p class="sub">An Anita Blake MU*</p>
  </div>
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
    margin-bottom: 150px;
  }

  .text {
    margin-top: 270px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
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
</style>
