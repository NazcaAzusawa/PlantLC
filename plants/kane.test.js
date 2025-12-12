const { calculateEssenceKane } = require('./kane');

// timeLeftSecをモックする必要があるため、グローバル変数を設定
global.timeLeftSec = 10; // 残り1時間（10秒）

function createPlant(overrides = {}) {
    return {
        harvestParams: {
            waterCount: 0, // 投資回数
            fertilizerColor: null,
            fertilizerGiven: false,
            lightLevel: 50,
            tempLevel: 3,
            harvested: false,
            ...overrides,
        },
    };
}

describe('calculateEssenceKane', () => {
    beforeEach(() => {
        // 各テスト前に残り時間をリセット（残り1時間 = 10秒）
        global.timeLeftSec = 10;
        global.window = { money: 100 };
    });

    test('残り1時間より前に採取するとエッセンス0', () => {
        global.timeLeftSec = 20; // 残り2時間（20秒）
        
        const plant = createPlant({
            waterCount: 5, // 投資5回 = 50G
            lightLevel: 85, // +3
            tempLevel: 3,  // +1
            fertilizerGiven: true,
            fertilizerColor: '緑',
        });

        const essence = calculateEssenceKane(plant);
        expect(essence).toBe(0);
    });

    test('最適条件でエッセンス量が最大倍率', () => {
        global.timeLeftSec = 5; // 残り0.5時間（5秒）
        global.window = { money: 100 };
        
        const plant = createPlant({
            waterCount: 5, // 投資5回 = 50G
            lightLevel: 87, // +3
            tempLevel: 3,  // +1
            fertilizerGiven: true,
            fertilizerColor: '緑', // 所持金(100) > 投資額(50)なので緑が最適 → +3
        });

        const essence = calculateEssenceKane(plant);
        // totalScore: 3+1+3 = 7 >= 7 → multiplier = 2.0
        // essence = 50 * 2.0 = 100
        expect(essence).toBe(100);
    });

    test('投資額が所持金より大きい場合、橙が最適', () => {
        global.timeLeftSec = 5;
        global.window = { money: 30 }; // 投資額(50)より少ない
        
        const plant = createPlant({
            waterCount: 5, // 投資5回 = 50G
            lightLevel: 87,
            tempLevel: 3,
            fertilizerGiven: true,
            fertilizerColor: '橙', // 所持金(30) < 投資額(50)なので橙が最適 → +3
        });

        const essence = calculateEssenceKane(plant);
        expect(essence).toBe(100);
    });

    test('投資額と所持金が同じ場合、紫が最適', () => {
        global.timeLeftSec = 5;
        global.window = { money: 50 }; // 投資額と同じ
        
        const plant = createPlant({
            waterCount: 5, // 投資5回 = 50G
            lightLevel: 87,
            tempLevel: 3,
            fertilizerGiven: true,
            fertilizerColor: '紫', // 所持金(50) = 投資額(50)なので紫が最適 → +3
        });

        const essence = calculateEssenceKane(plant);
        expect(essence).toBe(100);
    });
});

