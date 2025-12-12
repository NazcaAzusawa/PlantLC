const { calculateEssenceHere } = require('./here');

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

describe('calculateEssenceHere', () => {
    test('最適条件でエッセンス120を返す', () => {
        // 条件: 光量20-40(+3), 温度1-2(+3), 灌水1回(+3), 肥料: 紫(+3)
        const plant = createPlant({
            lightLevel: 30,
            tempLevel: 2,
            waterCount: 1,
            fertilizerGiven: true,
            fertilizerColor: '紫',
        });

        const essence = calculateEssenceHere(plant);
        expect(essence).toBe(120); // totalScore: 3+3+3+3 = 12 >= 10
    });

    test('条件が悪い場合はエッセンス0を返す', () => {
        const plant = createPlant({
            lightLevel: 90, // -2
            tempLevel: 5,   // -2
            waterCount: 0,  // -2
            fertilizerGiven: false, // -1
        });

        const essence = calculateEssenceHere(plant);
        expect(essence).toBe(0); // totalScore: -2-2-2-1 = -7 < 2
    });

    test('中程度の条件でエッセンス70を返す', () => {
        const plant = createPlant({
            lightLevel: 30, // +3
            tempLevel: 1,   // +3
            waterCount: 1,  // +3
            fertilizerGiven: false, // -1
        });

        const essence = calculateEssenceHere(plant);
        expect(essence).toBe(70); // totalScore: 3+3+3-1 = 8 >= 6
    });
});

