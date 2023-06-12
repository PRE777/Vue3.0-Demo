let Cesium = require("cesium/Cesium");

export class DrawWall {
  constructor(view) {
    this._viewer = view;
    this.positions = [];
    this.wall = null;
  }

  //事件行为
  handleMouse() {
    let handler = new Cesium.ScreenSpaceEventHandler(
      this._viewer.scene._imageryLayerCollection
    );
    //地图选点
    handler.setInputAction((movement) => {
      const ellipsoid = this._viewer.scene.globe.ellipsoid;
      // 世界坐标
      this.cartesian = this._viewer.camera.pickEllipsoid(
        movement.position,
        ellipsoid
      );
      //   let ray = this._viewer.camera.getPickRay(movement.position);
      //   let position = this._viewer.scene.globe.pick(ray, this._viewer.scene); // 地标坐标
      // let position = this.viewer.scene.pickPosition(movement.position);
      //   this.cartesian = position;
      if (this.positions.length == 0) {
        if (this.cartesian) {
          let cartesianClone = this.cartesian.clone();
          this.positions.push(cartesianClone);
        }
      }
      //   else if (this.positions.length == 3) {
      //       debugger
      //   }
      this.positions.push(this.cartesian);

      //   let leng = this.positions.length;
      if (this.positions.length == 3) {
        debugger;
        handler.destroy(); // 关闭事件句柄
        //   移除鼠标事件
        // handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        // handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction((movement) => {
      let ellipsoid = this._viewer.scene.globe.ellipsoid;
      this.cartesian = this._viewer.camera.pickEllipsoid(
        movement.endPosition,
        ellipsoid
      );
      //   let ray = this._viewer.camera.getPickRay(movement.endPosition);
      //   let position1 = this._viewer.scene.globe.pick(ray, this._viewer.scene); // 地标坐标
      // let position2 = this.viewer.scene.pickPosition(movement.endPosition); // 场景坐标
      //   this.cartesian = position1;

      if (this.positions.length >= 2) {
        if (!Cesium.defined(this.wall)) {
          this.wall = new WallPrimitive(this.positions);
        } else {
          this.positions.pop();
          this.positions.push(this.cartesian);
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // handler.setInputAction(() => {
    //   handler.destroy(); // 关闭事件句柄
    //   this.positions.pop(); // 最后一个点无效
    //   let a = this.positions;
    // }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    let that = this;
    let WallPrimitive = (function() {
      function _(positions) {
        this.options = {
          wall: {
            positions: [],
            maximumHeights: [200000, 200000],
            minimumHeights: [0, 0],
          },
        };
        this.positions = positions;
        this._init();
      }
      _.prototype._init = function() {
        let _self = this;
        let _update = function() {
          return _self.positions;
        };
        // 实时更新polyline.positions
        this.options.wall.positions = new Cesium.CallbackProperty(
          _update,
          false
        );
        that._viewer.entities.add(this.options);
      };
      return _;
    })();
  }
}
