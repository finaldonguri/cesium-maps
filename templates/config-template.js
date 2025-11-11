/**
 * 新規地図作成用のコンフィグテンプレート
 * このファイルをコピーして、各地図のconfig.jsとして使用してください
 */

const MAP_CONFIG = {
    // Cesium Ionアクセストークン
    cesiumToken: "YOUR_CESIUM_TOKEN_HERE",

    // 初期表示位置
    initialView: {
        longitude: 135.0,    // 経度
        latitude: 35.0,      // 緯度
        height: 10000        // カメラ高度（メートル）
    },

    // 3D地形
    terrain: {
        enabled: true,
        assetId: 2767062     // Cesium World Terrain
    },

    // 線A（赤い点線）
    lineA: {
        enabled: true,           // false: 使用しない
        toggleable: false,       // true: ON/OFF切替ボタン表示
        defaultVisible: true,    // 初期表示状態
        coordinates: [
            // [経度, 緯度] の配列
            // 例: [135.0, 35.0], [135.1, 35.1]
        ]
    },

    // 線B（黄色い半透明空中矢印）
    lineB: {
        enabled: true,
        toggleable: true,
        defaultVisible: false,
        coordinates: [
            [
                // [経度, 緯度, 高度] の配列
                // 例: [135.0, 35.0, 800], [135.1, 35.1, 800]
            ]
        ]
    },

    // 引出線付きポイント・ラベル
    points: [
        // { longitude: 135.0, latitude: 35.0, height: 150, name: "ポイント名" },
    ],

    // 画像レイヤー設定
    layers: {
        satellite: true,         // 衛星画像
        gsi: true,              // 地理院地図
        oldMaps: [              // 古地図（使用しない場合は空配列 [] ）
            // 'kumakawa',
            // 'chikubushima',
            // 'hikone_west',
            // 'kitakomatsu'
        ]
    }
};

// グローバルに公開
window.MAP_CONFIG = MAP_CONFIG;