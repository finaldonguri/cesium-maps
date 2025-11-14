/**
 * 画像レイヤー定義
 * 地理院、衛星、古地図などのレイヤー設定を一元管理
 */

const LAYER_DEFINITIONS = {
    // 衛星画像（Cesium Ion）
    satellite: {
        assetId: 3830183,
        type: 'ion'
    },
    
    // Google Photorealistic 3D Tiles（Cesium Ion）  ← これが追加されているか確認
    googlePhotorealistic3DTiles: {
        assetId: 2275207,
        type: '3dtiles'
    },

    // Google Maps 2D Roadmap（Cesium Ion）
    googleMaps: {
        assetId: 3830184,
        type: 'ion'
    },

    // 地理院標準地図
    gsi: {
        url: "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
        credit: new Cesium.Credit(
            '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>'
        ),
        minimumLevel: 2,
        maximumLevel: 18,
    },

    // 古地図コレクション（URLで指定）
    oldMaps: {
        // 熊川
        kumakawa: {
            url: "https://mapwarper.h-gis.jp/maps/tile/845/{z}/{x}/{y}.png",
            credit: new Cesium.Credit("『熊川』五万分一地形図, 明治26年測図/大正9年修正, https://purl.stanford.edu/cb173fj2995"),
            minimumLevel: 2,
            maximumLevel: 18,
        },
        // 竹生島
        chikubushima: {
            url: "https://mapwarper.h-gis.jp/maps/tile/846/{z}/{x}/{y}.png",
            credit: new Cesium.Credit("『竹生島』五万分一地形図, 明治26年測図/大正9年修正/昭和7年鉄道補入/昭和26年応急修正, https://purl.stanford.edu/zt128hp6132"),
            minimumLevel: 2,
            maximumLevel: 18,
        },
        // 彦根西部
        hikone_west: {
            url: "https://mapwarper.h-gis.jp/maps/tile/816/{z}/{x}/{y}.png",
            credit: new Cesium.Credit("『彦根西部』五万分一地形図, 明治26年測図/大正9年修正/昭和7年鉄道補入, https://purl.stanford.edu/yn560bk7442"),
            minimumLevel: 2,
            maximumLevel: 18,
        },
        // 北小松
        kitakomatsu: {
            url: "https://mapwarper.h-gis.jp/maps/tile/815/{z}/{x}/{y}.png",
            credit: new Cesium.Credit("『北小松』五万分一地形図, 明治26年測図/大正9年修正/昭和7年鉄道補入, https://purl.stanford.edu/hf547qg6944"),
            minimumLevel: 2,
            maximumLevel: 18,
        },
        // 彦根東部
        hikone_east: {
            url: "https://mapwarper.h-gis.jp/maps/tile/817/{z}/{x}/{y}.png",
            credit: new Cesium.Credit("『彦根東部』五万分一地形圖, 【測量時期】 明治24年測図/大正9年修正/昭和7年鉄道補入 【発行時期】 昭和8年6月発行, https://purl.stanford.edu/ry668yd4924"),
            minimumLevel: 2,
            maximumLevel: 18,
        },
        // 『京都西北部』五万分一地形圖
        kyoto_northwest: {
            url: "https://mapwarper.h-gis.jp/maps/tile/3547/{z}/{x}/{y}.png",
            credit: new Cesium.Credit("『京都西北部』五万分一地形圖, 作成: 1948, https://www.gsi.go.jp/"),
            minimumLevel: 2,
            maximumLevel: 18,
        },
        // 『京都西南部』五万分一地形圖
        kyoto_southwest: {
            url: "https://mapwarper.h-gis.jp/maps/tile/3546/{z}/{x}/{y}.png",
            credit: new Cesium.Credit("『京都西南部』五万分一地形圖, 作成: 1946, https://www.gsi.go.jp/"),
            minimumLevel: 2,
            maximumLevel: 18,
        },
    },

    // 将来的な拡張用（コメントアウト）
    // weatherMap: {
    //     url: "...",
    //     credit: new Cesium.Credit("Weather Data"),
    //     minimumLevel: 2,
    //     maximumLevel: 18,
    // }
};

// グローバルに公開
window.LAYER_DEFINITIONS = LAYER_DEFINITIONS;