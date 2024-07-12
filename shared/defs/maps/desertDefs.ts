import { GameConfig } from "../../gameConfig";
import { util } from "../../utils/util";
import { v2 } from "../../utils/v2";
import type { MapDef } from "../mapDefs";
import { Main } from "./baseDefs";

const mapDef = {
    mapId: 1,
    desc: {
        name: "Desert",
        icon: "img/loot/loot-weapon-flare-gun.svg",
        buttonCss: "btn-mode-desert"
    },
    assets: {
        audio: [
            { name: "piano_02", channel: "sfx" },
            { name: "log_03", channel: "sfx" },
            { name: "log_04", channel: "sfx" },
            { name: "piano_music_01", channel: "ambient" }
        ],
        atlases: ["gradient", "loadout", "shared", "desert"]
    },
    biome: {
        colors: {
            background: 6976835,
            water: 9083726,
            waterRipple: 13756037,
            beach: 13206586,
            riverbank: 11689508,
            grass: 14657367,
            underground: 4001027,
            playerSubmerge: 5151631
        },
        particles: {}
    },
    gameMode: { maxPlayers: 80, desertMode: true },
    gameConfig: {
        planes: {
            timings: [
                {
                    circleIdx: 1,
                    wait: 10,
                    options: { type: GameConfig.Plane.Airdrop }
                },
                {
                    circleIdx: 3,
                    wait: 2,
                    options: { type: GameConfig.Plane.Airdrop }
                }
            ],
            crates: [
                { name: "airdrop_crate_01", weight: 10 },
                { name: "airdrop_crate_02", weight: 1 }
            ]
        }
    },
    lootTable: {
        tier_guns: [
            { name: "famas", count: 1, weight: 0.9 },
            { name: "hk416", count: 1, weight: 4 },
            { name: "mk12", count: 1, weight: 0.1 },
            { name: "pkp", count: 1, weight: 0.005 },
            { name: "m249", count: 1, weight: 0.006 },
            { name: "ak47", count: 1, weight: 2.7 },
            { name: "scar", count: 1, weight: 0.01 },
            { name: "dp28", count: 1, weight: 0.5 },
            { name: "mosin", count: 1, weight: 0.1 },
            { name: "m39", count: 1, weight: 0.1 },
            { name: "m1a1", count: 1, weight: 10 },
            { name: "m870", count: 1, weight: 9 },
            { name: "m1100", count: 1, weight: 6 },
            { name: "mp220", count: 1, weight: 2 },
            { name: "saiga", count: 1, weight: 0.1 },
            { name: "ot38", count: 1, weight: 8 },
            { name: "m1911", count: 1, weight: 19 },
            { name: "deagle", count: 1, weight: 0.05 },
            { name: "sv98", count: 1, weight: 0.01 },
            { name: "spas12", count: 1, weight: 1 },
            { name: "qbb97", count: 1, weight: 0.01 },
            { name: "flare_gun", count: 1, weight: 14.5 },
            {
                name: "flare_gun_dual",
                count: 1,
                weight: 0.25
            },
            { name: "groza", count: 1, weight: 0.8 },
            { name: "scout", count: 1, weight: 0.05 }
        ],
        tier_airdrop_uncommon: [
            { name: "mk12", count: 1, weight: 2.5 },
            { name: "scar", count: 1, weight: 0.75 },
            { name: "mosin", count: 1, weight: 2.5 },
            { name: "m39", count: 1, weight: 2.5 },
            { name: "saiga", count: 1, weight: 1 },
            { name: "deagle", count: 1, weight: 1 },
            { name: "sv98", count: 1, weight: 0.5 },
            { name: "qbb97", count: 1, weight: 1.5 },
            { name: "m9", count: 1, weight: 0.01 },
            { name: "flare_gun", count: 1, weight: 0.5 },
            { name: "scout", count: 1, weight: 1.5 },
            { name: "model94", count: 1, weight: 2 },
            { name: "colt45", count: 1, weight: 1 }
        ],
        tier_airdrop_rare: [
            { name: "garand", count: 1, weight: 6 },
            { name: "awc", count: 1, weight: 3 },
            { name: "pkp", count: 1, weight: 3 },
            { name: "m249", count: 1, weight: 0.1 },
            { name: "m4a1", count: 1, weight: 4 },
            { name: "ots38_dual", count: 1, weight: 4.5 }
        ],
        tier_ammo: [
            { name: "45acp", count: 60, weight: 3 },
            { name: "762mm", count: 60, weight: 3 },
            { name: "556mm", count: 60, weight: 3 },
            { name: "12gauge", count: 10, weight: 3 }
        ],
        tier_ammo_crate: [
            { name: "45acp", count: 60, weight: 3 },
            { name: "762mm", count: 60, weight: 3 },
            { name: "556mm", count: 60, weight: 3 },
            { name: "12gauge", count: 10, weight: 3 },
            { name: "50AE", count: 21, weight: 1 },
            { name: "308sub", count: 5, weight: 1 },
            { name: "flare", count: 1, weight: 1 }
        ],
        tier_airdrop_ammo: [
            { name: "45acp", count: 30, weight: 3 },
            { name: "762mm", count: 30, weight: 3 },
            { name: "556mm", count: 30, weight: 3 },
            { name: "12gauge", count: 5, weight: 3 }
        ],
        tier_airdrop_outfits: [
            { name: "", count: 1, weight: 20 },
            { name: "outfitMeteor", count: 1, weight: 5 },
            { name: "outfitHeaven", count: 1, weight: 1 },
            {
                name: "outfitGhillie",
                count: 1,
                weight: 0.5
            }
        ],
        tier_airdrop_melee: [
            { name: "", count: 1, weight: 19 },
            { name: "stonehammer", count: 1, weight: 1 },
            { name: "pan", count: 1, weight: 1 }
        ],
        tier_chest: [
            { name: "famas", count: 1, weight: 1.15 },
            { name: "hk416", count: 1, weight: 4 },
            { name: "mk12", count: 1, weight: 0.55 },
            { name: "m249", count: 1, weight: 0.07 },
            { name: "ak47", count: 1, weight: 4 },
            { name: "scar", count: 1, weight: 0.27 },
            { name: "dp28", count: 1, weight: 0.55 },
            { name: "mosin", count: 1, weight: 0.55 },
            { name: "m39", count: 1, weight: 0.55 },
            { name: "saiga", count: 1, weight: 0.26 },
            { name: "mp220", count: 1, weight: 1.5 },
            { name: "deagle", count: 1, weight: 0.15 },
            { name: "vector45", count: 1, weight: 0.1 },
            { name: "sv98", count: 1, weight: 0.1 },
            { name: "spas12", count: 1, weight: 1 },
            { name: "groza", count: 1, weight: 1.15 },
            { name: "helmet02", count: 1, weight: 1 },
            { name: "helmet03", count: 1, weight: 0.25 },
            { name: "chest02", count: 1, weight: 1 },
            { name: "chest03", count: 1, weight: 0.25 },
            { name: "4xscope", count: 1, weight: 0.5 },
            { name: "8xscope", count: 1, weight: 0.25 }
        ],
        tier_hatchet: [
            { name: "vector45", count: 1, weight: 0.4 },
            { name: "hk416", count: 1, weight: 0.25 },
            { name: "mp220", count: 1, weight: 0.15 },
            { name: "pkp", count: 1, weight: 0.01 },
            { name: "m249", count: 1, weight: 0.01 },
            { name: "m9", count: 1, weight: 0.01 }
        ],
        tier_throwables: [
            { name: "frag", count: 2, weight: 1 },
            { name: "smoke", count: 1, weight: 1 },
            { name: "strobe", count: 1, weight: 0.2 },
            { name: "mirv", count: 2, weight: 0.05 }
        ],
        tier_airdrop_throwables: [
            { name: "strobe", count: 1, weight: 1 },
            { name: "frag", count: 3, weight: 0.1 }
        ]
    },
    mapGen: {
        map: {
            scale: { small: 1.1875, large: 1.1875 },
            shoreInset: 8,
            grassInset: 12,
            rivers: {
                weights: [
                    { weight: 0.1, widths: [4] },
                    { weight: 0.15, widths: [8] },
                    { weight: 0.25, widths: [8, 4] },
                    { weight: 0.21, widths: [8] },
                    { weight: 0.09, widths: [8, 8] },
                    { weight: 0.2, widths: [8, 8, 4] },
                    {
                        weight: 1e-4,
                        widths: [8, 8, 8, 6, 4]
                    }
                ],
                masks: [{ pos: v2.create(0.5, 0.5), rad: 80 }]
            }
        },
        places: [
            {
                name: "Blood Gulch",
                pos: v2.create(0.51, 0.5)
            },
            {
                name: "Southhaven",
                pos: v2.create(0.35, 0.76)
            },
            {
                name: "Atonement",
                pos: v2.create(0.8, 0.4)
            },
            {
                name: "Los Perdidos",
                pos: v2.create(0.33, 0.25)
            }
        ],
        customSpawnRules: {
            locationSpawns: [
                {
                    type: "river_town_02",
                    pos: v2.create(0.51, 0.5),
                    rad: 50,
                    retryOnFailure: false
                }
            ],
            placeSpawns: ["desert_town_01", "desert_town_02"]
        },
        densitySpawns: [
            {
                stone_01: 280,
                barrel_01: 76,
                silo_01: 4,
                crate_01: 50,
                crate_03: 8,
                bush_01: 90,
                tree_06: 220,
                tree_05c: 144,
                tree_09: 40,
                hedgehog_01: 12,
                container_01: 5,
                container_02: 5,
                container_03: 5,
                container_04: 5,
                shack_01: 8,
                outhouse_01: 5,
                loot_tier_1: 24,
                loot_tier_beach: 4
            }
        ],
        fixedSpawns: [
            {
                warehouse_01: 4,
                house_red_01: 3,
                house_red_02: 1,
                barn_01: 1,
                barn_02d: 1,
                cache_01: 1,
                cache_02: 1,
                bunker_structure_01: { odds: 0.05 },
                bunker_structure_03: 1,
                chest_01: 1,
                chest_03d: { odds: 1 },
                mil_crate_02: { odds: 0.25 },
                crate_18: 12,
                tree_02: 3,
                desert_town_01: 1,
                desert_town_02: 1,
                river_town_02: 1,
                greenhouse_02: 1,
                stone_05: 6
            }
        ],
        randomSpawns: [],
        spawnReplacements: [
            {
                tree_01: "tree_06",
                bush_01: "bush_05",
                crate_02: "crate_18",
                stone_01: "stone_01b",
                stone_03: "stone_03b"
            }
        ],
        importantSpawns: ["desert_town_01", "desert_town_02", "river_town_02"]
    }
};

export const Desert = util.mergeDeep({}, Main, mapDef) as MapDef;
