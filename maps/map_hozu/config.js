/**
 * 九里半街道マップの設定ファイル
 */

const MAP_CONFIG = {
    // Cesium Ionアクセストークン
    cesiumToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyOGRiZmY3Yy0wNzRjLTQ2MjktOGQ0Ni0xYmI5MzFmNDUxZDAiLCJpZCI6MzU0MDY0LCJpYXQiOjE3NjE0NTQ3MDh9.p9q4yTuNNbVz7U09nx04n-LQG0sxXh8TDw22H3FSIV0",

    // 初期表示位置
    initialView: {
        longitude: 135.63,
        latitude: 35.01,
        height: 15000
    },

    // 3D地形
    terrain: {
        enabled: true,
        assetId: 2767062
    },

    // 線A（赤い点線）
    lineA: {
        enabled: false,           // この地図で使用する
        toggleable: false,       // ON/OFF切替不可（常に表示）
        defaultVisible: false,    // 初期表示ON
        coordinates: [
        ]
    },

    // 線B（黄色い半透明空中矢印）
    lineB: {
        enabled: true,
        toggleable: true,        // ON/OFF切替可能
        defaultVisible: true,    // 初期表示ON
        coordinates: [
            [
                [135.606311832400962, 35.014520934861913, 800], [135.605890753340219, 35.015417582980952, 800], [135.620712736278819, 35.024590418167577, 800], [135.622902347394728, 35.018590258925144, 800], [135.625849900820072, 35.018590258925144, 800], [135.62812372774809, 35.025211099163933, 800], [135.631913439294919, 35.025486955871919, 800], [135.631155496985571, 35.017417762589552, 800], [135.647661796167199, 35.026866225448956, 800], [135.650272486343908, 35.030659096789798, 800], [135.653977982078544, 35.029486773531403, 800], [135.658778283371163, 35.01748673342761, 800], [135.668715749205006, 35.016038333612165, 800], [135.675621445801369, 35.011899907070472, 800], [135.680590178718347, 35.012934533338104, 800],
            ]
        ]
    },

    // 引出線付きポイント・ラベル
    points: [
        { longitude: 135.5872475, latitude: 35.0175040, height: 250, name: "保津川下り乗船場\nHozugawa-kudari boading" },
        { longitude: 135.595659, latitude: 35.018366, height: 250, name: "保津小橋\nHozu-kobashi" },
        { longitude: 135.6069745327962, latitude: 35.014882189208805, height: 250, name: "山本浜\nYamamotohama" },
        { longitude: 135.60826045742786, latitude: 35.01551988972753, height: 250, name: "宮ノ下の瀬\nMiyanoshita rapid" },
        { longitude: 135.61335696605983, latitude: 35.02100294277043, height: 250, name: "金岐の瀬\nKanage rapid" },
        { longitude: 135.6165068915337, latitude: 35.022577742902165, height: 250, name: "小鮎の滝\nKoayu rapid" },
        { longitude: 135.62097813406035, latitude: 35.02378539116505, height: 250, name: "大高瀬\nOotakase rapid" },
        { longitude: 135.62287752732362, latitude: 35.01896435276924, height: 250, name: "殿の漁場\nTono-no-ryoba" },
        { longitude: 135.6235555, latitude: 35.0184877, height: 250, name: "獅子ヶ口の瀬\nShishigaguchi rapid" },
        { longitude: 135.62665271890285, latitude: 35.022973853498335, height: 250, name: "女渕\nOnna-buchi" },
        { longitude: 135.62822178290295, latitude: 35.02473217492811, height: 250, name: "二股の瀬\nFutamata rapid" },
        { longitude: 135.63112396142947, latitude: 35.02452929361622, height: 250, name: "曲がり渕\nMagarifuchi" },
        { longitude: 135.6300621887978, latitude: 35.017959531415066, height: 250, name: "朝日の瀬\nAsahi rapid" },
        { longitude: 135.63970072479847, latitude: 35.02264537167639, height: 250, name: "ビキニの瀬\nBikini rapid" },
        { longitude: 135.673842613643, latitude: 35.01315747425929, height: 250, name: "嵐山(下船場)\nArashiyama landing pt" },
        { longitude: 135.67777117238012, latitude: 35.01292557703839, height: 250, name: "渡月橋\nTogetsukyo bridge" },
    ],

    // 画像レイヤー設定
    layers: {
        satellite: true,         // 衛星画像を使用
        googlePhotorealistic3DTiles: true,
        googleMaps: true,        // Google Maps を使用
        gsi: true,              // 地理院地図を使用
        oldMaps: [              // 使用する古地図（layerDefinitions.jsのキーを指定）
            'kyoto_northwest',
            'kyoto_southwest',
        ]
    }
};

// グローバルに公開
window.MAP_CONFIG = MAP_CONFIG;