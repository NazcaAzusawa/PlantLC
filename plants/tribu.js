// トリビュソスの難易度情報
const tribuDifficulty = {
    managementLevel: 2,      // 管理難易度: Lv.2
    damageScale: 'Kalyx'     // 予想被害規模: Kalyx
};

// トリビュソスの管理方法データ
const tribuHintContents = {
    'tribu-1': { text: 'トリビュソスは特別な管理が必要です。' },
    'tribu-2': { text: 'トリビュソスの管理方法2' },
    'tribu-3': { text: 'トリビュソスの最適温度は ${OPTIMAL_TEMP} です。' }
};

const tribuHints = [
    { id: 'tribu-1', name: 'トリビュソスの管理方法1', price: 5 },
    { id: 'tribu-2', name: 'トリビュソスの管理方法2', price: 5 },
    { id: 'tribu-3', name: 'トリビュソスの管理方法3', price: 10 }
];

// トリビュソスの最適温度を生成する関数（毎日新しい値を生成）
function generateTribuOptimalTemp() {
    // 1-5のランダムな温度を返す
    return Math.floor(Math.random() * 5) + 1;
}

// トリビュソスのエッセンス計算関数
function calculateEssenceTribu(plant) {
    const params = plant.harvestParams;
    const { waterCount, fertilizerColor, fertilizerGiven, lightLevel, tempLevel } = params;
    
    console.log('トリビュソス エッセンス計算:', params);
    
    // 総合スコア計算
    let totalScore = 0;
    
    // 光量スコア（中程度の光量を好む）
    let lightScore = 0;
    if (lightLevel >= 0 && lightLevel <= 29) lightScore = 1;
    else if (lightLevel >= 30 && lightLevel <= 70) lightScore = 2;
    else if (lightLevel >= 71 && lightLevel <= 100) lightScore = 0;
    totalScore += lightScore;
    
    // 温度スコア（最適温度を使用）
    let tempScore = 0;
    const optimalTemp = plant.optimalTemp || 3; // デフォルトは3
    if (tempLevel === optimalTemp) tempScore = 3;
    else if (Math.abs(tempLevel - optimalTemp) === 1) tempScore = 1;
    else tempScore = -1;
    totalScore += tempScore;
    
    // 灌水スコア（適度な灌水を好む）
    let waterScore = 0;
    if (waterCount === 0) waterScore = -1;
    else if (waterCount === 1) waterScore = 2;
    else if (waterCount === 2) waterScore = 2;
    else if (waterCount === 3) waterScore = 1;
    else if (waterCount >= 4) waterScore = 0;
    totalScore += waterScore;
    
    // 施肥スコア（基本的な設定）
    let fertilizerScore = 0;
    if (!fertilizerGiven) fertilizerScore = -2;
    else if (fertilizerColor === '緑') fertilizerScore = 1;
    else if (fertilizerColor === '紫') fertilizerScore = 2;
    else if (fertilizerColor === '橙') fertilizerScore = 1;
    totalScore += fertilizerScore;
    
    console.log('トリビュソス 個別スコア:', {
        lightLevel, lightScore,
        tempLevel, tempScore,
        optimalTemp,
        waterCount, waterScore,
        fertilizerColor, fertilizerGiven, fertilizerScore,
        totalScore
    });
    
    // 点数からエッセンス量に変換（5段階）
    let essence = 0;
    if (totalScore >= 10) essence = 50;
    else if (totalScore >= 8) essence = 35;
    else if (totalScore >= 6) essence = 20;
    else if (totalScore >= 4) essence = 10;
    else if (totalScore >= 1) essence = 5;
    else essence = 0;
    
    console.log('トリビュソス 計算結果:', { totalScore, essence });
    
    return essence;
}

// Node.js（Jest）で読み込むためのエクスポート
if (typeof module !== 'undefined') {
    module.exports = { calculateEssenceTribu, generateTribuOptimalTemp };
}

