let Cesium = require("cesium/Cesium");
var removeListener;
var entities;
export function addDataSources(viewer, data) {
    if (data == null || data == '') {
        return
    }
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

    let dataSourcePromise = Cesium.GeoJsonDataSource.load(data);
    dataSourcePromise.then((dataSource) => {
        entities = viewer.dataSources.add(dataSource)
        afterAddDataSource(dataSource)
    });


}


function afterAddDataSource(dataSource) {
    let pixelRange = 40; // 聚合距离 40像素
    let minimumClusterSize = 2; // 是每个聚合点的最小聚合个数，这个值最好是设置为2
    let enabled = true; // 是否聚合
    dataSource.clustering.enabled = enabled;
    dataSource.clustering.minimumClusterSize = minimumClusterSize;
    dataSource.clustering.pixelRange = pixelRange;

    let pinBuilder = new Cesium.PinBuilder();

    let pin100 = pinBuilder.fromText("100+", Cesium.Color.RED, 48).toDataURL();
    let pin50 = pinBuilder.fromText("50+", Cesium.Color.RED, 48).toDataURL();
    let pin40 = pinBuilder.fromText("40+", Cesium.Color.ORANGE, 48).toDataURL();
    let pin30 = pinBuilder.fromText("30+", Cesium.Color.YELLOW, 48).toDataURL();
    let pin20 = pinBuilder.fromText("20+", Cesium.Color.GREEN, 48).toDataURL();
    let pin10 = pinBuilder.fromText("10+", Cesium.Color.BLUE, 48).toDataURL();

    // let pin100 = pinBuilder.fromUrl(Cesium.buildModuleUrl("../../img/pinbuilder/red.png"), Cesium.Color.RED, 48).toDataURL();
    // let pin100 = pinBuilder.fromUrl(Cesium.buildModuleUrl("./red.png"), Cesium.Color.RED, 48).toDataURL();

    let singleDigitPins = new Array(8);
    for (let i = 0; i < singleDigitPins.length; i++) {
        singleDigitPins[i] = pinBuilder.fromText("" + (i + 2), Cesium.Color.VIOLET, 48).toDataURL();
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
                        cluster.billboard.image = pin100;
                    } else if (clusteringEntities.length >= 50) {
                        cluster.billboard.image = pin50;
                    } else if (clusteringEntities.length >= 40) {
                        cluster.billboard.image = pin40;
                    } else if (clusteringEntities.length >= 30) {
                        cluster.billboard.image = pin30;
                    } else if (clusteringEntities.length >= 20) {
                        cluster.billboard.image = pin20;
                    } else if (clusteringEntities.length >= 10) {
                        cluster.billboard.image = pin10;
                    } else {
                        cluster.billboard.image = singleDigitPins[clusteringEntities.length - 2];
                    }
                }
            );
        }
        let pixelRange = dataSource.clustering.pixelRange;
        dataSource.clustering.pixelRange = 0;
        dataSource.clustering.pixelRange = pixelRange;

    }

}