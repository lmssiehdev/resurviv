import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import { GunDef } from "../../../shared/defs/gameObjects/gunDefs";
import { WeaponSlot } from "../../../shared/gameConfig";
import { ObjectType } from "../../../shared/net/objectSerializeFns";
import { math } from "../../../shared/utils/math";
import { GamePlugin, Events } from "../game/pluginManager";

export class DeathMatchPlugin extends GamePlugin {
    protected override initListeners(): void {
        this.on(Events.Game_Created, (_data) => {
        });

        this.on(Events.Player_Join, (data) => {
            data.inventory = {
                '1xscope': 1,
                '2xscope': 1,
                '4xscope': 1,
                '762mm': 300,
                '12gauge': 90,
                '50AE': 196,
                '9mm': 420,
                '556mm': 300,
                'bandage': 30,
                'healthkit': 4,
                'soda': 15,
                'painkiller': 4,
            };
            data.scope = "4xscope";
            data.backpack = "backpack03";
            data.helmet = "helmet03";
            data.chest = "chest03";
        })

        this.on(Events.Player_Kill, (data) => {
            if (data.source?.__type === ObjectType.Player) {
                data.source.health += 20;
                data.source.boost += 25;

                function calculateAmmoToGive(currAmmo: number, maxClip: number, amount = 50){
                    const percentage = primaryGunDef.maxClip * amount / 100
                    return math.clamp(currAmmo + percentage, 0, maxClip)
                }

                const primary = {
                    ...data.source.weapons[WeaponSlot.Primary]
                };
                const secondary = {
                    ...data.source.weapons[WeaponSlot.Secondary]
                };

                const primaryGunDef = GameObjectDefs[primary.type] as GunDef;

                const secondaryGunDef = GameObjectDefs[secondary.type] as GunDef;

                
                data.source.weapons[WeaponSlot.Primary] = {
                    ...primary,
                    ammo: calculateAmmoToGive(primary.ammo, primaryGunDef.maxClip)
                }
                data.source.weapons[WeaponSlot.Secondary] = {
                    ...secondary,
                    ammo: calculateAmmoToGive(secondary.ammo, secondaryGunDef.maxClip)
                }
            }
        });
    }
}