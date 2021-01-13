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
      <!-- vue2.0 图片未放在static文件下，vue3.0 图片未放在public下（未放在静态文件夹下），用以下方式加载图片（必须用require） -->
      <div
        id="test"
        :style="{
          backgroundImage: 'url(' + require('@/assets/img/tianxia1.png') + ')',
        }"
        style="display: none"
      ></div>

      <!-- <el-button type="primary" @click="tiles_clicked()"> 3D Tiles </el-button> -->
      <div class="addHeatMap">
        <el-button @click="showHeatMap(true)">展示</el-button>
        <el-button @click="showHeatMap(false)">隐藏</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import { defaultInitCesium } from "../../assets/js/MapInit";
import CesiumNavigation from "cesium-navigation-es6";
import { mapControl } from "../../assets/js/tool/MapControl";
import targetForLocationComponent from "../targets/TargetLocation.vue";
import sceneModeComponent from "./SceneMode.vue";
import { init_CzmlDataSource, multi_part_czml } from "../../assets/js/Test3Dtile";

var heatmap = require("heatmap.js/build/heatmap");

var Cesium = require("cesium/Cesium");
var Tiff = require("tiff.js");
var fs = require("fs");

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
    this.outer();
  },
  methods: {
    initCesium() {
      const viewer = defaultInitCesium("cesium-mapViewer", "tianDitu", true, "3D");
      viewer.scene.screenSpaceCameraController.maximumZoomDistance = 19000000; // 相机高度的最大值设定为 10000000 米
      viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1000;

      // 开启地图高程;
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
    tiles_clicked() {
      init_CzmlDataSource(this.mapViewer);
      //   multi_part_czml(this.mapViewer);
    },
    outer() {
      var object = {
        name: "object",
        getName: function () {
          return function () {
            console.info(this.name);
          };
        },
      };
      object.getName().bind(object)();
    },
    showHeatMap(val) {
      if (val) {
        // 展示
        this.heatmapCreate();
      } else {
        // 隐藏
        this.heatmapRemove();
      }
    },
    heatmapCreate() {
      var len = 300;
      var points = [];
      var max = 100;

      //热力图图片大小
      var width = 600;
      var height = 400;

      //点坐标的矩形范围
      var latMin = 28.364807;
      var latMax = 40.251095;
      var lonMin = 94.389228;
      var lonMax = 108.666357;

      //随机创建300个点（经度、纬度、热力值）
      var dataRaw = [];
      for (var i = 0; i < len; i++) {
        var point = {
          lat: latMin + Math.random() * (latMax - latMin),
          lon: lonMin + Math.random() * (lonMax - lonMin),
          value: Math.floor(Math.random() * 100),
        };
        dataRaw.push(point);
      }
      //随机创建300个点（x、y、热力值）
      for (var i = 0; i < len; i++) {
        var dataItem = dataRaw[i];
        var point = {
          x: Math.floor(((dataItem.lat - latMin) / (latMax - latMin)) * width),
          y: Math.floor(((dataItem.lon - lonMin) / (lonMax - lonMin)) * height),
          value: Math.floor(dataItem.value),
        };
        max = Math.max(max, dataItem.value);
        points.push(point);
      }
      //   module.exports
      let heatDoc = document.createElement("div");
      heatDoc.setAttribute(
        "style",
        "width:600px;height:400px;margin: 0px;display: none;"
      );
      document.body.appendChild(heatDoc);
      this.heatmapInstance = heatmap.create({
        // container: document.querySelector("#heatmap"),
        container: heatDoc,
      });
      var data = {
        max: max,
        data: points,
      };
      this.heatmapInstance.setData(data);
      var canvas = document.getElementsByClassName("heatmap-canvas");
      this.heatmapEntities = this.mapViewer.entities.add({
        name: "heatmap",
        rectangle: {
          coordinates: Cesium.Rectangle.fromDegrees(lonMin, latMin, lonMax, latMax),
          material: new Cesium.ImageMaterialProperty({
            image: canvas[0],
            transparent: true,
          }),
        },
      });

      this.mapViewer.zoomTo(this.heatmapEntities);
    },
    heatmapRemove() {
      if (this.heatmapEntities) {
        this.mapViewer.entities.remove(this.heatmapEntities);
        this.heatmapEntities = null;
      }
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

.el-button--primary {
  color: #fff;
  background: rgba(10, 73, 107, 1) !important;
  border: 1px solid rgba(3, 195, 255, 1) !important;
  width: 100px;
  height: 30px;
  cursor: pointer;
  margin: 0 10px !important;
  position: absolute;
  left: 100px;
  top: 100px;
}
.addHeatMap {
  position: absolute;
  left: 10px;
  top: 10px;
  height: 50px;
  width: 150px;
  display: flex;
  align-items: center;
  justify-items: center;
}
</style>
