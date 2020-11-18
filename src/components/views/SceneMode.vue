<template>
  <div class="main-container">
    <img id="image" :src="imgURL" alt="mode" @click="changedMode()" />
  </div>
</template>

<script>
var Cesium = require("cesium/Cesium");

export default {
  props: ["mapViewer"],
  data() {
    return {
      imgURL: "",
    };
  },

  mounted() {
    this.$nextTick(() => {
      this.changedMode();
    });
  },
  methods: {
    changedMode() {
      // morphTo3D morphTo2D 方法并不会保留当前地图所处位置，而是重新加载（括号里的参数时用来控制经过多久开始变化的！）
      if (this.mapViewer.scene.mode == Cesium.SceneMode.SCENE2D) {
        // this.mapViewer.scene.morphTo3D(1); // 2D 3D 切换
        this.mapViewer.scene.mode = Cesium.SceneMode.SCENE3D;
        this.imgURL = require("@/assets/img/map3D.png");
      } else if (this.mapViewer.scene.mode == Cesium.SceneMode.SCENE3D) {
        // this.mapViewer.scene.morphTo2D(1); // 2D 3D 切换
        this.mapViewer.scene.mode = Cesium.SceneMode.SCENE2D;
        this.imgURL = require("@/assets/img/map2D.png");
      }
    //   $("#image").animate({ opacity: "toggle" }, "slow", null, function () {
    //     $("#image").attr("src", this.imgURL);
    //     $("#image").animate({ opacity: "toggle" }, "slow");
    //   });
      //   $("#image").animate({ opacity: "toggle" }, "slow");
      //   document.querySelector("img").animate({ opacity: "toggle" }, "slow");
    },
  },
};
</script>
<style scoped>
.main-container {
  display: block;
  width: 40px;
  height: 40px;
  /* background: red; */
  /* background-image: url("../../assets/img/map2D.png");
  transition: background-image 1s; */
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}
#image {
  transition: src 1s;
}
</style>