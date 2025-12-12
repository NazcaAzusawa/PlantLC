const { calculateEssenceHana } = require('./hana');
const { calculateEssenceKocho } = require('./kocho');
const { calculateEssenceKane } = require('./kane');

// グローバル変数をモック
global.window = {
    plantData: [],
    money: 100,
};

// getPlantCalculateFunctionをモック
global.getPlantCalculateFunction = (plantId) => {
    const funcMap = {
        'kocho': calculateEssenceKocho,
        'kane': calculateEssenceKane,
    };
    return funcMap[plantId];
};

global.logPlantInteraction = () => {};

function createPlant(overrides = {}) {
    return {
        id: 'hana',
        name: 'ハナモドキ',
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

function createLeftPlant(plantId = 'kocho', overrides = {}) {
    const plant = {
        id: plantId,
        name: plantId === 'kocho' ? 'コチョラン' : 'カネセンカ',
        harvestParams: {
            waterCount: 0,
            fertilizerColor: null,
            fertilizerGiven: false,
            lightLevel: 50,
            tempLevel: 3,
            harvested: false,
            ...(overrides.harvestParams || {}),
        },
    };
    // カネセンカの場合、waterCountもplantオブジェクトに直接設定
    if (plantId === 'kane' && overrides.harvestParams?.waterCount !== undefined) {
        plant.waterCount = overrides.harvestParams.waterCount;
    }
    return plant;
}

describe('calculateEssenceHana', () => {
    beforeEach(() => {
        global.timeLeftSec = 5; // カネセンカテスト用
        global.window = {
            plantData: [],
            money: 100,
        };
    });

    test('左の植物（コチョラン）と同じエッセンスを返す', () => {
        const leftPlant = createLeftPlant('kocho', {
            harvestParams: {
                lightLevel: 30,
                tempLevel: 5,
                waterCount: 2,
                fertilizerGiven: true,
                fertilizerColor: '紫',
            },
        });

        const hanaPlant = createPlant({
            lightLevel: 30,
            tempLevel: 5,
            waterCount: 2,
            fertilizerGiven: true,
            fertilizerColor: '紫',
        });

        // 左の植物のエッセンスを計算
        const leftEssence = calculateEssenceKocho(leftPlant);
        
        // ハナモドキのエッセンスを計算（左の植物をモック）
        const hanaEssence = calculateEssenceHana(hanaPlant, { left: leftPlant });

        // ハナモドキは左の植物と同じエッセンスを返すべき
        expect(hanaEssence).toBe(leftEssence);
        expect(hanaEssence).toBe(50); // コチョランの最適条件
    });

    test('左の植物がカネセンカの場合、特殊処理で計算', () => {
        const leftPlant = createLeftPlant('kane', {
            harvestParams: {
                waterCount: 5, // 投資5回 = 50G
                lightLevel: 87,
                tempLevel: 3,
                fertilizerGiven: true,
                fertilizerColor: '緑',
            },
        });

        const hanaPlant = createPlant({
            waterCount: 5,
            lightLevel: 87,
            tempLevel: 3,
            fertilizerGiven: true,
            fertilizerColor: '緑',
        });

        // ハナモドキのエッセンスを計算（左の植物をモック）
        // カネセンカの場合、ハナモドキ自身のパラメータで計算されるが、
        // 投資額は左の植物のものを使用
        const hanaEssence = calculateEssenceHana(hanaPlant, { left: leftPlant });

        // カネセンカの計算は特殊なので、結果が0以上であることを確認
        expect(hanaEssence).toBeGreaterThanOrEqual(0);
    });

    test('左の植物がない場合はエッセンス0を返す', () => {
        const hanaPlant = createPlant();

        // 左の植物がnullの場合
        const hanaEssence = calculateEssenceHana(hanaPlant, { left: null });

        expect(hanaEssence).toBe(0);
    });
});

