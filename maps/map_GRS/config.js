// Cesium ionのアクセストークン
Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyOGRiZmY3Yy0wNzRjLTQ2MjktOGQ0Ni0xYmI5MzFmNDUxZDAiLCJpZCI6MzU0MDY0LCJpYXQiOjE3NjE0NTQ3MDh9.p9q4yTuNNbVz7U09nx04n-LQG0sxXh8TDw22H3FSIV0";

(async function () {
    // === 追加: モバイルでも読みやすい最小スケール ===
    function computeUiScale() {
        const small = window.matchMedia("(max-width: 600px)").matches;
        const tiny = window.matchMedia("(max-width: 380px)").matches;
        let base = 1.0;
        if (small) base = 1.25;
        if (tiny) base = 1.4;
        return base;
    }
    let uiScale = computeUiScale();
    const px = (n) => `${Math.round(n * uiScale)}px`;

    // ラベル/ポイントに一括適用（存在するプロパティのみ触る）
    function applyCalloutStyle(entity, textFontPxBase = 18) {
        if (entity.point) {
            entity.point.pixelSize = Math.round(8 * uiScale);
            entity.point.outlineWidth = Math.round(2 * uiScale);
        }
        if (entity.label) {
            entity.label.font = `bold ${px(textFontPxBase)} sans-serif`;
            entity.label.outlineWidth = Math.max(2, Math.round(3 * uiScale));
            entity.label.pixelOffset = new Cesium.Cartesian2(0, -Math.round(8 * uiScale));
            entity.label.scaleByDistance = new Cesium.NearFarScalar(
                300.0, 1.0 * uiScale,
                8000.0, 0.7 * uiScale
            );
        }
    }
    // ===== Viewer =====
    const viewer = new Cesium.Viewer("cesiumContainer", {
        baseLayerPicker: false,
        timeline: false,
        animation: false,
        geocoder: false,
        homeButton: false,
    });

    // 既定ベースレイヤーを完全に除去（ボタンでの誤動作防止）
    while (viewer.imageryLayers.length > 0) {
        viewer.imageryLayers.remove(viewer.imageryLayers.get(0), false);
    }

    // 任意の見た目
    viewer.scene.globe.enableLighting = true;
    viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date("2024-06-21T12:00:00Z"));
    viewer.clock.shouldAnimate = false;

    // ===== 地形 =====
    const terrainProvider = await Cesium.CesiumTerrainProvider.fromIonAssetId(2767062);
    viewer.terrainProvider = terrainProvider;

    // ===== 画像レイヤー定義 =====
    const layers = viewer.imageryLayers;

    // 衛星（Ion）
    const satelliteProvider = await Cesium.IonImageryProvider.fromAssetId(3830183);

    // 地理院 標準地図
    const gsiProvider = new Cesium.UrlTemplateImageryProvider({
        url: "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
        credit: new Cesium.Credit(
            '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>'
        ),
        minimumLevel: 2,
        maximumLevel: 18,
    });

    // 古地図4枚
    const providersOld = [
        new Cesium.UrlTemplateImageryProvider({
            url: "https://mapwarper.h-gis.jp/maps/tile/845/{z}/{x}/{y}.png", // 熊川
            credit: new Cesium.Credit("『熊川』五万分一地形圖, 明治26年測図/大正9年修正, https://purl.stanford.edu/cb173fj2995"),
            minimumLevel: 2,
            maximumLevel: 18,
        }),
        new Cesium.UrlTemplateImageryProvider({
            url: "https://mapwarper.h-gis.jp/maps/tile/846/{z}/{x}/{y}.png", // 竹生島
            credit: new Cesium.Credit("『竹生島』五万分一地形圖, 明治26年測図/大正9年修正/昭和7年鉄道補入/昭和26年応急修正, https://purl.stanford.edu/zt128hp6132"),
            minimumLevel: 2,
            maximumLevel: 18,
        }),
        new Cesium.UrlTemplateImageryProvider({
            url: "https://mapwarper.h-gis.jp/maps/tile/816/{z}/{x}/{y}.png", // 彦根西部
            credit: new Cesium.Credit("『彦根西部』五万分一地形圖, 明治26年測図/大正9年修正/昭和7年鉄道補入, https://purl.stanford.edu/yn560bk7442"),
            minimumLevel: 2,
            maximumLevel: 18,
        }),
        new Cesium.UrlTemplateImageryProvider({
            url: "https://mapwarper.h-gis.jp/maps/tile/815/{z}/{x}/{y}.png", // 北小松
            credit: new Cesium.Credit("『北小松』五万分一地形圖, 明治26年測図/大正9年修正/昭和7年鉄道補入, https://purl.stanford.edu/hf547qg6944"),
            minimumLevel: 2,
            maximumLevel: 18,
        }),
    ];

    // レイヤーを一度だけ追加して参照保持
    const layerSatellite = layers.addImageryProvider(satelliteProvider); // 衛星
    const layerGSI = layers.addImageryProvider(gsiProvider); // 地理院

    const layerOlds = providersOld.map((p) => layers.addImageryProvider(p)); // 古地図4枚

    // 見た目調整（任意）
    [layerSatellite, layerGSI, ...layerOlds].forEach((l) => {
        l.alpha = 1.0;
        l.brightness = 0.95;
    });

    // まず全OFF → 衛星のみON
    function allOff() {
        layerSatellite.show = false;
        layerGSI.show = false;
        layerOlds.forEach((l) => (l.show = false));
    }
    allOff();
    layerSatellite.show = true;

    // 排他的切替
    function showSatellite() {
        allOff();
        layerSatellite.show = true;
        layers.lowerToBottom(layerSatellite);
        setActive("btn-satellite");
    }
    function showGSI() {
        allOff();
        layerGSI.show = true;
        layers.lowerToBottom(layerGSI);
        setActive("btn-gsi");
    }
    function showOldMaps() {
        allOff();
        layerOlds.forEach((l) => (l.show = true));
        layers.raiseToTop(layerOlds[layerOlds.length - 1]);
        setActive("btn-old");
    }

    // アクティブ状態（任意・見た目用）
    function setActive(id) {
        const ids = ["btn-gsi", "btn-satellite", "btn-old"];
        ids.forEach((x) => {
            const el = document.getElementById(x);
            if (el) el.classList.toggle("active", x === id);
        });
    }

    // ボタンにイベント付与（存在する場合のみ）
    const btnSat = document.getElementById("btn-satellite");
    const btnGsi = document.getElementById("btn-gsi");
    const btnOld = document.getElementById("btn-old");
    if (btnSat) btnSat.onclick = showSatellite;
    if (btnGsi) btnGsi.onclick = showGSI;
    if (btnOld) btnOld.onclick = showOldMaps;
    setActive("btn-satellite");

    // ===== ルート（GeoJSON） =====
    const routeGeojson = {
        type: "FeatureCollection",
        name: "route",
        crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
        features: [
            {
                type: "Feature",
                properties: { name: "A", style: "Line" },
                geometry: {
                    type: "LineString",
                    coordinates: [
                        [135.97661048267534, 35.36482341576319],
                        [135.97679996825266, 35.36382759910151],
                        [135.97890536355646, 35.36310648281633],
                        [135.97913695703988, 35.362144984416524],
                        [135.98130551420277, 35.36180158935581],
                        [135.9829898304458, 35.36059969514149],
                        [135.98608476154237, 35.35939778303565],
                        [135.98962182565276, 35.358813990700185],
                        [135.99124298003665, 35.35816151191858],
                        [135.98890599124945, 35.35292432018871],
                        [135.9893691782163, 35.352769774945934],
                        [135.98823226475224, 35.35010811602774],
                        [135.99317994371614, 35.347669616032995],
                        [135.99682227759166, 35.34643316537488],
                        [135.9976223278071, 35.34667358781837],
                        [135.99804340686785, 35.34665641481042],
                        [135.99854870174076, 35.34730898654601],
                        [136.00238052119363, 35.34698270133717],
                        [136.00865459919893, 35.34562602765274],
                        [136.00966518894475, 35.34480170846408],
                        [136.01120212751647, 35.34475018823551],
                        [136.01259168841698, 35.345763413366434],
                        [136.01587610509094, 35.345368428809813],
                        [136.02069746033658, 35.34425215766549],
                        [136.02012900360455, 35.34311869733738],
                        [136.02073956824268, 35.3452825623463],
                        [136.02153961845812, 35.345969491498906],
                        [136.02217123704924, 35.34741202370657],
                        [136.02358185190278, 35.34758375201545],
                        [136.0242134704939, 35.34863128679389],
                        [136.02572935511262, 35.34919798027394],
                        [136.026508351375, 35.3494040496446],
                        [136.02690837648274, 35.35167077802412],
                        [136.02747683321474, 35.352271793818595],
                        [136.02949801270637, 35.3589856947664],
                        [136.0300033075793, 35.35919173916392],
                        [136.03023490106267, 35.360273463624686],
                        [136.03002436153236, 35.36035931415163],
                        [136.0325087279908, 35.36726139780711],
                        [136.03341404797146, 35.36980231481287],
                        [136.0323824042726, 35.37163927931583],
                        [136.0323402963665, 35.37694392340082],
                        [136.0332666703002, 35.38020550553897],
                        [136.03280348333337, 35.38223105334142],
                        [136.03351931773665, 35.38648797110119],
                        [136.0351194181675, 35.386590958263845],
                        [136.0337930191261, 35.38909693869335],
                        [136.0337930191261, 35.392272213020235],
                        [136.03425620609298, 35.39498396995367],
                        [136.03514047212056, 35.39743820299364],
                        [136.03629843953766, 35.39989236133399],
                        [136.0366563567393, 35.40056166428032],
                        [136.0360457921012, 35.40171147944664],
                        [136.0373721911426, 35.401883092244105],
                        [136.03796170182764, 35.40262102311042],
                        [136.03838278088838, 35.4031015326014],
                        [136.03916177715078, 35.40454304388949],
                        [136.0398986655071, 35.40565848136188],
                        [136.04328835194625, 35.40833546831901],
                        [136.0443199956451, 35.409450853310375],
                        [136.0457937723577, 35.408060909645996],
                    ],
                },
            },
            {
                type: "Feature",
                properties: { name: "B", style: "arrow" },
                geometry: {
                    type: "MultiLineString",
                    coordinates: [
                        [
                            [135.979684359818748, 35.36225658749678, 800], [135.980408369168231, 35.361933154084859, 800], [135.98113787574701, 35.361622318337858, 800], [135.981872660377007, 35.361324173645457, 800], [135.982612502294387, 35.361038809584322, 800], [135.98335717921583, 35.360766311891247, 800], [135.984106467405439, 35.360506762437339, 800], [135.984860141741763, 35.360260239203456, 800], [135.98561797578563, 35.36002681625677, 800], [135.986379741848083, 35.359806563728505, 800], [135.98714521105876, 35.359599547792868, 800], [135.987914153434701, 35.359405830647184, 800], [135.988686337949531, 35.359225470493193, 800], [135.989461532602718, 35.359058521519565, 800], [135.990239504489296, 35.358905033885605, 800], [135.99102001986995, 35.358765053706229, 800], [135.991802844241221, 35.358638623038054, 800], [135.992587742405817, 35.358525779866802, 800], [135.993374478543444, 35.358426558095857, 800], [135.994162816281602, 35.358340987536117, 800], [135.994952518766553, 35.358269093896993, 800], [135.995743348734578, 35.358210898778715, 800], [135.996535068583142, 35.358166419665828, 800], [135.997327440442376, 35.35813566992195, 800], [135.998120226246584, 35.358118658785756, 800], [135.998913187805584, 35.358115391368187, 800], [135.9997060868765, 35.358125868650923, 800], [136.000498685235129, 35.358150087486109, 800], [136.001290744747706, 35.358188040597256, 800], [136.00208202744227, 35.358239716581465, 800], [136.002872295580374, 35.358305099912855, 800], [136.003661311728251, 35.358384170947183, 800], [136.004448838828381, 35.358476905927802, 800], [136.005234640270629, 35.358583276992768, 800], [136.006018479963274, 35.358703252183204, 800], [136.00680012240403, 35.35883679545293, 800], [136.007579332750794, 35.358983866679267, 800], [136.008355876892097, 35.359144421675104, 800], [136.009129521517593, 35.359318412202171, 800], [136.009900034188092, 35.35950578598554, 800], [136.01066718340536, 35.359706486729316, 800], [136.011430738681668, 35.359920454133558, 800], [136.012190470609198, 35.360147623912404, 800], [136.012946150928684, 35.360387927813377, 800], [136.013697552598273, 35.360641293637876, 800], [136.014444449861571, 35.360907645262913, 800], [136.015186618315539, 35.361186902663924, 800], [136.015923834977883, 35.361478981938866, 800], [136.016655878354072, 35.361783795333395, 800], [136.017382528503845, 35.362101251267234, 800], [136.018103567107318, 35.362431254361702, 800], [136.018818777530669, 35.362773705468356, 800], [136.019527944890996, 35.363128501698782, 800], [136.020230856121117, 35.363495536455517, 800], [136.020927300033463, 35.36387469946407, 800], [136.021617067383517, 35.364265876806044, 800], [136.022299950932791, 35.364668950953373, 800], [136.022975745510905, 35.365083800803639, 800], [136.023644248077431, 35.365510301716455, 800], [136.0243052577828, 35.365948325550882, 800], [136.024958576028553, 35.366397740703981, 800], [136.025604006527232, 35.366858412150307, 800], [136.026241355361179, 35.367330201482503, 800], [136.026870431040805, 35.367812966952876, 800], [136.027491044562225, 35.368306563515986, 800], [136.028103009463962, 35.368810842872222, 800], [136.028706141882992, 35.369325653512362, 800], [136.02930026061, 35.369850840763085, 800], [136.029885187143776, 35.370386246833455, 800], [136.030460745744875, 35.370931710862315, 800], [136.031026763488455, 35.371487068966637, 800], [136.031583070316174, 35.372052154290735, 800], [136.032129499087347, 35.372626797056419, 800], [136.032665885629001, 35.373210824613984, 800], [136.033192068785496, 35.373804061494099, 800], [136.033707890466616, 35.374406329460513, 800], [136.034213195695315, 35.375017447563629, 800], [136.034707832654107, 35.375637232194826, 800], [136.035191652730845, 35.376265497141681, 800], [136.03566451056318, 35.37690205364386, 800], [136.036126264082469, 35.37754671044987, 800], [136.036576774556181, 35.3781992738745, 800], [136.03701590662979, 35.378859547857026, 800], [136.037443528367447, 35.379527334020104, 800], [136.037859511291401, 35.380202431729366, 800], [136.03826373042088, 35.380884638153745, 800], [136.038656064309407, 35.381573748326346, 800], [136.039036395081496, 35.382269555206094, 800], [136.039404608467862, 35.382971849739874, 800], [136.039760593839929, 35.383680420925415, 800], [136.040104244242912, 35.384395055874606, 800], [136.040435456428128, 35.385115539877525, 800], [136.040754130883812, 35.385841656466908, 800], [136.04106017186524, 35.386573187483194, 800], [136.041353487423237, 35.387309913140079, 800], [136.041633989432086, 35.38805161209055, 800], [136.04190159361579, 35.388798061493361, 800], [136.042156219573428, 35.389549037080037, 800], [136.042397790803449, 35.390304313222202, 800], [136.042626234726441, 35.3910636629994, 800], [136.042841482707161, 35.391826858267258, 800], [136.043043470074991, 35.392593669726054, 800], [136.043232136143388, 35.39336386698956, 800], [136.043407424228235, 35.394137218654329, 800], [136.043569281664759, 35.394913492369156, 800], [136.043717659823358, 35.395692454904932, 800], [136.043852514124239, 35.396473872224696, 800], [136.043973804050864, 35.397257509553938, 800], [136.044081493162054, 35.398043131451182, 800], [136.044175549102874, 35.39883050187867, 800], [136.044255943614559, 35.399619384273315, 800], [136.044322652542775, 35.400409541617762, 800], [136.044375655845045, 35.401200736511605, 800], [136.044414937596684, 35.401992731242693, 800], [136.044440485995608, 35.402785287858592, 800], [136.044452293365879, 35.403578168238028, 800], [136.044450356159984, 35.404371134162467, 800], [136.044434674960002, 35.40516394738767, 800], [136.044405254477255, 35.405956369715277, 800], [136.044362103551066, 35.406748163064364, 800],
                        ],
                    ],
                },
            },
        ],
    };

    // ===== GeoJSON読込＋スタイル & 線B参照収集 =====
    const guideBEntities = []; // B（空中ガイド）をここに集める

    try {
        const ds = await Cesium.GeoJsonDataSource.load(routeGeojson);
        viewer.dataSources.add(ds);

        for (const entity of ds.entities.values) {
            const p = entity.properties;
            const style = p?.style?.getValue?.();
            const name = entity.name ?? p?.name?.getValue?.();

            if (entity.polyline) {
                if (style === "arrow" || name === "B") {
                    const yellowTrans = Cesium.Color.YELLOW.withAlpha(0.5);
                    entity.polyline.width = 25;
                    entity.polyline.material = new Cesium.PolylineArrowMaterialProperty(yellowTrans);
                    entity.polyline.clampToGround = false;
                    entity.polyline.heightReference = Cesium.HeightReference.NONE;

                    guideBEntities.push(entity); // Bを収集
                } else {
                    entity.polyline.material = new Cesium.PolylineDashMaterialProperty({
                        color: Cesium.Color.RED,
                        gapColor: Cesium.Color.TRANSPARENT,
                        dashLength: 17,
                    });
                    entity.polyline.width = 4;
                    entity.polyline.clampToGround = true;
                }
            }
        }

        // ===== コールアウト関数 =====
        async function addCallout(viewer, lon, lat, lift, text) {
            const carto = Cesium.Cartographic.fromDegrees(lon, lat);
            const [updated] = await Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [carto]);
            const groundH = (updated && updated.height) || 0;

            const groundPos = Cesium.Cartesian3.fromDegrees(lon, lat, groundH);
            const airPos = Cesium.Cartesian3.fromDegrees(lon, lat, groundH + lift);

            // 引出線
            viewer.entities.add({
                polyline: {
                    positions: [groundPos, airPos],
                    width: Math.max(2, Math.round(2 * uiScale)),
                    material: Cesium.Color.BLUE.withAlpha(0.9),
                    clampToGround: false,
                },
            });

            // 地面ポイント
            const pt = viewer.entities.add({
                position: groundPos,
                point: {
                    pixelSize: Math.round(8 * uiScale),
                    color: Cesium.Color.RED,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: Math.round(2 * uiScale),
                },
            });

            // 空中ラベル
            const lb = viewer.entities.add({
                position: airPos,
                label: {
                    text: text,
                    font: `bold ${px(18)} sans-serif`,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: Math.max(2, Math.round(3 * uiScale)),
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -Math.round(8 * uiScale)),
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    scaleByDistance: new Cesium.NearFarScalar(300.0, 1.0 * uiScale, 8000.0, 0.7 * uiScale),
                },
            });

            // 念のためスタイル適用（将来の一括更新にも対応）
            applyCalloutStyle(pt);
            applyCalloutStyle(lb);
        }

        // ===== 11個のポイント =====
        const calloutPoints = [
            { lon: 135.979569, lat: 35.363215, lift: 150, text: "上古賀" },
            { lon: 135.992452, lat: 35.358096, lift: 150, text: "下古賀" },
            { lon: 135.999059, lat: 35.346819, lift: 150, text: "南古賀" },
            { lon: 136.036103, lat: 35.401112, lift: 150, text: "今津" },
            { lon: 136.002362, lat: 35.387109, lift: 150, text: "饗庭野演習場" },
            { lon: 136.031997, lat: 35.372335, lift: 150, text: "饗庭" },
            { lon: 136.029968, lat: 35.359905, lift: 150, text: "熊野本" },
            { lon: 136.013546, lat: 35.358712, lift: 150, text: "大寶寺山" },
            { lon: 136.021757, lat: 35.346550, lift: 150, text: "安曇川" },
            { lon: 136.066304, lat: 35.353863, lift: 150, text: "外ヶ濱" },
            { lon: 136.027090, lat: 35.351784, lift: 150, text: "安井川" },
            { lon: 136.020389, lat: 35.343009, lift: 150, text: "十八川" },
            { lon: 136.008685, lat: 35.344818, lift: 150, text: "庄堺" },
            { lon: 136.033106, lat: 35.386475, lift: 150, text: "木津" },
            { lon: 136.043913, lat: 35.409439, lift: 150, text: "濱分" }
        ];
        for (const p of calloutPoints) await addCallout(viewer, p.lon, p.lat, p.lift, p.text);

        viewer.flyTo(ds);
    } catch (e) {
        console.error("GeoJSON読み込みエラー:", e);
    }

    // ===== 線B（空中ガイド）の表示トグル =====
    function setGuideBVisible(flag) {
        guideBEntities.forEach((ent) => (ent.show = flag));
    }
    // 既定：表示ON
    setGuideBVisible(true);

    // ボタン（id="btn-guideB" があれば利用）／なければ自動生成
    (function initGuideBToggle() {
        let btn = document.getElementById("btn-guideB");
        if (!btn) {
            // 自動で小さなトグルを作る（HTMLを触らずに済む）
            const holder = document.createElement("div");
            holder.style.position = "absolute";
            holder.style.top = "10px";
            holder.style.right = "10px";
            holder.style.zIndex = "10";
            holder.style.background = "rgba(0,0,0,.45)";
            holder.style.backdropFilter = "blur(6px)";
            holder.style.borderRadius = "12px";
            holder.style.padding = "6px";

            btn = document.createElement("button");
            btn.id = "btn-guideB";
            btn.textContent = "空中ガイド B";
            btn.style.border = "none";
            btn.style.padding = "6px 10px";
            btn.style.borderRadius = "8px";
            btn.style.cursor = "pointer";
            btn.style.color = "#fff";
            btn.style.background = "#2d8cff";

            holder.appendChild(btn);
            document.body.appendChild(holder);
        } else {
            // 既存スタイルに合わせて .active 反映
            btn.classList.add("active");
        }

        let visible = true;
        const refreshLook = () => {
            if (btn.classList) {
                btn.classList.toggle("active", visible);
            } else {
                // 生成ボタン用（色でON/OFF表現）
                btn.style.background = visible ? "#2d8cff" : "rgba(255,255,255,.12)";
            }
            btn.textContent = visible ? "→:ON" : "→:OFF";
        };
        refreshLook();

        btn.onclick = () => {
            visible = !visible;
            setGuideBVisible(visible);
            refreshLook();
        };
    })();
})();
