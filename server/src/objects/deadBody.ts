import { collider } from "../../../shared/utils/collider";
import { ObjectType } from "../../../shared/utils/objectSerializeFns";
import { type Vec2, v2 } from "../../../shared/utils/v2";
import { Config } from "../config";
import { type Game } from "../game";
import { BaseGameObject } from "./gameObject";

export class DeadBodyBarn {
    deadBodies: DeadBody[] = [];

    constructor(readonly game: Game) {}

    update(dt: number) {
        for (let i = 0; i < this.deadBodies.length; i++) {
            const deadBody = this.deadBodies[i];
            deadBody.update(dt);
            if (deadBody.__id === 0) {
                this.deadBodies.splice(i, 1);
            }
        }
    }

    addDeadBody(pos: Vec2, playerId: number, layer: number, dir: Vec2) {
        const deadBody = new DeadBody(this.game, pos, playerId, layer, dir);
        this.deadBodies.push(deadBody);
        this.game.objectRegister.register(deadBody);
    }
}

export class DeadBody extends BaseGameObject {
    bounds = collider.createCircle(v2.create(0, 0), 2);

    override readonly __type = ObjectType.DeadBody;

    layer: number;
    playerId: number;

    vel: Vec2;
    oldPos: Vec2;
    dragConstant: number;

    constructor(game: Game, pos: Vec2, playerId: number, layer: number, dir: Vec2) {
        super(game, pos);
        this.layer = layer;
        this.playerId = playerId;
        this.vel = v2.mul(dir, 8);
        this.oldPos = v2.copy(this.pos);
        this.dragConstant = Math.exp(-3.69 / Config.tps);
    }

    update(dt: number): void {
        const moving =
            Math.abs(this.vel.x) > 0.001 ||
            Math.abs(this.vel.y) > 0.001 ||
            !v2.eq(this.oldPos, this.pos);

        if (!moving) return;

        this.oldPos = v2.copy(this.pos);

        const halfDt = dt / 2;

        const calculateSafeDisplacement = (): Vec2 => {
            let displacement = v2.mul(this.vel, halfDt);
            if (v2.lengthSqr(displacement) >= 1) {
                displacement = v2.normalizeSafe(displacement);
            }

            return displacement;
        };

        this.pos = v2.add(this.pos, calculateSafeDisplacement());
        this.vel = v2.mul(this.vel, this.dragConstant);

        this.pos = v2.add(this.pos, calculateSafeDisplacement());
        this.game.map.clampToMapBounds(this.pos);

        const originalLayer = this.layer;
        const objs = this.game.grid.intersectCollider(
            collider.createCircle(this.pos, 0.1)
        );
        this.checkStairs(objs, 2);

        this.pos = this.game.map.clampToMapBounds(this.pos);

        if (this.layer !== originalLayer) {
            this.setDirty();
        }

        if (!v2.eq(this.oldPos, this.pos)) {
            this.setPartDirty();
            this.game.grid.updateObject(this);
        }
    }
}
