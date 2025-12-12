const { calculateEssenceKokyu } = require('./kokyu');

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

describe('calculateEssenceKokyu', () => {
    test('最適条件でエッセンス45を返す', () => {
        // 条件: 光量31-70(+3), 温度5(+4), 灌水2回(+2), 肥料: 紫(+3)
        const plant = createPlant({
            lightLevel: 60,
            tempLevel: 5,
            waterCount: 2,
            fertilizerGiven: true,
            fertilizerColor: '紫',
        });

        const essence = calculateEssenceKokyu(plant);
        expect(essence).toBe(45);
    });

    test('中程度の条件でエッセンス30を返す', () => {
        // 条件: 光量31-70(+3), 温度4(+3), 灌水2回(+2), 肥料: 緑(+1)
        const plant = createPlant({
            lightLevel: 50,
            tempLevel: 4,
            waterCount: 2,
            fertilizerGiven: true,
            fertilizerColor: '緑',
        });

        const essence = calculateEssenceKokyu(plant);
        expect(essence).toBe(30);
    });

    test('低条件でエッセンス10を返す', () => {
        // 条件: 光量0-30(+2), 温度3(+2), 灌水1回(+1), 肥料: 橙(+1)
        const plant = createPlant({
            lightLevel: 20,
            tempLevel: 3,
            waterCount: 1,
            fertilizerGiven: true,
            fertilizerColor: '橙',
        });

        const essence = calculateEssenceKokyu(plant);
        expect(essence).toBe(10);
    });

    test('最低条件でエッセンス0を返す', () => {
        // 条件: 光量71-100(+1), 温度1(0), 灌水0回(0), 肥料なし(0)
        const plant = createPlant({
            lightLevel: 90,
            tempLevel: 1,
            waterCount: 0,
            fertilizerGiven: false,
            fertilizerColor: null,
        });

        const essence = calculateEssenceKokyu(plant);
        expect(essence).toBe(0);
    });
});

