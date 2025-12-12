// バベルの難易度情報
const babelDifficulty = {
    managementLevel: 2,      // 管理難易度: Lv.2
    damageScale: 'Kalyx'     // 予想被害規模: Kalyx
};

// バベルの管理方法データ
const babelHintContents = {
    'babel-1': { text: 'バベルを採取した場合、次の一日は他の植物の管理方法の漢字が別の漢字に置き換わって表示されます。' }
};

const babelHints = [
    { id: 'babel-1', name: 'バベルの管理方法1', price: 5 }
];

// バベルのエッセンス計算関数
function calculateEssenceBabel(plant) {
    const params = plant.harvestParams;
    const { waterCount, fertilizerColor, fertilizerGiven, lightLevel, tempLevel } = params;
    
    console.log('バベル エッセンス計算:', params);
    
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
    
    // 施肥スコア（基本的な設定）
    let fertilizerScore = 0;
    if (fertilizerGiven && fertilizerColor === '緑') fertilizerScore = 2;
    else if (fertilizerGiven && fertilizerColor === '紫') fertilizerScore = 2;
    else if (fertilizerGiven && fertilizerColor === '橙') fertilizerScore = 1;
    else fertilizerScore = 0; // 施肥なし
    totalScore += fertilizerScore;
    
    console.log('バベル 個別スコア:', {
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
    
    console.log('バベル 計算結果:', { totalScore, essence });
    
    return essence;
}

// Node.js（Jest）で読み込むためのエクスポート
if (typeof module !== 'undefined') {
    module.exports = { calculateEssenceBabel };
}

