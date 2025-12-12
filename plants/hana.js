// ハナモドキの難易度情報
const hanaDifficulty = {
    managementLevel: 2,      // 管理難易度: Lv.2
    damageScale: 'Anthes'    // 予想被害規模: Anthes
};

// ハナモドキの管理方法データ
const hanaHintContents = {
    'hana-1': { text: 'ハナモドキは左の植物を模倣します。推奨される管理方法は左の植物と同じです。ただし、一部処理は適用されません。' },
};

const hanaHints = [
    { id: 'hana-1', name: 'ハナモドキの管理方法1', price: 20 }
];

function calculateEssenceHana(plant, mockNeighbors = null) {
    // 左にある植物のインデックスを取得
    const currentIndex = mockNeighbors ? 0 : window.plantData.indexOf(plant);
    const leftPlantIndex = currentIndex - 1;
    
    const leftPlant = mockNeighbors?.left || window.plantData[leftPlantIndex];
    if (!leftPlant) {
        console.log('ハナモドキ 左の植物が存在しません');
        return 0;
    }
    console.log('ハナモドキ 左の植物:', leftPlant.name);
    
    // 左の植物の計算関数を呼び出す（calculateEssenceを使うと無限再帰になるため、直接関数名を構築）
    // 関数名のマッピング
    // 左の植物がカネセンカの場合、特殊処理
    if (leftPlant.id === 'kane') {
        return calculateEssenceKane(plant);
    }
    
    // 共通関数を使用して左の植物のエッセンス計算
    const calculateFunc = getPlantCalculateFunction(leftPlant.id);
    if (calculateFunc) {
        const essence = calculateFunc(leftPlant);
        
        // ログ追加
        logPlantInteraction('hana', leftPlant.id, 'essence_copy', essence);
        
        return essence;
    }
    
    return 0;
}

// カネセンカのエッセンス計算を呼び出すためのヘルパー関数
function calculateEssenceKane(plant, mockNeighbors = null) {
    // ハナモドキの場合、左の植物の投資額を使用
    if (plant.id === 'hana') {
        const currentIndex = mockNeighbors ? 0 : window.plantData.indexOf(plant);
        const leftPlantIndex = currentIndex - 1;
        const leftPlant = mockNeighbors?.left || window.plantData[leftPlantIndex];
        
        if (!leftPlant) {
            console.log('ハナモドキ（カネセンカ模倣）左の植物が存在しません');
            return 0;
        }
        
        // 左の植物の投資額を取得
        const investmentGold = (leftPlant.waterCount || leftPlant.harvestParams?.waterCount || 0) * 10;
        
        // ハナモドキのパラメータでスコア計算
        const params = plant.harvestParams;
        const { fertilizerColor, fertilizerGiven, lightLevel, tempLevel } = params;
        
        let totalScore = 0;
        
        // 光量スコア
        if (lightLevel >= 0 && lightLevel <= 49) totalScore -= 1;
        else if (lightLevel >= 50 && lightLevel <= 59) totalScore += 1;
        else if (lightLevel >= 60 && lightLevel <= 80) totalScore += 3;
        else if (lightLevel >= 81 && lightLevel <= 100) totalScore += 1;
        
        // 温度スコア
        if (tempLevel === 1) totalScore -= 1;
        else if (tempLevel === 2) totalScore += 2;
        else if (tempLevel === 3) totalScore += 2;
        else if (tempLevel === 4) totalScore += 0;
        else if (tempLevel === 5) totalScore -= 1;
        
        // 肥料スコア（カネセンカと同じ動的判定）
        let fertilizerScore = 0;
        if (!fertilizerGiven) {
            fertilizerScore = -3;
        } else {
            // 収穫時の所持金を取得
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
            
            console.log('ハナモドキ（カネセンカ模倣）肥料判定:', {
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
        
        // 倍率を算出
        let multiplier = 0;
        if (totalScore >= 10) multiplier = 3.0;
        else if (totalScore >= 6) multiplier = 2.0;
        else if (totalScore >= 2) multiplier = 1.0;
        else if (totalScore >= -2) multiplier = 0.5;
        else multiplier = 0;
        
        const essence = Math.floor(investmentGold * multiplier);
        console.log('ハナモドキ（カネセンカ倍率適用）:', { investmentGold, totalScore, multiplier, essence });
        return essence;
    }
    
    // カネセンカ自身の場合
    return calculateEssenceKane(plant);
}

// Node.js（Jest）で読み込むためのエクスポート
if (typeof module !== 'undefined') {
    module.exports = { calculateEssenceHana };
}

