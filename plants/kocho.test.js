const { calculateEssenceKocho } = require('./kocho');

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
    };
}

describe('calculateEssenceKocho', () => {
    test('最適条件でエッセンス50を返す', () => {
        // 条件: 光量16-49(+3), 温度5(+3), 灌水1-3回(+1), 肥料: 紫(+3)
        const plant = createPlant({
            lightLevel: 30,
            tempLevel: 5,
            waterCount: 2,
            fertilizerGiven: true,
            fertilizerColor: '紫',
        });

        const essence = calculateEssenceKocho(plant);
        expect(essence).toBe(50);
    });

    test('肥料ミス（未施肥）時はエッセンス0を返す', () => {
        // 肥料なしは-10で大きく減点 → 合計スコアが0以下になる代表例
        const plant = createPlant({
            lightLevel: 50, // 0点帯
            tempLevel: 3,   // +1
            waterCount: 1,  // +1
            fertilizerGiven: false,
            fertilizerColor: null,
        });

        const essence = calculateEssenceKocho(plant);
        expect(essence).toBe(0);
    });
});

