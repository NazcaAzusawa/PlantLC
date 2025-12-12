// ナギノゾミの難易度情報
const nagiDifficulty = {
    managementLevel: 1,      // 管理難易度: Lv.1
    damageScale: 'Kalyx'     // 予想被害規模: Kalyx
};

// ナギノゾミの管理方法データ
const crystalLeafHintContents = {
    'nagi-1': { text: 'ナギノゾミは環境の変化を嫌います。' },
    'nagi-2': { text: 'ナギノゾミは施肥を行うことが望まれますが、前日と異なる肥料を与えるとダメージが発生します。' },
    'nagi-3': { text: 'ナギノゾミは1日に3回の灌水が望まれますが、前日と異なる回数だとダメージが発生します。' },
    'nagi-4': { text: 'ナギノゾミは日照や温度を前日から変更すると採取量が減少します。' },
    'nagi-5': { text: 'ナギノゾミは日照レベル70以上、温度レベル2での育成が望ましいです。' }
};

const crystalLeafHints = [
    { id: 'nagi-1', name: 'ナギノゾミの管理方法1', price: 5 },
    { id: 'nagi-2', name: 'ナギノゾミの管理方法2', price: 7 },
    { id: 'nagi-3', name: 'ナギノゾミの管理方法3', price: 10 },
    { id: 'nagi-4', name: 'ナギノゾミの管理方法4', price: 12 },
    { id: 'nagi-5', name: 'ナギノゾミの管理方法5', price: 12 },
];

function calculateEssenceNagi(plant) {
    const params = plant.harvestParams;
    const { waterCount, fertilizerColor, fertilizerGiven, lightLevel, tempLevel } = params;
    
    console.log('ナギノゾミ エッセンス計算:', params);
    
    // 前日の環境から変更があったかチェック
    let environmentChanged = false;
    const dayEndParams = plant.dayEndParams;
    
    // 初日は初期設定（日照50、温度3）と比較
    const prevLightLevel = dayEndParams?.lightLevel ?? 50;
    const prevTempLevel = dayEndParams?.tempLevel ?? 3;
    
    if (lightLevel !== prevLightLevel || tempLevel !== prevTempLevel) {
        environmentChanged = true;
        console.log('ナギノゾミ 環境変化検知:', {
            prevLight: prevLightLevel,
            currentLight: lightLevel,
            prevTemp: prevTempLevel,
            currentTemp: tempLevel
        });
    }
    
    // 総合スコア計算
    let totalScore = 0;
    
    // 光量スコア
    let lightScore = 0;
    if (lightLevel >= 0 && lightLevel <= 29) lightScore = 0;
    else if (lightLevel >= 30 && lightLevel <= 49) lightScore = 1;
    else if (lightLevel >= 50 && lightLevel <= 69) lightScore = 2;
    else if (lightLevel >= 70 && lightLevel <= 100) lightScore = 3;
    totalScore += lightScore;
    
    // 温度スコア
    let tempScore = 0;
    if (tempLevel === 1) tempScore = 2;
    else if (tempLevel === 2) tempScore = 3;
    else if (tempLevel === 3) tempScore = 2;
    else if (tempLevel === 4) tempScore = 1;
    else if (tempLevel === 5) tempScore = 0;
    totalScore += tempScore;
    
    // 灌水スコア（3回が最適）
    let waterScore = 0;
    if (waterCount === 0) waterScore = 0;
    else if (waterCount === 1) waterScore = 1;
    else if (waterCount === 2) waterScore = 2;
    else if (waterCount === 3) waterScore = 3;
    else if (waterCount === 4) waterScore = 2;
    else if (waterCount === 5) waterScore = 1;
    else if (waterCount >= 6) waterScore = 0;
    totalScore += waterScore;
    
    // 肥料スコア
    let fertilizerScore = 0;
    if (!fertilizerGiven) fertilizerScore =0;
    else if (fertilizerColor === '紫') fertilizerScore = 3;
    else if (fertilizerColor === '緑') fertilizerScore = 3;
    else if (fertilizerColor === '橙') fertilizerScore = 3;
    totalScore += fertilizerScore;
    
    console.log('ナギノゾミ 計算結果:', { totalScore, environmentChanged });
    
    // 点数からエッセンス量に変換
    let essence = 0;
    if (totalScore >= 12) essence = 40;
    else if (totalScore >= 9) essence = 20;
    else if (totalScore >= 6) essence = 10;
    else if (totalScore >= 3) essence = 5;
    else essence = 0;
    
    // 環境変化による減少
    if (environmentChanged) {
        essence = Math.floor(essence * 0.3); // 30%に減少
        console.log('ナギノゾミ 環境変化によるエッセンス減少:', essence);
    }
    
    return essence;
}

// ナギノゾミの施肥処理（ダメージ判定）
function handleNaginozomiFertilizer(plant, fertilizerColor) {
    const dayEndParams = plant.dayEndParams;
    const prevFertilizerColor = dayEndParams?.fertilizerColor ?? null;
    
    console.log('ナギノゾミ 施肥判定:', {
        current: fertilizerColor,
        prev: prevFertilizerColor
    });
    
    // 前日と異なる肥料を与えた場合
    if (prevFertilizerColor !== fertilizerColor) {
        const damage = 15;
        modifyHP(-damage);
        console.log('ナギノゾミ 施肥ダメージ発生！HP -15');
    }
}

// ナギノゾミの灌水処理（ダメージ判定）
function handleNaginozomiWater(plant) {
    const dayEndParams = plant.dayEndParams;
    const prevWaterCount = dayEndParams?.waterCount ?? 0;
    const currentWaterCount = plant.waterCount;
    
    console.log('ナギノゾミ 灌水判定:', {
        current: currentWaterCount,
        prev: prevWaterCount
    });
    
    // 前日と異なる回数の場合
    if (prevWaterCount !== currentWaterCount) {
        const damage = 10;
        modifySAN(-damage);
        console.log('ナギノゾミ 灌水ダメージ発生！精神 -10');
    }
}

// ナギノゾミの日次処理
function handleNaginozomiDayEnd(plant) {
    console.log('ナギノゾミ デイ終了処理完了');
}

// Node.js（Jest）で読み込むためのエクスポート
if (typeof module !== 'undefined') {
    module.exports = { calculateEssenceNagi };
}
