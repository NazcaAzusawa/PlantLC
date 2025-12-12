// シデロータスの難易度情報
const sideDifficulty = {
    managementLevel: 2,      // 管理難易度: Lv.2
    damageScale: 'Kalyx'     // 予想被害規模: Kalyx
};

// シデロータスの管理方法データ
const waraitakeHintContents = {
    'side-1': { text: 'シデロータスは採取時にダメージが発生します。このダメージは採取量が高いほど、高くなります。' },
    'side-2': { text: 'シデロータスは中程度の日照のもと管理してください。' },
    'side-3': { text: 'シデロータスに肥料は不要です。施肥を行っても採取量には一切影響を与えません。' },
    'side-4': { text: 'シデロータスには灌水を行ってください。ただし、連日の灌水は避けるようにしてください。' },
    'side-5': { text: 'シデロータスに2日以上灌水を行うと、翌日の採取量が半減します。ダメージは本来の採取量に依存します。' },
    'side-6': { text: '採取時のダメージを軽減させるためには焼きなましを行ってください。' },
    'side-7': { text: '2時間以上、温度を5に保ったあと、温度1に変えると焼きなまし状態になります。焼きなまし状態で1時間以内に採取を行うと、ダメージが1/3に軽減されます。' }
};

const waraitakeHints = [
    { id: 'side-1', name: 'シデロータスの管理方法1', price: 3 },
    { id: 'side-2', name: 'シデロータスの管理方法2', price: 3 },
    { id: 'side-3', name: 'シデロータスの管理方法3', price: 5 },
    { id: 'side-4', name: 'シデロータスの管理方法4', price: 5 },
    { id: 'side-5', name: 'シデロータスの管理方法5', price: 5 },
    { id: 'side-6', name: 'シデロータスの管理方法6', price: 3 },
    { id: 'side-7', name: 'シデロータスの管理方法7', price: 7 }   
];

// シデロータスのAIメッセージ
const siderotasAIMessages = {
    // 特定状況のメッセージ
    consecutiveWater: [
        '昨日よりなんか汚い気がします。サビ？',
        '連続灌水は避けたいところです。',
        '色が変わってきましたね。'
    ],
    // 通常のメッセージ
    normal: [
        'シデロータスは順調に成長しています。',
        '特に問題は見られません。',
        '中程度の日照が効果的です。',
        '灌水は適切に行いましょう。',
        '肥料は不要です。',
        '安定した状態です。',
        '色つやが良いですね。',
        '順調に育っています。'
    ]
};

// シデロータスのAIメッセージを取得
function getSiderotasAIMessage(plant) {
    // 連続灌水が2日以上の場合
    if (plant.consecutiveWaterDays >= 2) {
        return siderotasAIMessages.consecutiveWater[Math.floor(Math.random() * siderotasAIMessages.consecutiveWater.length)];
    }
    
    // 通常メッセージ
    return siderotasAIMessages.normal[Math.floor(Math.random() * siderotasAIMessages.normal.length)];
}

function calculateEssenceSide(plant) {
    const params = plant.harvestParams;
    const { waterCount, fertilizerColor, fertilizerGiven, lightLevel, tempLevel } = params;
    
    console.log('シデロータス エッセンス計算:', params);
    
    // 連続灌水による効率減少をチェック
    let efficiencyMultiplier = 1.0;
    if (plant.consecutiveWaterDays >= 2) {
        efficiencyMultiplier = 0.5; // 50%減少
        console.log('シデロータス 連続灌水による効率減少適用：', plant.consecutiveWaterDays, '日連続');
    }
    
    // 総合スコア計算
    let totalScore = 0;
    
    // 光量スコア
    let lightScore = 0;
    if (lightLevel >= 0 && lightLevel <= 29) lightScore = 1;
    else if (lightLevel >= 30 && lightLevel <= 70) lightScore = 2;
    else if (lightLevel >= 71 && lightLevel <= 100) lightScore = 0;
    totalScore += lightScore;
    
    // 温度スコア（2が最適）
    let tempScore = 0;
    if (tempLevel === 1) tempScore = 0;
    else if (tempLevel === 2) tempScore = 0;
    else if (tempLevel === 3) tempScore = 1;
    else if (tempLevel === 4) tempScore = 1;
    else if (tempLevel === 5) tempScore = 1;
    totalScore += tempScore;
    
    // 灌水スコア
    let waterScore = 0;
    if (waterCount === 0) waterScore = 0;
    else if (waterCount === 1) waterScore = 3;
    else if (waterCount === 2) waterScore = 2;
    else if (waterCount >= 3) waterScore = 1;
    totalScore += waterScore;
    
    // 肥料スコア（シデロータスは肥料の影響なし）
    // totalScore += fertilizerScore;
    
    console.log('シデロータス 計算結果:', { totalScore, efficiencyMultiplier });
    
    // 点数からエッセンス量に変換（5段階）
    let essence = 0;
    if (totalScore >= 5) essence = 50;
    else if (totalScore >= 3) essence = 30;
    else if (totalScore >= 1) essence = 10;
    else essence = 0;
    
    // 本来のエッセンス量を記録（ダメージ計算用）
    plant.originalEssenceAmount = essence;
    
    // 連続灌水による効率減少を適用
    essence = Math.floor(essence * efficiencyMultiplier);
    
    return essence;
}

// シデロータスの採取処理（ダメージ計算）
function handleSiderotasHarvest(plant, essenceAmount) {
    // ダメージの基本量を計算（本来採取できるエッセンス量の50%）
    const originalEssence = plant.originalEssenceAmount || essenceAmount;
    let damage = Math.floor(originalEssence * 0.5);
    
    console.log('シデロータス 本来のエッセンス量:', originalEssence);
    console.log('シデロータス 基本ダメージ:', damage);
    
    // 温度5を2時間以上保った後、温度1に戻して1時間以内に採取した場合
    if (plant.temp5StartTime !== null && plant.temp1StartTime !== null) {
        const DAY_DURATION_SEC = 60; // 1日=60秒
        const gameTime5 = plant.temp5StartTime; // 温度5を開始した時刻（ゲーム内）
        const gameTime1 = plant.temp1StartTime; // 温度1に戻した時刻（ゲーム内）
        const currentGameTime = DAY_DURATION_SEC - timeLeftSec; // 現在のゲーム内時刻
        
        // 温度5を2時間以上保ったかチェック（ゲーム内2時間 = 20秒）
        const timeAtTemp5 = (gameTime1 || currentGameTime) - gameTime5;
        console.log('シデロータス 温度5保持時間:', timeAtTemp5, '秒');
        
        if (timeAtTemp5 >= 20) {
            console.log('シデロータス 特殊条件達成：温度5を2時間以上保持');
            
            // 温度1に戻してから1時間以内に採取したかチェック（ゲーム内1時間 = 10秒）
            if (plant.temp1StartTime !== null) {
                const timeSinceTemp1 = currentGameTime - plant.temp1StartTime;
                console.log('シデロータス 温度1に戻してからの経過時間:', timeSinceTemp1, '秒');
                
                if (timeSinceTemp1 <= 10) {
                    damage = Math.floor(damage / 3); // ダメージが1/3に
                    console.log('シデロータス ダメージ軽減条件達成！ダメージが1/3に:', damage);
                }
            }
        }
    }
    
    // HPダメージを適用
    modifyHP(-damage);
    
    console.log('シデロータス 最終ダメージ:', damage);
}

// シデロータスの日次処理
function handleSiderotasDayEnd(plant) {
    // 連続灌水日数の管理
    if (plant.waterCount > 0) {
        plant.consecutiveWaterDays++;
        console.log('シデロータス 連続灌水日数:', plant.consecutiveWaterDays);
        
        if (plant.consecutiveWaterDays >= 2) {
            console.log('シデロータス 警告：2日以上連続灌水中。次の日の採取効率が50%減少します。');
        }
    } else {
        if (plant.consecutiveWaterDays > 0) {
            console.log('シデロータス 灌水を中断。連続灌水日数をリセット（前日:', plant.consecutiveWaterDays, '日）');
        }
        plant.consecutiveWaterDays = 0;
    }
    
    // 温度5を開始した時刻をリセット
    plant.temp5StartTime = null;
    plant.temp1StartTime = null;
    
    console.log('シデロータス デイ終了処理完了');
}

// シデロータスの温度変更処理
function handleSiderotasTempChange(plant, newTemp) {
    // 温度5になった時刻を記録
    if (newTemp === 5 && plant.temp5StartTime === null) {
        const DAY_DURATION_SEC = 60;
        plant.temp5StartTime = DAY_DURATION_SEC - timeLeftSec;
        console.log('シデロータス 温度5開始:', plant.temp5StartTime, '秒');
    }
    
    // 温度1に戻した時刻を記録
    if (newTemp === 1 && plant.temp5StartTime !== null && plant.temp1StartTime === null) {
        const DAY_DURATION_SEC = 60;
        plant.temp1StartTime = DAY_DURATION_SEC - timeLeftSec;
        console.log('シデロータス 温度1に戻す:', plant.temp1StartTime, '秒');
        
        // 温度5を保持していた時間を計算
        const timeAtTemp5 = plant.temp1StartTime - plant.temp5StartTime;
        console.log('シデロータス 温度5を保持していた時間:', timeAtTemp5, '秒');
        
        if (timeAtTemp5 >= 20) {
            console.log('シデロータス 特殊条件達成：温度5を2時間以上保持');
        }
    }
}

// Node.js（Jest）で読み込むためのエクスポート
if (typeof module !== 'undefined') {
    module.exports = { calculateEssenceSide };
}
