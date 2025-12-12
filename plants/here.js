// ヘレボラストの難易度情報
const hereDifficulty = {
    managementLevel: 1,      // 管理難易度: Lv.1
    damageScale: 'Kalyx'     // 予想被害規模: Kalyx
};

// ヘレボラストの管理方法データ
const moonFlowerHintContents = {
    'here-1': { text: 'ヘレボラストは低光量を好む。光量20～40が最適。' },
    'here-2': { text: 'ヘレボラストは夜間の温度管理が重要。温度1～2で安定。' },
    'here-3': { text: 'ヘレボラストへの灌水は夕方に1回のみ。' },
    'here-4': { text: 'ヘレボラストに紫の施肥で花の香りが強くなる。' }
};

const moonFlowerHints = [
    { id: 'here-1', name: 'ヘレボラストの管理方法1', price: 5 },
    { id: 'here-2', name: 'ヘレボラストの管理方法2', price: 7 },
    { id: 'here-3', name: 'ヘレボラストの管理方法3', price: 10 },
    { id: 'here-4', name: 'ヘレボラストの管理方法4', price: 12 }
];

function calculateEssenceHere(plant) {
    const params = plant.harvestParams;
    const { waterCount, fertilizerColor, fertilizerGiven, lightLevel, tempLevel } = params;
    
    console.log('ヘレボラスト（ID: here）エッセンス計算:', params);
    
    // 総合スコア計算
    let totalScore = 0;
    
    // 光量スコア（低光量を好む）
    let lightScore = 0;
    if (lightLevel >= 0 && lightLevel <= 19) lightScore = 2;
    else if (lightLevel >= 20 && lightLevel <= 40) lightScore = 3;
    else if (lightLevel >= 41 && lightLevel <= 60) lightScore = 0;
    else if (lightLevel >= 61 && lightLevel <= 80) lightScore = -1;
    else if (lightLevel >= 81 && lightLevel <= 100) lightScore = -2;
    totalScore += lightScore;
    
    // 温度スコア（1～2が最適）
    let tempScore = 0;
    if (tempLevel === 1) tempScore = 3;
    else if (tempLevel === 2) tempScore = 3;
    else if (tempLevel === 3) tempScore = 0;
    else if (tempLevel === 4) tempScore = -1;
    else if (tempLevel === 5) tempScore = -2;
    totalScore += tempScore;
    
    // 灌水スコア（1回のみ）
    let waterScore = 0;
    if (waterCount === 0) waterScore = -2;
    else if (waterCount === 1) waterScore = 3;
    else if (waterCount === 2) waterScore = 0;
    else if (waterCount >= 3) waterScore = -1;
    totalScore += waterScore;
    
    // 肥料スコア
    let fertilizerScore = 0;
    if (!fertilizerGiven) fertilizerScore = -1;
    else if (fertilizerColor === '紫') fertilizerScore = 3;
    else if (fertilizerColor === '緑') fertilizerScore = 1;
    else if (fertilizerColor === '橙') fertilizerScore = 0;
    totalScore += fertilizerScore;
    
    console.log('ヘレボラスト 計算結果:', { totalScore });
    
    // 点数からエッセンス量に変換（5段階）
    if (totalScore >= 10) return 120;
    else if (totalScore >= 6) return 70;
    else if (totalScore >= 2) return 30;
    else return 0;
}

// ヘレボラストの日終了処理（採取しなかった場合のダメージ）
function handleHereDayEnd(plant) {
    if (!plant.harvestedToday) {
        modifyHP(-20);
        console.log('ヘレボラスト 採取しなかったためHP-20');
    }
}

// Node.js（Jest）で読み込むためのエクスポート
if (typeof module !== 'undefined') {
    module.exports = { calculateEssenceHere };
}
