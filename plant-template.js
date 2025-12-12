// 植物テンプレートファイル
// このファイルをコピーして各植物専用のファイルを作成してください

// 植物名（例：標本B：ワライダケ）
const PLANT_NAME = '標本X：植物名';
const PLANT_ID = 'x'; // 植物ID（小文字）

// 管理方法データ
const plantHintContents = {
    'x-1': { text: '植物Xの管理方法1の内容をここに記述してください。' },
    'x-2': { text: '植物Xの管理方法2の内容をここに記述してください。' },
    'x-3': { text: '植物Xの管理方法3の内容をここに記述してください。' },
    'x-4': { text: '植物Xの管理方法4の内容をここに記述してください。' },
    // 必要に応じて管理方法数を増減してください
};

const plantHints = [
    { id: 'x-1', name: '植物Xの管理方法1', price: 5 },
    { id: 'x-2', name: '植物Xの管理方法2', price: 7 },
    { id: 'x-3', name: '植物Xの管理方法3', price: 10 },
    { id: 'x-4', name: '植物Xの管理方法4', price: 12 },
    // 価格と名前を調整してください
];

// エッセンス計算関数
function calculateEssenceX(plant) {
    const params = plant.harvestParams;
    const { waterCount, fertilizerColor, fertilizerGiven, lightLevel, tempLevel } = params;
    
    console.log('植物X エッセンス計算:', params);
    
    // ここに植物X専用のエッセンス計算ロジックを実装してください
    // 例：基本的なスコア計算
    let totalScore = 0;
    
    // 光量スコア（例）
    if (lightLevel >= 0 && lightLevel <= 30) totalScore += 1;
    else if (lightLevel >= 31 && lightLevel <= 70) totalScore += 2;
    else if (lightLevel >= 71 && lightLevel <= 100) totalScore += 1;
    
    // 温度スコア（例）
    if (tempLevel === 1) totalScore += 0;
    else if (tempLevel === 2) totalScore += 1;
    else if (tempLevel === 3) totalScore += 2;
    else if (tempLevel === 4) totalScore += 1;
    else if (tempLevel === 5) totalScore += 0;
    
    // 灌水スコア（例）
    if (waterCount === 0) totalScore += 0;
    else if (waterCount === 1) totalScore += 1;
    else if (waterCount === 2) totalScore += 2;
    else if (waterCount === 3) totalScore += 1;
    else totalScore += 0; // 4回以上
    
    // 施肥スコア（例）
    if (fertilizerGiven && fertilizerColor === 'green') totalScore += 1;
    else if (fertilizerGiven && fertilizerColor === 'purple') totalScore += 2;
    else if (fertilizerGiven && fertilizerColor === 'orange') totalScore += 1;
    else totalScore += 0; // 施肥なし
    
    // エッセンス変換（例：5段階）
    let essence = 0;
    if (totalScore >= 8) essence = 40;
    else if (totalScore >= 6) essence = 25;
    else if (totalScore >= 4) essence = 15;
    else if (totalScore >= 2) essence = 8;
    else if (totalScore >= 1) essence = 3;
    else essence = 0;
    
    console.log('植物X 計算結果:', { totalScore, essence });
    
    return essence;
}

// 特殊ロジック関数（必要に応じて実装）
function checkPlantXManagement(plant) {
    // 植物Xの管理操作チェック
    // 例：特定の条件で爆発するなどの特殊ロジック
    const params = plant.dayEndParams;
    const { waterCount, fertilizerGiven, lightLevel, tempLevel, harvested } = params;
    
    // ここに植物X専用の管理チェックロジックを実装
    // 例：何らかの管理操作が行われたかチェック
    let hasManagement = false;
    if (waterCount > 0) hasManagement = true;
    if (fertilizerGiven) hasManagement = true;
    if (harvested) hasManagement = true;
    if (lightLevel !== 50) hasManagement = true; // デフォルト値から変更されたか
    if (tempLevel !== 3) hasManagement = true; // デフォルト値から変更されたか
    
    console.log('植物X 管理操作チェック:', {
        waterCount, fertilizerGiven, lightLevel, tempLevel, harvested, hasManagement
    });
    
    return hasManagement;
}

// 爆発処理関数（必要に応じて実装）
function handlePlantXExplosion() {
    // 植物Xの爆発処理
    console.log('植物X 爆発発生！');
    // 例：HP減少、フィードバック表示など
    // modifyHP(-50); // app.jsの関数を使用
    // showFeedback('植物Xが爆発しました！HP -50');
}

// ステータスチェック関数（リアルタイム表示用）
function checkPlantXStatus(plant) {
    // 植物Xのリアルタイムステータスチェック
    const params = plant.harvestParams;
    const { waterCount, fertilizerGiven, lightLevel, tempLevel } = params;
    
    // ここに植物X専用のステータス判定ロジックを実装
    // 例：管理状況に応じて「安定」「注意」「危険」を返す
    
    let hasManagement = false;
    if (waterCount > 0) hasManagement = true;
    if (fertilizerGiven) hasManagement = true;
    if (lightLevel !== 50) hasManagement = true;
    if (tempLevel !== 3) hasManagement = true;
    
    if (!hasManagement) {
        const currentTime = formatTimeNumber(timeLeftSec); // app.jsのグローバル変数
        const timeLeft = parseFloat(currentTime);
        
        if (timeLeft <= 1.0) {
            return '危険'; // 赤文字
        } else if (timeLeft <= 2.0) {
            return '注意'; // 黄文字
        }
    }
    
    return '安定'; // 通常の緑文字
}

// 使用方法：
// 1. このファイルをコピーして plant-[植物名].js として保存
// 2. PLANT_NAME, PLANT_ID を適切な値に変更
// 3. 管理方法データ（plantHintContents, plantHints）を編集
// 4. エッセンス計算ロジック（calculateEssenceX）を実装
// 5. 必要に応じて特殊ロジック関数を実装
// 6. app.js でこのファイルを読み込み、perPlantHints に追加
// 7. calculateEssence 関数の switch 文に case を追加
// 8. getHintContent 関数に管理方法取得ロジックを追加
