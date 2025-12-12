// レテレテの難易度情報
const reteDifficulty = {
    managementLevel: 2,      // 管理難易度: Lv.2（仮）
    damageScale: 'Kalyx'     // 予想被害規模: Kalyx（仮）
};

// レテレテの管理方法データ
const reteHintContents = {
    'rete-1': { text: 'レテレテは特別な管理が必要です。' }
};

const reteHints = [
    { id: 'rete-1', name: 'レテレテの管理方法1', price: 5 }
];

// レテレテのエッセンス計算関数
function calculateEssenceRete(plant) {
    const params = plant.harvestParams;
    const { waterCount, fertilizerColor, fertilizerGiven, lightLevel, tempLevel } = params;
    
    console.log('レテレテ エッセンス計算:', params);
    
    // 総合スコア計算
    let totalScore = 0;
    
    // 光量スコア（中程度の光量を好む）
    let lightScore = 0;
    if (lightLevel >= 0 && lightLevel <= 29) lightScore = 1;
    else if (lightLevel >= 30 && lightLevel <= 70) lightScore = 2;
    else if (lightLevel >= 71 && lightLevel <= 100) lightScore = 0;
    totalScore += lightScore;
    
    // 温度スコア（中程度の温度を好む）
    let tempScore = 0;
    if (tempLevel === 1) tempScore = 0;
    else if (tempLevel === 2) tempScore = 1;
    else if (tempLevel === 3) tempScore = 2;
    else if (tempLevel === 4) tempScore = 1;
    else if (tempLevel === 5) tempScore = 0;
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
    
    console.log('レテレテ 個別スコア:', {
        lightLevel, lightScore,
        tempLevel, tempScore,
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
    
    console.log('レテレテ 計算結果:', { totalScore, essence });
    
    return essence;
}

// Node.js（Jest）で読み込むためのエクスポート
if (typeof module !== 'undefined') {
    module.exports = { calculateEssenceRete };
}

