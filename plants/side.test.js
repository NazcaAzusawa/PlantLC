const { calculateEssenceSide } = require('./side');

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
        consecutiveWaterDays: 0,
    };
}

describe('calculateEssenceSide', () => {
    test('最適条件でエッセンス50を返す', () => {
        // 条件: 光量30-70(+2), 温度2-5(+1), 灌水1回(+3)
        const plant = createPlant({
            lightLevel: 50,
            tempLevel: 3,
            waterCount: 1,
            fertilizerGiven: false, // 肥料は無影響
        });

        const essence = calculateEssenceSide(plant);
        expect(essence).toBe(50); // totalScore: 2+1+3 = 6 >= 5
    });

    test('連続灌水2日以上でエッセンス半減', () => {
        const plant = createPlant({
            lightLevel: 50,
            tempLevel: 3,
            waterCount: 1,
        });
        plant.consecutiveWaterDays = 2; // 2日以上連続灌水（plantオブジェクトの直接プロパティ）

        const essence = calculateEssenceSide(plant);
        expect(essence).toBe(25); // 50 * 0.5 = 25
    });

    test('条件が悪い場合はエッセンス0を返す', () => {
        const plant = createPlant({
            lightLevel: 80, // 0点
            tempLevel: 1,   // 0点
            waterCount: 0,  // 0点
        });

        const essence = calculateEssenceSide(plant);
        expect(essence).toBe(0);
    });
});

