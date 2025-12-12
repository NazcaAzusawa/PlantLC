// クリュソボロスの難易度情報
const kuryuDifficulty = {
    managementLevel: 2,      // 管理難易度: Lv.2
    damageScale: 'Blas'      // 予想被害規模: Blas
};

// クリュソボロスの管理方法データ
const kuryuHintContents = {
    'kuryu-1': { text: 'クリュソボロスのエッセンスから得られたゴールドのみが、この植物の管理情報解禁に用いることが出来ます。' },
    'kuryu-2': { text: 'クリュソボロスのエッセンスから得られたゴールドは、通常のゴールドとしても使用できます。' },
    'kuryu-3': { text: '通常のゴールド使用を行う場合、通常のゴールドから消費され、通常のゴールドがなくなったらこのゴールドを使い始めます。' }
};

const kuryuHints = [
    { id: 'kuryu-1', name: 'クリュソボロスの管理方法1', price: 5 },
    { id: 'kuryu-2', name: 'クリュソボロスの管理方法2', price: 7 },
    { id: 'kuryu-3', name: 'クリュソボロスの管理方法3', price: 10 }
];

// クリュソボロスのエッセンス計算関数
function calculateEssenceKuryu(plant) {
    const params = plant.harvestParams;
    const { waterCount, fertilizerColor, fertilizerGiven, lightLevel, tempLevel } = params;
    
    console.log('クリュソボロス エッセンス計算:', params);
    
    // 総合スコア計算
    let totalScore = 0;
    
    // 光量スコア（標準的な設定）
    let lightScore = 0;
    if (lightLevel >= 0 && lightLevel <= 30) lightScore = 1;
    else if (lightLevel >= 31 && lightLevel <= 70) lightScore = 3;
    else if (lightLevel >= 71 && lightLevel <= 100) lightScore = 2;
    totalScore += lightScore;
    
    // 温度スコア（中程度の温度を好む）
    let tempScore = 0;
    if (tempLevel === 1) tempScore = 0;
    else if (tempLevel === 2) tempScore = 1;
    else if (tempLevel === 3) tempScore = 3;
    else if (tempLevel === 4) tempScore = 2;
    else if (tempLevel === 5) tempScore = 1;
    totalScore += tempScore;
    
    // 灌水スコア
    let waterScore = 0;
    if (waterCount === 0) waterScore = 0;
    else if (waterCount === 1) waterScore = 2;
    else if (waterCount === 2) waterScore = 3;
    else if (waterCount === 3) waterScore = 2;
    else waterScore = 1; // 4回以上
    totalScore += waterScore;
    
    // 施肥スコア（緑の肥料を好む）
    let fertilizerScore = 0;
    if (fertilizerGiven && fertilizerColor === '緑') fertilizerScore = 3;
    else if (fertilizerGiven && fertilizerColor === '紫') fertilizerScore = 2;
    else if (fertilizerGiven && fertilizerColor === '橙') fertilizerScore = 1;
    else fertilizerScore = 0; // 施肥なし
    totalScore += fertilizerScore;
    
    console.log('クリュソボロス 個別スコア:', {
        lightLevel, lightScore,
        tempLevel, tempScore,
        waterCount, waterScore,
        fertilizerColor, fertilizerGiven, fertilizerScore,
        totalScore
    });
    
    // 5段階エッセンス変換
    let essence = 0;
    if (totalScore >= 10) essence = 40;
    else if (totalScore >= 8) essence = 30;
    else if (totalScore >= 6) essence = 20;
    else if (totalScore >= 4) essence = 10;
    else if (totalScore >= 1) essence = 5;
    else essence = 0;
    
    console.log('クリュソボロス 計算結果:', { totalScore, essence });
    
    return essence;
}

// Node.js（Jest）で読み込むためのエクスポート
if (typeof module !== 'undefined') {
    module.exports = { calculateEssenceKuryu };
}

