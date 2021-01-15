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
        // let dataSourcePromise = viewer.dataSource.add(
        //     // Cesium.KmlDataSource.load(path, options)
        //     Cesium.DataSource.load(path, options)
        // );
        // dataSourcePromise.then((dataSource) => {
        //     afterAddDataSource(dataSource)
        // });

    let dataSourcePromise = Cesium.GeoJsonDataSource.load(data, options);
    dataSourcePromise.then((dataSource) => {
        myDataSource = dataSource;
        entities = viewer.dataSources.add(dataSource)
        afterAddDataSource(dataSource)
    });
}
export function distoryPointsEntities(viewer) {
    if (myDataSource) {
        viewer.dataSources.remove(myDataSource);
        myDataSource = null;
    }

}

function afterAddDataSource(dataSource) {
    let pixelRange = 40; // 聚合距离 40像素
    let minimumClusterSize = 1; // 是每个聚合点的最小聚合个数，这个值最好是设置为2
    let enabled = true; // 是否聚合
    dataSource.clustering.enabled = enabled;
    dataSource.clustering.minimumClusterSize = minimumClusterSize;
    dataSource.clustering.pixelRange = pixelRange;

    let pinBuilder = new Cesium.PinBuilder();

    // let pin100 = pinBuilder.fromText("100+", Cesium.Color.PURPLE, 40).toDataURL();
    // let pin50 = pinBuilder.fromText("50+", Cesium.Color.RED, 40).toDataURL();
    // let pin40 = pinBuilder.fromText("40+", Cesium.Color.ORANGE, 40).toDataURL();
    // let pin30 = pinBuilder.fromText("30+", Cesium.Color.YELLOW, 40).toDataURL();
    // let pin20 = pinBuilder.fromText("20+", Cesium.Color.GREEN, 40).toDataURL();
    // let pin10 = pinBuilder.fromText("10+", Cesium.Color.BLUE, 40).toDataURL();

    // let url = Cesium.buildModuleUrl("images/pinbuilder/red.png");
    let pin100 = pinBuilder.fromUrl(Cesium.buildModuleUrl("images/pinbuilder/red.png"), Cesium.Color.PURPLE.withAlpha(1), 50)
    let pin50 = pinBuilder.fromUrl(Cesium.buildModuleUrl("images/pinbuilder/red.png"), Cesium.Color.RED.withAlpha(0), 50)
    let pin40 = pinBuilder.fromUrl(Cesium.buildModuleUrl("images/pinbuilder/red.png"), Cesium.Color.ORANGE.withAlpha(0), 50)
    let pin30 = pinBuilder.fromUrl(Cesium.buildModuleUrl("images/pinbuilder/red.png"), Cesium.Color.YELLOW.withAlpha(0), 50)
    let pin20 = pinBuilder.fromUrl(Cesium.buildModuleUrl("images/pinbuilder/red.png"), Cesium.Color.GREEN.withAlpha(0), 50)
    let pin10 = pinBuilder.fromUrl(Cesium.buildModuleUrl("images/pinbuilder/red.png"), Cesium.Color.BLUE.withAlpha(0), 50)
        // let pin100 = pinBuilder.fromUrl("../../img/pinbuilder/purple.png", Cesium.Color.RED.withAlpha(0), 40);

    // let pin50 = pinBuilder.fromUrl("../../img/pinbuilder/red.png", Cesium.Color.RED.withAlpha(0), 40);
    // let pin100 = require("../../img/pinbuilder/purple.png")
    // let pin50 = require("../../img/pinbuilder/red.png");
    // let pin40 = require("../../img/pinbuilder/orange.png");
    // let pin30 = require("../../img/pinbuilder/yellow.png");
    // let pin20 = require("../../img/pinbuilder/green.png");
    // let pin10 = require("../../img/pinbuilder/blue.png");
    let singleDigitPins = new Array(8);
    for (let i = 0; i < singleDigitPins.length; i++) {
        singleDigitPins[i] = pinBuilder.fromText("" + (i + 2), Cesium.Color.VIOLET, 40).toDataURL();
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
                    if (clusteringEntities.length >= 100) {
                        pin100.then(canvas => {
                            cluster.billboard.image = canvas.toDataURL();
                            // let a = canvas.toDataURL();
                            // let b = require("../../img/pinbuilder/purple.png")
                            // cluster.billboard.image = require("../../img/pinbuilder/purple.png")
                        })
                    } else if (clusteringEntities.length >= 50) {
                        pin50.then(canvas => {
                            cluster.billboard.image = canvas.toDataURL();
                        })
                    } else if (clusteringEntities.length >= 40) {
                        pin40.then(canvas => {
                            cluster.billboard.image = canvas.toDataURL();
                        })
                    } else if (clusteringEntities.length >= 30) {
                        pin30.then(canvas => {
                            cluster.billboard.image = canvas.toDataURL();
                        })
                    } else if (clusteringEntities.length >= 20) {
                        pin20.then(canvas => {
                            cluster.billboard.image = canvas.toDataURL();
                        })
                    } else if (clusteringEntities.length >= 10) {
                        pin10.then(canvas => {
                            cluster.billboard.image = canvas.toDataURL();
                        })
                    } else {
                        cluster.billboard.image = singleDigitPins[clusteringEntities.length - 2];
                        // cluster.billboard.image = require("../../img/pinbuilder/camera.png");
                    }
                }
            );
        }
        let pixelRange = dataSource.clustering.pixelRange;
        dataSource.clustering.pixelRange = 0;
        dataSource.clustering.pixelRange = pixelRange;

    }

}

function combineNewIcon(image) {
    let canvas = document.createElement('canvas');
    debugger
    W = image.w;

    canvas.width = W
    canvas.height = W
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    W = W * this.ratio
    ctx.font = `bold ${this.ratio*20}px Arial`;

    ctx.drawImage(image.loadedDom, 0, 0, W, W);
    ctx.fillText(this.number, W / 2, W / 2);

    let result = canvas.toDataURL("image/png");

    return result
}