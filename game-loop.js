// ========================================
// game-loop.js
// ゲームループ、タイマー、日次処理、リザルト画面
// ========================================

// --- ゲームループ/ステータス ---
const DAY_DURATION_SEC = 60; // 1日=60秒（ゲーム内表現 6.0→0.0, 0.1刻み）
const PANIC_MS = 4000;
let currentDay = 1;
let timeLeftSec = DAY_DURATION_SEC;
let dayTimerId;
let isDayActive = false;
let isPanic = false;
let panicUntil = 0;
let controlsEnabled = true;
const player = { hp: 100, san: 100 };
window.money = 100; // カネセンカの肥料判定で使用（グローバル公開）
window.kuryuGold = 0; // クリュソボロスの専用ゴールド（グローバル公開）
window.babelKanjiConversionActive = false; // バベルの漢字変換フラグ（グローバル公開）
let essenceGainedToday = 0;
let numHarvestedToday = 0;
let hpChangeToday = 0;
let sanChangeToday = 0;

// AIメッセージ更新用のタイマー（10秒ごと）
let aiMessageTimer = null;
let lastAIMessageTime = 0;

// --- リザルト/ショップ ---
const screenGame = document.getElementById('screen-game');
const screenResult = document.getElementById('screen-result');
const resultDayEl = document.getElementById('result-day');
const resultHarvestEl = document.getElementById('result-harvest-count');
const resultEssenceEl = document.getElementById('result-essence');
const resultMoneyEl = document.getElementById('result-money');
const resultHpChangeEl = document.getElementById('result-hp-change');
const resultSanChangeEl = document.getElementById('result-san-change');
const resultHpRecoveryBtn = document.getElementById('result-hp-recovery');
const resultSanRecoveryBtn = document.getElementById('result-san-recovery');
let overlayOpen = false;
let pausedForOverlay = false;
let overlayPrevFocus = null;

// 自動スライダー機能
let plantSliderInterval = null;
let currentPlantSliderIndex = 0;

function showScreen(screenEl) {
    // 文字列IDが渡された場合は要素を取得
    if (typeof screenEl === 'string') {
        screenEl = document.getElementById(screenEl);
    }
    
    const screens = [screenGame, screenResult, document.getElementById('screen-plant-selection')].filter(Boolean);
    const activeEl = document.activeElement;
    // 1) 既存フォーカスが非表示化される画面にある場合は先にフォーカス解除
    screens.forEach(s => {
        if (s && s !== screenEl && s.contains(activeEl)) {
            try { activeEl.blur(); } catch (_) {}
        }
    });

    // 2) 表示/非表示と a11y/inert 切替
    screens.forEach(s => {
        const isTarget = s === screenEl;
        if (s === screenGame) {
            s.style.display = isTarget ? 'block' : 'none';
            if (!isTarget) {
                s.setAttribute('inert', '');
            } else {
                s.removeAttribute('inert');
            }
        } else {
            if (isTarget) {
                s.setAttribute('aria-hidden', 'false');
                s.removeAttribute('inert');
            } else {
                s.setAttribute('aria-hidden', 'true');
                s.setAttribute('inert', '');
            }
        }
    });

    // 3) 新しい画面にフォーカス移動
    if (screenEl) {
        const focusable = screenEl.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable && typeof focusable.focus === 'function') {
            focusable.focus();
        } else {
            screenEl.setAttribute('tabindex', '-1');
            screenEl.focus({ preventScroll: true });
            screenEl.removeAttribute('tabindex');
        }
    }
}

function openResultModal() {
    // クリュソボロスの専用ゴールドは採取時に既に加算されているため、
    // 通常のゴールド換金時にクリュソボロスのエッセンスを除外する必要はない
    // （専用ゴールドと通常ゴールドの両方に換金される）
    window.money += essenceGainedToday; // 換金（シンプル、クリュソボロスも含む）
    
    // アニメーション付きで数値を更新
    animateNumber('result-day', currentDay);
    animateNumber('result-harvest-count', numHarvestedToday);
    animateNumber('result-essence', essenceGainedToday);
    animateNumber('result-money', window.money);
    
    // HPと正気度の変化を表示（色付き）
    updateStatusChange('result-hp-change', hpChangeToday);
    updateStatusChange('result-san-change', sanChangeToday);
    
    // 植物の状態を表示（スライダー形式）
    updatePlantStatus();
    
    showScreen(screenResult);
}

// 結果画面を閉じる時にスライダーを停止
function closeResultModal() {
    stopPlantSlider();
    // 他の画面に移行する処理があればここに追加
}

// 数値アニメーション関数
function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.classList.add('animating');
    element.textContent = '0';
    
    let currentValue = 0;
    const increment = targetValue / 30; // 30フレームでアニメーション
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
            element.classList.remove('animating');
        }
        element.textContent = Math.floor(currentValue);
    }, 50);
}

// ステータス変化の表示（色付き）
function updateStatusChange(elementId, changeValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const changeText = changeValue >= 0 ? `+${changeValue}` : String(changeValue);
    element.textContent = changeText;
    
    // 色分け
    element.classList.remove('positive', 'negative');
    if (changeValue > 0) {
        element.classList.add('positive');
    } else if (changeValue < 0) {
        element.classList.add('negative');
    }
}

// 植物の状態を表示（スライダー形式）
function updatePlantStatus() {
    const container = document.getElementById('result-plant-status');
    const indicatorsContainer = document.getElementById('plant-slider-indicators');
    if (!container || !indicatorsContainer) return;
    
    container.innerHTML = '';
    indicatorsContainer.innerHTML = '';
    
    // 植物が1つもない場合は何も表示しない
    if (window.plantData.length === 0) return;
    
    // 植物の状態アイテムを作成
    window.plantData.forEach((plant, index) => {
        const item = document.createElement('div');
        item.className = 'plant-status-item';
        item.dataset.index = index;
        
        const name = document.createElement('div');
        name.className = 'plant-status-name';
        name.textContent = plant.name;
        
        const state = document.createElement('div');
        state.className = 'plant-status-state';
        
        // 植物の状態を判定
        if (plant.harvestedToday) {
            state.textContent = '採取済み';
            state.classList.add('harvested');
        } else {
            state.textContent = '未採取';
            state.classList.add('not-harvested');
        }
        
        item.appendChild(name);
        item.appendChild(state);
        container.appendChild(item);
        
        // インジケーターを作成
        const indicator = document.createElement('div');
        indicator.className = 'slider-indicator';
        indicator.dataset.index = index;
        if (index === 0) indicator.classList.add('active');
        
        indicator.addEventListener('click', () => {
            currentPlantSliderIndex = index; // インデックスを更新
            showPlantSlide(index);
        });
        
        indicatorsContainer.appendChild(indicator);
    });
    
    // 最初の植物を表示
    if (window.plantData.length > 0) {
        currentPlantSliderIndex = 0; // インデックスをリセット
        showPlantSlide(0);
        
        // 自動スライド（植物が2つ以上ある場合のみ）
        if (window.plantData.length > 1) {
            startPlantSlider();
        }
    }
}

// 植物スライダーの表示制御
function showPlantSlide(index) {
    const items = document.querySelectorAll('.plant-status-item');
    const indicators = document.querySelectorAll('.slider-indicator');
    
    items.forEach((item, i) => {
        item.classList.remove('active', 'prev');
        if (i === index) {
            item.classList.add('active');
        } else if (i < index) {
            item.classList.add('prev');
        }
    });
    
    indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
    });
}

function startPlantSlider() {
    if (window.plantData.length <= 1) return;
    
    plantSliderInterval = setInterval(() => {
        currentPlantSliderIndex = (currentPlantSliderIndex + 1) % window.plantData.length;
        showPlantSlide(currentPlantSliderIndex);
    }, 1500); // 1.5秒間隔
}

function stopPlantSlider() {
    if (plantSliderInterval) {
        clearInterval(plantSliderInterval);
        plantSliderInterval = null;
    }
}

// スライダーを一時停止/再開する機能
function togglePlantSlider() {
    if (plantSliderInterval) {
        stopPlantSlider();
    } else {
        startPlantSlider();
    }
}

function handleGameOver() {
    isDayActive = false;
    clearInterval(dayTimerId);
    clearInterval(aiMessageTimer);
    setControlsEnabled(false);
    
    // 黒いオーバーレイで画面全体を覆う
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background-color: rgba(0, 0, 0, 0) !important;
        z-index: 999999 !important;
        transition: background-color 2s ease-out !important;
    `;
    document.body.appendChild(overlay);
    
    // オーバーレイを黒にフェード
    requestAnimationFrame(() => {
        overlay.style.setProperty('background-color', 'rgba(0, 0, 0, 1)', 'important');
    });
    
    console.log('ゲームオーバー');
}

// --- 日次管理 ---
function resetDailyState() {
    window.plantData.forEach(p => {
        p.waterCount = 0;
        p.fertilizedToday = false;
        p.harvestedToday = false;
        p.herePenaltyApplied = false; // ヘレボラストのペナルティフラグをリセット
        p.waterTimes = []; // アクアステラの灌水時刻をリセット
        p.kokyuTempEffectApplied = false; // コキュートスの温度効果フラグをリセット
        p.kokyuNoDamageActive = false; // コキュートスのノーダメージフラグをリセット
        
        // バベルの漢字変換フラグは次の日が終わったらリセット（startDayで処理）
        
        // トリビュソスの特殊処理：デイ終了時にlastOptimalTempHourをリセット
        if (p.id === 'tribu') {
            // 更新回数はリセットしない（継続）
            // lastOptimalTempHourはリセットして、次の日の開始時に最初の最適温度が生成されるようにする
            p.lastOptimalTempHour = undefined;
        }
        
        // コキュートスの特殊処理：温度5保持時間をリセット
        if (p.id === 'kokyu') {
            p.temp5StartTime = null;
        }
    });
    // ヘレボラストのエッセンスリセットフラグをリセット
    window.hereEssenceResetApplied = false;
    updateControlsUI();
}

function startDay() {
    isDayActive = true;
    timeLeftSec = DAY_DURATION_SEC;
    essenceGainedToday = 0;
    numHarvestedToday = 0;
    hpChangeToday = 0;
    sanChangeToday = 0;
    // ヘレボラストのエッセンスリセットフラグを初期化
    window.hereEssenceResetApplied = false;
    // バベルの漢字変換フラグの確認（前日に採取された場合、この日は漢字変換が有効）
    if (window.babelKanjiConversionActive) {
        console.log('バベル 漢字変換が有効な一日が始まりました');
        console.log('バベル フラグ状態:', window.babelKanjiConversionActive);
    }
    setControlsEnabled(true);
    updateHeader();
    clearInterval(dayTimerId);
    
    // AIメッセージのタイマーを開始
    lastAIMessageTime = Date.now();
    aiMessageTimer = setInterval(() => {
        if (isDayActive) {
            updateAIMessagesPeriodically();
        }
    }, 1000);
    
    // シデロータスの特殊処理：デイ開始時の温度チェック
    window.plantData.forEach(plant => {
        if (plant.id === 'side' && plant.tempLevel === 5 && plant.temp5StartTime === null) {
            const DAY_DURATION_SEC = 60;
            plant.temp5StartTime = DAY_DURATION_SEC - timeLeftSec;
            console.log('シデロータス デイ開始時から温度5:', plant.temp5StartTime, '秒');
        }
        
        // トリビュソスの特殊処理：デイ開始時に最初の最適温度を生成
        if (plant.id === 'tribu') {
            plant.optimalTemp = generateTribuOptimalTemp();
            if (plant.displayOptimalTemp === undefined) {
                plant.displayOptimalTemp = plant.optimalTemp;
            }
            plant.lastOptimalTempHour = -1; // 最初の時間（0時間目）で更新されるように
            console.log(`トリビュソス デイ開始時の最適温度を生成: ${plant.optimalTemp}`);
        }
        
        // コキュートスの特殊処理：デイ開始時に温度5を保持していたら記録開始
        if (plant.id === 'kokyu' && plant.tempLevel === 5 && (plant.temp5StartTime === null || plant.temp5StartTime === undefined)) {
            const DAY_DURATION_SEC = 60;
            plant.temp5StartTime = DAY_DURATION_SEC - timeLeftSec;
            console.log('コキュートス デイ開始時から温度5:', plant.temp5StartTime, '秒');
        }
    });
    
    dayTimerId = setInterval(() => {
        if (!isDayActive) return;
        if (pausedForOverlay) return; // オーバーレイ中は停止
        // 1秒ごとに0.1減る → 秒を10分割して管理
        timeLeftSec = Math.max(0, timeLeftSec - 1);
        maybeEndPanic();
        updateHeader();
        
        // パフォーマンス改善：コチョランのステータス更新（キャッシュを使用）
        if (!cachedPlantA) {
            cachedPlantA = window.plantData.find(plant => plant.id === 'kocho');
        }
        if (cachedPlantA) {
            const status = checkPlantAStatus(cachedPlantA);
            if (!cachedPlantAStatusEl) {
                cachedPlantAStatusEl = document.querySelector(`[data-plant-id="kocho"] .monitor-status`);
            }
            if (cachedPlantAStatusEl) {
                // テキストが変更された場合のみ更新
                if (cachedPlantAStatusEl.textContent !== status) {
                    cachedPlantAStatusEl.textContent = status;
                    // ステータスに応じて色を変更
                    cachedPlantAStatusEl.className = 'monitor-status';
                    if (status === '注意') {
                        cachedPlantAStatusEl.style.color = '#ffd700'; // 黄色
                    } else if (status === '危険') {
                        cachedPlantAStatusEl.style.color = '#ff4444'; // 赤色
                    } else {
                        cachedPlantAStatusEl.style.color = ''; // デフォルト色
                    }
                }
            }
        }
        
        // トリビュソスの特殊処理：1時間ごと（10秒ごと）に最適温度を生成
        window.plantData.forEach(plant => {
            if (plant.id === 'tribu') {
                // 1時間 = 10秒（DAY_DURATION_SEC = 60秒、1日 = 6時間）
                const currentHour = Math.floor((DAY_DURATION_SEC - timeLeftSec) / 10);
                if (plant.lastOptimalTempHour === undefined) {
                    plant.lastOptimalTempHour = -1;
                }
                if (plant.lastOptimalTempHour !== currentHour) {
                    // 新しい時間になったので最適温度を生成（ただしdisplayOptimalTempは更新されない）
                    plant.optimalTemp = generateTribuOptimalTemp();
                    plant.lastOptimalTempHour = currentHour;
                    console.log(`トリビュソス ${currentHour}時間目の最適温度を生成: ${plant.optimalTemp} (表示: ${plant.displayOptimalTemp})`);
                }
            }
        });
        
        // コキュートスの特殊処理：未採取時、施設全体の温度レベルを1低下（内部処理のみ、表示は変えない）
        const kokyuPlant = window.plantData.find(p => p.id === 'kokyu');
        if (kokyuPlant && !kokyuPlant.harvestedToday) {
            // コキュートスが未採取の場合、全植物の実際の温度を-1（下限1）
            window.plantData.forEach(plant => {
                // 表示用の温度レベルは保持
                // 実際のエッセンス計算時に使用する温度レベルを-1
                const actualTemp = Math.max(1, plant.tempLevel - 1);
                plant.actualTempLevel = actualTemp; // 内部温度レベルを保存
                
                // harvestParamsも更新（採取時のエッセンス計算で使用）
                if (!plant.kokyuTempEffectApplied) {
                    // 初回のみ適用（毎秒更新を防ぐ）
                    plant.harvestParams.tempLevel = actualTemp;
                    plant.kokyuTempEffectApplied = true;
                }
            });
        } else if (kokyuPlant && kokyuPlant.harvestedToday) {
            // コキュートスが採取済みの場合、効果を解除
            window.plantData.forEach(plant => {
                if (plant.kokyuTempEffectApplied) {
                    // 元の温度レベルに戻す
                    plant.harvestParams.tempLevel = plant.tempLevel;
                    plant.kokyuTempEffectApplied = false;
                    delete plant.actualTempLevel;
                }
            });
        }
        
        if (timeLeftSec === 0) {
            endDay();
        }
    }, 1000);
}

function endDay() {
    isDayActive = false;
    clearInterval(dayTimerId);
    clearInterval(aiMessageTimer); // AIメッセージのタイマーも停止
    setControlsEnabled(false);
    
    // デイ終了時のパラメータを保存
    saveDayEndParams();
    
    // HPまたは正気度が0の場合、ゲームオーバー
    if (player.hp === 0 || player.san === 0) {
        handleGameOver();
        return;
    }
    
    showFeedback("勤務終了");
    openResultModal();
    currentDay++;
    resetDailyState();
    
    // パフォーマンス改善：キャッシュのリセット
    cachedPlantAStatusEl = null;
}

// デイ終了時のパラメータを保存する関数
function saveDayEndParams() {
    window.plantData.forEach(plant => {
        // ナギノゾミの特殊ロジック：日次処理（保存前に前日の値で判定）
        if (plant.id === 'nagi') {
            handleNaginozomiDayEnd(plant);
            // 日終了時に灌水ダメージ判定（前日の値と比較）
            handleNaginozomiWater(plant);
            // 日終了時に施肥ダメージ判定（前日の値と比較）
            handleNaginozomiFertilizer(plant, plant.fertilizerColor);
        }
        
        // dayEndParamsを保存（この後、plant.dayEndParamsは当日の値になる）
        plant.dayEndParams = {
            waterCount: plant.waterCount,
            fertilizerColor: plant.fertilizerColor || null,
            fertilizerGiven: plant.fertilizedToday,
            lightLevel: plant.lightLevel,
            tempLevel: plant.tempLevel,
            harvested: plant.harvestedToday
        };
        
        console.log(`${plant.name} デイ終了パラメータ:`, plant.dayEndParams);
        
        // コチョランの特殊ロジック：管理操作チェック（保存前に当日の値で判定）
        if (plant.id === 'kocho') {
            // dayEndParamsを一時保存して当日の値で判定
            const tempParams = {
                waterCount: plant.waterCount,
                fertilizerGiven: plant.fertilizedToday,
                lightLevel: plant.lightLevel,
                tempLevel: plant.tempLevel,
                harvested: plant.harvestedToday
            };
            
            const hasManagement = checkPlantAManagement({ dayEndParams: tempParams });
            if (!hasManagement) {
                // アクアステラが施設内にある場合、爆発を防ぐ
                const hasAqua = window.plantData.some(p => p.id === 'aqua' && p.name.includes('アクアステラ'));
                if (!hasAqua) {
                    handlePlantAExplosion();
                } else {
                    console.log('アクアステラ 施設内に存在するため、コチョランの爆発を防いだ');
                    logPlantInteraction('aqua', 'kocho', 'explosion_prevention', '爆発を防いだ');
                }
            }
        }
        
        // シデロータスの特殊ロジック：日次処理
        if (plant.id === 'side') {
            handleSiderotasDayEnd(plant);
        }
        
        // ヘレボラストの特殊ロジック：日次処理
        if (plant.id === 'here') {
            handleHereDayEnd(plant);
        }
        
        // バベルの特殊ロジック：採取済みの場合、次の日の漢字変換フラグを立てる
        if (plant.id === 'babel' && plant.harvestedToday) {
            window.babelKanjiConversionActive = true;
            console.log('バベル 採取済み：次の一日は漢字変換が有効になります');
        }
    });
    
    // バベルの漢字変換フラグをリセット（フラグが有効な日が終わったら次の日には無効化）
    // 注意：この時点でフラグが有効な場合、それは「前日にバベルを採取した日」なので、
    // その日が終わったらフラグをリセットして、次の日は通常表示に戻す
    // ただし、この処理はバベルの採取判定の後に実行されるため、今回採取した場合はリセットしない
    // 現在フラグが有効で、かつバベルが今日採取されていない場合のみリセット
    const babelPlant = window.plantData.find(p => p.id === 'babel');
    if (window.babelKanjiConversionActive && (!babelPlant || !babelPlant.harvestedToday)) {
        window.babelKanjiConversionActive = false;
        console.log('バベル 漢字変換が有効だった日が終わりました：フラグをリセット（次の日は通常表示）');
    }
    
    // レテレテの特殊ロジック：レテレテと両隣の植物の光量・温度をリセット
    const reteIndex = window.plantData.findIndex(p => p.id === 'rete');
    if (reteIndex !== -1) {
        // レテレテ自身をリセット
        window.plantData[reteIndex].lightLevel = 50;
        window.plantData[reteIndex].tempLevel = 3;
        window.plantData[reteIndex].dayEndParams.lightLevel = 50;
        window.plantData[reteIndex].dayEndParams.tempLevel = 3;
        console.log('レテレテ 自身の光量・温度をリセット: 光量50, 温度3');
        
        // 左隣の植物をリセット（存在する場合）
        if (reteIndex > 0) {
            const leftPlant = window.plantData[reteIndex - 1];
            leftPlant.lightLevel = 50;
            leftPlant.tempLevel = 3;
            leftPlant.dayEndParams.lightLevel = 50;
            leftPlant.dayEndParams.tempLevel = 3;
            console.log(`レテレテ 左隣の植物(${leftPlant.name})の光量・温度をリセット: 光量50, 温度3`);
        }
        
        // 右隣の植物をリセット（存在する場合）
        if (reteIndex < window.plantData.length - 1) {
            const rightPlant = window.plantData[reteIndex + 1];
            rightPlant.lightLevel = 50;
            rightPlant.tempLevel = 3;
            rightPlant.dayEndParams.lightLevel = 50;
            rightPlant.dayEndParams.tempLevel = 3;
            console.log(`レテレテ 右隣の植物(${rightPlant.name})の光量・温度をリセット: 光量50, 温度3`);
        }
    }
}

// リザルト画面のイベントリスナー
if (resultHpRecoveryBtn) resultHpRecoveryBtn.addEventListener('click', () => { 
    // 体力+10回復（上限100）
    modifyHP(10);
    closeResultModal(); // スライダーを停止
    showPlantSelectionScreen(); 
});

if (resultSanRecoveryBtn) resultSanRecoveryBtn.addEventListener('click', () => { 
    // 正気度回復（減少分の10%、端数切捨て）
    const sanLoss = 100 - player.san;
    const recoveryAmount = Math.floor(sanLoss * 0.1);
    if (recoveryAmount > 0) {
        modifySAN(recoveryAmount);
    }
    closeResultModal(); // スライダーを停止
    showPlantSelectionScreen(); 
});

