<template>
  <div class="home-container">
    <div class="mapview-container">
      <div id="cesium-mapViewer"></div>
      <target-for-location-component
        :mapViewer="mapViewer"
        v-if="targetLocationShow"
      ></target-for-location-component>
      <scene-mode-component
        :mapViewer="mapViewer"
        v-if="screenMode"
      ></scene-mode-component>
      <!-- vue2.0 图片为放在static文件下，vue3.0 图片未放在public下（未放在静态文件夹下），用以下方式加载图片（必须用require） -->
      <div
        id="test"
        :style="{
          backgroundImage: 'url(' + require('@/assets/img/tianxia1.png') + ')',
        }"
        style="display: none"
      ></div>
    </div>
  </div>
</template>
<script>
import { defaultInitCesium } from "../../assets/js/MapInit";
import CesiumNavigation from "cesium-navigation-es6";
import { mapControl } from "../../assets/js/tool/MapControl";
import targetForLocationComponent from "../targets/TargetLocation.vue";
import sceneModeComponent from "./SceneMode.vue";
var Cesium = require("cesium/Cesium");
var Tiff = require('tiff.js');
var fs = require('fs');

export default {
  data() {
    return {
      mapViewer: null,
      targetLocationShow: false, // 经纬度视角高度实时展示
      screenMode: false, // 2D，3D模块展示
      imgURL: require("@/assets/img/timg1.png"),
    };
  },
  components: {
    targetForLocationComponent,
    sceneModeComponent,
  },
  mounted() {
    this.mapViewer = this.initCesium();

    mapControl(this.mapViewer, {
      lng: 115.435314,
      lat: 39.960521,
      height: 5000000.0,
    });
    this.targetLocationShow = true;
    this.screenMode = true;
    // this.mapViewer.scene.morphTo3D(1); // 2D 3D 切换

    // 创建热力图
    var bounds = {
      west: -109.0,
      south: 30.0,
      east: -80.0,
      north: 50.0,
    };
    // createHeatMap(this.mapViewer, bounds);
    // document.querySelector("#test").style.backgroundImage =
    //   "url('tianxia.png')";
  },
  methods: {
    initCesium() {
      const viewer = defaultInitCesium(
        "cesium-mapViewer",
        "google",
        true,
        "3D"
      );
      viewer.scene.screenSpaceCameraController.maximumZoomDistance = 19000000; // 相机高度的最大值设定为 10000000 米
      viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1000;

      // 开启地图高程
      var terrainProvider = Cesium.createWorldTerrain({
        requestVertexNormals: true,
        requestWaterMask: false,
      });
      viewer.terrainProvider = terrainProvider;
      viewer.scene.globe.depthTestAgainstTerrain = true; // true有高程遮挡

      // 显示刷新率和帧率
      viewer.scene.debugShowFramesPerSecond = true;
      // this.mapViewer.scene.morphTo3D(0); // 2D 3D 切换
      return viewer;
    },
  },
};
</script>

<style scoped>
@import url(../../assets/css/cesiumNavgation.css);
#test {
  width: 200px;
  height: 200px;
  position: absolute;
  left: 10px;
  top: 10px;
  background-color: red;
}

.home-container {
  width: 100%;
  height: 100%;
  background-color: transparent;
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