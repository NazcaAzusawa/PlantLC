// アクアステラの難易度情報
const aquaDifficulty = {
    managementLevel: 3,      // 管理難易度: Lv.3
    damageScale: 'Blas'      // 予想被害規模: Blas
};

// アクアステラの管理方法データ
const stormWeedHintContents = {
    'aqua-1': { text: 'アクアステラは最後の灌水から1時間以上間隔を開ける必要がある。' },
    'aqua-2': { text: '施設にアクアステラがある間はコチョランの爆発が発動しない。' },
    'aqua-3': { text: '施設にアクアステラがある間は「」の「」は発動しない。' },
    'aqua-4': { text: 'アクアステラは温度1～2で安定。' }
};

const stormWeedHints = [
    { id: 'aqua-1', name: 'アクアステラの管理方法1', price: 3 },
    { id: 'aqua-2', name: 'アクアステラの管理方法2', price: 5 },
    { id: 'aqua-3', name: 'アクアステラの管理方法3', price: 5 },
    { id: 'aqua-4', name: 'アクアステラの管理方法4', price: 7 }
];

function calculateEssenceAqua(plant) {
    const params = plant.harvestParams;
    const { waterCount, fertilizerColor, fertilizerGiven, lightLevel, tempLevel } = params;
    
    console.log('アクアステラ（ID: aqua）エッセンス計算:', params);
    
    // 総合スコア計算
    let totalScore = 0;
    
    // 光量スコア（不安定：極端な値を好む）
    let lightScore = 0;
    if (lightLevel >= 0 && lightLevel <= 20) lightScore = 2;
    else if (lightLevel >= 21 && lightLevel <= 40) lightScore = 0;
    else if (lightLevel >= 41 && lightLevel <= 60) lightScore = -1;
    else if (lightLevel >= 61 && lightLevel <= 80) lightScore = 0;
    else if (lightLevel >= 81 && lightLevel <= 100) lightScore = 2;
    totalScore += lightScore;
    
    // 温度スコア（不安定：極端な値を好む）
    let tempScore = 0;
    if (tempLevel === 1) tempScore = 2;
    else if (tempLevel === 2) tempScore = 0;
    else if (tempLevel === 3) tempScore = -1;
    else if (tempLevel === 4) tempScore = 0;
    else if (tempLevel === 5) tempScore = 2;
    totalScore += tempScore;
    
    // 灌水スコア（不規則）
    let waterScore = 0;
    if (waterCount === 0) waterScore = 0;
    else if (waterCount === 1) waterScore = 1;
    else if (waterCount === 2) waterScore = 2;
    else if (waterCount === 3) waterScore = 1;
    else if (waterCount >= 4) waterScore = 0;
    totalScore += waterScore;
    
    // 肥料スコア（肥料が特に重要）
    let fertilizerScore = 0;
    if (!fertilizerGiven) fertilizerScore = -3;
    else if (fertilizerColor === '橙') fertilizerScore = 3;
    else if (fertilizerColor === '紫') fertilizerScore = 1;
    else if (fertilizerColor === '緑') fertilizerScore = 0;
    totalScore += fertilizerScore;
    
    console.log('アクアステラ 計算結果:', { totalScore });
    
    // 点数からエッセンス量に変換（5段階）
    if (totalScore >= 10) return 60;
    else if (totalScore >= 6) return 40;
    else if (totalScore >= 2) return 20;
    else if (totalScore >= -2) return 8;
    else return 0;
}

// アクアステラの特殊処理：1時間間隔チェック
function handleAquaWaterInterval(plant) {
    // DAY_DURATION_SEC = 60秒（1日=6時間）, 1時間 = 10秒
    const ONE_HOUR_IN_GAME_SEC = 10;
    
    if (plant.waterTimes && plant.waterTimes.length > 0) {
        const lastWaterTime = plant.waterTimes[plant.waterTimes.length - 1];
        const currentTime = DAY_DURATION_SEC - timeLeftSec;
        const timeSinceLastWater = currentTime - lastWaterTime;
        
        if (timeSinceLastWater < ONE_HOUR_IN_GAME_SEC && plant.waterTimes.length > 1) {
            console.log(`アクアステラ 最後の灌水から${timeSinceLastWater}秒しか経過していないため、灌水回数を${plant.waterCount}回から${plant.waterCount - 1}回に調整`);
            plant.harvestParams.waterCount = plant.waterCount - 1;
        }
    }
}

// Node.js（Jest）で読み込むためのエクスポート
if (typeof module !== 'undefined') {
    module.exports = { calculateEssenceAqua };
}
