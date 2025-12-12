// コキュートスの難易度情報
const kokyuDifficulty = {
    managementLevel: 3,      // 管理難易度: Lv.3
    damageScale: 'Kalyx'    // 予想被害規模: Kalyx
};

// コキュートスの管理方法データ
const kokyuHintContents = {
    'kokyu-1': { text: 'コキュートスは採取していない間、施設全体の温度レベルを1低下させます。' },
    'kokyu-2': { text: 'コキュートスを採取する際、体力ダメージを60受けます。' },
    'kokyu-3': { text: 'コキュートスをノーダメージで採取するには、温度レベルを最大（5のボタン）で3時間以上維持する必要があります。' }
};

const kokyuHints = [
    { id: 'kokyu-1', name: 'コキュートスの管理方法1', price: 5 },
    { id: 'kokyu-2', name: 'コキュートスの管理方法2', price: 7 },
    { id: 'kokyu-3', name: 'コキュートスの管理方法3', price: 10 }
];

// コキュートスのエッセンス計算関数
// 温度レベルが実際の値より-1されているため、それを考慮して計算
function calculateEssenceKokyu(plant) {
    const params = plant.harvestParams;
    const { waterCount, fertilizerColor, fertilizerGiven, lightLevel, tempLevel } = params;
    
    console.log('コキュートス エッセンス計算:', params);
    
    // 総合スコア計算
    let totalScore = 0;
    
    // 光量スコア（標準的な設定）
    let lightScore = 0;
    if (lightLevel >= 0 && lightLevel <= 30) lightScore = 2;
    else if (lightLevel >= 31 && lightLevel <= 70) lightScore = 3;
    else if (lightLevel >= 71 && lightLevel <= 100) lightScore = 1;
    totalScore += lightScore;
    
    // 温度スコア（実際の温度レベルを使用、コキュートスは温度5を好む）
    let tempScore = 0;
    // 内部処理で-1されているため、実際の温度レベルを考慮
    // ただし、harvestParams.tempLevelは既に調整済みなので、そのまま使用
    if (tempLevel === 1) tempScore = 0;
    else if (tempLevel === 2) tempScore = 1;
    else if (tempLevel === 3) tempScore = 2;
    else if (tempLevel === 4) tempScore = 3;
    else if (tempLevel === 5) tempScore = 4;
    totalScore += tempScore;
    
    // 灌水スコア
    let waterScore = 0;
    if (waterCount === 0) waterScore = 0;
    else if (waterCount === 1) waterScore = 1;
    else if (waterCount === 2) waterScore = 2;
    else if (waterCount === 3) waterScore = 1;
    else waterScore = 0; // 4回以上
    totalScore += waterScore;
    
    // 施肥スコア（紫の肥料を好む）
    let fertilizerScore = 0;
    if (fertilizerGiven && fertilizerColor === '緑') fertilizerScore = 1;
    else if (fertilizerGiven && fertilizerColor === '紫') fertilizerScore = 3;
    else if (fertilizerGiven && fertilizerColor === '橙') fertilizerScore = 1;
    else fertilizerScore = 0; // 施肥なし
    totalScore += fertilizerScore;
    
    console.log('コキュートス 個別スコア:', {
        lightLevel, lightScore,
        tempLevel, tempScore,
        waterCount, waterScore,
        fertilizerColor, fertilizerGiven, fertilizerScore,
        totalScore
    });
    
    // 5段階エッセンス変換
    let essence = 0;
    if (totalScore >= 10) essence = 45;
    else if (totalScore >= 8) essence = 30;
    else if (totalScore >= 6) essence = 20;
    else if (totalScore >= 4) essence = 10;
    else if (totalScore >= 1) essence = 5;
    else essence = 0;
    
    console.log('コキュートス 計算結果:', { totalScore, essence });
    
    return essence;
}

// コキュートスの特殊ロジック：温度5を保持していた時間をチェック
function checkKokyuTemp5Condition(plant) {
    if (plant.temp5StartTime === null || plant.temp5StartTime === undefined) {
        return false;
    }
    
    const DAY_DURATION_SEC = 60;
    const currentTime = DAY_DURATION_SEC - timeLeftSec;
    const timeAtTemp5 = currentTime - plant.temp5StartTime;
    
    // 3時間 = 30秒（1時間 = 10秒）
    const requiredTime = 30;
    
    console.log('コキュートス 温度5保持時間チェック:', {
        temp5StartTime: plant.temp5StartTime,
        currentTime,
        timeAtTemp5,
        requiredTime,
        met: timeAtTemp5 >= requiredTime
    });
    
    return timeAtTemp5 >= requiredTime;
}

// コキュートスの採取時の処理
function handleKokyuHarvest(plant) {
    // 温度5を3時間以上維持していたかチェック
    const isNoDamage = checkKokyuTemp5Condition(plant);
    
    if (isNoDamage) {
        // ノーダメージフラグを立てる（その日中は温度を変えても変化しない）
        plant.kokyuNoDamageActive = true;
        console.log('コキュートス ノーダメージ条件達成：ダメージなし');
        showFeedback('コキュートスを安全に採取しました');
    } else {
        // HP-60ダメージ
        modifyHP(-60);
        console.log('コキュートス 採取時にHP-60ダメージ');
        showFeedback('コキュートスを採取しましたが、HP -60');
    }
    
    return isNoDamage;
}

// コキュートスの温度変更処理（温度5になった時刻を記録）
function handleKokyuTempChange(plant, newTemp) {
    // ノーダメージフラグが既に立っている場合は何もしない（温度を変えても変化しない）
    if (plant.kokyuNoDamageActive) {
        console.log('コキュートス ノーダメージフラグが立っているため、温度変更を無視');
        return;
    }
    
    // 温度5になった時刻を記録
    if (newTemp === 5 && (plant.temp5StartTime === null || plant.temp5StartTime === undefined)) {
        const DAY_DURATION_SEC = 60;
        plant.temp5StartTime = DAY_DURATION_SEC - timeLeftSec;
        console.log('コキュートス 温度5開始:', plant.temp5StartTime, '秒');
    }
    
    // 温度が5以外に変わった場合、リセット（ノーダメージフラグが立っていない場合のみ）
    if (newTemp !== 5 && plant.temp5StartTime !== null && plant.temp5StartTime !== undefined) {
        plant.temp5StartTime = null;
        console.log('コキュートス 温度5を解除、リセット');
    }
}

// Node.js（Jest）で読み込むためのエクスポート
if (typeof module !== 'undefined') {
    module.exports = { calculateEssenceKokyu };
}

