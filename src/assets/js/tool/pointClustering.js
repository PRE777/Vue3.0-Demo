let Cesium = require("cesium/Cesium");
var removeListener;
var entities;
let myDataSource;
export function addDataSources(viewer, data) {
    if (data == null || data == '') {
        return
    }
    distoryPointsEntities(viewer);
    let options = {
        camera: viewer.scene.camera,
        canvas: viewer.scene.canvas,
        clampToGround: false,
    }
    let dataSourcePromise = Cesium.GeoJsonDataSource.load(data, options);
    dataSourcePromise.then((dataSource) => {
        myDataSource = dataSource;
        entities = viewer.dataSources.add(dataSource)
        dataSource.entities.values.forEach(entity => {
            entity.billboard.image = require("../../img/pinbuilder/camera.png");
            entity.type = "cluser";
        });
        afterAddDataSource(dataSource)
    });
}
export function distoryPointsEntities(viewer) {
    if (myDataSource) {
        viewer.dataSources.remove(myDataSource);
        myDataSource = null;
    }
    if (Cesium.defined(removeListener)) {
        removeListener();
        removeListener = undefined;
    }

}

function afterAddDataSource(dataSource) {
    let pixelRange = 30; // 聚合距离 30像素
    let minimumClusterSize = 2; // 是每个聚合点的最小聚合个数，这个值最好是设置为2
    let enabled = true; // 是否聚合
    dataSource.clustering.enabled = enabled;
    dataSource.clustering.minimumClusterSize = minimumClusterSize;
    dataSource.clustering.pixelRange = pixelRange;


    // let pinBuilder = new Cesium.PinBuilder();
    // let pin100 = pinBuilder.fromText("100+", Cesium.Color.PURPLE, 40).toDataURL();
    // let pin50 = pinBuilder.fromText("50+", Cesium.Color.RED, 40).toDataURL();
    // let pin40 = pinBuilder.fromText("40+", Cesium.Color.ORANGE, 40).toDataURL();
    // let pin30 = pinBuilder.fromText("30+", Cesium.Color.YELLOW, 40).toDataURL();
    // let pin20 = pinBuilder.fromText("20+", Cesium.Color.GREEN, 40).toDataURL();
    // let pin10 = pinBuilder.fromText("10+", Cesium.Color.BLUE, 40).toDataURL();

    // let url = Cesium.buildModuleUrl("images/pinbuilder/red.png");
    // let pin100 = pinBuilder.fromUrl(Cesium.buildModuleUrl("images/pinbuilder/red.png"), Cesium.Color.PURPLE.withAlpha(1), 50)
    // let pin50 = pinBuilder.fromUrl(Cesium.buildModuleUrl("images/pinbuilder/red.png"), Cesium.Color.RED.withAlpha(0), 50)
    // let pin40 = pinBuilder.fromUrl(Cesium.buildModuleUrl("images/pinbuilder/red.png"), Cesium.Color.ORANGE.withAlpha(0), 50)
    // let pin30 = pinBuilder.fromUrl(Cesium.buildModuleUrl("images/pinbuilder/red.png"), Cesium.Color.YELLOW.withAlpha(0), 50)
    // let pin20 = pinBuilder.fromUrl(Cesium.buildModuleUrl("images/pinbuilder/red.png"), Cesium.Color.GREEN.withAlpha(0), 50)
    // let pin10 = pinBuilder.fromUrl(Cesium.buildModuleUrl("images/pinbuilder/red.png"), Cesium.Color.BLUE.withAlpha(0), 50)
    // let pin100 = pinBuilder.fromUrl("../../img/pinbuilder/purple.png", Cesium.Color.RED.withAlpha(0), 40);

    // let pin50 = pinBuilder.fromUrl("../../img/pinbuilder/red.png", Cesium.Color.RED.withAlpha(0), 40);

    let pin100 = require("../../img/pinbuilder/purple.png")
    let pin50 = require("../../img/pinbuilder/red.png");
    let pin40 = require("../../img/pinbuilder/orange.png");
    let pin30 = require("../../img/pinbuilder/yellow.png");
    let pin20 = require("../../img/pinbuilder/green.png");
    let pin10 = require("../../img/pinbuilder/blue.png");
    let singleDigitPins = new Array(8);
    for (let i = 0; i < singleDigitPins.length; i++) {
        // singleDigitPins[i] = pinBuilder.fromText("" + (i + 2), Cesium.Color.VIOLET, 40).toDataURL();
        combineNewIcon(pin10, (i + 2)).then(img => {
            singleDigitPins[i] = img
        })
    }
    customStyle();

    function customStyle() {
        if (Cesium.defined(removeListener)) {
            removeListener();
            removeListener = undefined;
        } else {
            removeListener = dataSource.clustering.clusterEvent.addEventListener(
                (clusteringEntities, cluster) => {
                    // clusteredEntities参数表示的是聚合Entities数据集
                    // cluster是一个包含了billboard、label、和point 属性的对象
                    cluster.label.show = false;
                    cluster.billboard.show = true;
                    cluster.billboard.id = cluster.label.id;
                    cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                    let length = clusteringEntities.length;
                    if (length >= 100) {
                        combineNewIcon(pin100, length).then(img => {
                            cluster.billboard.image = img;
                        });
                    } else if (length >= 50) {
                        combineNewIcon(pin50, length).then(img => {
                            cluster.billboard.image = img;
                        });
                    } else if (length >= 40) {
                        combineNewIcon(pin40, length).then(img => {
                            cluster.billboard.image = img;
                        });
                    } else if (length >= 30) {
                        combineNewIcon(pin30, length).then(img => {
                            cluster.billboard.image = img;
                        });

                    } else if (length >= 20) {
                        combineNewIcon(pin20, length).then(img => {
                            cluster.billboard.image = img;
                        });

                    } else if (length >= 10) {
                        combineNewIcon(pin10, length).then(img => {
                            cluster.billboard.image = img;
                        });
                    } else {
                        cluster.billboard.image = singleDigitPins[clusteringEntities.length - 2];
                        // cluster.billboard.image = pinBuilder.fromText(length, Cesium.Color.VIOLET, 40).toDataURL()
                    }
                }
            );
        }
        setTimeout(forceCluster, 0); // 重新触发聚合
    }

    function forceCluster() {
        let pixelRange = dataSource.clustering.pixelRange;
        dataSource.clustering.pixelRange = 0;
        dataSource.clustering.pixelRange = pixelRange;
    }

}

function combineNewIcon(image, count) {
    let promise = new Promise((resolve, reject) => {
        let width = 40;
        let height = 40;
        let scale = 1.0;

        let canvas = document.createElement('canvas');
        canvas.width = width
        canvas.height = height

        var context = canvas.getContext("2d");
        context.textAlign = "center";
        context.rect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'rgba(255, 255, 255, 1)';
        // context.fill(); // 填充会显示白色矩形

        var myImage = new Image();
        myImage.src = image; //背景图片  你自己本地的图片或者在线图片
        myImage.crossOrigin = 'Anonymous';

        myImage.onload = function() {
            context.drawImage(myImage, 0, 0, width, height);
            context.font = `bold ${scale*14}px Arial`;
            context.fillText(count, 20, 25, 40);
            context.textAlign = "center";
            let base64 = canvas.toDataURL("image/png");
            resolve(base64);
        }

    });
    return promise;
}