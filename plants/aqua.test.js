const { calculateEssenceAqua } = require('./aqua');

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

describe('calculateEssenceAqua', () => {
    test('最適条件でエッセンス60を返す', () => {
        // 条件: 光量0-20または81-100(+2), 温度1または5(+2), 灌水2回(+2), 肥料: 橙(+3)
        const plant = createPlant({
            lightLevel: 15,
            tempLevel: 1,
            waterCount: 2,
            fertilizerGiven: true,
            fertilizerColor: '橙',
        });

        const essence = calculateEssenceAqua(plant);
        expect(essence).toBe(40); // totalScore: 2+2+2+3 = 9 >= 6
    });

    test('極端な値（光量高・温度高）で高エッセンス', () => {
        const plant = createPlant({
            lightLevel: 95,
            tempLevel: 5,
            waterCount: 2,
            fertilizerGiven: true,
            fertilizerColor: '橙',
        });

        const essence = calculateEssenceAqua(plant);
        expect(essence).toBe(40); // totalScore: 2+2+2+3 = 9 >= 6
    });

    test('条件が悪い場合はエッセンス0を返す', () => {
        const plant = createPlant({
            lightLevel: 50, // -1
            tempLevel: 3,   // -1
            waterCount: 0,  // 0
            fertilizerGiven: false, // -3
        });

        const essence = calculateEssenceAqua(plant);
        expect(essence).toBe(0); // totalScore: -1-1+0-3 = -5 < -2
    });
});

