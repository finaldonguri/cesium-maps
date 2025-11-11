/**
 * Cesium地図共通ユーティリティ
 * 全ての地図で使用する共通機能を提供
 */

class CesiumMapBuilder {
    constructor(containerId, config) {
        this.containerId = containerId;
        this.config = config;
        this.viewer = null;
        this.entities = {
            lineA: null,
            lineB: [],
            points: [],
            labels: []
        };
        this.layers = {
            satellite: null,
            gsi: null,
            oldMaps: []
        };
        this.uiScale = this.computeUiScale();
    }

    // モバイル対応UIスケール計算
    computeUiScale() {
        const small = window.matchMedia("(max-width: 600px)").matches;
        const tiny = window.matchMedia("(max-width: 380px)").matches;
        let base = 1.0;
        if (small) base = 1.25;
        if (tiny) base = 1.4;
        return base;
    }

    px(n) {
        return `${Math.round(n * this.uiScale)}px`;
    }

    // Viewerの初期化
    async initViewer() {
        Cesium.Ion.defaultAccessToken = this.config.cesiumToken;

        this.viewer = new Cesium.Viewer(this.containerId, {
            baseLayerPicker: false,
            timeline: false,
            animation: false,
            geocoder: false,
            homeButton: false,
        });

        // 既定ベースレイヤーを完全に除去
        while (this.viewer.imageryLayers.length > 0) {
            this.viewer.imageryLayers.remove(this.viewer.imageryLayers.get(0), false);
        }

        // 見た目調整
        this.viewer.scene.globe.enableLighting = true;
        this.viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date("2024-06-21T12:00:00Z"));
        this.viewer.clock.shouldAnimate = false;

        // 3D地形
        if (this.config.terrain.enabled) {
            const terrainProvider = await Cesium.CesiumTerrainProvider.fromIonAssetId(
                this.config.terrain.assetId
            );
            this.viewer.terrainProvider = terrainProvider;
        }

        return this.viewer;
    }

    // 画像レイヤーの初期化
    async initLayers(layerDefinitions) {
        const layers = this.viewer.imageryLayers;

        // 衛星
        if (this.config.layers.satellite) {
            const satelliteProvider = await Cesium.IonImageryProvider.fromAssetId(
                layerDefinitions.satellite.assetId
            );
            this.layers.satellite = layers.addImageryProvider(satelliteProvider);
        }

        // 地理院
        if (this.config.layers.gsi) {
            const gsiProvider = new Cesium.UrlTemplateImageryProvider(layerDefinitions.gsi);
            this.layers.gsi = layers.addImageryProvider(gsiProvider);
        }

        // 古地図
        if (this.config.layers.oldMaps && this.config.layers.oldMaps.length > 0) {
            for (const oldMapUrl of this.config.layers.oldMaps) {
                const provider = new Cesium.UrlTemplateImageryProvider(
                    layerDefinitions.oldMaps[oldMapUrl]
                );
                this.layers.oldMaps.push(layers.addImageryProvider(provider));
            }
        }

        // 見た目調整
        const allLayers = [
            this.layers.satellite,
            this.layers.gsi,
            ...this.layers.oldMaps
        ].filter(Boolean);

        allLayers.forEach((l) => {
            l.alpha = 1.0;
            l.brightness = 0.95;
        });

        // 初期表示: 衛星のみON
        this.showLayer('satellite');
    }

    // レイヤー表示切替
    showLayer(type) {
        // 全OFF
        if (this.layers.satellite) this.layers.satellite.show = false;
        if (this.layers.gsi) this.layers.gsi.show = false;
        this.layers.oldMaps.forEach(l => l.show = false);

        // 指定レイヤーのみON
        const layers = this.viewer.imageryLayers;
        switch (type) {
            case 'satellite':
                if (this.layers.satellite) {
                    this.layers.satellite.show = true;
                    layers.lowerToBottom(this.layers.satellite);
                }
                break;
            case 'gsi':
                if (this.layers.gsi) {
                    this.layers.gsi.show = true;
                    layers.lowerToBottom(this.layers.gsi);
                }
                break;
            case 'oldMaps':
                this.layers.oldMaps.forEach(l => l.show = true);
                if (this.layers.oldMaps.length > 0) {
                    layers.raiseToTop(this.layers.oldMaps[this.layers.oldMaps.length - 1]);
                }
                break;
        }
    }

    // レイヤー切替ボタンの作成
    createLayerButtons() {
        const toolbar = document.querySelector('.layer-toolbar');
        if (!toolbar) return;

        const buttons = [
            { id: 'btn-gsi', label: '地理院', type: 'gsi', enabled: this.config.layers.gsi },
            { id: 'btn-satellite', label: '衛星', type: 'satellite', enabled: this.config.layers.satellite },
            { id: 'btn-old', label: '古地図', type: 'oldMaps', enabled: this.config.layers.oldMaps && this.config.layers.oldMaps.length > 0 }
        ];

        buttons.forEach(btn => {
            if (!btn.enabled) return;

            const button = document.getElementById(btn.id);
            if (button) {
                button.onclick = () => {
                    this.showLayer(btn.type);
                    this.setActiveButton(btn.id);
                };
            }
        });

        // 初期アクティブ状態
        this.setActiveButton('btn-satellite');
    }

    setActiveButton(activeId) {
        const ids = ['btn-gsi', 'btn-satellite', 'btn-old'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.toggle('active', id === activeId);
        });
    }

    // 線A（赤い点線）の追加
    async addLineA() {
        if (!this.config.lineA.enabled) return;

        const geojson = {
            type: "FeatureCollection",
            features: [{
                type: "Feature",
                properties: { name: "A", style: "Line" },
                geometry: {
                    type: "LineString",
                    coordinates: this.config.lineA.coordinates
                }
            }]
        };

        const ds = await Cesium.GeoJsonDataSource.load(geojson);
        await this.viewer.dataSources.add(ds);

        for (const entity of ds.entities.values) {
            if (entity.polyline) {
                entity.polyline.material = new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.RED,
                    gapColor: Cesium.Color.TRANSPARENT,
                    dashLength: 17,
                });
                entity.polyline.width = 4;
                entity.polyline.clampToGround = true;
                entity.show = this.config.lineA.defaultVisible;
                this.entities.lineA = entity;
            }
        }

        // トグルボタン作成
        if (this.config.lineA.toggleable) {
            this.createLineAToggle();
        }
    }

    // 線B（黄色い半透明空中矢印）の追加
    async addLineB() {
        if (!this.config.lineB.enabled) return;

        const geojson = {
            type: "FeatureCollection",
            features: [{
                type: "Feature",
                properties: { name: "B", style: "arrow" },
                geometry: {
                    type: "MultiLineString",
                    coordinates: this.config.lineB.coordinates
                }
            }]
        };

        const ds = await Cesium.GeoJsonDataSource.load(geojson);
        await this.viewer.dataSources.add(ds);

        for (const entity of ds.entities.values) {
            if (entity.polyline) {
                const yellowTrans = Cesium.Color.YELLOW.withAlpha(0.5);
                entity.polyline.width = 25;
                entity.polyline.material = new Cesium.PolylineArrowMaterialProperty(yellowTrans);
                entity.polyline.clampToGround = false;
                entity.polyline.heightReference = Cesium.HeightReference.NONE;
                entity.show = this.config.lineB.defaultVisible;
                this.entities.lineB.push(entity);
            }
        }

        // トグルボタン作成
        if (this.config.lineB.toggleable) {
            this.createLineBToggle();
        }
    }

    // 引出線付きポイント・ラベルの追加
    async addPoints() {
        if (!this.config.points || this.config.points.length === 0) return;

        for (const p of this.config.points) {
            await this.addCallout(p.longitude, p.latitude, p.height, p.name);
        }
    }

    // コールアウト追加（引出線付きポイント＋ラベル）
    async addCallout(lon, lat, lift, text) {
        const carto = Cesium.Cartographic.fromDegrees(lon, lat);
        const [updated] = await Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, [carto]);
        const groundH = (updated && updated.height) || 0;

        const groundPos = Cesium.Cartesian3.fromDegrees(lon, lat, groundH);
        const airPos = Cesium.Cartesian3.fromDegrees(lon, lat, groundH + lift);

        // 引出線
        this.viewer.entities.add({
            polyline: {
                positions: [groundPos, airPos],
                width: Math.max(2, Math.round(2 * this.uiScale)),
                material: Cesium.Color.BLUE.withAlpha(0.9),
                clampToGround: false,
            },
        });

        // 地面ポイント
        const pt = this.viewer.entities.add({
            position: groundPos,
            point: {
                pixelSize: Math.round(8 * this.uiScale),
                color: Cesium.Color.RED,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: Math.round(2 * this.uiScale),
            },
        });

        // 空中ラベル
        const lb = this.viewer.entities.add({
            position: airPos,
            label: {
                text: text,
                font: `bold ${this.px(18)} sans-serif`,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: Math.max(2, Math.round(3 * this.uiScale)),
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -Math.round(8 * this.uiScale)),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                scaleByDistance: new Cesium.NearFarScalar(300.0, 1.0 * this.uiScale, 8000.0, 0.7 * this.uiScale),
            },
        });

        this.entities.points.push(pt);
        this.entities.labels.push(lb);
    }

    // 線Aトグルボタン作成
    createLineAToggle() {
        // 実装省略（必要に応じて追加）
    }

    // 線Bトグルボタン作成
    createLineBToggle() {
        const holder = document.createElement("div");
        holder.style.position = "absolute";
        holder.style.top = "10px";
        holder.style.right = "10px";
        holder.style.zIndex = "10";
        holder.style.background = "rgba(0,0,0,.45)";
        holder.style.backdropFilter = "blur(6px)";
        holder.style.borderRadius = "12px";
        holder.style.padding = "6px";

        const btn = document.createElement("button");
        btn.id = "btn-guideB";
        btn.textContent = "空中ガイド B";
        btn.style.border = "none";
        btn.style.padding = "6px 10px";
        btn.style.borderRadius = "8px";
        btn.style.cursor = "pointer";
        btn.style.color = "#fff";
        btn.style.background = "#2d8cff";
        btn.classList.add("active");

        holder.appendChild(btn);
        document.body.appendChild(holder);

        let visible = this.config.lineB.defaultVisible;
        const refreshLook = () => {
            btn.classList.toggle("active", visible);
            btn.textContent = visible ? "↑:ON" : "↑:OFF";
        };
        refreshLook();

        btn.onclick = () => {
            visible = !visible;
            this.entities.lineB.forEach(ent => ent.show = visible);
            refreshLook();
        };
    }

    // 初期ビュー設定
    flyToInitialView() {
        if (this.config.initialView) {
            this.viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(
                    this.config.initialView.longitude,
                    this.config.initialView.latitude,
                    this.config.initialView.height
                ),
                duration: 2
            });
        }
    }

    // 全初期化（一括実行）
    async init(layerDefinitions) {
        await this.initViewer();
        await this.initLayers(layerDefinitions);
        this.createLayerButtons();
        await this.addLineA();
        await this.addLineB();
        await this.addPoints();
        this.flyToInitialView();
        return this.viewer;
    }
}

// グローバルに公開
window.CesiumMapBuilder = CesiumMapBuilder;