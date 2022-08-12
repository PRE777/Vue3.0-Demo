let Cesium = require("cesium/Cesium");
import * as echarts from "echarts";

export class Profile {
  constructor(viewer, elementId) {
    this.elementId = elementId;
    this.viewer = viewer;
    this.positions = [];
    this.positionsCartographic = [];
    this.positions_Inter = [];
    this.poly = null;
    this.distance = 0;
    this.cartesian = null;
    this.floatingPoint = null;
    this.DistanceArray = [];
    this.profileItem = [];
    //echars;
    this.ProfileData_Lon = [];
    this.PolyPoints = [];
  }
  //事件行为
  handleMouse() {
    let handler = new Cesium.ScreenSpaceEventHandler(
      this.viewer.scene._imageryLayerCollection
    );
    //地图选点
    handler.setInputAction((movement) => {
      const ellipsoid = this.viewer.scene.globe.ellipsoid;

      // 世界坐标
      // this.cartesian = this.viewer.camera.pickEllipsoid(
      //   movement.position,
      //   ellipsoid
      // );
      let ray = this.viewer.camera.getPickRay(movement.position);
      let position1 = this.viewer.scene.globe.pick(ray, this.viewer.scene); // 地标坐标
      // let position2 = this.viewer.scene.pickPosition(movement.position); // 场景坐标
      this.cartesian = position1;

      if (this.positions.length == 0) {
        if (this.cartesian) {
          let cartesianClone = this.cartesian.clone();
          this.positions.push(cartesianClone);
        } else {
          return;
        }
      }
      this.positions.push(this.cartesian);
      if (this.poly) {
        // 进行插值计算
        this.interPoints(this.poly.positions);
        this.distance = this.getSpaceDistance(this.positions_Inter);
      } else {
        this.distance = this.getSpaceDistance(this.positions);
      }
      let textDisance = this.distance + "米";
      this.DistanceArray.push(this.distance);

      const cartographic = ellipsoid.cartesianToCartographic(
        this.positions[this.positions.length - 1]
      );
      const lat = Cesium.Math.toDegrees(cartographic.latitude);
      const lng = Cesium.Math.toDegrees(cartographic.longitude);
      // 根据经纬度获取地形高度
      const height = coordinateTransformHeight({
        viewer: this.viewer,
        lng: lng,
        lat: lat,
      });

      this.floatingPoint = this.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lng, lat, height),
        point: {
          pixelSize: 8,
          color: Cesium.Color.RED,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
        label: {
          text: textDisance,
          font: "18px sans-serif",
          fillColor: Cesium.Color.GOLD,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(20, -20),
          heightReference: Cesium.HeightReference.NONE,
        },
      });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    //移动 线
    handler.setInputAction((movement) => {
      let ellipsoid = this.viewer.scene.globe.ellipsoid;
      // this.cartesian = this.viewer.camera.pickEllipsoid(
      //   movement.endPosition,
      //   ellipsoid
      // );
      let ray = this.viewer.camera.getPickRay(movement.endPosition);
      let position1 = this.viewer.scene.globe.pick(ray, this.viewer.scene); // 地标坐标
      // let position2 = this.viewer.scene.pickPosition(movement.endPosition); // 场景坐标
      this.cartesian = position1;

      if (this.positions.length >= 2) {
        if (!Cesium.defined(this.poly)) {
          this.poly = new PolyLinePrimitive(this.positions);
        } else {
          this.positions.pop();
          this.positions.push(this.cartesian);
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    //结束选点

    handler.setInputAction(() => {
      handler.destroy(); // 关闭事件句柄
      this.positions.pop(); // 最后一个点无效
      setTimeout(() => {
        this.createProfileChart(this.profileItem);
      }, 5000);
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    let that = this;
    let PolyLinePrimitive = (function() {
      function _(positions) {
        this.options = {
          polyline: {
            show: true,
            positions: [],
            material: Cesium.Color.CHARTREUSE,
            width: 5,
            clampToGround: true,
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
        this.options.polyline.positions = new Cesium.CallbackProperty(
          _update,
          false
        );
        that.viewer.entities.add(this.options);
      };
      return _;
    })();
  }

  // 空间两点距离计算函数
  getSpaceDistance(positions) {
    const ellipsoid = this.viewer.scene.globe.ellipsoid;
    const cartographic = ellipsoid.cartesianToCartographic(positions[0]);
    const lat = Cesium.Math.toDegrees(cartographic.latitude);
    const lng = Cesium.Math.toDegrees(cartographic.longitude);

    // 根据经纬度获取地形高度
    const height = coordinateTransformHeight({
      viewer: this.viewer,
      lng: lng,
      lat: lat,
    });
    const arr = [lng, lat, height];

    const point1 = {
      point: arr,
      distance: 0,
    };
    this.profileItem.push(point1);

    let distance = 0;
    for (let i = 0; i < positions.length - 1; i++) {
      let point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
      let point2cartographic = Cesium.Cartographic.fromCartesian(
        positions[i + 1]
      );
      /** 根据经纬度计算出距离**/
      let geodesic = new Cesium.EllipsoidGeodesic();
      geodesic.setEndPoints(point1cartographic, point2cartographic);
      let s = geodesic.surfaceDistance;
      // 返回两点之间的距离
      s = Math.sqrt(
        Math.pow(s, 2) +
          Math.pow(point2cartographic.height - point1cartographic.height, 2)
      );
      distance = distance + s;

      const cartographic = ellipsoid.cartesianToCartographic(positions[i + 1]);
      const lat = Cesium.Math.toDegrees(cartographic.latitude);
      const lng = Cesium.Math.toDegrees(cartographic.longitude);
      // const height = cartographic.height;

      // 根据经纬度获取地形高度
      const height = coordinateTransformHeight({
        viewer: this.viewer,
        lng: lng,
        lat: lat,
      });

      const arr = [lng, lat, height];
      let m_Item = {
        point: arr,
        distance: distance,
      };
      this.profileItem.push(m_Item);
    }
    return distance.toFixed(2);
  }
  // 线段插值点
  interPoints(positions) {
    this.positionsCartographic = [];
    let terrainSamplePositions = [];
    for (let index = 0; index < positions.length - 1; index++) {
      const element = positions[index];
      let ellipsoid = this.viewer.scene.globe.ellipsoid;
      let cartographic = ellipsoid.cartesianToCartographic(element);
      this.positionsCartographic.push(cartographic);
    }
    for (let i = 0; i < this.positionsCartographic.length; i++) {
      const m_Cartographic0 = this.positionsCartographic[i];
      const m_Cartographic1 = this.positionsCartographic[i + 1];
      if (m_Cartographic1) {
        let a =
          Math.abs(m_Cartographic0.longitude - m_Cartographic1.longitude) *
          1000000;
        let b =
          Math.abs(m_Cartographic0.latitude - m_Cartographic1.latitude) *
          1000000;
        // 等距采样
        if (a > b) b = a;
        let length = parseInt(b / 2);
        if (length > 1000) length = 1000;
        if (length < 2) length = 2;
        // let length = 4;//等分采样
        for (let j = 0; j < length; j++) {
          terrainSamplePositions.push(
            new Cesium.Cartographic(
              Cesium.Math.lerp(
                m_Cartographic0.longitude,
                m_Cartographic1.longitude,
                j / (length - 1)
              ),
              Cesium.Math.lerp(
                m_Cartographic0.latitude,
                m_Cartographic1.latitude,
                j / (length - 1)
              )
            )
          );
        }
        terrainSamplePositions.pop();
      } else {
        terrainSamplePositions.push(m_Cartographic0);
      }
    }
    this.positions_Inter = [];
    for (let n = 0; n < terrainSamplePositions.length; n++) {
      // 地理坐标（弧度）转经纬度坐标
      let m_cartographic = terrainSamplePositions[n];
      let height = this.viewer.scene.globe.getHeight(m_cartographic);
      let point = Cesium.Cartesian3.fromDegrees(
        (m_cartographic.longitude / Math.PI) * 180,
        (m_cartographic.latitude / Math.PI) * 180,
        height
      );
      this.positions_Inter.push(point);
    }
  }
  //绘制echarts;
  createProfileChart(Positions) {
    let polyPoint = null;
    let that = this;
    let PolyPointPrimitive = (() => {
      function _(position) {
        this.options = {
          position: [],
          point: {
            pixelSize: 10,
            color: Cesium.Color.BLUE,
            outlineColor: Cesium.Color.GREEN,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          },
        };
        that.PolyPoints = position;
        this._init();
      }
      _.prototype._init = function() {
        let _update = function() {
          return that.PolyPoints;
        };
        // 实时更新point position
        this.options.position = new Cesium.CallbackProperty(_update, true);
        that.viewer.entities.add(this.options);
      };
      return _;
    })();
    let ProfileData = [];

    let y_Min = 100000000;
    for (let index = 0; index < Positions.length; index++) {
      const element = Positions[index];
      let m_distance = element.distance.toFixed(2);
      let m_Lon = element.point[0]; //.toFixed(5)
      let m_Lat = element.point[1]; //.toFixed(5)
      let m_height = element.point[2]; //.toFixed(2)
      if (m_height < y_Min) {
        y_Min = m_height;
      }
      let m_data = [m_distance, m_height.toFixed(2)];
      ProfileData.push(m_data);
      this.ProfileData_Lon.push([m_Lon, m_Lat, m_height]);
    }
    // console.log(ProfileData);
    let lineChart = echarts.init(document.getElementById(this.elementId));
    let lineoption = {
      title: {
        text: "剖面分析",
      },
      tooltip: {
        trigger: "axis",
        formatter(params) {
          const index = params[0].dataIndex;
          const position = that.ProfileData_Lon[index];
          const lng = +position[0];
          const lat = +position[1];
          const height = +position[2];
          that.PolyPoints = Cesium.Cartesian3.fromDegrees(lng, lat, height);
          if (!Cesium.defined(polyPoint)) {
            polyPoint = new PolyPointPrimitive(that.PolyPoints);
          }
          return `当前高度:${params[0]["data"][1]},纬度:${lat.toFixed(
            5
          )},经度:${lng.toFixed(5)}`;
        },
      },
      legend: {
        data: ["剖面线"],
      },
      grid: {
        x: 40,
        x2: 40,
        y2: 24,
      },
      calculable: true,
      xAxis: [
        {
          type: "value",
          max: "dataMax",
          scale: true,
        },
      ],
      yAxis: [
        {
          type: "value",
          min: y_Min,
          scale: true,
        },
      ],
      series: [
        {
          name: "剖面线",
          type: "line",
          data: ProfileData,
          markPoint: {
            data: [
              { type: "max", name: "最高点" },
              { type: "min", name: "最低点" },
            ],
          },
        },
      ],
    };
    lineChart.setOption(lineoption);

    document.getElementById(this.elementId).style.bottom = "0";
    document.getElementById(this.elementId).style.backgroundColor = "#fff";
    document.getElementById(this.elementId).style.visibility = "visible";
    window.addEventListener("resize", () => {
      lineChart.resize();
    });
  }
  //清除全部
  clearAll() {
    this.viewer.entities.removeAll();
    // echarts.init(document.getElementById(this.elementId)).dispose(); // 销毁实例
    $(`#${this.elementId}`)
      .removeAttr("_echarts_instance_")
      .empty();
    document.getElementById(this.elementId).style.bottom = "-500px";
    this.positions = [];
    this.positionsCartographic = [];
    this.positions_Inter = [];
    this.poly = null;
    this.distance = 0;
    this.cartesian = null;
    this.floatingPoint = null;
    this.DistanceArray = [];
    this.profileItem = [];
    //echars;
    this.ProfileData_Lon = [];
    this.PolyPoints = [];
  }
}

function coordinateTransformHeight({ viewer, lng, lat } = {}) {
  // 经纬度转弧度
  const m_lat = Cesium.Math.toRadians(lat);
  const m_lng = Cesium.Math.toRadians(lng);
  return viewer.scene.globe.getHeight({
    latitude: m_lat,
    longitude: m_lng,
  });
}
