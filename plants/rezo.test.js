const { calculateEssenceRezo } = require('./rezo');

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
        resonantAnswers: null, // テストで設定
    };
}

describe('calculateEssenceRezo', () => {
    test('全問正解でエッセンス100を返す', () => {
        const answers = {
            light: 40,
            temp: 2,
            water: 2,
            fertilizer: '紫',
        };
        
        const plant = createPlant({
            lightLevel: answers.light,
            tempLevel: answers.temp,
            waterCount: answers.water,
            fertilizerGiven: true,
            fertilizerColor: answers.fertilizer,
        });
        plant.resonantAnswers = answers;

        const essence = calculateEssenceRezo(plant);
        expect(essence).toBe(100); // totalScore: 1+1+1+1 = 4 >= 4
    });

    test('1つでも不正解ならエッセンス0を返す', () => {
        const answers = {
            light: 40,
            temp: 2,
            water: 2,
            fertilizer: '紫',
        };
        
        const plant = createPlant({
            lightLevel: 50, // 不正解
            tempLevel: answers.temp,
            waterCount: answers.water,
            fertilizerGiven: true,
            fertilizerColor: answers.fertilizer,
        });
        plant.resonantAnswers = answers;

        const essence = calculateEssenceRezo(plant);
        expect(essence).toBe(0); // totalScore: -5+1+1+1 = -2 < 4
    });

    test('肥料が不正解ならエッセンス0を返す', () => {
        const answers = {
            light: 40,
            temp: 2,
            water: 2,
            fertilizer: '紫',
        };
        
        const plant = createPlant({
            lightLevel: answers.light,
            tempLevel: answers.temp,
            waterCount: answers.water,
            fertilizerGiven: true,
            fertilizerColor: '緑', // 不正解
        });
        plant.resonantAnswers = answers;

        const essence = calculateEssenceRezo(plant);
        expect(essence).toBe(0);
    });
});

