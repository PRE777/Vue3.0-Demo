// let heatmap = require("heatmap.js/build/heatmap");
let Cesium = require("cesium/Cesium");
let heatmapEntities = undefined;

export function heatmapCreate(viewer) {
    var len = 400;
    var points = [];
    var max = 100;

    //热力图图片大小
    var width = 600;
    var height = 400;

    //点坐标的矩形范围
    var latMin = 20.364807;
    var latMax = 44.251095;
    var lonMin = 100.389228;
    var lonMax = 122.666357;

    //随机创建 len 个点（经度、纬度、热力值）
    var dataRaw = [];
    // var test = [];
    for (var i = 0; i < len; i++) {
        var point = {
            lat: latMin + Math.random() * (latMax - latMin),
            lon: lonMin + Math.random() * (lonMax - lonMin),
            value: Math.floor(Math.random() * 100),
        };
        dataRaw.push(point);
        // const point1 = [point.lon, point.lat];
        // test.push(point1)
    }
    // console.log(JSON.stringify(test));
    // debugger
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
        `width:${width}px;height:${height}px;margin: 0px;display: none;`
    );
    document.body.appendChild(heatDoc);
    var heatmapInstance = heatmap.create({
        container: heatDoc,
        radius: 20,
        maxOpacity: .5,
        minOpacity: 0,
        blur: .75,
        gradient: {
            '0.9': 'red',
            '0.8': 'orange',
            '0.7': 'yellow',
            '0.5': 'blue',
            '0.3': 'green',
        },
    });
    var data = {
        max: max,
        data: points,
    };
    heatmapInstance.setData(data);
    var canvas = document.getElementsByClassName("heatmap-canvas");
    heatmapEntities = viewer.entities.add({
        name: "heatmap",
        rectangle: {
            coordinates: Cesium.Rectangle.fromDegrees(lonMin, latMin, lonMax, latMax),
            material: new Cesium.ImageMaterialProperty({
                image: canvas[0],
                transparent: true,
            }),
        },
    });

    viewer.zoomTo(heatmapEntities);
}

export function heatmapRemove(viewer) {
    if (heatmapEntities) {
        viewer.entities.remove(heatmapEntities);
        heatmapEntities = null;
    }
}