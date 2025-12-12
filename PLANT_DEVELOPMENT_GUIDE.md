# 植物追加・開発マニュアル

このマニュアルでは、新しい植物を追加し、テストファイルを作成する手順を説明します。

## 目次

1. [植物ファイルの作成](#植物ファイルの作成)
2. [難易度情報の設定](#難易度情報の設定)
3. [必須関数の実装](#必須関数の実装)
4. [エクスポートの追加](#エクスポートの追加)
5. [app.jsへの登録](#appjsへの登録)
6. [テストファイルの作成](#テストファイルの作成)
7. [チェックリスト](#チェックリスト)

---

## 植物ファイルの作成

### 1. ファイル名と場所

- **場所**: `plants/` ディレクトリ
- **ファイル名**: `[植物ID].js` (例: `kocho.js`, `hana.js`)
- **命名規則**: 小文字、英数字のみ

### 2. 基本的な構造

各植物ファイルには以下の要素が必要です：

```javascript
// 難易度情報（必須）
const [plantId]Difficulty = {
    managementLevel: 1,      // 管理難易度: 1, 2, または 3
    damageScale: 'Blas'       // 予想被害規模: 'Blas', 'Kalyx', または 'Anthes'
};

// 管理方法データ
const [plantId]HintContents = {
    '[plantId]-1': { text: '管理方法1の説明' },
    '[plantId]-2': { text: '管理方法2の説明' },
    // ...
};

const [plantId]Hints = [
    { id: '[plantId]-1', name: '管理方法1の名前', price: 3 },
    { id: '[plantId]-2', name: '管理方法2の名前', price: 5 },
    // ...
];

// エッセンス計算関数（必須）
function calculateEssence[PlantName](plant) {
    // 実装
}

// Node.js（Jest）で読み込むためのエクスポート（必須）
if (typeof module !== 'undefined') {
    module.exports = { calculateEssence[PlantName] };
}
```

### 3. 関数命名規則

- **エッセンス計算**: `calculateEssence[PlantName]` (例: `calculateEssenceKocho`)
- **管理方法の変数**: `[plantId]Hints`, `[plantId]HintContents`
- **難易度情報の変数**: `[plantId]Difficulty` (例: `kochoDifficulty`)

---

## 難易度情報の設定

### 難易度の種類

- **管理難易度 (managementLevel)**: `1`, `2`, `3` のいずれか
  - Lv.1: 管理しやすい、手間が少ない
  - Lv.2: 中程度の管理の複雑さ
  - Lv.3: 管理が複雑、手間が多い

- **予想被害規模 (damageScale)**: `'Blas'`, `'Kalyx'`, `'Anthes'` のいずれか
  - Blas: 小さい方（被害が小さい）
  - Kalyx: 中程度（被害が中程度）
  - Anthes: 大きい方（被害が大きい）

### 設定例

```javascript
// 難易度情報
const kochoDifficulty = {
    managementLevel: 1,      // Lv.1
    damageScale: 'Anthes'    // 大きな被害
};
```

### 表示

難易度情報は以下の場所に自動的に表示されます：

- **モニター画面**: 右上に表示（例: "Lv.1 - Anthes"）
- **植物選択画面**: 植物名の下に表示（例: "Lv.2 - Kalyx"）

内部で `plant.difficulty` プロパティとしてアクセス可能です。

---

## 必須関数の実装

### calculateEssence[PlantName]

エッセンス計算の核となる関数です。必ず実装してください。

```javascript
function calculateEssence[PlantName](plant) {
    const params = plant.harvestParams;
    const { waterCount, fertilizerColor, fertilizerGiven, lightLevel, tempLevel } = params;
    
    console.log('[植物名] エッセンス計算:', params);
    
    // スコア計算
    let totalScore = 0;
    
    // 光量スコア
    let lightScore = 0;
    // 条件分岐でスコアを決定
    
    // 温度スコア
    let tempScore = 0;
    // 条件分岐でスコアを決定
    
    // 灌水スコア
    let waterScore = 0;
    // 条件分岐でスコアを決定
    
    // 肥料スコア
    let fertilizerScore = 0;
    // 条件分岐でスコアを決定
    
    totalScore = lightScore + tempScore + waterScore + fertilizerScore;
    
    // エッセンス量への変換（5段階など）
    let essence = 0;
    if (totalScore >= 10) essence = 50;
    else if (totalScore >= 8) essence = 35;
    // ...
    
    console.log('[植物名] 計算結果:', { totalScore, essence });
    
    return essence;
}
```

### harvestParams の構造

```javascript
plant.harvestParams = {
    waterCount: 0,           // 灌水回数（整数）
    fertilizerColor: null,  // 肥料の色: '緑', '紫', '橙', または null
    fertilizerGiven: false, // 施肥を行ったかどうか（boolean）
    lightLevel: 50,        // 光量レベル（0-100）
    tempLevel: 3,           // 温度レベル（1-5）
    harvested: false        // 採取済みかどうか
}
```

---

## エクスポートの追加

**必須**: Jestでテストできるように、ファイルの末尾にエクスポートを追加してください。

```javascript
// Node.js（Jest）で読み込むためのエクスポート
if (typeof module !== 'undefined') {
    module.exports = { calculateEssence[PlantName] };
}
```

**注意**: 関数名は実際の関数名と完全に一致させること（例: `calculateEssenceKocho`）

---

## app.jsへの登録

### 1. perPlantHints への追加

`game-state.js`の`perPlantHints`オブジェクトに追加：

```javascript
const perPlantHints = {
    'kocho': kochoHints,
    'side': waraitakeHints,
    // ...
    '[plantId]': [plantId]Hints,  // ← 追加
};
```

### 2. plantCalculateFuncMap への追加

`game-state.js`の`plantCalculateFuncMap`オブジェクトに追加：

```javascript
const plantCalculateFuncMap = {
    'kocho': 'calculateEssenceKocho',
    'side': 'calculateEssenceSide',
    // ...
    '[plantId]': 'calculateEssence[PlantName]',  // ← 追加
};
```

### 3. plantDifficultyMap への追加

`game-state.js`の`plantDifficultyMap`オブジェクトに追加：

```javascript
const plantDifficultyMap = {
    'kocho': kochoDifficulty,
    'side': sideDifficulty,
    // ...
    '[plantId]': [plantId]Difficulty,  // ← 追加
};
```

**注意**: 難易度情報は植物ファイルで定義した定数名を使用すること（例: `kochoDifficulty`, `sideDifficulty`）

### 4. plantNameToId への追加

`game-state.js`の`plantNameToId`オブジェクトに追加：

```javascript
const plantNameToId = {
    'コチョラン': 'kocho',
    'シデロータス': 'side',
    // ...
    '[植物名]': '[plantId]',  // ← 追加
};
```

### 5. plantSelectionOptions への追加

`game-state.js`の`plantSelectionOptions`配列に追加：

```javascript
const plantSelectionOptions = [
    // ...
    {
        name: '[植物名]',
        icon: '[絵文字]',
        flavor: '[フレーバーテキスト]',
        cost: 0
    }
];
```

### 6. スクリプトタグの追加（HTMLファイル）

`test.html`など、HTMLファイルにスクリプトタグを追加：

```html
<script src="plants/[plantId].js"></script>
```

### 7. shop-system.js への追加

`shop-system.js`の`getHintContent()`関数に植物の管理方法を取得する処理を追加：

```javascript
function getHintContent(hintId) {
    // ...
    } else if (hintId.startsWith('[plantId]-')) {
        const data = [plantId]HintContents[hintId];
        text = String(data?.text || '');
    }
    // ...
}
```

---

## テストファイルの作成

### 1. ファイル名と場所

- **場所**: `plants/` ディレクトリ
- **ファイル名**: `[植物ID].test.js` (例: `kocho.test.js`, `hana.test.js`)

### 2. 基本的なテスト構造

```javascript
const { calculateEssence[PlantName] } = require('./[plantId]');

function createPlant(overrides = {}) {
    return {
        harvestParams: {
            waterCount: 0,
            fertilizerColor: null,
            fertilizerGiven: false,
            lightLevel: 50,
            tempLevel: 3,
            harvested: false,
            ...overrides,
        },
        // 植物固有のプロパティがあれば追加
        // 例: consecutiveWaterDays: 0,
    };
}

describe('calculateEssence[PlantName]', () => {
    test('最適条件でエッセンス[値]を返す', () => {
        const plant = createPlant({
            lightLevel: 30,
            tempLevel: 5,
            waterCount: 2,
            fertilizerGiven: true,
            fertilizerColor: '紫',
        });

        const essence = calculateEssence[PlantName](plant);
        expect(essence).toBe(50); // 期待値を設定
    });

    test('条件が悪い場合はエッセンス0を返す', () => {
        const plant = createPlant({
            lightLevel: 90,
            tempLevel: 1,
            waterCount: 0,
            fertilizerGiven: false,
        });

        const essence = calculateEssence[PlantName](plant);
        expect(essence).toBe(0);
    });
});
```

### 3. テスト実行

```bash
npm test
```

特定の植物のテストのみ実行：

```bash
npm test -- [plantId].test.js
```

---

## チェックリスト

新しい植物を追加する際は、以下のチェックリストを確認してください：

- [ ] 植物ファイル (`plants/[plantId].js`) を作成
- [ ] **難易度情報を追加** (`[plantId]Difficulty`)
- [ ] `calculateEssence[PlantName]` 関数を実装
- [ ] `module.exports` を追加
- [ ] `app.js` の `perPlantHints` に追加
- [ ] `app.js` の `plantCalculateFuncMap` に追加
- [ ] `app.js` の `plantDifficultyMap` に追加
- [ ] HTMLファイルにスクリプトタグを追加（必要に応じて）
- [ ] テストファイル (`plants/[plantId].test.js`) を作成
- [ ] テストを実行してパスすることを確認 (`npm test`)
- [ ] `PLANTS.md` に植物の説明を追加（必要に応じて）

---

## トラブルシューティング

### テストが「Cannot find module」エラーになる

→ `module.exports` が正しく追加されているか確認

### テストが「calculateEssenceXXX is not a function」エラーになる

→ 関数名が `module.exports` と一致しているか確認

### グローバル変数が undefined になる

→ テストファイルで `global.変数名` を設定（例: `global.timeLeftSec = 10`）

### 植物固有のプロパティが undefined になる

→ テストの `createPlant` 関数でプロパティを初期化

### 難易度情報が表示されない

→ `app.js` の `plantDifficultyMap` に追加されているか確認
→ 植物ファイルで `[plantId]Difficulty` が正しく定義されているか確認

---

## 参考ファイル

特殊ロジックの実装例は、既存の植物ファイルを参考にしてください：

- `plants/kocho.js` - 基本的なエッセンス計算
- `plants/side.js` - 連続灌水による効率減少などの状態管理
- `plants/nagi.js` - 前日の状態との比較（環境変化）
- `plants/rezo.js` - ランダムな正解パラメータ
- `plants/kane.js` - グローバル変数の利用（timeLeftSec, window.money）
- `plants/hana.js` - 他植物への依存（左の植物を参照）

各植物のテストファイル（`.test.js`）も同様に参考にできます。

---

## 複雑な特殊ロジック実装時の注意点

今後追加予定の植物には、時間管理、他植物への影響、状態永続化などの複雑な機能が含まれます。以下の点に注意してください。

### 1. 時間管理

#### ゲーム内時間の扱い

- **基本単位**: `timeLeftSec`（残り秒数、グローバル変数）
- **1日**: `DAY_DURATION_SEC = 60` 秒
- **1時間**: 10秒（`timeLeftSec / 10`で時間単位に変換）
- **経過時間**: `DAY_DURATION_SEC - timeLeftSec`

#### 時間条件の実装例

```javascript
// 残り2時間以下をチェック
const timeLeftHours = timeLeftSec / 10;
if (timeLeftHours <= 2.0) {
    // 処理
}

// 開始2時間後（残り4時間以下）
if (timeLeftHours <= 4.0) {
    // 処理
}

// 残り時間がゾロ目かチェック（例: 6.0, 5.5, 4.4）
const timeLeftStr = timeLeftHours.toFixed(1);
const isAllSame = /^(\d)\.\1$/.test(timeLeftStr) || /^(\d+)\.0$/.test(timeLeftStr);
```

#### 時間ベースの定期処理

```javascript
// 0.1時間ごとの処理（1秒ごと）
// app.jsのタイマー内で呼び出される想定
function checkPlantSpecialCondition(plant) {
    const timeLeftHours = timeLeftSec / 10;
    // 処理を実装
}
```

**注意**: テスト時は `global.timeLeftSec` を設定すること

### 2. グローバル変数へのアクセス

以下のグローバル変数にアクセスできますが、テスト容易性を考慮して使用を最小限に：

```javascript
// 利用可能なグローバル変数
window.plantData      // 全植物データの配列
window.money          // 所持金
timeLeftSec           // 残り時間（秒）
player.hp             // プレイヤーのHP
player.san            // プレイヤーのSAN値
```

**推奨**: 関数のパラメータで必要な値を渡す設計にする。テスト時は `global` オブジェクトに設定

### 3. 他植物への影響

#### 左/右の植物へのアクセス

```javascript
function calculateEssence[PlantName](plant) {
    const currentIndex = window.plantData.indexOf(plant);
    const leftPlant = window.plantData[currentIndex - 1];
    const rightPlant = window.plantData[currentIndex + 1];
    
    // 左/右の植物が存在するかチェック
    if (!leftPlant) {
        return 0; // またはデフォルト処理
    }
    
    // 処理を実装
}
```

#### 施設全体への影響

```javascript
// 全植物の温度を変更する例
function applyGlobalTempChange(newTemp) {
    window.plantData.forEach(plant => {
        plant.tempLevel = newTemp;
        plant.harvestParams.tempLevel = newTemp;
    });
}
```

**注意**: 副作用の影響範囲を明確にすること

### 4. 状態の永続化

#### dayEndParams の活用

```javascript
// 前日の状態を保存（翌日比較用）
function handleDayEnd(plant) {
    // dayEndParams に現在の状態をコピー
    plant.dayEndParams = {
        waterCount: plant.harvestParams.waterCount,
        fertilizerColor: plant.harvestParams.fertilizerColor,
        lightLevel: plant.harvestParams.lightLevel,
        tempLevel: plant.harvestParams.tempLevel,
        // ...
    };
}

// 前日との比較
function calculateEssence[PlantName](plant) {
    const dayEndParams = plant.dayEndParams;
    const prevFertilizerColor = dayEndParams?.fertilizerColor ?? null;
    
    // 前日と異なる肥料を比較
    if (plant.harvestParams.fertilizerColor !== prevFertilizerColor) {
        // 処理
    }
}
```

#### 植物固有の状態プロパティ

```javascript
// 植物オブジェクトに直接プロパティを追加
// 例: 連続灌水日数
plant.consecutiveWaterDays = 0;

// 例: サビの状態
plant.rustLevel = 0; // 0: なし, 1: 部分的, 2: 全体

// 翌日への影響を考慮した実装
function handleDayEnd(plant) {
    // サビが拡大する条件
    if (plant.rustLevel === 1 && /* 条件 */) {
        plant.rustLevel = 2; // 翌日全体に拡大
    }
}
```

**注意**: 植物オブジェクトの構造を変更する場合は、テストの `createPlant` でも初期化すること

### 5. UI操作の特殊処理

#### 長押し判定

```javascript
// app.js側で実装する必要がある
// 植物ファイル側ではフラグを設定
let longPressRequired = false;
let longPressDuration = 2000; // ミリ秒

// 採取時に長押しをチェック
function handleHarvest(plant) {
    if (plant.requiresLongPress && !wasLongPressed) {
        // 長押しされていない場合の処理
        modifySAN(-5); // 例: SAN最大値減少
        return;
    }
}
```

#### ボタンの反応が悪い（複数回押す必要）

```javascript
// 植物固有のカウンターを追加
plant.buttonPressCount = 0;
const REQUIRED_PRESSES = 4;

function handleWater(plant) {
    plant.buttonPressCount++;
    if (plant.buttonPressCount >= REQUIRED_PRESSES) {
        // 実際の灌水処理
        plant.waterCount++;
        plant.buttonPressCount = 0;
    }
}
```

**注意**: UI操作は `app.js` 側で実装が必要。植物ファイル側は状態管理のみ

### 6. ランダム要素と状態変更

#### スワイプごとのランダム変更

```javascript
// app.jsのchangeMonitor関数内で呼び出される想定
function onMonitorChange(plant) {
    // 温度レベルをランダムに変更
    const randomTemp = Math.floor(Math.random() * 5) + 1;
    plant.tempLevel = randomTemp;
    plant.harvestParams.tempLevel = randomTemp;
    
    // ステータスをランダムに変更
    const statuses = ['安全', '注意', '危険'];
    plant.fakeStatus = statuses[Math.floor(Math.random() * statuses.length)];
}
```

#### 一定時間ごとの状態切り替え

```javascript
// app.jsのタイマー内で呼び出し
function updatePlantSpecialState(plant) {
    const TIME_INTERVAL = 1.0; // 1時間ごと
    const timeLeftHours = timeLeftSec / 10;
    
    // 切り替えタイミングを判定
    if (Math.floor(timeLeftHours) % TIME_INTERVAL === 0) {
        // 状態を更新（例: 花弁の色）
        plant.petalColor = getRandomColor();
    }
}
```

### 7. 採取順序による影響

```javascript
// 採取順序を記録
let harvestOrder = [];

function handleHarvest(plant) {
    harvestOrder.push(plant.id);
    
    // 特定の植物が採取された後に他の植物を採取すると影響
    const specialPlantHarvested = harvestOrder.includes('specialPlantId');
    if (specialPlantHarvested && plant.id !== 'specialPlantId') {
        // エッセンスがリセットされるなどの処理
        plant.essenceGained = 0;
    }
}
```

### 8. 表示の制御（タイマー非公開など）

```javascript
// タイマーの表示/非表示を制御
function shouldHideTimer(plant) {
    return plant.hideTimer || false;
}

// app.js側で利用
if (shouldHideTimer(currentPlant)) {
    timerEl.style.display = 'none';
} else {
    timerEl.style.display = 'block';
}
```

### 9. テスト時の注意点

#### 複雑な状態を持つ植物のテスト

```javascript
describe('calculateEssence[PlantName]', () => {
    beforeEach(() => {
        // グローバル変数をリセット
        global.timeLeftSec = 50; // 残り5時間
        global.window = {
            plantData: [],
            money: 100
        };
        
        // プレイヤーの状態
        global.player = { hp: 100, san: 100 };
    });
    
    test('時間条件を満たす場合', () => {
        global.timeLeftSec = 24; // 残り2.4時間
        
        const plant = createPlant({ /* ... */ });
        const essence = calculateEssence[PlantName](plant);
        expect(essence).toBeGreaterThan(0);
    });
    
    test('他植物の影響を受ける場合', () => {
        const leftPlant = createLeftPlant('kocho');
        global.window.plantData = [leftPlant, plant];
        
        const essence = calculateEssence[PlantName](plant);
        expect(essence).toBe(expectedValue);
    });
});
```

#### 状態の初期化

```javascript
function createPlant(overrides = {}) {
    return {
        harvestParams: { /* ... */ },
        dayEndParams: { /* ... */ },
        // 植物固有の状態を初期化
        consecutiveWaterDays: 0,
        rustLevel: 0,
        buttonPressCount: 0,
        hideTimer: false,
        // ...
        ...overrides,
    };
}
```

### 10. 実装のベストプラクティス

1. **副作用の分離**: エッセンス計算と副作用（ダメージ、状態変更）は別関数に分ける
2. **nullチェック**: 他植物やグローバル変数へのアクセス時は必ず存在チェック
3. **状態の明確化**: 植物固有の状態プロパティは明示的にコメントで説明
4. **テスト容易性**: 関数は可能な限り純粋関数にする。必要な値はパラメータで受け取る
5. **ログの活用**: 複雑な状態変化には console.log で追跡可能にする

---

## 追加のヒント

1. **console.log を活用**: デバッグ時に計算過程を確認できるようにログを残す
2. **テストは複数のケース**: 最適条件、悪条件、境界値など複数のテストケースを作成
3. **コメントを書く**: 特殊なロジックには理由をコメントで説明
4. **既存パターンを再利用**: 類似の植物があれば、その実装を参考にする

