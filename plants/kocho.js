// コチョランの難易度情報
const kochoDifficulty = {
    managementLevel: 1,      // 管理難易度: Lv.1
    damageScale: 'Anthes'    // 予想被害規模: Anthes
};

// コチョランの管理方法データ
const kochoHintContents = {
    'kocho-1': { text: 'コチョランは定期的な管理を好みます。' },
    'kocho-2': { text: 'コチョランは紫の肥料を好みます。エッセンスを採取するために、施肥は必ず行ってください。' },
    'kocho-3': { text: 'コチョランに極度な日射は必要ありません、かえって育成を悪化させるおそれがあります。' },
    'kocho-4': { text: 'コチョランは暖かい環境を好みます。' },
    'kocho-5': { text: 'コチョランへの灌水は、3回以内に留めると安定します。ただし、エッセンス採取量への影響は大きくありません。' },
    'kocho-6': { text: 'コチョランが1日の間に一度も何らかの作業、または環境調整が行われなかった場合、コチョランは施設全体に及ぶ爆発を起こします。' }
};

const kochoHints = [
    { id: 'kocho-1', name: 'コチョランの管理方法1', price: 3 },
    { id: 'kocho-2', name: 'コチョランの管理方法2', price: 3 },
    { id: 'kocho-3', name: 'コチョランの管理方法3', price: 3 },
    { id: 'kocho-4', name: 'コチョランの管理方法4', price: 5 },
    { id: 'kocho-5', name: 'コチョランの管理方法5', price: 5 },
    { id: 'kocho-6', name: 'コチョランの管理方法6', price: 5 }
];

// コチョランのAIメッセージ
const kochoAIMessages = {
    // 特定状況のメッセージ
    urgent: [
        'なんか…さっきから花弁が赤く点滅している気がします。',
        'これは…警告状態です。すぐに何か対応してください。'
    ],
    warning: [
        '様子を見る限り、そろそろ注意が必要かもしれません。',
        'もしかして、今日はまだ何もしていませんか？'
    ],
    // 通常のメッセージ
    normal: [
        'コチョランは順調に成長しています。',
        '今日も管理を続けていきましょう。',
        '紫の肥料が効果的なようです。',
        '温度は高めに保つと良い状態です。',
        '色つやが良いですね。',
        '安定した状態が保たれています。',
        'きれいな花が咲いています。',
        '特に問題は見られません。'
    ]
};

// コチョランのAIメッセージを取得
function getKochoAIMessage(plant) {
    // 残り時間を計算
    const currentTime = formatTimeNumber(timeLeftSec);
    const timeLeft = parseFloat(currentTime);
    
    // 管理操作の有無をチェック
    const hasManagement = !!(plant.waterCount > 0 || plant.fertilizedToday || plant.harvestedToday || plant.lightLevel !== 50 || plant.tempLevel !== 3);
    
    // 緊急状態（残り1時間以下で管理操作なし）
    if (!hasManagement && timeLeft <= 1.0) {
        return kochoAIMessages.urgent[Math.floor(Math.random() * kochoAIMessages.urgent.length)];
    }
    
    // 警告状態（残り2時間以下で管理操作なし）
    if (!hasManagement && timeLeft <= 2.0) {
        return kochoAIMessages.warning[Math.floor(Math.random() * kochoAIMessages.warning.length)];
    }
    
    // 通常メッセージ
    return kochoAIMessages.normal[Math.floor(Math.random() * kochoAIMessages.normal.length)];
}

function calculateEssenceKocho(plant) {
    const params = plant.harvestParams;
    const { waterCount, fertilizerColor, fertilizerGiven, lightLevel, tempLevel } = params;
    
    console.log('コチョラン エッセンス計算:', params);
    
    // 総合スコア計算
    let totalScore = 0;
    
    // 光量スコア
    let lightScore = 0;
    if (lightLevel >= 0 && lightLevel <= 15) lightScore = 2;
    else if (lightLevel >= 16 && lightLevel <= 49) lightScore = 3;
    else if (lightLevel >= 50 && lightLevel <= 69) lightScore = 0;
    else if (lightLevel >= 70 && lightLevel <= 89) lightScore = -1;
    else if (lightLevel >= 90 && lightLevel <= 100) lightScore = -2;
    totalScore += lightScore;
    
    // 温度スコア
    let tempScore = 0;
    if (tempLevel === 1) tempScore = 0;
    else if (tempLevel === 2) tempScore = 0;
    else if (tempLevel === 3) tempScore = 1;
    else if (tempLevel === 4) tempScore = 2;
    else if (tempLevel === 5) tempScore = 3;
    totalScore += tempScore;
    
    // 灌水スコア
    let waterScore = 0;
    if (waterCount === 0) waterScore = 0;
    else if (waterCount === 1) waterScore = 1;
    else if (waterCount === 2) waterScore = 1;
    else if (waterCount === 3) waterScore = 1;
    else waterScore = 0; // 4回以上
    totalScore += waterScore;
    
    // 施肥スコア
    let fertilizerScore = 0;
    if (fertilizerGiven && fertilizerColor === '緑') fertilizerScore = 0;
    else if (fertilizerGiven && fertilizerColor === '紫') fertilizerScore = 3;
    else if (fertilizerGiven && fertilizerColor === '橙') fertilizerScore = 0;
    else fertilizerScore = -10; // 施肥なし
    totalScore += fertilizerScore;
    
    console.log('コチョラン 個別スコア:', {
        lightLevel, lightScore,
        tempLevel, tempScore,
        waterCount, waterScore,
        fertilizerColor, fertilizerGiven, fertilizerScore,
        totalScore
    });
    
    // 5段階エッセンス変換
    let essence = 0;
    if (totalScore >= 10) essence = 50;
    else if (totalScore >= 8) essence = 35;
    else if (totalScore >= 6) essence = 20;
    else if (totalScore >= 4) essence = 10;
    else if (totalScore >= 1) essence = 5;
    else essence = 0;
    
    console.log('コチョラン 計算結果:', { totalScore, essence });
    
    return essence;
}

// コチョランの特殊ロジック：管理操作チェック
function checkPlantAManagement(plant) {
    const params = plant.dayEndParams;
    const { waterCount, fertilizerGiven, lightLevel, tempLevel, harvested } = params;
    
    // 管理操作の有無をチェック
    let hasManagement = false;
    
    // 灌水チェック
    if (waterCount > 0) hasManagement = true;
    
    // 施肥チェック
    if (fertilizerGiven) hasManagement = true;
    
    // 採取チェック
    if (harvested) hasManagement = true;
    
    // 光量・温度の初期値からの変更チェック
    // 初期値は lightLevel: 50, tempLevel: 3
    if (lightLevel !== 50) hasManagement = true;
    if (tempLevel !== 3) hasManagement = true;
    
    console.log('コチョラン 管理操作チェック:', {
        waterCount,
        fertilizerGiven,
        lightLevel,
        tempLevel,
        harvested,
        hasManagement
    });
    
    return hasManagement;
}

// コチョランの爆発処理
function handlePlantAExplosion() {
    console.log('コチョラン 爆発発生！HP -100');
    modifyHP(-100);
    showFeedback('コチョランが爆発しました！HP -100');
}

// コチョランのステータスチェック（リアルタイム）
function checkPlantAStatus(plant) {
    const params = plant.harvestParams;
    const { waterCount, fertilizerGiven, lightLevel, tempLevel, harvested } = params;
    
    // 管理操作の有無をチェック
    let hasManagement = false;
    
    // 灌水チェック
    if (waterCount > 0) hasManagement = true;
    
    // 施肥チェック
    if (fertilizerGiven) hasManagement = true;
    
    // 採取チェック
    if (harvested) hasManagement = true;
    
    // 光量・温度の初期値からの変更チェック
    // 初期値は lightLevel: 50, tempLevel: 3
    if (lightLevel !== 50) hasManagement = true;
    if (tempLevel !== 3) hasManagement = true;
    
    // 管理操作がない場合のみステータス変化
    if (!hasManagement) {
        const currentTime = formatTimeNumber(timeLeftSec);
        const timeLeft = parseFloat(currentTime);
        
        if (timeLeft <= 1.0) {
            return '危険'; // 赤文字
        } else if (timeLeft <= 2.0) {
            return '注意'; // 黄文字
        }
    }
    
    return '安定'; // 通常の緑文字
}

// Node.js（Jest）で読み込むためのエクスポート
if (typeof module !== 'undefined') {
    module.exports = { calculateEssenceKocho };
}