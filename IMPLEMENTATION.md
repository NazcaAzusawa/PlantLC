# 実装詳細

## メンテナンスガイドライン

### コメントと実装の不一致について

**原則: コメントが間違っている場合はコメントを修正する**

- コードの実装が常に正しい
- コメントが実装と矛盾している場合は、コメントを実装に合わせて修正する
- 実装をコメントに合わせて変更してはいけない

## ファイル構成

```
LC/
├── test.html            # メインHTMLファイル
├── styles.css           # スタイルシート
├── app.js               # メインゲームロジック（エントリーポイント）
├── game-state.js        # グローバル状態、植物データ、難易度情報
├── game-loop.js         # ゲームループ、タイマー、デイ終了処理
├── ui-controls.js       # UI操作、モニター表示、コントロール
├── shop-system.js       # 管理方法ショップ、植物選択画面
├── plants/
│   ├── kocho.js         # コチョラン専用ロジック
│   ├── side.js           # シデロータス専用ロジック
│   ├── hana.js           # ハナモドキ専用ロジック
│   ├── nagi.js           # ナギノゾミ専用ロジック
│   ├── kane.js           # カネセンカ専用ロジック
│   ├── here.js           # ヘレボラスト専用ロジック
│   ├── aqua.js           # アクアステラ専用ロジック
│   ├── rezo.js           # レゾナントリリィ専用ロジック
│   ├── dai.js            # ダイダイダイ専用ロジック
│   ├── rete.js           # レテレテ専用ロジック
│   ├── tribu.js          # トリビュソス専用ロジック
│   ├── kokyu.js          # コキュートス専用ロジック
│   ├── kuryu.js          # クリュソボロス専用ロジック
│   ├── babel.js          # バベル専用ロジック
│   └── *.test.js         # テストファイル
├── DESIGN.md            # ゲームシステム設計
├── IMPLEMENTATION.md    # このファイル
└── PLANT_DEVELOPMENT_GUIDE.md  # 植物追加マニュアル
```

## データ構造

### 植物データ (plantData)

```javascript
{
    id: 'kocho',              // 植物を識別するID（英語の文字列）
    name: "コチョラン",        // 表示名
    status: "安定",           // 「安定」「要観察」など
    waterCount: 0,            // 本日の灌水回数
    fertilizedToday: false,   // 本日の施肥有無
    harvestedToday: false,    // 本日の採取有無
    lightLevel: 50,           // 現在の光量レベル（0-100）
    tempLevel: 3,             // 現在の温度レベル（1-5）
    fertilizer: 0,            // 肥料の種類（互換性のため残存）
    fertilizerColor: null,    // 肥料の色（'緑'/'紫'/'橙'）
    
    // 採取時のパラメータ（エッセンス量計算用）
    harvestParams: {
        waterCount: 0,
        fertilizerColor: null,
        fertilizerGiven: false,
        lightLevel: 50,
        tempLevel: 3,
        harvested: false
    },
    
    // デイ終了時のパラメータ（特殊判定・翌日初期値用）
    dayEndParams: {
        waterCount: 0,
        fertilizerColor: null,
        fertilizerGiven: false,
        lightLevel: 50,
        tempLevel: 3,
        harvested: false
    }
}
```

## エッセンス計算関数の責任

### 原則

`calculateEssence{PlantName}`関数は**エッセンス量の計算のみ**を行う。

### 含めてはいけないもの

- ダメージ計算
- ペナルティの適用
- 状態の変更
- 副作用のある処理

### 含めるべきもの

- 光量、温度、灌水、肥料などのパラメータからスコアを計算
- スコアからエッセンス量を算出
- エッセンス量を返す

### 副作用は別関数で実装

ダメージやペナルティなどの副作用は、別の関数（`handle{PlantName}{Action}`）として実装する。

例：
- `handleSiderotasHarvest(plant, essenceAmount)` - シデロータスの採取ダメージ
- `handleRezoHarvest(plant)` - レゾナントリリィの正気度ダメージ
- `handleAquaWaterInterval(plant)` - アクアステラの1時間間隔チェック
- `handleNaginozomiFertilizer(plant, fertilizerColor)` - ナギノゾミの施肥ダメージ
- `handleNaginozomiWater(plant)` - ナギノゾミの灌水ダメージ

### 理由

この設計により、ハナモドキが左の植物のエッセンス計算を呼び出した際に、不要な副作用が発生しない。ハナモドキは純粋にエッセンス量のみを取得できる。

## ゲームループ

### 日次タイマー

```javascript
function updateDayTimer() {
    timeLeftSec--;
    const hoursLeft = (timeLeftSec / 10).toFixed(1);
    timerEl.textContent = `残り時間: ${hoursLeft}時間`;
    
    if (timeLeftSec <= 0) {
        endDay();
    }
}
```

### デイ終了処理

1. デイ終了時のパラメータを保存
2. 特殊判定（例：コチョランの爆発判定）
3. リザルト画面表示
4. 植物選択画面表示（新しい植物を追加）

## 管理操作の実装

### 灌水

```javascript
btnWater.addEventListener('click', () => {
    plant.waterCount++;
    plant.harvestParams.waterCount = plant.waterCount;
    updateControlsUI();
});
```

### 施肥

```javascript
fertButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const color = btn.dataset.color;
        plant.fertilizerColor = color;
        plant.fertilizedToday = true;
        plant.harvestParams.fertilizerColor = color;
        plant.harvestParams.fertilizerGiven = true;
        updateControlsUI();
    });
});
```

### 光量調整

```javascript
sliderLight.addEventListener('input', (e) => {
    plant.lightLevel = parseInt(e.target.value);
    plant.harvestParams.lightLevel = plant.lightLevel;
    updateControlsUI();
});
```

### 温度調整

```javascript
tempButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const level = parseInt(btn.dataset.level);
        plant.tempLevel = level;
        plant.harvestParams.tempLevel = level;
        updateControlsUI();
    });
});
```

### 採取

```javascript
btnHarvest.addEventListener('click', () => {
    plant.harvestParams.waterCount = plant.waterCount;
    plant.harvestParams.lightLevel = plant.lightLevel;
    plant.harvestParams.tempLevel = plant.tempLevel;
    plant.harvestParams.fertilizerGiven = plant.fertilizedToday;
    plant.harvestParams.fertilizerColor = plant.fertilizerColor || null;
    plant.harvestParams.harvested = true;
    
    essenceGained = calculateEssence(plant);
    essenceGainedToday += essenceGained;
    plant.harvestedToday = true;
    
    updateControlsUI();
});
```

## エッセンス計算システム

### 点数制

各植物は独自の点数計算ロジックを持ちます：

```javascript
function calculateEssenceKocho(plant) {
    const params = plant.harvestParams;
    const { waterCount, fertilizerColor, fertilizerGiven, lightLevel, tempLevel } = params;
    
    let totalScore = 0;
    
    // 光量スコア
    if (lightLevel >= 0 && lightLevel <= 15) totalScore += 2;
    else if (lightLevel >= 16 && lightLevel <= 49) totalScore += 3;
    // ...
    
    // 温度スコア
    if (tempLevel === 1) totalScore += 0;
    // ...
    
    // 点数からエッセンス量に変換
    if (totalScore >= 15) return 50;
    else if (totalScore >= 10) return 35;
    // ...
    
    return essence;
}
```

### 動的関数呼び出し

```javascript
// 植物IDから計算関数へのマッピング（app.jsで定義）
const plantCalculateFuncMap = {
    'kocho': 'calculateEssenceKocho',
    'side': 'calculateEssenceSide',
    'hana': 'calculateEssenceHana',
    'nagi': 'calculateEssenceNagi',
    'kane': 'calculateEssenceKane',
    'here': 'calculateEssenceHere',
    'aqua': 'calculateEssenceAqua',
    'rezo': 'calculateEssenceRezo',
    'dai': 'calculateEssenceDai',
    'rete': 'calculateEssenceRete',
    'tribu': 'calculateEssenceTribu',
    'kokyu': 'calculateEssenceKokyu',
    'kuryu': 'calculateEssenceKuryu',
    'babel': 'calculateEssenceBabel'
};

// 共通関数を使用して計算
function calculateEssence(plant) {
    const funcName = plantCalculateFuncMap[plant.id];
    const func = window[funcName];
    if (func) return func(plant);
    return 0;
}
```

## 管理方法システム

### 購入状態の管理

```javascript
const purchasedHints = {
    'kocho': [],
    'side': []
};

const perPlantHints = {
    'kocho': kochoHints,
    'side': waraitakeHints,
    'hana': hanaHints,
    'nagi': crystalLeafHints,
    'kane': goldenBerryHints,
    'here': moonFlowerHints,
    'aqua': stormWeedHints,
    'rezo': eternalTreeHints,
    'dai': daiHints,
    'rete': reteHints,
    'tribu': tribuHints,
    'kokyu': kokyuHints,
    'kuryu': kuryuHints,
    'babel': babelHints
};
```

### 購入処理

```javascript
function purchaseHint(hintId) {
    const plantId = currentPlant.id;
    if (!purchasedHints[plantId]) {
        purchasedHints[plantId] = [];
    }
    
    purchasedHints[plantId].push(hintId);
    money -= hint.price;
    shopMoneyIngameEl.textContent = String(money);
    
    updateHintDisplay();
}
```

## 画面遷移

### スワイプシステム

```javascript
const SWIPE_THRESHOLD = 50; // スワイプ距離の閾値
const SWIPE_VELOCITY_THRESHOLD = 0.3; // スワイプ速度の閾値（px/ms）

monitorWrapper.addEventListener('touchend', (e) => {
    const dx = touchEndX - monitorTouchStartX;
    const velocity = Math.abs(dx) / dt;
    
    if (velocity > SWIPE_VELOCITY_THRESHOLD) {
        // モニター切り替え
        changeMonitor(newIndex);
    }
});
```

### モニター切り替え

```javascript
function changeMonitor(newIndex) {
    currentPlantIndex = newIndex;
    const offset = -newIndex * 100;
    monitorWrapper.style.transform = `translateX(${offset}%)`;
    updateControlsUI();
}
```

## パフォーマンス最適化

### DOM要素のキャッシュ

```javascript
let cachedTimerNumber = null;
let cachedParamDisplay = null;
let cachedPlantAStatusEl = null;
let cachedPlantA = null;
```

### 条件付き更新

```javascript
if (cachedPlantAStatusEl.textContent !== status) {
    cachedPlantAStatusEl.textContent = status;
    // 色の更新...
}
```

## 技術スタック

- **HTML5**: 構造
- **CSS3**: スタイリング（Grid、Flexbox、Custom Properties）
- **Vanilla JavaScript**: ゲームロジック（フレームワーク不使用）
- **Responsive Design**: `clamp()`, `vmin`, `vh`でレスポンシブ対応

## 注意事項

### データの一貫性

- **植物ID**: 英語の文字列で管理（例: `'kocho'`, `'side'`, `'hana'`）
- **管理方法ID**: `{plantId}-{number}`形式で統一（例: `'kocho-1'`, `'side-1'`, `'rezo-1'`）
  - 旧アルファベット1文字形式（`a-`, `b-`, `j-`など）は使用しない
  - 26個を超える植物にも対応できる形式
- `harvestParams`と`dayEndParams`は用途が異なるため、別々に管理

### コードの保守性

- 植物ごとのロジックは専用ファイルに分離
- 共通ロジックは`app.js`に集約
- エッセンス計算関数は副作用を含まない
- 副作用は別関数として実装

## 各植物の管理パラメータとエッセンスの関係

### コチョラン（kocho）
- **光量**: 16-49（+3）、0-15（+2）、50-69（0）、70-89（-1）、90-100（-2）
- **温度**: 5（+3）、4（+2）、3（+1）
- **灌水**: 1-3回（+1）
- **肥料**: 紫（+3）、緑/橙/未施肥（-10）
- **エッセンス**: 10点以上で50、8-9で35、6-7で20、4-5で10、1-3で5
- **特殊**: 管理操作なし → 爆発（HP-100）

### シデロータス（side）
- **光量**: 30-70（+2）、0-29（+1）、71-100（0）
- **温度**: 3-5（+1）、1-2（0）
- **灌水**: 1回（+3）、2回（+2）、3回以上（+1）
- **肥料**: 影響なし（計算に含まれない）
- **エッセンス**: 5点以上で50、3-4で30、1-2で10、0で0
- **特殊**: 連続灌水2日以上 → エッセンス50%減少、採取時にダメージ（本来のエッセンス量の50%）

### ナギノゾミ（nagi）
- **光量**: 50-70（+3）、40-49（+1）、0-39/81-100（-1）、71-80（+1）
- **温度**: 3（+3）、2（+2）、4（+1）、1/5（-1）
- **灌水**: 3回（+3）、4回（+2）、2回（+1）、1回（0）、5回以上（-1）、0回（-2）
- **肥料**: 紫（+3）、緑（+1）、橙/未施肥（-1）
- **エッセンス**: 11点以上で40、6-10で28、2-5で15、-2〜1で5、-3以下で0
- **特殊**: 環境変化（光量・温度が前日と異なる）でエッセンス30%に減少、前日と異なる肥料でHP-15、前日と異なる灌水回数で正気度-10

### カネセンカ（kane）
- **光量**: 60-80（+3）、50-59（+1）、81-100（+1）、0-49（-1）
- **温度**: 2-3（+2）、1/5（-1）、4（0）
- **肥料**: 緑（+3）、紫（+2）、橙（+1）、未施肥（-3）
- **エッセンス**: 投資額×倍率（スコア10以上で3.0倍、6-9で2.0倍、2-5で1.0倍、-2〜1で0.5倍、-3以下で0倍）
- **特殊**: 残り1時間より前に採取 → エッセンス0

### ヘレボラスト（here）
- **光量**: 20-40（+3）、0-19（+2）、41-60（0）、61-80（-1）、81-100（-2）
- **温度**: 1-2（+3）、3（0）、4（-1）、5（-2）
- **灌水**: 1回（+3）、0回（-2）、2回（0）、3回以上（-1）
- **肥料**: 紫（+3）、緑（+1）、橙/未施肥（0/-1）
- **エッセンス**: 10点以上で35、6-9で25、2-5で12、-2〜1で5、-3以下で0
- **特殊**: 採取されないとHP-20、ヘレボラストが採取された後に他の植物から採取するとそれまでのエッセンスが0に

### アクアステラ（aqua）
- **光量**: 0-20（+2）、21-40/61-80（0）、81-100（+2）、41-60（-1）
- **温度**: 1/5（+2）、2/4（0）、3（-1）
- **灌水**: 2回（+2）、1回/3回（+1）、4回以上/0回（0）
- **肥料**: 橙（+3）、紫（+1）、緑/未施肥（0/-3）
- **エッセンス**: 10点以上で60、6-9で40、2-5で20、-2〜1で8、-3以下で0
- **特殊**: 最後の灌水から1時間以内に再度灌水した場合は灌水回数-1、コチョランの爆発を防ぐ

### レゾナントリリィ（rezo）
- **光量**: 正解で+1、不正解で-5
- **温度**: 正解で+1、不正解で-105
- **灌水**: 正解で+1、不正解で-105（正解値は1-4の範囲）
- **肥料**: 正解で+1、不正解で-105
- **エッセンス**: スコア4（全正解）で100、それ以外で0
- **特殊**: 光量以外の条件が正解でない場合、正気度-30。正解パラメータは植物生成時にランダムで決定される
- **管理方法ID**: `rezo-1`～`rezo-6`（プレースホルダー `${LIGHT}`, `${TEMP}`, `${WATER}`, `${FERTILIZER}` を使用）

### トリビュソス（tribu）
- **管理方法ID**: `tribu-1`～`tribu-3`
- **管理方法3**: プレースホルダー `${OPTIMAL_TEMP}` を使用
- **最適温度更新**: 管理方法3購入後、更新ボタンが表示される

### コキュートス（kokyu）
- **管理方法ID**: `kokyu-1`～`kokyu-3`
- **エッセンス計算**: 温度レベルは実際の温度（コキュートスの効果適用後）を使用
- **特殊処理**: `handleKokyuHarvest()`, `handleKokyuTempChange()` で実装
- **状態管理**: `temp5StartTime`, `kokyuNoDamageActive`, `kokyuTempEffectApplied` フラグ

### クリュソボロス（kuryu）
- **管理方法ID**: `kuryu-1`～`kuryu-3`
- **専用ゴールド**: `window.kuryuGold` グローバル変数で管理
- **購入処理**: `shop-system.js`で専用ゴールドと通常ゴールドの使い分けを実装

### バベル（babel）
- **管理方法ID**: `babel-1`
- **漢字変換**: `shop-system.js`の`convertKanjiWithBabel()`関数で実装
- **変換フラグ**: `window.babelKanjiConversionActive` で管理
- **変換タイミング**: `getHintContent()`関数内で、プレースホルダー置換後に適用

### ハナモドキ（hana）
- **エッセンス**: 左の植物と同じ（左の植物のエッセンス計算関数を呼び出す）
- **特殊**: 左がカネセンカの場合は投資額×倍率を計算、左の植物が未追加の場合は0

## 植物間相互作用の実装ガイドライン

### 概要

他の植物に依存する植物を実装する場合の指針です。

**例：** ハナモドキ（左の植物と同じエッセンスを産出）

#### グローバル変数の参照
```javascript
// グローバル変数は window オブジェクト経由で参照
const leftPlant = window.plantData[leftPlantIndex];
```

#### 配列インデックスの取得
```javascript
// 現在の植物のインデックスを取得
const currentIndex = window.plantData.indexOf(plant);
const leftPlantIndex = currentIndex - 1;

// 左の植物を取得（初期植物がいるため必ず存在）
const leftPlant = window.plantData[leftPlantIndex];
```

#### エッセンス計算関数の呼び出し
```javascript
// 無限再帰を防ぐため、calculateEssence関数は使わず直接呼び出し
const functionNameMap = {
    'kocho': 'calculateEssenceKocho',
    'side': 'calculateEssenceSide',
    // ...
};

const functionName = functionNameMap[leftPlant.id];
const essence = window[functionName](leftPlant);
```

#### 無限再帰の防止
- `calculateEssence(plant)`を使うとハナモドキ自身を呼び出すため無限再帰に陥る
- 代わりに直接関数名をマッピングして呼び出す

#### 副作用の分離
- エッセンス計算関数は副作用を含まない
- 副作用（ダメージ、ペナルティなど）は別の`handle*`関数として実装
- これにより、他の植物のエッセンス計算関数を安全に呼び出せる

#### ヘルパー関数の使い分け
```javascript
// 特殊なケース（カネセンカなど）は専用のヘルパー関数を作成
if (leftPlant.id === 'kane') {
    return calculateEssenceKane(plant); // ヘルパー関数
}
```

### 実装済みの改善点

#### 関数マッピングの一元管理
- `plantCalculateFuncMap`をapp.jsに一元化
- `getPlantCalculateFunction()`関数で統一的なアクセスを実現
- 新しい植物追加時の変更箇所を最小化

#### 相互作用のテストしやすさの向上
- ハナモドキの`calculateEssenceHana()`に`mockNeighbors`パラメータを追加
- モックデータを使用してテスト可能に
- デバッグ時に任意の植物を左の植物として指定可能

#### 相互作用のロギング強化
- `logPlantInteraction()`関数をapp.jsに実装
- 植物間の相互作用を自動的にログ出力
- デバッグ時の追跡が容易に