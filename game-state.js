// ========================================
// game-state.js
// データ定義、グローバル変数、植物データ初期化
// ========================================

// --- データ定義 ---
// 管理方法の購入状態を管理（植物ID -> 管理方法番号の配列）
const purchasedHints = {
    'kocho': [],
    'side': []
};

// 難易度情報のマッピング（植物ID -> 難易度情報）
const plantDifficultyMap = {
    'kocho': kochoDifficulty,
    'side': sideDifficulty,
    'hana': hanaDifficulty,
    'nagi': nagiDifficulty,
    'kane': kaneDifficulty,
    'here': hereDifficulty,
    'aqua': aquaDifficulty,
    'rezo': rezoDifficulty,
    'dai': daiDifficulty,
    'rete': reteDifficulty,
    'tribu': tribuDifficulty,
    'kokyu': kokyuDifficulty,
    'kuryu': kuryuDifficulty,
    'babel': babelDifficulty
};

// 難易度情報を取得する関数（他ファイルからも利用可能）
function getPlantDifficulty(plantId) {
    return plantDifficultyMap[plantId] || { managementLevel: 1, damageScale: 'Blas' };
}

// 管理難易度表示用のテキストを生成する関数
function formatManagementLevel(difficulty) {
    if (!difficulty) {
        return 'Lv.?';
    }
    return `Lv.${difficulty.managementLevel}`;
}

// 予想被害規模表示用のテキストを生成する関数
function formatDamageScale(difficulty) {
    if (!difficulty) {
        return '?';
    }
    return difficulty.damageScale || '?';
}

// 予想被害規模の色を取得する関数
function getDamageScaleColor(damageScale) {
    switch(damageScale) {
        case 'Blas':
            return '#4ade80'; // 緑色
        case 'Kalyx':
            return '#ffd700'; // 黄色
        case 'Anthes':
            return '#ff4444'; // 赤色
        default:
            return '#e0e1dd'; // デフォルト色
    }
}

// グローバル変数として公開（他のファイルから参照するため）
window.plantData = [
    { 
        id: 'kocho', 
        name: "コチョラン", 
        status: "安定", 
        waterCount: 0, 
        fertilizedToday: false, 
        harvestedToday: false, 
        lightLevel: 50, 
        tempLevel: 3, 
        fertilizer: 0,
        fertilizerColor: null,
        difficulty: getPlantDifficulty('kocho'), // 難易度情報
        // 採取時のパラメータ（エッセンス量計算用）
        harvestParams: {
            waterCount: 0,
            fertilizerColor: null,
            fertilizerGiven: false,
            lightLevel: 50,
            tempLevel: 3,
            harvested: false
        },
        // デイ終了時のパラメータ（特殊判定・翌日初期値用）
        dayEndParams: {
            waterCount: 0,
            fertilizerColor: null,
            fertilizerGiven: false,
            lightLevel: 50,
            tempLevel: 3,
            harvested: false
        }
    },
    { 
        id: 'side', 
        name: "シデロータス", 
        status: "要観察", 
        waterCount: 0, 
        fertilizedToday: false, 
        harvestedToday: false, 
        lightLevel: 50, 
        tempLevel: 3, 
        fertilizer: 0,
        fertilizerColor: null,
        difficulty: getPlantDifficulty('side'), // 難易度情報
        // 連続灌水日数の管理
        consecutiveWaterDays: 0,
        // 温度5を保持した時間を記録
        temp5StartTime: null,
        // 温度1に戻した時間を記録
        temp1StartTime: null,
        harvestParams: {
            waterCount: 0,
            fertilizerColor: null,
            fertilizerGiven: false,
            lightLevel: 50,
            tempLevel: 3,
            harvested: false
        },
        dayEndParams: {
            waterCount: 0,
            fertilizerColor: null,
            fertilizerGiven: false,
            lightLevel: 50,
            tempLevel: 3,
            harvested: false
        }
    }
];

let currentPlantIndex = 0;

// パフォーマンス改善：DOM要素のキャッシュ
let cachedTimerNumber = null;
let cachedParamDisplay = null;
let cachedPlantAStatusEl = null;
let cachedPlantA = null;

const perPlantHints = {
    'kocho': kochoHints,
    'side': waraitakeHints,
    'hana': hanaHints,
    'nagi': crystalLeafHints,
    'kane': goldenBerryHints,
    'here': moonFlowerHints,
    'aqua': stormWeedHints,
    'rezo': eternalTreeHints,
    'dai': daiHints,
    'rete': reteHints,
    'tribu': tribuHints,
    'kokyu': kokyuHints,
    'kuryu': kuryuHints,
    'babel': babelHints,
};

// 植物IDから計算関数へのマッピング（一元管理）
const plantCalculateFuncMap = {
    'kocho': 'calculateEssenceKocho',
    'side': 'calculateEssenceSide',
    'hana': 'calculateEssenceHana',
    'nagi': 'calculateEssenceNagi',
    'kane': 'calculateEssenceKane',
    'here': 'calculateEssenceHere',
    'aqua': 'calculateEssenceAqua',
    'rezo': 'calculateEssenceRezo',
    'dai': 'calculateEssenceDai',
    'rete': 'calculateEssenceRete',
    'tribu': 'calculateEssenceTribu',
    'kokyu': 'calculateEssenceKokyu',
    'kuryu': 'calculateEssenceKuryu',
    'babel': 'calculateEssenceBabel'
};

// 他植物から呼び出す場合は共通関数を使用
function getPlantCalculateFunction(plantId) {
    const funcName = plantCalculateFuncMap[plantId];
    return window[funcName];
}

// 相互作用のロギング強化
function logPlantInteraction(sourceId, targetId, interactionType, result) {
    console.log(`[${interactionType}] ${sourceId} → ${targetId}:`, result);
}

// 植物選択肢のデータ
const plantSelectionOptions = [
    {
        name: 'ハナモドキ',
        icon: '🌻',
        flavor: 'その彩を写し取り、初めて輪郭を得る虚の花',
        cost: 0
    },
    {
        name: 'ナギノゾミ',
        icon: '🍃',
        flavor: '変化という不協和音を拒み、ただ昨日の静寂を望む',
        cost: 0
    },
    {
        name: 'カネセンカ',
        icon: '💰',
        flavor: '沈みゆく太陽に賭けられた、束の間の黄金を咲かす',
        cost: 0
    },
    {
        name: 'ヘレボラスト',
        icon: '🌙',
        flavor: '忘れられた痛みを知る花は、最後の瞬間に触れられることを待つ',
        cost: 0
    },
    {
        name: 'アクアステラ',
        icon: '🌊',
        flavor: 'その清らかな輝きは、周囲の厄災を洗い流す星の水辺',
        cost: 0
    },
    {
        name: 'レゾナントリリィ',
        icon: '🌷',
        flavor: 'その共鳴は狂気へと変わる',
        cost: 0
    },
    {
        name: 'トリビュソス',
        icon: '🌿',
        flavor: '最適な温度レベルは毎日変わります',
        cost: 0
    },
    {
        name: 'ダイダイダイ',
        icon: '🍊',
        flavor: '適当なアイコン',
        cost: 0
    },
    {
        name: 'レテレテ',
        icon: '🌼',
        flavor: '適当なアイコン',
        cost: 0
    },
    {
        name: 'コキュートス',
        icon: '❄️',
        flavor: 'その冷気は施設全体を凍らせる',
        cost: 0
    },
    {
        name: 'クリュソボロス',
        icon: '🪙',
        flavor: 'その輝きは専用の財宝を生み出す',
        cost: 0
    },
    {
        name: 'バベル',
        icon: '🗼',
        flavor: 'その混乱は言葉を歪める',
        cost: 0
    }
];

// 植物名から植物IDへのマッピング
const plantNameToId = {
    'コチョラン': 'kocho',
    'シデロータス': 'side',
    'ハナモドキ': 'hana',
    'ナギノゾミ': 'nagi',
    'カネセンカ': 'kane',
    'ヘレボラスト': 'here',
    'アクアステラ': 'aqua',
    'レゾナントリリィ': 'rezo',
    'ダイダイダイ': 'dai',
    'レテレテ': 'rete',
    'トリビュソス': 'tribu',
    'コキュートス': 'kokyu',
    'クリュソボロス': 'kuryu',
    'バベル': 'babel'
};

// エッセンス計算式（植物ごと）
function calculateEssence(plant) {
    const { id } = plant;
    
    console.log('エッセンス計算開始:', {
        id, plantData: plant
    });
    
    // マッピングから関数を取得して実行
    const calculateFunc = getPlantCalculateFunction(id);
    if (calculateFunc) {
        return calculateFunc(plant);
    }
    
    return 0;
}

