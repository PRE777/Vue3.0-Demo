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
      <div class="clusteringPoint">
        <el-button @click="showClusteringPoint(true)">展示点</el-button>
        <el-button @click="showClusteringPoint(false)">隐藏点</el-button>
      </div>
      <div class="add-primitive">
        <el-button @click="addPrimitive()">添加</el-button>
        <el-button @click="destroyPrimitive(false)">销毁</el-button>
        <el-button @click="addListener()">地图移动监听</el-button>
        <el-button @click="removeListener()">移除监听</el-button>
      </div>
      <div class="draw-arrow">
        <el-button @click="singleArrow()">单箭头</el-button>
        <el-button @click="clearArrows()">清 除</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import { defaultInitCesium } from "../assets/js/MapInit";
import { mapControl } from "../assets/js/tool/MapControl";
import targetForLocationComponent from "../components/targets/TargetLocation.vue";
import sceneModeComponent from "../components/SceneMode.vue";
import { init_CzmlDataSource, multi_part_czml } from "../assets/js/Test3Dtile";
import { PrimitiveRectangle } from "../assets/js/PrimitiveRectangle";
import DrawstraightArrow from "../assets/js/Arrow";
// var heatmap = require("heatmap.js/build/heatmap");
import { heatmapCreate, heatmapRemove } from "../assets/js/tool/heatmapEvent";
import { addDataSources, distoryPointsEntities } from "../assets/js/tool/pointClustering";
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
    //   设置window.name属性

    let obj = { username: "张三", userage: 22 };
    window.name = JSON.stringify(obj);

    this.mapViewer = this.initCesium();
    mapControl(this.mapViewer, {
      lng: 115.435314,
      lat: 39.960521,
      height: 5000000.0,
    });
    this.targetLocationShow = true;
    this.screenMode = true;
    // this.mapViewer.scene.morphTo3D(1); // 2D 3D 切换
    this.outer();
    PrimitiveRectangle.getInstance().initializationview(this.mapViewer);
    // this.drawLatLine();
    // message 事件，监听其它页面 postMessage 发送过来的消息
    window.addEventListener(
      "message",
      (e) => {
        if (e.data.type.indexOf("webpack") != -1) {
          return;
        }
        if (e.data) {
          debugger;
          // 通过监听message事件，可以监听对方发送的消息。
          console.log(e.data); // 跨域请求信息
          // 向父窗口发送消息
          setTimeout(() => {
            let parent = window.opener;
            console.log(parent == e.source);

            let parent1 = window.parent; // 针对iframe来说，parent
            console.log(parent1 == e.source);

            // 检测当前窗口是否通过其他页面打开（是否有父窗口）
            if (parent) {
              parent.postMessage("这条信息是子窗口发送来的", "http://localhost:8088/");
            }
            if (e.source) {
              // 发送消息的窗口
              e.source.postMessage("这条信息是子窗口发送来的111", e.origin);
            }
          }, 3000);
        }
      },
      false
    );
    this.straightArrow = new DrawstraightArrow(this.mapViewer);
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
      //   viewer.scene.globe.depthTestAgainstTerrain = true; // true有高程遮挡

      // 显示刷新率和帧率
      viewer.scene.debugShowFramesPerSecond = true;
      // this.mapViewer.scene.morphTo3D(0); // 2D 3D 切换
      return viewer;
    },
    tiles_clicked() {
      init_CzmlDataSource(this.mapViewer);
    },
    outer() {
      var object = {
        name: "object",
        // 计算属性
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
        heatmapCreate(this.mapViewer);
      } else {
        // 隐藏
        heatmapRemove(this.mapViewer);
      }
    },
    showClusteringPoint(val) {
      if (val) {
        // 展示
        // 取消地形遮挡
        this.mapViewer.scene.globe.depthTestAgainstTerrain = false;
        let data = require("../assets/JsonSource/points.json");
        addDataSources(this.mapViewer, data);
      } else {
        // 隐藏
        this.mapViewer.scene.globe.depthTestAgainstTerrain = true;
        distoryPointsEntities(this.mapViewer);
      }
    },

    drawLatLine() {
      // 画纬度线
      let positions = [];
      let coordinates = [];
      let lats = [];
      for (let lat = -90; lat <= 90; lat++) {
        // lats.push(lat);
        for (let lng = -180; lng <= 180; lng++) {
          coordinates.push(lng);
          coordinates.push(lat);
          coordinates.push(500000.0);
        }
      }
      // positions = Cesium.Cartesian3.fromDegreesArray(coordinates);
      positions = Cesium.Cartesian3.fromDegreesArrayHeights(coordinates);

      this.mapViewer.entities.add({
        polyline: {
          positions: positions,
          width: 2.0,
          material: Cesium.Color.RED,
        },
      });
    },
    // 添加primitive
    addPrimitive() {
      PrimitiveRectangle.getInstance().addRectangleGeometry();
      // PrimitiveRectangle.getInstance().testAddRectangle();
    },
    destroyPrimitive() {
      PrimitiveRectangle.getInstance().removeRectangleGrometry();
    },
    addListener() {
      this.mapViewer.scene.camera.moveEnd.addEventListener(this.eventListener);
    },
    eventListener() {
      PrimitiveRectangle.getInstance().addRectangleGeometry();
    },
    removeListener() {
      this.mapViewer.scene.camera.moveEnd.removeEventListener(this.eventListener);
    },

    singleArrow() {
      this.straightArrow.startCreate();
    },
    clearArrows() {
    //   debugger;
    //   let a = this.straightArrow.getData();
    //   debugger;
      if (this.straightArrow) {
        this.straightArrow.clear();
      }
    },
  },
};
</script>

<style scoped>
@import url(../assets/css/cesiumNavgation.css);
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
.clusteringPoint {
  position: absolute;
  left: 10px;
  top: 70px;
  height: 50px;
  width: 150px;
  display: flex;
  align-items: center;
  justify-items: center;
}
.add-primitive {
  position: absolute;
  left: 10px;
  top: 130px;
  height: 50px;
  width: 200px;
  display: flex;
  align-items: center;
  justify-items: center;
}
.draw-arrow {
  position: absolute;
  left: 10px;
  top: 200px;
  height: 50px;
  width: 200px;
  display: flex;
  align-items: center;
  justify-items: center;
}
</style>
