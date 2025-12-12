// ========================================
// shop-system.js
// 管理方法ショップ、植物選択画面
// ========================================

// In-game overlay
const overlay = document.getElementById('overlay-shop');
const overlayCloseBtn = document.getElementById('overlay-close');
const shopMoneyIngameEl = document.getElementById('shop-money-ingame');
const shopListIngameEl = document.getElementById('shop-list-ingame');
const overlayHeaderEl = document.querySelector('#overlay-shop .overlay-header');

// バベルの漢字変換用：文字化け風の漢字リスト（よく見る文字化けの漢字20個）
const babelKanjiList = [
    '繧', '縺', '繝', '縲', '閖', '譌', '竍', '鐚', '驩', '骭', '蠏', '翫', '隨', '灘', '撰', '托', '抵', '搾', '繹', '峨', '瓲', '纊', '鍈', '蓜', '炻', '棈', '兊', '夋', '奛', '奣', '寬', '﨑', '嵂', '咊', '咩', '哿', '喆', '坙', '坥', '彅'
];

// バベルの漢字変換関数：漢字をランダムに別の漢字に置き換える
function convertKanjiWithBabel(text) {
    if (!text) return text;
    
    // 漢字を抽出して、それぞれをランダムな文字化け風の漢字に置換
    const converted = text.replace(/[\u4e00-\u9faf]/g, (kanji) => {
        // 文字化け風の漢字リストからランダムに選択
        const randomIndex = Math.floor(Math.random() * babelKanjiList.length);
        return babelKanjiList[randomIndex];
    });
    
    console.log('バベル convertKanjiWithBabel:', {
        input: text,
        output: converted,
        kanjiFound: text.match(/[\u4e00-\u9faf]/g)?.length || 0
    });
    
    return converted;
}

function getHintContent(hintId) {
    // 各植物の管理方法を専用ファイルから取得（すべてplantId形式に統一）
    let text = '';
    
    if (hintId.startsWith('kocho-')) {
        const data = kochoHintContents[hintId];
        text = String(data?.text || '');
    } else if (hintId.startsWith('side-')) {
        const data = waraitakeHintContents[hintId];
        text = String(data?.text || '');
    } else if (hintId.startsWith('hana-')) {
        const data = hanaHintContents[hintId];
        text = String(data?.text || '');
    } else if (hintId.startsWith('nagi-')) {
        const data = crystalLeafHintContents[hintId];
        text = String(data?.text || '');
    } else if (hintId.startsWith('kane-')) {
        const data = goldenBerryHintContents[hintId];
        text = String(data?.text || '');
    } else if (hintId.startsWith('here-')) {
        const data = moonFlowerHintContents[hintId];
        text = String(data?.text || '');
    } else if (hintId.startsWith('aqua-')) {
        const data = stormWeedHintContents[hintId];
        text = String(data?.text || '');
    } else if (hintId.startsWith('rezo-')) {
        const data = eternalTreeHintContents[hintId];
        text = String(data?.text || '');
        
        // レゾナントリリィのヒントに正解値を埋め込む
        const plant = window.plantData.find(p => p.id === 'rezo');
        if (plant && plant.resonantAnswers) {
            const answers = plant.resonantAnswers;
            
            if (hintId === 'rezo-1') {
                text = text.replace('${LIGHT}', answers.light);
            } else if (hintId === 'rezo-2') {
                text = text.replace('${TEMP}', answers.temp);
            } else if (hintId === 'rezo-3') {
                text = text.replace('${WATER}', answers.water);
            } else if (hintId === 'rezo-4') {
                text = text.replace('${FERTILIZER}', answers.fertilizer);
            }
        }
    } else if (hintId.startsWith('tribu-')) {
        const data = tribuHintContents[hintId];
        text = String(data?.text || '');
        
        // トリビュソスの管理情報3に最適温度を埋め込む
        if (hintId === 'tribu-3') {
            const plant = window.plantData.find(p => p.id === 'tribu');
            if (plant) {
                const optimalTemp = plant.displayOptimalTemp || plant.optimalTemp || 3;
                text = text.replace('${OPTIMAL_TEMP}', optimalTemp);
            }
        }
    } else if (hintId.startsWith('dai-')) {
        const data = daiHintContents[hintId];
        text = String(data?.text || '');
    } else if (hintId.startsWith('rete-')) {
        const data = reteHintContents[hintId];
        text = String(data?.text || '');
    } else if (hintId.startsWith('kokyu-')) {
        const data = kokyuHintContents[hintId];
        text = String(data?.text || '');
    } else if (hintId.startsWith('kuryu-')) {
        const data = kuryuHintContents[hintId];
        text = String(data?.text || '');
    } else if (hintId.startsWith('babel-')) {
        const data = babelHintContents[hintId];
        text = String(data?.text || '');
    }
    
    // バベルが前日に採取された場合、すべての管理方法の漢字を変換（バベル自身の管理方法も含む）
    // プレースホルダー置換は既に完了しているので、ここで変換を適用
    if (text && window.babelKanjiConversionActive) {
        const originalText = text;
        text = convertKanjiWithBabel(text);
        console.log('バベル 漢字変換:', {
            hintId,
            original: originalText,
            converted: text,
            flagActive: window.babelKanjiConversionActive
        });
    }
    
    return text;
}

function renderShopIngame() {
    if (!shopListIngameEl) return;
    
    // ゴールド表示を更新（通常ゴールドと専用ゴールドを合算して表示）
    const kuryuGold = window.kuryuGold || 0;
    const totalGold = window.money + kuryuGold;
    shopMoneyIngameEl.textContent = String(totalGold);
    
    shopListIngameEl.innerHTML = '';
    // 現在の植物のみの管理方法を表示
    const plant = window.plantData[currentPlantIndex];
    if (overlayHeaderEl) overlayHeaderEl.textContent = `${plant.name}：管理方法`;
    
    // purchasedHintsが未定義の場合は初期化
    if (!purchasedHints[plant.id]) {
        purchasedHints[plant.id] = [];
    }
    
    const list = perPlantHints[plant.id] || [];
    list.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'shop-item';
        
        // 既に購入済みかチェック
        const isPurchased = purchasedHints[plant.id].includes(idx);
        
        if (isPurchased) {
            // 購入済みの場合は内容を直接表示
            const content = document.createElement('div');
            content.className = 'hint-content';
            content.textContent = getHintContent(item.id);
            row.classList.add('purchased');
            row.appendChild(content);
        } else {
            // 未購入の場合は通常の購入UI
            const name = document.createElement('div');
            name.textContent = item.name;
            const price = document.createElement('div');
            price.textContent = item.price + ' G';
            const btn = document.createElement('button');
            btn.className = 'buy-btn';
            btn.textContent = '購入';
            
            // 管理方法は1から順に。前の管理方法が購入済みでない場合は非活性
            if (idx > 0 && !purchasedHints[plant.id].includes(idx - 1)) {
                btn.disabled = true;
                row.dataset.locked = '1';
            }
            
            // クリュソボロスの場合は専用ゴールドのみ使用可能
            if (plant.id === 'kuryu') {
                const kuryuGold = window.kuryuGold || 0;
                if (kuryuGold < item.price) {
                    btn.disabled = true;
                }
            } else {
                // その他の植物の場合は、通常ゴールド+専用ゴールドで判定
                const totalGold = window.money + (window.kuryuGold || 0);
                if (totalGold < item.price) {
                    btn.disabled = true;
                }
            }
            
            row.appendChild(name); 
            row.appendChild(price); 
            row.appendChild(btn);
            
            btn.addEventListener('click', () => {
                const plant = window.plantData[currentPlantIndex];
                const price = item.price;
                let canPurchase = false;
                
                // クリュソボロスの管理方法購入時は専用ゴールドのみ使用可能
                if (plant.id === 'kuryu') {
                    const kuryuGold = window.kuryuGold || 0;
                    if (kuryuGold >= price) {
                        window.kuryuGold -= price;
                        canPurchase = true;
                        console.log(`クリュソボロス 専用ゴールドで購入: ${price} G (残り: ${window.kuryuGold} G)`);
                    }
                } else {
                    // その他の植物の場合は、通常のゴールドから優先的に消費
                    const totalGold = window.money + (window.kuryuGold || 0);
                    if (totalGold >= price) {
                        // 通常のゴールドから消費
                        if (window.money >= price) {
                            window.money -= price;
                            console.log(`通常ゴールドで購入: ${price} G (残り: ${window.money} G)`);
                        } else {
                            // 通常のゴールドが足りない場合、専用ゴールドから消費
                            const remainingPrice = price - window.money;
                            window.kuryuGold = (window.kuryuGold || 0) - remainingPrice;
                            window.money = 0;
                            console.log(`通常ゴールド(${window.money + remainingPrice} G) + 専用ゴールド(${remainingPrice} G)で購入 (専用ゴールド残り: ${window.kuryuGold} G)`);
                        }
                        canPurchase = true;
                    }
                }
                
                if (canPurchase) {
                    // ゴールド表示を更新（通常ゴールドと専用ゴールドを合算）
                    const kuryuGold = window.kuryuGold || 0;
                    const totalGold = window.money + kuryuGold;
                    shopMoneyIngameEl.textContent = String(totalGold);
                    
                    // 購入状態を記録
                    if (!purchasedHints[plant.id].includes(idx)) {
                        purchasedHints[plant.id].push(idx);
                    }
                    
                    // 購入内容を直ちに表示
                    const content = document.createElement('div');
                    content.className = 'hint-content';
                    content.textContent = getHintContent(item.id);
                    
                    // ヘッダ類は消して中身だけにし、購入済みスタイルに
                    row.classList.add('purchased');
                    row.innerHTML = '';
                    row.appendChild(content);
                    
                    // 高さを明示的にリセットして最小限にする
                    row.style.height = 'fit-content';
                    row.style.minHeight = 'auto';
                    row.style.maxHeight = 'none';
                    content.style.height = 'fit-content';
                    content.style.minHeight = 'auto';
                    content.style.maxHeight = 'none';
                    
                    // 次の管理方法を解放
                    const next = row.nextElementSibling;
                    if (next && next.querySelector('.buy-btn')) {
                        const nextBtn = next.querySelector('.buy-btn');
                        nextBtn.disabled = false;
                        next.removeAttribute('data-locked');
                    }
                }
            });
        }
        
        shopListIngameEl.appendChild(row);
    });
    
    // トリビュソスの場合、管理方法3（tribu-3）が購入済みの場合のみ更新ボタンを追加
    if (plant.id === 'tribu') {
        // tribu-3が購入済みかチェック
        const t3Index = (perPlantHints[plant.id] || []).findIndex(item => item.id === 'tribu-3');
        const isT3Purchased = t3Index !== -1 && purchasedHints[plant.id] && purchasedHints[plant.id].includes(t3Index);
        
        // tribu-3が購入済みの場合のみ更新ボタンを表示
        if (isT3Purchased) {
            // 最適温度と更新回数の初期化
            if (!plant.optimalTemp) {
                plant.optimalTemp = generateTribuOptimalTemp();
            }
            if (plant.updateCount === undefined) {
                plant.updateCount = 0;
            }
            // 更新前の最適温度（表示用）
            if (plant.displayOptimalTemp === undefined) {
                plant.displayOptimalTemp = plant.optimalTemp;
            }
            
            // 更新ボタンの行を作成（管理情報3とは別の枠）
            const updateRow = document.createElement('div');
            updateRow.className = 'shop-item';
            
            const updateName = document.createElement('div');
            updateName.textContent = '最適温度情報を更新';
            
            // 更新回数に応じた金額計算（1回目: 10G, 2回目: 20G, 3回目: 30G...）
            const updatePrice = (plant.updateCount + 1) * 10;
            const updatePriceEl = document.createElement('div');
            updatePriceEl.textContent = updatePrice + ' G';
            
            const updateBtn = document.createElement('button');
            updateBtn.className = 'buy-btn';
            updateBtn.textContent = '更新';
            
            // 所持金が足りない場合は無効化（通常ゴールド+専用ゴールドで判定）
            const totalGold = window.money + (window.kuryuGold || 0);
            if (totalGold < updatePrice) {
                updateBtn.disabled = true;
            }
            
            updateBtn.addEventListener('click', () => {
                // トリビュソスの更新は通常ゴールド+専用ゴールドで購入可能
                const totalGold = window.money + (window.kuryuGold || 0);
                if (totalGold >= updatePrice) {
                    // 通常のゴールドから消費
                    if (window.money >= updatePrice) {
                        window.money -= updatePrice;
                    } else {
                        // 通常のゴールドが足りない場合、専用ゴールドから消費
                        const remainingPrice = updatePrice - window.money;
                        window.kuryuGold = (window.kuryuGold || 0) - remainingPrice;
                        window.money = 0;
                        console.log(`トリビュソス更新: 通常ゴールド(${window.money + remainingPrice} G) + 専用ゴールド(${remainingPrice} G)で購入`);
                    }
                    
                    // ゴールド表示を更新（通常ゴールドと専用ゴールドを合算）
                    const kuryuGold = window.kuryuGold || 0;
                    const totalGold = window.money + kuryuGold;
                    shopMoneyIngameEl.textContent = String(totalGold);
                    
                    // 既に生成されている最適温度を表示に反映（新しい最適温度は生成しない）
                    plant.displayOptimalTemp = plant.optimalTemp;
                    plant.updateCount = (plant.updateCount || 0) + 1;
                    
                    console.log(`トリビュソス 最適温度情報を更新: ${plant.displayOptimalTemp} (更新回数: ${plant.updateCount})`);
                    
                    // 管理情報3（tribu-3）が購入済みの場合、その内容を更新
                    const t3Index = (perPlantHints[plant.id] || []).findIndex(item => item.id === 'tribu-3');
                    if (t3Index !== -1 && purchasedHints[plant.id] && purchasedHints[plant.id].includes(t3Index)) {
                        // 管理情報3の行を探す
                        const purchasedRows = shopListIngameEl.querySelectorAll('.shop-item.purchased');
                        const t3Row = Array.from(purchasedRows).find(row => {
                            const content = row.querySelector('.hint-content');
                            return content && content.textContent.includes('最適温度');
                        });
                        
                        if (t3Row) {
                            const content = t3Row.querySelector('.hint-content');
                            if (content) {
                                // 管理情報3の内容を更新
                                content.textContent = getHintContent('tribu-3');
                            }
                        }
                    }
                    
                    // 次の更新金額を計算
                    const nextPrice = (plant.updateCount + 1) * 10;
                    updatePriceEl.textContent = nextPrice + ' G';
                    
                    // 所持金が足りない場合は無効化（通常ゴールド+専用ゴールドで判定）
                    const nextTotalGold = window.money + (window.kuryuGold || 0);
                    if (nextTotalGold < nextPrice) {
                        updateBtn.disabled = true;
                    } else {
                        updateBtn.disabled = false;
                    }
                }
            });
            
            updateRow.appendChild(updateName);
            updateRow.appendChild(updatePriceEl);
            updateRow.appendChild(updateBtn);
            
            shopListIngameEl.appendChild(updateRow);
        }
    }
}

function openOverlayShop() {
    if (!overlay || overlayOpen || !isDayActive) return;
    overlayPrevFocus = document.activeElement;
    pausedForOverlay = true;
    overlayOpen = true;
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-open');
    renderShopIngame();
}

function closeOverlayShop() {
    if (!overlay || !overlayOpen) return;
    
    // フォーカスを外す
    if (document.activeElement && overlay.contains(document.activeElement)) {
        document.activeElement.blur();
    }
    
    overlay.classList.remove('is-open');
    // visibilityがトランジション後に隠れるため少し遅らせて aria-hidden
    setTimeout(() => { overlay && overlay.setAttribute('aria-hidden', 'true'); }, 220);
    overlayOpen = false;
    pausedForOverlay = false;
    if (overlayPrevFocus && typeof overlayPrevFocus.focus === 'function') {
        overlayPrevFocus.focus();
    }
}

if (overlayCloseBtn) overlayCloseBtn.addEventListener('click', () => { closeOverlayShop(); });

// キー操作: ↓でオーバーレイ開く、↑/Escで閉じる
document.addEventListener('keydown', (e) => {
    if (screenGame && screenGame.style.display === 'block') {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            openOverlayShop();
        } else if (e.key === 'ArrowUp' || e.key === 'Escape') {
            if (overlayOpen) { e.preventDefault(); closeOverlayShop(); }
        }
    }
});

// タッチ: 下スワイプで開く、上スワイプで閉じる（感度調整）
let hintTouchStartY = null;
let hintTouchStartX = null;
document.addEventListener('touchstart', (e) => { 
    if (!isDayActive) return; 
    hintTouchStartY = e.changedTouches[0].clientY;
    hintTouchStartX = e.changedTouches[0].clientX;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    if (!isDayActive || hintTouchStartY === null || hintTouchStartX === null) return;
    
    const dy = e.changedTouches[0].clientY - hintTouchStartY;
    const dx = e.changedTouches[0].clientX - hintTouchStartX;
    
    // 左右スワイプの制限
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        const now = Date.now();
        if (now - lastMonitorChangeTime < MONITOR_CHANGE_COOLDOWN) {
            hintTouchStartY = null;
            hintTouchStartX = null;
            return;
        }
    }
    
    // 下スワイプで管理方法ショップ（より厳しく）
    if (dy > 150 && Math.abs(dy) > Math.abs(dx) * 2 && !overlayOpen) { openOverlayShop(); }
    if (dy < -150 && Math.abs(dy) > Math.abs(dx) * 2 && overlayOpen) { closeOverlayShop(); }
    
    hintTouchStartY = null;
    hintTouchStartX = null;
}, { passive: true });

// デバッグ用のコンソールコマンド
window.t = () => {
    timeLeftSec = 0;
    console.log('時間を0に設定しました');
    updateHeader();
};

window.p = (plantId) => {
    let targetOption;
    
    if (plantId) {
        // 引数で指定された植物IDから検索
        targetOption = plantSelectionOptions.find(opt => {
            const plantName = opt.name.includes('：') ? opt.name.split('：')[1] : opt.name;
            const optPlantId = plantNameToId[plantName] || plantName;
            return optPlantId === plantId;
        });
    } else {
        // 引数なしの場合は現在の植物
        const plant = window.plantData[currentPlantIndex];
        targetOption = plantSelectionOptions.find(opt => {
            const plantName = opt.name.includes('：') ? opt.name.split('：')[1] : opt.name;
            const optPlantId = plantNameToId[plantName] || plantName;
            return optPlantId === plant.id;
        });
    }
    
    if (targetOption) {
        // 既に追加済みかチェック
        const addedPlantIds = window.plantData.map(p => p.id);
        const targetPlantName = targetOption.name.includes('：') ? targetOption.name.split('：')[1] : targetOption.name;
        const targetPlantId = plantNameToId[targetPlantName] || targetPlantName;
        if (addedPlantIds.includes(targetPlantId)) {
            console.log(`${targetOption.name} は既に追加済みです`);
            return;
        }
        
        // 植物選択画面に追加するためのフラグを設定
        window.debugForcePlant = targetOption;
        console.log(`${targetOption.name} を次回の選択肢に追加しました`);
    } else {
        console.log('エラー: 植物データが見つかりません');
    }
};

console.log('デバッグコマンド: t() - 時間を0にする, p(plantId) - 植物を選択肢に追加 (例: p("f"))');

// 植物選択画面を表示する関数
function showPlantSelectionScreen() {
    const selectionGrid = document.getElementById('plant-selection-grid');
    
    // 既存の選択肢をクリア
    selectionGrid.innerHTML = '';
    
    // 追加済み植物のIDを取得
    const addedPlantIds = window.plantData.map(plant => plant.id);
    
    // 追加済みでない植物をフィルタリング
    const availableOptions = plantSelectionOptions.filter(option => {
        const plantName = option.name.includes('：') ? option.name.split('：')[1] : option.name;
        const plantId = plantNameToId[plantName] || plantName;
        return !addedPlantIds.includes(plantId);
    });
    
    // デバッグ用: 強制表示する植物が設定されている場合
    if (window.debugForcePlant) {
        const forcedOption = window.debugForcePlant;
        window.debugForcePlant = null; // 一度使ったらクリア
        const optionEl = document.createElement('div');
        optionEl.className = 'plant-option';
        // 難易度情報を取得
        const forcedPlantName = forcedOption.name.includes('：') ? forcedOption.name.split('：')[1] : forcedOption.name;
        const forcedPlantId = plantNameToId[forcedPlantName] || forcedPlantName;
        const forcedDifficulty = getPlantDifficulty(forcedPlantId);
        
        const forcedDamageScale = formatDamageScale(forcedDifficulty);
        const forcedDamageScaleColor = getDamageScaleColor(forcedDamageScale);
        
        optionEl.innerHTML = `
            <div class="plant-icon">${forcedOption.icon}</div>
            <div class="plant-info">
                <div class="plant-name">${forcedOption.name}</div>
                <div class="plant-difficulty-container">
                    <span class="plant-management-level">${formatManagementLevel(forcedDifficulty)}</span>
                    <span class="plant-damage-scale" style="color: ${forcedDamageScaleColor};">${forcedDamageScale}</span>
                </div>
                <div class="plant-flavor">${forcedOption.flavor}</div>
            </div>
        `;
        optionEl.addEventListener('click', () => {
            selectNewPlant(forcedOption);
        });
        selectionGrid.appendChild(optionEl);
        showScreen('screen-plant-selection');
        return;
    }
    
    // 利用可能な植物がない場合は何も表示しない
    if (availableOptions.length === 0) {
        selectionGrid.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--color-text-secondary);">追加可能な植物がありません</div>';
        showScreen('screen-plant-selection');
        return;
    }
    
    // 利用可能な植物からランダムに3つを選択（最大3つまで）
    const selectedOptions = availableOptions
        .sort(() => Math.random() - 0.5) // ランダムにシャッフル
        .slice(0, Math.min(3, availableOptions.length)); // 最大3つまで
    
    // 植物選択肢を生成
    selectedOptions.forEach(option => {
        const optionEl = document.createElement('div');
        optionEl.className = 'plant-option';
        
        // 難易度情報を取得
        const plantName = option.name.includes('：') ? option.name.split('：')[1] : option.name;
        const plantId = plantNameToId[plantName] || plantName;
        const difficulty = getPlantDifficulty(plantId);
        
        const damageScale = formatDamageScale(difficulty);
        const damageScaleColor = getDamageScaleColor(damageScale);
        
        optionEl.innerHTML = `
            <div class="plant-icon">${option.icon}</div>
            <div class="plant-info">
                <div class="plant-name">${option.name}</div>
                <div class="plant-difficulty-container">
                    <span class="plant-management-level">${formatManagementLevel(difficulty)}</span>
                    <span class="plant-damage-scale" style="color: ${damageScaleColor};">${damageScale}</span>
                </div>
                <div class="plant-flavor">${option.flavor}</div>
            </div>
        `;
        
        optionEl.addEventListener('click', () => {
            selectNewPlant(option);
        });
        
        selectionGrid.appendChild(optionEl);
    });
    
    // 植物選択画面を表示
    showScreen('screen-plant-selection');
}

// 新しい植物を選択して追加する関数
function selectNewPlant(option) {
    // 植物名からIDを抽出
    const plantName = option.name;
    // 植物IDを取得
    const plantId = plantNameToId[plantName] || plantName;
    
    // 新しい植物データを作成
    const newPlant = {
        id: plantId,
        name: option.name,
        lightLevel: 50,
        tempLevel: 3,
        fertilizer: 0,
        harvestedToday: false,
        fertilizedToday: false,
        waterCount: 0,
        fertilizerColor: null,
        difficulty: getPlantDifficulty(plantId), // 難易度情報
        waterTimes: [], // アクアステラ用の灌水時刻記録
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
    };
    
    // レゾナントリリィの正解パラメータを生成
    if (plantId === 'rezo') {
        newPlant.resonantAnswers = generateResonantLilyAnswers();
        console.log('レゾナントリリィ 正解パラメータ生成:', newPlant.resonantAnswers);
    }
    
    // トリビュソスの最適温度を初期化
    if (plantId === 'tribu') {
        newPlant.optimalTemp = generateTribuOptimalTemp();
        newPlant.displayOptimalTemp = newPlant.optimalTemp;
        newPlant.updateCount = 0;
        console.log('トリビュソス 最適温度を初期化:', newPlant.optimalTemp);
    }
    
    // コキュートスの初期化
    if (plantId === 'kokyu') {
        newPlant.temp5StartTime = null;
        newPlant.kokyuNoDamageActive = false;
        console.log('コキュートス 初期化完了');
    }
    
    // 植物データの配列に追加（一番右に）
    window.plantData.push(newPlant);
    
    // purchasedHintsに追加
    if (!purchasedHints[plantId]) {
        purchasedHints[plantId] = [];
    }
    
    // モニターを更新
    initializeMonitors();
    
    // ゲーム画面に戻る
    showScreen('screen-game');
    
    // 次の日を開始
    startDay();
}

