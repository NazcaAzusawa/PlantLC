// ========================================
// ui-controls.js
// UI操作、コントロール、モニター表示
// ========================================

// --- DOM要素の取得 ---
const monitorWrapper = document.getElementById('monitorWrapper');
const btnWater = document.getElementById('control-water');
const btnHarvest = document.getElementById('control-harvest'); 
const fertilizerPanel = document.getElementById('fertilize-panel'); 
const fertilizerOptions = document.getElementById('fertilizer-options');
const fertButtons = fertilizerOptions.querySelectorAll('.fert-btn'); 
const sliderLight = document.getElementById('light-slider');
const tempOptions = document.getElementById('temp-options');
const tempButtons = tempOptions.querySelectorAll('.temp-btn');
const paramDisplay = document.getElementById('parameters'); 
const timerEl = document.getElementById('timer');
const essenceDisplay = document.getElementById('essence-display');
const moneyDisplay = document.getElementById('money-display');

// --- 全画面機能 ---
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('全画面に移行できませんでした:', err);
        });
    } else {
        document.exitFullscreen().catch(err => {
            console.log('全画面を終了できませんでした:', err);
        });
    }
}

// 全画面状態の変更を監視
document.addEventListener('fullscreenchange', () => {
    const isFullscreen = !!document.fullscreenElement;
    console.log('全画面状態:', isFullscreen ? 'ON' : 'OFF');
});

// F11キーまたはダブルクリックで全画面切り替え
document.addEventListener('keydown', (e) => {
    if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
    }
});

// モニター部分をダブルクリックで全画面切り替え
document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.addEventListener('dblclick', toggleFullscreen);
    }
});

let feedbackTimer;

// --- 初期化処理 ---
function initializeMonitors() {
    monitorWrapper.innerHTML = ''; 
    window.plantData.forEach((plant, index) => {
        const screen = document.createElement('div');
        screen.className = 'monitor-screen';
        screen.dataset.plantId = plant.id;
        screen.style.transform = `translateX(${(index - currentPlantIndex) * 100}%)`;
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'monitor-name';
        nameDiv.textContent = plant.name;
        screen.appendChild(nameDiv);
        
        // 管理難易度表示を追加
        const managementLevelDiv = document.createElement('div');
        managementLevelDiv.className = 'monitor-management-level';
        managementLevelDiv.textContent = formatManagementLevel(plant.difficulty);
        screen.appendChild(managementLevelDiv);
        
        // 予想被害規模表示を追加
        const damageScaleDiv = document.createElement('div');
        damageScaleDiv.className = 'monitor-damage-scale';
        damageScaleDiv.textContent = formatDamageScale(plant.difficulty);
        const damageScale = formatDamageScale(plant.difficulty);
        damageScaleDiv.style.color = getDamageScaleColor(damageScale);
        screen.appendChild(damageScaleDiv);
        
        const statusDiv = document.createElement('div');
        statusDiv.className = 'monitor-status';
        statusDiv.textContent = plant.status;
        screen.appendChild(statusDiv);
        
        // AIの表示エリアを追加
        const aiDiv = document.createElement('div');
        aiDiv.className = 'monitor-ai';
        aiDiv.textContent = '...';
        screen.appendChild(aiDiv);
        
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'monitor-feedback';
        screen.appendChild(feedbackDiv);
        monitorWrapper.appendChild(screen);
    });
}

// --- フィードバック表示関数 ---
function showFeedback(message) {
    clearTimeout(feedbackTimer); 
    const currentScreen = monitorWrapper.children[currentPlantIndex];
    const feedbackEl = currentScreen.querySelector('.monitor-feedback');
    if (feedbackEl) {
        feedbackEl.textContent = message;
        feedbackEl.classList.add('active'); 
        feedbackTimer = setTimeout(() => {
            feedbackEl.classList.remove('active');
        }, 1500);
    }
}

// --- コントロールUIの更新（植物ごとの無効化対応） ---
let updateControlsUITimer = null;

function updateControlsUI() {
    // 既存のタイマーをクリア
    if (updateControlsUITimer) {
        clearTimeout(updateControlsUITimer);
    }
    
    // 遅延させてから更新
    updateControlsUITimer = setTimeout(() => {
        const currentPlant = window.plantData[currentPlantIndex];

        // コチョランのステータス更新
        if (currentPlant.id === 'kocho') {
            const status = checkPlantAStatus(currentPlant);
            const statusEl = document.querySelector(`[data-plant-id="kocho"] .monitor-status`);
            if (statusEl) {
                statusEl.textContent = status;
                // ステータスに応じて色を変更
                statusEl.className = 'monitor-status';
                if (status === '注意') {
                    statusEl.style.color = '#ffd700'; // 黄色
                } else if (status === '危険') {
                    statusEl.style.color = '#ff4444'; // 赤色
                } else {
                    statusEl.style.color = ''; // デフォルト色
                }
            }
        }
        
        // AIメッセージを更新（植物ごと）
        updateAIMessage(currentPlant);

        // 採取: 常にラベルは「採取」。実行後は植物ごとに無効化のみ
        const isHarvestDisabled = currentPlant.harvestedToday || !controlsEnabled;
        btnHarvest.disabled = isHarvestDisabled;
        btnHarvest.classList.toggle('disabled', isHarvestDisabled);
        btnHarvest.textContent = "採取";
        
        fertButtons.forEach(btn => {
            btn.disabled = currentPlant.fertilizedToday || !controlsEnabled;
        });
        fertilizerPanel.querySelector('label').textContent = currentPlant.fertilizedToday ? "施肥 (完了)" : "施肥";

        // 灌水: 回数のみ表示（カネセンカの場合は投資ボタン）
        if (currentPlant.id === 'kane') {
            const investmentGold = currentPlant.waterCount * 10;
            btnWater.innerHTML = "投資<br><span style='font-size: var(--font-size-small); opacity: 0.8;'>(" + investmentGold + " G)</span>";
        } else {
            btnWater.innerHTML = "灌水<br><span style='font-size: var(--font-size-small); opacity: 0.8;'>(" + currentPlant.waterCount + " 回)</span>";
        }
        btnWater.disabled = !controlsEnabled;
        
        sliderLight.value = currentPlant.lightLevel;
        sliderLight.disabled = !controlsEnabled;
        
        tempButtons.forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.temp) === currentPlant.tempLevel);
            btn.disabled = !controlsEnabled;
        });
    }, 50);
}

// AIメッセージを更新する関数
function updateAIMessage(plant) {
    const aiEl = document.querySelector(`[data-plant-id="${plant.id}"] .monitor-ai`);
    if (!aiEl) return;
    
    let message = '';
    
    switch (plant.id) {
        case 'kocho':
            message = getKochoAIMessage(plant);
            break;
        case 'side':
            message = getSiderotasAIMessage(plant);
            break;
        case 'rezo':
            message = getRezoAIMessage(plant);
            break;
        default:
            message = '...';
    }
    
    aiEl.textContent = message;
}

function updateAIMessagesPeriodically() {
    const now = Date.now();
    // 10秒ごとに更新
    if (now - lastAIMessageTime >= 10000) {
        lastAIMessageTime = now;
        
        // すべての植物のAIメッセージを更新
        window.plantData.forEach(plant => {
            updateAIMessage(plant);
        });
    }
}

// --- 共通ユーティリティ ---
function formatTimeNumber(totalSec) {
    // 6.0 から 0.0 まで 0.1刻み（実時間1秒で 0.1 減）
    const tenths = (totalSec / 10).toFixed(1);
    return tenths;
}

function updateHeader() {
    // キャッシュを使用してDOM操作を最小化
    if (!cachedTimerNumber && timerEl) {
        cachedTimerNumber = timerEl.querySelector('.timer-number');
    }
    if (cachedTimerNumber) {
        cachedTimerNumber.textContent = formatTimeNumber(timeLeftSec);
    }
    
    // パラメータ表示を更新
    if (!cachedParamDisplay && paramDisplay) {
        cachedParamDisplay = paramDisplay;
    }
    if (cachedParamDisplay) {
        // エッセンスと所持金を更新
        const essenceEl = document.getElementById('essence-display');
        const moneyEl = document.getElementById('money-display');
        if (essenceEl) essenceEl.textContent = `💰${essenceGainedToday}`;
        if (moneyEl) moneyEl.textContent = `💎${window.money}`;
        
        // HPとSANのゲージと値を更新
        const hpGaugeEl = document.getElementById('hp-gauge');
        const hpDisplayEl = document.getElementById('hp-display');
        const sanGaugeEl = document.getElementById('san-gauge');
        const sanDisplayEl = document.getElementById('san-display');
        
        if (hpGaugeEl) hpGaugeEl.style.width = `${player.hp}%`;
        if (hpDisplayEl) hpDisplayEl.textContent = player.hp;
        if (sanGaugeEl) sanGaugeEl.style.width = `${player.san}%`;
        if (sanDisplayEl) sanDisplayEl.textContent = player.san;
    }
}

function setControlsEnabled(enabled) {
    controlsEnabled = enabled;
    if (!enabled) {
        btnWater.disabled = true;
        btnHarvest.disabled = true;
        fertButtons.forEach(btn => { btn.disabled = true; });
        sliderLight.disabled = true;
        tempButtons.forEach(btn => { btn.disabled = true; });
    } else {
        sliderLight.disabled = false;
        updateControlsUI();
    }
}

function canInteract() {
    return isDayActive && !isPanic;
}

function modifyHP(delta) {
    player.hp = Math.max(0, Math.min(100, player.hp + delta));
    hpChangeToday += delta;
    updateHeader();
}

function modifySAN(delta) {
    player.san = Math.max(0, Math.min(100, player.san + delta));
    sanChangeToday += delta;
    updateHeader();
}

function startPanic() {
    if (isPanic) return;
    isPanic = true;
    panicUntil = Date.now() + PANIC_MS;
    setControlsEnabled(false);
    showFeedback("パニック！");
}

function maybeEndPanic() {
    if (isPanic && Date.now() >= panicUntil) {
        isPanic = false;
        if (isDayActive) setControlsEnabled(true);
    }
}

// --- モニターの切り替え（1輪ずつ制限） ---
let lastMonitorChangeTime = 0;
const MONITOR_CHANGE_COOLDOWN = 300; // 300msのクールダウン

// シャッターを開く関数
function openShutter() {
    isShutterClosed = false;
    const controls = document.querySelector('.controls');
    if (controls) {
        controls.classList.remove('shutter-closed');
    }
}

function changeMonitor(newIndex) {
    const now = Date.now();
    if (now - lastMonitorChangeTime < MONITOR_CHANGE_COOLDOWN) {
        return; // クールダウン中は無視
    }
    
    if (newIndex < 0 || newIndex >= window.plantData.length) {
        return; // 範囲外は無視
    }
    
    if (newIndex === currentPlantIndex) {
        return;
    }
    
    lastMonitorChangeTime = now;
    
    // シャッターが閉じていない場合は閉じる
    if (!isShutterClosed) {
        isShutterClosed = true;
        const controls = document.querySelector('.controls');
        if (controls) {
            controls.classList.add('shutter-closed');
        }
    }
    
    // 植物インデックスを更新（シャッターが閉じている間に）
    setTimeout(() => {
        currentPlantIndex = newIndex;
        
        // 各モニターの位置を更新
        window.plantData.forEach((plant, index) => {
            const screen = document.querySelector(`[data-plant-id="${plant.id}"]`);
            if (screen) {
                screen.style.transform = `translateX(${(index - currentPlantIndex) * 100}%)`;
            }
        });
        
        // パラメータを更新
        updateControlsUI();
        
        // シャッターを開く
        setTimeout(() => {
            openShutter();
        }, 50);
    }, 50);
}

// --- イベントリスナー設定 ---
let isShutterClosed = false;

// スワイプを検知して矢印キーと同一の挙動にする
let monitorTouchStartX = 0;
let monitorTouchStartY = 0;
let monitorTouchStartTime = 0;
const SWIPE_THRESHOLD = 50; // スワイプ距離の閾値（px）
const SWIPE_VELOCITY_THRESHOLD = 0.3; // スワイプ速度の閾値（px/ms）

monitorWrapper.addEventListener('touchstart', (e) => {
    if (!isDayActive) return;
    
    monitorTouchStartX = e.changedTouches[0].clientX;
    monitorTouchStartY = e.changedTouches[0].clientY;
    monitorTouchStartTime = Date.now();
}, { passive: true });

monitorWrapper.addEventListener('touchend', (e) => {
    if (!isDayActive) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndTime = Date.now();
    
    const dx = touchEndX - monitorTouchStartX;
    const dy = touchEndY - monitorTouchStartY;
    const dt = touchEndTime - monitorTouchStartTime;
    
    // 左右スワイプを検知（上下スワイプとの区別）
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
        // スワイプ速度を計算（px/ms）
        const velocity = Math.abs(dx) / dt;
        
        // 一定速度以上のスワイプのみ処理
        if (velocity > SWIPE_VELOCITY_THRESHOLD) {
            let newIndex = currentPlantIndex;
            
            if (dx > 0) {
                // 右スワイプ → 左に移動（前の植物）
                newIndex = currentPlantIndex - 1;
            } else {
                // 左スワイプ → 右に移動（次の植物）
                newIndex = currentPlantIndex + 1;
            }
            
            // 範囲チェック
            if (newIndex < 0) newIndex = 0;
            if (newIndex >= window.plantData.length) newIndex = window.plantData.length - 1;
            
            // 矢印キーと同じ挙動で移動
            changeMonitor(newIndex);
        }
        // 速度が足りない場合は何もしない（シャッターは降ろさない）
    }
    // 左右スワイプではない場合も何もしない（シャッターは降ろさない）
    
    monitorTouchStartX = 0;
    monitorTouchStartY = 0;
    monitorTouchStartTime = 0;
}, { passive: true });

document.addEventListener('keydown', (e) => {
    if (!canInteract()) return; 
    if (e.key === 'ArrowLeft') {
        e.preventDefault(); 
        changeMonitor(currentPlantIndex - 1);
    } else if (e.key === 'ArrowRight') {
        e.preventDefault(); 
        changeMonitor(currentPlantIndex + 1);
    }
});

let essenceGained; // 採取時のエッセンス獲得量

btnWater.addEventListener('click', () => {//潅水処理
    if (!canInteract()) return;
    const plant = window.plantData[currentPlantIndex];
    
    // カネセンカの場合、投資処理
    if (plant.id === 'kane') {
        // 所持金が10G以上ある場合のみ投資可能
        if (window.money >= 10) {
            window.money -= 10;
            plant.waterCount++;
            plant.harvestParams.waterCount = plant.waterCount;
            const shopMoneyIngameEl = document.getElementById('shop-money-ingame');
            if (shopMoneyIngameEl) shopMoneyIngameEl.textContent = String(window.money);
            console.log(`${plant.name} に投資。${plant.waterCount * 10} G投資済み`);
        } else {
            console.log(`${plant.name} に投資できません。所持金が足りません。`);
        }
    } else {
        // 通常の灌水処理
        plant.waterCount++;
        plant.harvestParams.waterCount = plant.waterCount;
        console.log(`${plant.name} に灌水。本日 ${plant.waterCount} 回目`);
    }
    
    // アクアステラの特殊処理：灌水時刻を記録
    if (plant.id === 'aqua') {
        if (!plant.waterTimes) plant.waterTimes = [];
        const gameTime = DAY_DURATION_SEC - timeLeftSec; // ゲーム内経過時間を記録
        plant.waterTimes.push(gameTime);
        console.log(`アクアステラ 灌水時刻を記録: ゲーム内${gameTime}秒（${plant.waterCount}回目）`);
    }
    
    updateControlsUI(); 
});

btnHarvest.addEventListener('click', () => {
    if (!canInteract()) return;
    if (btnHarvest.disabled) return; 
    const plant = window.plantData[currentPlantIndex];
    
    // アクアステラの特殊処理：1時間間隔チェック
    if (plant.id === 'aqua') {
        handleAquaWaterInterval(plant);
    }
    
    // 採取時パラメータを最新の状態に更新
    plant.harvestParams.waterCount = plant.waterCount;
    plant.harvestParams.lightLevel = plant.lightLevel;
    
    // コキュートスの効果を考慮して温度レベルを設定
    // コキュートスが未採取の場合、全植物の温度が-1される
    const kokyuPlant = window.plantData.find(p => p.id === 'kokyu');
    let actualTempForHarvest = plant.tempLevel;
    if (kokyuPlant && !kokyuPlant.harvestedToday) {
        actualTempForHarvest = Math.max(1, plant.tempLevel - 1);
    }
    plant.harvestParams.tempLevel = actualTempForHarvest;
    
    plant.harvestParams.fertilizerGiven = plant.fertilizedToday;
    plant.harvestParams.fertilizerColor = plant.fertilizerColor || null;
    plant.harvestParams.harvested = true; // 採取済みフラグを設定
    
    // エッセンス計算（採取時パラメータを使用）
    essenceGained = calculateEssence(plant);
    
    // シデロータスの特殊処理：ダメージ計算
    if (plant.id === 'side') {
        handleSiderotasHarvest(plant, essenceGained);
    }
    
    // レゾナントリリィの特殊処理：正気度ダメージ判定
    if (plant.id === 'rezo') {
        handleRezoHarvest(plant);
    }
    
    // コキュートスの特殊処理：採取時のダメージ判定
    if (plant.id === 'kokyu') {
        handleKokyuHarvest(plant);
    }
    
    // ヘレボラストの特殊処理
    if (plant.id === 'here') {
        console.log('ヘレボラスト 採取完了（エッセンス0）');
        // ヘレボラスト自体のエッセンスは加算しない
        essenceGained = 0;
        // ヘレボラストを採取しても、それまでのエッセンスは保持される
    } else {
        // ヘレボラストが既に採取されている場合、最初の植物を採取したときにそれまでのエッセンスを0に
        const hasHereBeenHarvested = window.plantData.some(p => p.id === 'here' && p.harvestedToday);
        if (hasHereBeenHarvested && !window.hereEssenceResetApplied) {
            console.log(`ヘレボラスト 採取後の最初の植物(${plant.name})を検出`);
            console.log(`それまでのエッセンス(${essenceGainedToday})を0にリセットします`);
            essenceGainedToday = 0;
            console.log(`リセット後: ${essenceGainedToday}`);
            window.hereEssenceResetApplied = true; // グローバルフラグを立てて2回目以降は適用しない
            
            // ログ追加
            logPlantInteraction('here', plant.id, 'essence_reset', 'それまでのエッセンスを0に');
        }
    }
    
    // その植物のエッセンスを加算（ヘレボラスト以外の植物は必ず加算される）
    if (plant.id !== 'here') {
        const prevEssence = essenceGainedToday;
        essenceGainedToday += essenceGained;
        console.log(`${plant.name} エッセンス加算: ${prevEssence} + ${essenceGained} = ${essenceGainedToday}`);
        
        // クリュソボロスの特殊処理：専用ゴールドに加算
        if (plant.id === 'kuryu') {
            window.kuryuGold = (window.kuryuGold || 0) + essenceGained;
            console.log(`クリュソボロス 専用ゴールド加算: ${essenceGained} G (合計: ${window.kuryuGold} G)`);
        }
    } else {
        console.log(`ヘレボラストは加算されません`);
    }
    numHarvestedToday++;
    
    plant.harvestedToday = true;
    
    console.log(`${plant.name} から採取しました。エッセンス: ${essenceGained}`);
    console.log('採取時パラメータ:', plant.harvestParams);
    showFeedback(`採取成功！エッセンス +${essenceGained}`);
    
    // エッセンス獲得・ダメージ処理は plant ごとの handle* 関数で実装済み
    // 即座にUI更新
    updateControlsUI(); 
});
        
fertilizerOptions.addEventListener('click', (e) => {
    if (!canInteract()) return;
    const targetButton = e.target.closest('.fert-btn');
    if (!targetButton || targetButton.disabled) {
        return;
    }
    const plant = window.plantData[currentPlantIndex];
    const color = targetButton.dataset.color; // 「緑」「紫」「橙」が取得される
    
    // ダイダイダイの特殊処理：橙の肥料で正気度-100
    if (plant.id === 'dai' && color === '橙') {
        modifySAN(-100);
        console.log('ダイダイダイ 橙の肥料により正気度-100');
    }
    
    // 施肥情報を更新
    plant.fertilizedToday = true;
    plant.fertilizerColor = color;
    
    // 採取時パラメータを更新
    plant.harvestParams.fertilizerGiven = true;
    plant.harvestParams.fertilizerColor = color;
    
    console.log(`${plant.name} に ${color} を施肥しました。`);
    showFeedback(`${color} を与えました。`);
    
    updateControlsUI();
});

sliderLight.addEventListener('input', (e) => {
    if (!canInteract()) return;
    window.plantData[currentPlantIndex].lightLevel = parseInt(e.target.value);
});
sliderLight.addEventListener('change', (e) => {
    if (!canInteract()) return;
    const plant = window.plantData[currentPlantIndex];
    const newLightLevel = parseInt(e.target.value);
    
    // 日光レベルを更新
    plant.lightLevel = newLightLevel;
    
    // 採取時パラメータを更新
    plant.harvestParams.lightLevel = newLightLevel;
    
    console.log(`${plant.name} の日光レベルを ${newLightLevel} に変更`);
});

tempOptions.addEventListener('click', (e) => {
    if (!canInteract()) return;
    const targetButton = e.target.closest('.temp-btn');
    if (targetButton) {
        const plant = window.plantData[currentPlantIndex];
        const newTemp = parseInt(targetButton.dataset.temp);
        
        // 温度レベルを更新
        plant.tempLevel = newTemp;
        
        // コキュートスの効果を考慮して採取時パラメータを更新
        // コキュートスが未採取の場合、全植物の温度が-1される
        const kokyuPlant = window.plantData.find(p => p.id === 'kokyu');
        let actualTempForHarvest = newTemp;
        if (kokyuPlant && !kokyuPlant.harvestedToday) {
            actualTempForHarvest = Math.max(1, newTemp - 1);
        }
        plant.harvestParams.tempLevel = actualTempForHarvest;
        
        // コキュートスの効果フラグをリセット（次回のタイマー処理で再適用される）
        plant.kokyuTempEffectApplied = false;
        
        // シデロータスの特殊処理：温度変更時の処理
        if (plant.id === 'side') {
            handleSiderotasTempChange(plant, newTemp);
        }
        
        // コキュートスの特殊処理：温度変更時の処理
        if (plant.id === 'kokyu') {
            handleKokyuTempChange(plant, newTemp);
        }
        
        console.log(`${plant.name} の温度を ${newTemp} に変更`);
        updateControlsUI();
    }
});

// --- 初期化実行 ---
initializeMonitors();
updateControlsUI();
startDay();

// パフォーマンス改善：キャッシュの初期化
cachedTimerNumber = timerEl ? timerEl.querySelector('.timer-number') : null;
cachedParamDisplay = paramDisplay;
cachedPlantA = window.plantData.find(plant => plant.id === 'kocho');
cachedPlantAStatusEl = document.querySelector(`[data-plant-id="kocho"] .monitor-status`);

// --- 拡大操作の抑止（iOS Safari などのピンチズーム対策） ---
document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
});

// --- モバイルの正確なvh計測（アドレスバー考慮） ---
function setViewportHeightVar() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setViewportHeightVar();
window.addEventListener('resize', setViewportHeightVar);
window.addEventListener('orientationchange', setViewportHeightVar);

// 初期表示
showScreen(screenGame);

