// レゾナントリリィの難易度情報
const rezoDifficulty = {
    managementLevel: 3,      // 管理難易度: Lv.3
    damageScale: 'Kalyx'     // 予想被害規模: Kalyx
};

// レゾナントリリィの管理方法データ
const eternalTreeHintContents = {
    'rezo-1': { text: 'レゾナントリリィは光量を${LIGHT}に設定してください。' },
    'rezo-2': { text: 'レゾナントリリィは温度を${TEMP}に設定してください。' },
    'rezo-3': { text: 'レゾナントリリィは灌水を1日に${WATER}回行ってください。' },
    'rezo-4': { text: 'レゾナントリリィには${FERTILIZER}色の肥料を与えてください。' },
    'rezo-5': { text: 'すべての管理条件が適切に設定されていない場合、レゾナントリリィからはエッセンスを採取できません。' },
    'rezo-6': { text: '採取時に光量以外の管理条件が適切でない場合、正気度が減少します。' }
};

const eternalTreeHints = [
    { id: 'rezo-1', name: 'レゾナントリリィの管理方法1', price: 1 },
    { id: 'rezo-2', name: 'レゾナントリリィの管理方法2', price: 1 },
    { id: 'rezo-3', name: 'レゾナントリリィの管理方法3', price: 1 },
    { id: 'rezo-4', name: 'レゾナントリリィの管理方法4', price: 1 },
    { id: 'rezo-5', name: 'レゾナントリリィの管理方法5', price: 30 },
    { id: 'rezo-6', name: 'レゾナントリリィの管理方法6', price: 30 },
];

// レゾナントリリィの正解パラメータを生成
function generateResonantLilyAnswers() {
    return {
        light: Math.floor(Math.random() * 101), // 0-100
        temp: Math.floor(Math.random() * 5) + 1, // 1-5
        water: Math.floor(Math.random() * 4) + 1, // 1-4
        fertilizer: ['緑', '紫', '橙'][Math.floor(Math.random() * 3)] // 緑, 紫, 橙
    };
}

// レゾナントリリィのAIメッセージ
const rezoAIMessages = {
    // 採取後のメッセージ（光量を含む）
    afterHarvest: [
        '採取時の光量は{light}でした。',
    ],
    // 通常のメッセージ
    normal: [
        'レゾナントリリィは共鳴を感じています。',
        '正しいパラメータを見つけてください。',
        '共鳴の音が聞こえます。',
        'パラメータを調整してください。'
    ]
};

// レゾナントリリィのAIメッセージを取得
function getRezoAIMessage(plant) {
    // 採取済みの場合、光量を含むメッセージをランダムに表示
    if (plant.harvestedToday) {
        const messages = rezoAIMessages.afterHarvest;
        const message = messages[Math.floor(Math.random() * messages.length)];
        const lightLevel = plant.harvestParams.lightLevel;
        return message.replace('{light}', lightLevel);
    }
    
    // 通常メッセージ
    return rezoAIMessages.normal[Math.floor(Math.random() * rezoAIMessages.normal.length)];
}

function calculateEssenceRezo(plant) {
    const params = plant.harvestParams;
    const { waterCount, fertilizerColor, fertilizerGiven, lightLevel, tempLevel } = params;
    
    console.log('レゾナントリリィ エッセンス計算:', params);
    
    // 正解パラメータを取得（なければ生成）
    if (!plant.resonantAnswers) {
        plant.resonantAnswers = generateResonantLilyAnswers();
        console.log('レゾナントリリィ 正解パラメータ生成:', plant.resonantAnswers);
    }
    
    const answers = plant.resonantAnswers;
    
    // 総合スコア計算
    let totalScore = 0;
    
    // 光量スコア（正解なら+1、その他-5）
    if (lightLevel === answers.light) {
        totalScore += 1;
        console.log('レゾナントリリィ 光量正解:', lightLevel);
    } else {
        totalScore -= 5;
        console.log('レゾナントリリィ 光量不正解:', lightLevel, '正解:', answers.light);
    }
    
    // 温度スコア（正解なら+1、その他-5）
    if (tempLevel === answers.temp) {
        totalScore += 1;
        console.log('レゾナントリリィ 温度正解:', tempLevel);
    } else {
        totalScore -= 105;
        console.log('レゾナントリリィ 温度不正解:', tempLevel, '正解:', answers.temp);
    }
    
    // 灌水スコア（正解なら+1、その他-105）
    if (waterCount === answers.water) {
        totalScore += 1;
        console.log('レゾナントリリィ 灌水正解:', waterCount);
    } else {
        totalScore -= 105;
        console.log('レゾナントリリィ 灌水不正解:', waterCount, '正解:', answers.water);
    }
    
    // 肥料スコア（正解なら+1、その他-5）
    if (fertilizerGiven && fertilizerColor === answers.fertilizer) {
        totalScore += 1;
        console.log('レゾナントリリィ 肥料正解:', fertilizerColor);
    } else {
        totalScore -= 105;
        console.log('レゾナントリリィ 肥料不正解:', fertilizerColor, '正解:', answers.fertilizer);
    }
    
    console.log('レゾナントリリィ 計算結果:', { totalScore });
    
    // 点数からエッセンス量に変換
    // 全問正解の場合のみエッセンス獲得
    if (totalScore >= 4) return 100;
    else return 0;
}

// レゾナントリリィの採取処理（正気度ダメージ判定）
function handleRezoHarvest(plant) {
    const params = plant.harvestParams;
    const { waterCount, fertilizerColor, fertilizerGiven, tempLevel } = params;
    const answers = plant.resonantAnswers;
    
    // 光量以外が正解かどうかをチェック
    const isTempCorrect = tempLevel === answers.temp;
    const isWaterCorrect = waterCount === answers.water;
    const isFertilizerCorrect = fertilizerGiven && fertilizerColor === answers.fertilizer;
    
    // 1つでも不正解があれば正気度減少
    if (!isTempCorrect || !isWaterCorrect || !isFertilizerCorrect) {
        modifySAN(-30);
        console.log('レゾナントリリィ 正気度ダメージ発生: -30');
    }
}

// Node.js（Jest）で読み込むためのエクスポート
if (typeof module !== 'undefined') {
    module.exports = { calculateEssenceRezo };
}
