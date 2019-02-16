<template>
  <div class="home">
    <h1 class="header">Make your website Perfect!</h1>
    <div class="description">
      <p>Get difference between mockup and your website without layering!</p>
      <p>There are 2 simple steps to do that:</p>
    </div>
    <form-input
      class="enter-website"
      name="url"
      label="Enter website:"
      placeholder="Type website url, like google.com"
    />
    <design-uploader />
  </div>
</template>

<script>
import DesignUploader from "../components/DesignUploader";
import FormInput from "../atoms/FormInput";
export default {
  name: "home",
  components: { DesignUploader, FormInput }
};
</script>

<style lang="scss">
body {
  background-color: $color-bg1;
}
.home {
  max-width: 540px;
  margin: 0 auto;
  h1.header {
    max-width: 340px;
    font-size: 50px;
    margin-bottom: 5px;
  }
  .description {
    color: $color-b3;
    font-size: 18px;
    line-height: 16px;
  }
  .enter-website {
    margin: 40px 0;
  }
}
</style>
