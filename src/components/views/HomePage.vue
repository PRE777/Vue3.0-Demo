<template>
  <div class="home-container">
    <!-- <img src="/images/timg.png" alt="图片" /> -->
    <div class="mapview-container">
      <div id="cesium-mapViewer"></div>
      <img :src="imgURL" alt="图片" v-drag />
      <target-for-location-component
        :mapViewer="mapViewer"
        v-if="targetLocationShow"
      ></target-for-location-component>
    </div>
  </div>
</template>
<script>
import { defaultInitCesium } from "../../assets/js/MapInit";
import CesiumNavigation from "cesium-navigation-es6";
import { mapControl } from "../../assets/js/tool/MapControl";
import targetForLocationComponent from "../targets/TargetLocation.vue";
var Cesium = require("cesium/Cesium");
export default {
  data() {
    return {
      mapViewer: null,
      targetLocationShow: false,
      imgURL: require("@/assets/img/timg1.png"),
    };
  },
  components: {
    targetForLocationComponent,
  },
  mounted() {
    this.mapViewer = defaultInitCesium(
      "cesium-mapViewer",
      "google",
      true,
      "3D"
    );

    // var terrainProvider = Cesium.createWorldTerrain({
    //   requestVertexNormals: true,
    //   requestWaterMask: false,
    // });
    // this.mapViewer.terrainProvider = terrainProvider;
    // this.mapViewer.scene.globe.depthTestAgainstTerrain = true; // true有高程遮挡

    // 显示刷新率和帧率
    this.mapViewer.scene.debugShowFramesPerSecond = true;
    mapControl(this.mapViewer, {
      lng: 115.435314,
      lat: 39.960521,
      height: 5000000.0,
    });
    this.targetLocationShow = true;
  },
  methods: {},
};
</script>

<style scoped>
@import url(../../assets/css/cesiumNavgation.css);

.home-container {
  width: 100%;
  height: 100%;
  background-color: transparent;
}
img {
  position: absolute;
  left: 10px;
  top: 10px;
  width: 100px;
  height: 100px;
  z-index: 9999;
}
.mapview-container {
  display: block;
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  border: 1px solid rgb(7, 17, 43);
}
/* 地图 */
#cesium-mapViewer {
  display: block;
  height: 100%;
  /* width: 100%; */
  position: relative;
  background: rgba(3, 195, 255, 0.1);
  border: 1px solid rgb(60, 117, 219);
}
</style>