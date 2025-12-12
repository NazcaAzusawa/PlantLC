const { calculateEssenceNagi } = require('./nagi');

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
        dayEndParams: {
            lightLevel: 50,
            tempLevel: 3,
            waterCount: 0,
            fertilizerColor: null,
        },
    };
}

describe('calculateEssenceNagi', () => {
    test('最適条件でエッセンス40を返す', () => {
        // 条件: 光量70以上(+3), 温度2(+3), 灌水3回(+3), 肥料(+3)
        const plant = createPlant({
            lightLevel: 80,
            tempLevel: 2,
            waterCount: 3,
            fertilizerGiven: true,
            fertilizerColor: '紫',
        });
        plant.dayEndParams = {
            lightLevel: 80,
            tempLevel: 2,
            waterCount: 3,
            fertilizerColor: '紫',
        };

        const essence = calculateEssenceNagi(plant);
        expect(essence).toBe(40); // totalScore: 3+3+3+3 = 12 >= 12
    });

    test('環境変化でエッセンス30%に減少', () => {
        const plant = createPlant({
            lightLevel: 80,
            tempLevel: 2,
            waterCount: 3,
            fertilizerGiven: true,
            fertilizerColor: '紫',
        });
        // 前日は異なる環境
        plant.dayEndParams = {
            lightLevel: 50,
            tempLevel: 3,
            waterCount: 3,
            fertilizerColor: '紫',
        };

        const essence = calculateEssenceNagi(plant);
        expect(essence).toBe(12); // 40 * 0.3 = 12
    });

    test('条件が悪い場合はエッセンス0を返す', () => {
        const plant = createPlant({
            lightLevel: 20,
            tempLevel: 5,
            waterCount: 0,
            fertilizerGiven: false,
        });

        const essence = calculateEssenceNagi(plant);
        expect(essence).toBe(0);
    });
});

