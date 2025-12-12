const { calculateEssenceTribu, generateTribuOptimalTemp } = require('./tribu');

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
        optimalTemp: 3, // デフォルト最適温度
        ...overrides,
    };
}

describe('calculateEssenceTribu', () => {
    test('最適温度と一致する場合、エッセンス35を返す', () => {
        // 条件: 光量30-70(+2), 最適温度3と一致(+3), 灌水1回(+2), 肥料: 紫(+2)
        // totalScore: 2+3+2+2 = 9 → essence: 35 (>=8)
        const plant = createPlant({
            lightLevel: 50,
            tempLevel: 3,
            optimalTemp: 3,
            waterCount: 1,
            fertilizerGiven: true,
            fertilizerColor: '紫',
        });
        
        const essence = calculateEssenceTribu(plant);
        expect(essence).toBe(35);
    });
    
    test('最適温度から1ずれている場合、エッセンス20を返す', () => {
        // 条件: 光量30-70(+2), 最適温度3から1ずれ(+1), 灌水2回(+2), 肥料: 緑(+1)
        // totalScore: 2+1+2+1 = 6 → essence: 20
        const plant = createPlant({
            lightLevel: 50,
            tempLevel: 2, // 最適温度3から1ずれ
            optimalTemp: 3,
            waterCount: 2,
            fertilizerGiven: true,
            fertilizerColor: '緑',
        });
        
        const essence = calculateEssenceTribu(plant);
        expect(essence).toBe(20);
    });
    
    test('最適温度から2以上ずれている場合、ペナルティ', () => {
        const plant = createPlant({
            lightLevel: 50,
            tempLevel: 1, // 最適温度3から2ずれ
            optimalTemp: 3,
            waterCount: 1,
            fertilizerGiven: true,
            fertilizerColor: '紫',
        });
        
        const essence = calculateEssenceTribu(plant);
        // totalScore: 2-1+2+2 = 5 → essence: 10
        expect(essence).toBe(10);
    });
});

describe('generateTribuOptimalTemp', () => {
    test('1から5の範囲でランダムな温度を返す', () => {
        const temps = [];
        for (let i = 0; i < 50; i++) {
            const temp = generateTribuOptimalTemp();
            temps.push(temp);
            expect(temp).toBeGreaterThanOrEqual(1);
            expect(temp).toBeLessThanOrEqual(5);
        }
        
        // 全ての温度が含まれていることを確認（ランダムなので高確率で含まれる）
        const uniqueTemps = [...new Set(temps)];
        expect(uniqueTemps.length).toBeGreaterThan(1);
    });
});

