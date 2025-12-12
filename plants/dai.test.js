const { calculateEssenceDai } = require('./dai');

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

describe('calculateEssenceDai', () => {
    test('最適条件でエッセンス35を返す', () => {
        // 条件: 光量30-70(+2), 温度3(+2), 灌水1-2回(+2), 肥料: 紫(+2)
        // totalScore: 2+2+2+2 = 8 → essence: 35 (>=8)
        const plant = createPlant({
            lightLevel: 50,
            tempLevel: 3,
            waterCount: 1,
            fertilizerGiven: true,
            fertilizerColor: '紫',
        });
        
        const essence = calculateEssenceDai(plant);
        expect(essence).toBe(35);
    });
    
    test('中程度の条件でエッセンス20を返す', () => {
        const plant = createPlant({
            lightLevel: 50,
            tempLevel: 2,
            waterCount: 2,
            fertilizerGiven: true,
            fertilizerColor: '緑',
        });
        
        const essence = calculateEssenceDai(plant);
        // totalScore: 2+1+2+1 = 6 → essence: 20
        expect(essence).toBe(20);
    });
    
    test('最悪条件でエッセンス0を返す', () => {
        const plant = createPlant({
            lightLevel: 80,
            tempLevel: 1,
            waterCount: 0,
            fertilizerGiven: false,
            fertilizerColor: null,
        });
        
        const essence = calculateEssenceDai(plant);
        // totalScore: 0+0-1-2 = -3 → essence: 0
        expect(essence).toBe(0);
    });
});

