
<!--
 * @Author: PRE777
 * @Descripttion: your project
 * @Date: 2023-03-29 13:28:11
 * @LastEditors: PRE777
 * @LastEditTime: 2023-06-08 16:03:08
 * @FilePath: /Vue3.0-Demo/src/views/ThreePage.vue
-->
<template>
  <div class="cesium-container">
    <vc-cesium :viewerOptions="viewerOptions">
      <vc-draw-graphics
        v-model="drawState"
        :options="drawOptions"
        @draw-start="onDrawStart"
        @draw-end="onDrawEnd"
      />
    </vc-cesium>
  </div>
</template>

<script>
// import { VcCesium, VcDrawGraphics } from "vue-cesium";
var Cesium = require("cesium/Cesium");

export default {
  components: {
    // VcCesium,
    // VcDrawGraphics,
  },
  data() {
    return {
      viewerOptions: {
        animation: false,
        timeline: false,
      },
      drawState: false,
      drawOptions: {
        mode: "polygon",
        material: Cesium.Color.RED.withAlpha(0.5),
      },
    };
  },
  methods: {
    onDrawStart(event) {
      console.log("Draw start:", event);
    },
    onDrawEnd(event) {
      console.log("Draw end:", event);
    },
  },
};
</script>
<style>
.cesium-container {
  height: 100%;
}
</style>
