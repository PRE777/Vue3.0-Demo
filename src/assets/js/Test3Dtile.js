var Cesium = require('cesium/Cesium');

export function init_CzmlDataSource(viewer) {
    var scene = viewer.scene;
    var clock = viewer.clock;
    var entity;
    var positionProperty;
    var dataSourcePromise = Cesium.CzmlDataSource.load(
        "../../SampleData/ClampToGround.czml"
    );
    viewer.dataSources.add(dataSourcePromise).then(function(dataSource) {
        entity = dataSource.entities.getById("CesiumMilkTruck");
        positionProperty = entity.position;
    });
    var tileset = scene.primitives.add(
        new Cesium.Cesium3DTileset({
            url: Cesium.IonResource.fromAssetId(40866),
        })
    );
    viewer.camera.setView({
        destination: new Cesium.Cartesian3(
            1216403.8845586285, -4736357.493351395,
            4081299.715698949
        ),
        orientation: new Cesium.HeadingPitchRoll(
            4.2892217081808806, -0.4799070147502502,
            6.279789177843313
        ),
        endTransform: Cesium.Matrix4.IDENTITY,
    });
    if (scene.clampToHeightSupported) {
        tileset.initialTilesLoaded.addEventListener(start);
    } else {
        window.alert("This browser does not support clampToHeight.");
    }

    function start() {
        clock.shouldAnimate = true;
        var objectsToExclude = [entity];
        scene.postRender.addEventListener(function() {
            var position = positionProperty.getValue(clock.currentTime);
            entity.position = scene.clampToHeight(position, objectsToExclude);
        });
    }
}

export function multi_part_czml(viewer) {

    var statusDisplay = document.createElement("div");
    var fuelDisplay = document.createElement("div");
    var czmlPath = "../../SampleData/";
    var vehicleEntity;

    // Add a blank CzmlDataSource to hold our multi-part entity/entities.
    var dataSource = new Cesium.CzmlDataSource();
    viewer.dataSources.add(dataSource);
    // This demo shows how a single path can be broken up into several CZML streams.
    var partsToLoad = [{
            url: "MultipartVehicle_part1.czml",
            range: [0, 1500],
            requested: false,
            loaded: false,
        },
        {
            url: "MultipartVehicle_part2.czml",
            range: [1500, 3000],
            requested: false,
            loaded: false,
        },
        {
            url: "MultipartVehicle_part3.czml",
            range: [3000, 4500],
            requested: false,
            loaded: false,
        },
    ];

    function updateStatusDisplay() {
        var msg = "";
        partsToLoad.forEach(function(part) {
            msg += part.url + " - ";
            if (part.loaded) {
                msg += "Loaded.<br/>";
            } else if (part.requested) {
                msg += "Loading now...<br/>";
            } else {
                msg += "Not needed yet.<br/>";
            }
        });
        statusDisplay.innerHTML = msg;
    }

    // Helper function to mark a part as requested, and process it into the dataSource.
    function processPart(part) {
        part.requested = true;
        updateStatusDisplay();
        dataSource.process(czmlPath + part.url).then(function() {
            part.loaded = true;
            updateStatusDisplay();

            // Follow the vehicle with the camera.
            if (!viewer.trackedEntity) {
                viewer.trackedEntity = vehicleEntity = dataSource.entities.getById(
                    "Vehicle"
                );
            }
        });
    }

    // Load the first part up front.
    processPart(partsToLoad[0]);

    // Load a new section before the clock naturally gets there.
    // Note this can't predict when a user may fast-forward to it.
    var preloadTimeInSeconds = 100;

    viewer.clock.onTick.addEventListener(function(clock) {
        // This example uses time offsets from the start to identify which parts need loading.
        var timeOffset = Cesium.JulianDate.secondsDifference(
            clock.currentTime,
            clock.startTime
        );

        // Filter the list of parts to just the ones that need loading right now.
        // Then, process each part that needs loading.
        partsToLoad
            .filter(function(part) {
                return (!part.requested &&
                    timeOffset >= part.range[0] - preloadTimeInSeconds &&
                    timeOffset <= part.range[1]
                );
            })
            .forEach(function(part) {
                processPart(part);
            });

        if (vehicleEntity) {
            var fuel = vehicleEntity.properties.fuel_remaining.getValue(
                clock.currentTime
            );
            if (Cesium.defined(fuel)) {
                fuelDisplay.textContent = "Fuel: " + fuel.toFixed(2) + " gal";
            }
        }
    });

    // Add a reset button, for convenience.
    // Sandcastle.addToolbarButton("Reset demo", function() {
    //     // Put things back to the starting position.
    //     viewer.clock.currentTime = viewer.clock.startTime;
    //     viewer.clock.shouldAnimate = true;

    //     partsToLoad.forEach(function(part) {
    //         part.requested = false;
    //         part.loaded = false;
    //     });

    //     dataSource.entities.removeAll();
    //     processPart(partsToLoad[0]);
    // });

    // Show the status display below the reset button.
    // statusDisplay.style.background = "rgba(42, 42, 42, 0.7)";
    // statusDisplay.style.padding = "5px 10px";
    // document.getElementById("toolbar").appendChild(statusDisplay);

    // Show a multi-part custom property being read from CZML.
    // fuelDisplay.style.background = "rgba(42, 42, 42, 0.7)";
    // fuelDisplay.style.padding = "5px 10px";
    // fuelDisplay.style.marginTop = "5px";
    // document.getElementById("toolbar").appendChild(fuelDisplay);


}