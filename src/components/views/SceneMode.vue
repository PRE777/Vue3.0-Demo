<template>
  <div class="main-container">
    <img id="image" src="" alt="mode" @click="changedMode()" />
  </div>
</template>

<script>
var Cesium = require("cesium/Cesium");

export default {
  props: ["mapViewer"],
  data() {
    return {};
  },

  mounted() {
    this.$nextTick(() => {
      //   this.changedMode();
      this.changedMode();
    });
  },
  methods: {
    changedMode() {
      let imageURL = "";
      let image = "";
      // morphTo3D morphTo2D 方法并不会保留当前地图所处位置，而是重新加载（括号里的参数时用来控制经过多久开始变化的！）
      if (this.mapViewer.scene.mode == Cesium.SceneMode.SCENE2D) {
        // this.mapViewer.scene.morphTo3D(1); // 2D 3D 切换
        this.mapViewer.scene.mode = Cesium.SceneMode.SCENE3D;
        imageURL = require("@/assets/img/map3D.png");
      } else if (this.mapViewer.scene.mode == Cesium.SceneMode.SCENE3D) {
        // this.mapViewer.scene.morphTo2D(1); // 2D 3D 切换
        this.mapViewer.scene.mode = Cesium.SceneMode.SCENE2D;
        imageURL = require("@/assets/img/map2D.png");
      }

      /**
       * 效果一
        //   (“slow”,“normal”, or “fast”) 或 毫秒数
        //   show，hide，toggle切换
        $("#image").animate({ opacity: "toggle" }, 400, null, function () {
          $(this).attr("src", imageURL);
          $(this).animate({ opacity: "toggle" }, 400);
        });
        // 与下相同
       */

      $("#image").fadeToggle(400, null, function () {
        $(this).attr("src", imageURL);
        $(this).fadeToggle(400);
      });
      /**
       * 效果二
        $("#image").slideUp(400, null, function () {
          $(this).attr("src", imageURL);
          $(this).slideDown(400);
        });
     */

      //   document.querySelector(
      //     ".main-container"
      //   ).style.backgroundImage = `url('${imageURL}')`;

      //   $(".main-container").css(
      //     "background-image",
      //     `url('${imageURL}')`
      //   );
    },
  },
};
</script>
<style scoped>
.main-container {
  display: block;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.4);
  transition: background-image 0.8s; /* background-image 切换时0.8s 动画，此处未使用*/
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}
</style>