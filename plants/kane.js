// カネセンカの難易度情報
const kaneDifficulty = {
    managementLevel: 2,      // 管理難易度: Lv.2
    damageScale: 'Blas'      // 予想被害規模: Blas
};

// カネセンカの管理方法データ
const goldenBerryHintContents = {
    'kane-1': { text: 'カネセンカは「灌水」の代わりに「投資」を行うことが出来ます。' },
    'kane-2': { text: 'カネセンカに「投資」を行うと、1回ごとに所持金から10Gを投資します。' },
    'kane-3': { text: 'カネセンカのエッセンス量は「投資ゴールド×トータルスコアから算出される倍率（最大3倍）」です。' },
    'kane-4': { text: 'カネセンカは日没まで残り1時間を切るまで採取しないでください。' }
};

const goldenBerryHints = [
    { id: 'kane-1', name: 'カネセンカの管理方法1', price: 3 },
    { id: 'kane-2', name: 'カネセンカの管理方法2', price: 3 },
    { id: 'kane-3', name: 'カネセンカの管理方法3', price: 3 },
    { id: 'kane-4', name: 'カネセンカの管理方法4', price: 5 }
];

function calculateEssenceKane(plant) {
    const params = plant.harvestParams;
    const { waterCount, fertilizerColor, fertilizerGiven, lightLevel, tempLevel } = params;
    
    console.log('カネセンカ（ID:kane）エッセンス計算:', params);
    
    // 残り時間をチェック（残り1時間より前は倍率0）
    const timeLeftHours = timeLeftSec / 10; // ゲーム内時間（時間単位）
    const isBeforeOneHour = timeLeftHours > 1.0;
    
    if (isBeforeOneHour) {
        console.log('カネセンカ 残り1時間より前に採取したため倍率0');
        return 0;
    }
    
    // 投資額を取得（waterCountが投資回数）
    const investmentGold = waterCount * 10;
    
    // 総合スコア計算
    let totalScore = 0;
    
    // 光量スコア（60～80が最適）
    let lightScore = 0;
    if (lightLevel >= 0 && lightLevel <= 49) lightScore = -1;
    else if (lightLevel >= 50 && lightLevel <= 84) lightScore = 1;
    else if (lightLevel >= 85 && lightLevel <= 90) lightScore = 3;
    else if (lightLevel >= 91 && lightLevel <= 100) lightScore = 0;
    totalScore += lightScore;
    
    // 温度スコア（2～3が最適）
    let tempScore = 0;
    if (tempLevel === 1) tempScore = 0;
    else if (tempLevel === 2) tempScore = 0;
    else if (tempLevel === 3) tempScore = 1;
    else if (tempLevel === 4) tempScore = 0;
    else if (tempLevel === 5) tempScore = 0;
    totalScore += tempScore;
    
    // 肥料スコア（肥料が特に重要・動的判定）
    // 収穫時の所持金と投資額を比較して最適な肥料を決定
    let fertilizerScore = 0;
    if (!fertilizerGiven) {
        fertilizerScore = -3;
    } else {
        // 収穫時の所持金を取得（app.jsのグローバル変数）
        const currentMoney = window.money || 0;
        
        // 最適な肥料色を判定
        let optimalColor = '';
        if (currentMoney > investmentGold) {
            optimalColor = '緑';
        } else if (currentMoney < investmentGold) {
            optimalColor = '橙';
        } else {
            optimalColor = '紫';
        }
        
        console.log('カネセンカ 肥料判定:', {
            currentMoney,
            investmentGold,
            optimalColor,
            givenColor: fertilizerColor
        });
        
        // 最適な肥料なら+3、それ以外は-2
        if (fertilizerColor === optimalColor) {
            fertilizerScore = 3;
        } else {
            fertilizerScore = -2;
        }
    }
    totalScore += fertilizerScore;
    
    console.log('カネセンカ 計算結果:', { totalScore, investmentGold });
    
    // トータルスコアから倍率を算出（最大3倍）
    let multiplier = 0;
    if (totalScore >= 7) multiplier = 2.0;
    else if (totalScore >= 5) multiplier = 1.5;
    else if (totalScore >= 2) multiplier = 1.0;
    else multiplier = 0.5;
    
    // エッセンス量 = 投資ゴールド × 倍率
    const essence = Math.floor(investmentGold * multiplier);
    
    console.log('カネセンカ エッセンス量:', { investmentGold, multiplier, essence });
    
    return essence;
}

// Node.js（Jest）で読み込むためのエクスポート
if (typeof module !== 'undefined') {
    module.exports = { calculateEssenceKane };
}
