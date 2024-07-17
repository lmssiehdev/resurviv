import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import type { GunDef } from "../../../shared/defs/gameObjects/gunDefs";
import { WeaponSlot } from "../../../shared/gameConfig";
import { ObjectType } from "../../../shared/net/objectSerializeFns";
import { math } from "../../../shared/utils/math";
import { Events, GamePlugin } from "../game/pluginManager";

export class DeathMatchPlugin extends GamePlugin {
    protected override initListeners(): void {
        this.on(Events.Game_Created, (_data) => {});

        this.on(Events.Player_Join, (data) => {
            data.boost = 100;
            data.inventory = {
                "1xscope": 1,
                "2xscope": 1,
                "4xscope": 1,
                "762mm": 300,
                "12gauge": 90,
                "50AE": 196,
                "9mm": 420,
                "556mm": 300,
                bandage: 30,
                healthkit: 4,
                soda: 15,
                painkiller: 4
            };
            data.scope = "4xscope";
            data.backpack = "backpack03";
            data.helmet = "helmet03";
            data.chest = "chest03";
        });

        this.on(Events.Player_Kill, (data) => {
            // clear inventory to prevent loot from dropping;
            data.player.inventory = {};
            data.player.backpack = "backpack00";
            (["scope", "helmet", "chest"] as const).forEach(
                (item) => (data.player[item] = "")
            );

            data.player.weaponManager.setCurWeapIndex(WeaponSlot.Melee);

            {
                const primary = data.player.weapons[WeaponSlot.Primary];
                primary.type = "";
                primary.ammo = 0;
                primary.cooldown = 0;

                const secondary = data.player.weapons[WeaponSlot.Secondary];
                secondary.type = "";
                secondary.ammo = 0;
                secondary.cooldown = 0;
            }

            // give the killer health and gun ammo and inventory ammo
            if (data.source?.__type === ObjectType.Player) {
                const killer = data.source;
                killer.health += 20;
                killer.boost += 25;

                function calculateAmmoToGive(
                    currAmmo: number,
                    maxClip: number,
                    amount = 50
                ) {
                    const percentage = (maxClip * amount) / 100;
                    return math.clamp(currAmmo + percentage, 0, maxClip);
                }

                const primary = {
                    ...killer.weapons[WeaponSlot.Primary]
                };

                if (primary.type != "") {
                    const primaryGunDef = GameObjectDefs[primary.type] as GunDef;
                    killer.weapons[WeaponSlot.Primary] = {
                        ...primary,
                        ammo: calculateAmmoToGive(primary.ammo, primaryGunDef.maxClip)
                    };
                }

                const secondary = {
                    ...killer.weapons[WeaponSlot.Secondary]
                };

                if (secondary.type != "") {
                    const secondaryGunDef = GameObjectDefs[secondary.type] as GunDef;

                    killer.weapons[WeaponSlot.Secondary] = {
                        ...secondary,
                        ammo: calculateAmmoToGive(secondary.ammo, secondaryGunDef.maxClip)
                    };
                }

                // @TODO: add ammo to inventory
            }
        });
    }
}
