var Cesium = require("cesium/Cesium");

export class PrimitiveRectangle {
  constructor() {
    this.viewer = null;
    this.primitive = null;
  }
  initializationview(view) {
    this.viewer = view;
  }

  static getInstance() {
    if (!this._instance) {
      this._instance = new PrimitiveRectangle();
    }
    return this._instance;
  }

  // 绘制网格
  addRectangleGeometry() {
    this.removeRectangleGrometry();
    let data = getPosition();
    let instances = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      instances.push(
        new Cesium.GeometryInstance({
          id: item.id,
          name: `duang-${i}`,
          geometry: new Cesium.RectangleGeometry({
            rectangle: Cesium.Rectangle.fromDegrees(
              item.minLng,
              item.minLat,
              item.maxLng,
              item.maxLat
            ),
            vertexFormat: Cesium.PerInstanceColorAppearance.VERTEXT_FORMAT,
          }),
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(
              Cesium.Color.fromRandom({
                alpha: 0.5,
              })
            ),
          },
        })
      );
    }
    this.primitive = new Cesium.Primitive({
      geometryInstances: instances, //合并
      //某些外观允许每个几何图形实例分别指定某个属性，例如：
      appearance: new Cesium.PerInstanceColorAppearance(),
    });
    this.viewer.scene.primitives.add(this.primitive);
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    let lastAttributes = null;
    let lastColor = null;
    // 设置单击事件的处理句柄
    this.handler.setInputAction((movement) => {
      let pick = this.viewer.scene.pick(movement.position);
      if (lastAttributes && lastColor) {
        lastAttributes.color = lastColor;
      }
      if (Cesium.defined(pick)) {
        let attributes = this.primitive.getGeometryInstanceAttributes(pick.id);
        lastAttributes = attributes;
        lastColor = attributes.color;
        attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(
          Cesium.Color.RED
        );
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // this.viewer.scene.camera.moveEnd.addEventListener(this.addRectangleGeometry);
  }

  // 添加监听
  //   addListener(){
  //     this.viewer.scene.camera.moveEnd.addEventListener(this.eventListener);
  //   }
  eventListener() {
    console.log(123);
    this.removeRectangleGrometry();
  }
  // 清除
  removeRectangleGrometry() {
    if (this.primitive) {
      this.viewer.scene.primitives.remove(this.primitive);
    }
    if (this.handler) {
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    // this.viewer.scene.camera.moveEnd.removeEventListener(this.addRectangleGeometry);
  }
}

function getPosition() {
  let minlng = 120;
  let minlat = 22.5;
  let maxlng = 121;
  let maxlat = 23.5;
  let space = 0.01;

  let arr = [];
  let i = 0;

  for (var lng = minlng; lng < maxlng; lng += space) {
    let j = 0;
    for (var lat = minlat; lat < maxlat; lat += space) {
      let dic = {
        minLng: lng,
        minLat: lat,
        maxLng: lng + space,
        maxLat: lat + space,
        id: `rectangle-${i}-${j}`,
      };
      arr.push(dic);
      j = j + 1;
    }
    i = i + 1;
  }
  return arr;
}
