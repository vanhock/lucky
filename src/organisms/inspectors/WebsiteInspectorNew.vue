<template>
  <i-frame :src="websiteUrl">
    <div>Test info</div>
  </i-frame>
</template>

<script>
import IFrame from "../../molecules/IFrame";
export default {
  name: "WebsiteInspectorNew",
  components: { IFrame },
  data: () => ({
    websiteUrl: location.href,
    frameWidth: window.innerWidth + "px",
    frameHeight: window.innerHeight - 24 + "px"
  })
};
</script>

<style scoped></style>
