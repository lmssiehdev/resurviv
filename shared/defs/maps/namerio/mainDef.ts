import type { MapDef } from "../../mapDefs";
import { Main } from "../baseDefs";

const config = {
    places: 3
} as const;

export const NamerioMain: MapDef = {
    ...Main,
    mapGen: {
        ...Main.mapGen,
        map: {
            ...Main.mapGen.map,
            baseWidth: 235,
            baseHeight: 235,
            rivers: {
                ...Main.mapGen.map.rivers,
                weights: []
            }
        },
        places: Array(config.places)
            .fill(false)
            .map(() => {
                return Main.mapGen.places[
                    Math.floor(Math.random() * Main.mapGen.places.length)
                ];
            }),
        densitySpawns: Main.mapGen.densitySpawns.reduce(
            (array, item) => {
                let object: Record<string, number> = {};
                for (const [key, value] of Object.entries(item)) {
                    object[key] = (value * 20) / 100;
                }
                array.push(object);
                return array;
            },
            [] as Record<string, number>[]
        ),
        fixedSpawns: [
            {
                // small is spawn count for solos and duos, large is spawn count for squads
                warehouse_01: 1,
                house_red_01: { small: 1, large: 1 },
                // house_red_02: { small: 1, large: 1 },
                // barn_01: { small: 1, large: 3 },
                // barn_02: 1,
                hut_01: 2,
                hut_02: 1, // spas hut
                hut_03: 1, // scout hut
                greenhouse_01: { small: 1, large: 1 },
                cache_01: 1,
                cache_02: { odds: 0.1 }, // mosin tree
                cache_07: 1,
                // bunker_structure_01: { odds: 0.05 },
                // bunker_structure_02: 1,
                // bunker_structure_03: 1,
                // bunker_structure_04: 1,
                // bunker_structure_05: 1,
                // warehouse_complex_01: 1,
                chest_01: 1,
                chest_03: { odds: 0.2 },
                mil_crate_02: { odds: 0.25 },
                tree_02: 3,
                teahouse_complex_01su: {
                    small: 1,
                    large: 1
                },
                // stone_04: 1,
                club_complex_01: 1
            }
        ],
        randomSpawns: [
            {
                spawns: [
                    "mansion_structure_01",
                    "warehouse_complex_01",
                    "police_01",
                    "bank_01"
                ],
                choose: 1
            }
        ]
    }
};
