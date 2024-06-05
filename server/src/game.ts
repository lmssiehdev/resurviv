import { Emote, Player } from "./objects/player";
import { type Vec2, v2 } from "../../shared/utils/v2";
import { Grid } from "./utils/grid";
import { type BaseGameObject } from "./objects/gameObject";
import { SpawnMode, type ConfigType } from "./config";
import { GameMap } from "./map";
import { BulletManager } from "./objects/bullet";
import { Logger } from "./utils/logger";
import { GameConfig, TeamMode } from "../../shared/gameConfig";
import * as net from "../../shared/net";
import { DropItemMsg } from "../../shared/msgs/dropItemMsg";
import { DisconnectMsg } from "../../shared/msgs/disconnectMsg";
import { EmoteMsg } from "../../shared/msgs/emoteMsg";
import { JoinMsg } from "../../shared/msgs/joinMsg";
import { InputMsg } from "../../shared/msgs/inputMsg";
import { type Explosion } from "./objects/explosion";
import { LootBarn } from "./objects/loot";
import { Gas } from "./objects/gas";
import { UnlockDefs } from "../../shared/defs/gameObjects/unlockDefs";
import { ObjectType } from "../../shared/utils/objectSerializeFns";
import { IDAllocator } from "./IDAllocator";
import { GameObjectDefs } from "../../shared/defs/gameObjectDefs";
import { SpectateMsg } from "../../shared/msgs/spectateMsg";
import { util } from "../../shared/utils/util";

export class Game {
    started = false;
    stopped = false;
    allowJoin = true;
    over = false;
    startedTime = 0;
    id: number;
    teamMode = TeamMode.Solo;

    objectIdAllocator = new IDAllocator(16);
    groupIdAllocator = new IDAllocator(8);

    players = new Set<Player>();
    connectedPlayers = new Set<Player>();
    livingPlayers = new Set<Player>();
    spectatablePlayers: Player[] = []; // array version of livingPlayers since it needs to be ordered

    teams = new Map<number, Player[]>();//team id maps to all players in that team

    get aliveCount(): number {
        return this.livingPlayers.size;
    }

    aliveCountDirty = false;

    msgsToSend: Array<{ type: number, msg: net.AbstractMsg }> = [];

    partialObjs = new Set<BaseGameObject>();
    fullObjs = new Set<BaseGameObject>();

    lootBarn = new LootBarn(this);

    newPlayers: Player[] = [];

    explosions: Explosion[] = [];

    map: GameMap;

    grid: Grid;

    config: ConfigType;

    now!: number;

    tickTimes: number[] = [];

    timeouts: Timer[] = [];

    bulletManager = new BulletManager(this);

    logger: Logger;

    gas: Gas;

    emotes: Emote[] = [];

    constructor(id: number, config: ConfigType) {
        this.id = id;
        this.logger = new Logger(`Game #${this.id}`);
        this.logger.log("Creating");
        const start = Date.now();

        this.config = config;

        this.grid = new Grid(1024, 1024);
        this.map = new GameMap(this);

        this.gas = new Gas(this);

        this.allowJoin = true;

        this.logger.log(`Created in ${Date.now() - start} ms`);
    }

    tick(): void {
        const now = Date.now();
        if (!this.now) this.now = now;
        const dt = (now - this.now) / 1000;
        this.now = now;

        this.bulletManager.update(dt);

        this.gas.update(dt);

        for (const loot of this.grid.categories[ObjectType.Loot]) {
            loot.update(dt);
        }

        for (const deadBody of this.grid.categories[ObjectType.DeadBody]) {
            deadBody.update(dt);
        }

        for (const explosion of this.explosions) {
            explosion.explode(this);
        }

        for (const player of this.players) {
            player.update(dt);
        }

        for (const obj of this.partialObjs) {
            if (this.fullObjs.has(obj)) {
                this.partialObjs.delete(obj);
                continue;
            }
            obj.serializePartial();
        }
        for (const obj of this.fullObjs) {
            obj.serializeFull();
        }

        for (const player of this.connectedPlayers) {
            player.sendMsgs(dt);
        }

        //
        // reset stuff
        //
        for (const player of this.players) {
            player.healthDirty = false;
            player.boostDirty = false;
            player.zoomDirty = false;
            player.actionDirty = false;
            player.inventoryDirty = false;
            player.weapsDirty = false;
            player.spectatorCountDirty = false;
            player.activeIdDirty = false;

            player.groupStatusDirty = false;
            player.playerStatusDirty = false;
        }

        this.fullObjs.clear();
        this.partialObjs.clear();
        this.newPlayers.length = 0;
        this.bulletManager.reset();
        this.msgsToSend.length = 0;
        this.explosions.length = 0;
        this.emotes.length = 0;
        this.grid.updateObjects = false;
        this.aliveCountDirty = false;

        this.gas.dirty = false;
        this.gas.timeDirty = false;

        // Record performance and start the next tick
        // THIS TICK COUNTER IS WORKING CORRECTLY!
        // It measures the time it takes to calculate a tick, not the time between ticks.
        const tickTime = Date.now() - this.now;
        this.tickTimes.push(tickTime);

        if (this.tickTimes.length >= 200) {
            const mspt = this.tickTimes.reduce((a, b) => a + b) / this.tickTimes.length;

            this.logger.log(`Avg ms/tick: ${mspt.toFixed(2)} | Load: ${((mspt / (1000 / this.config.tps)) * 100).toFixed(1)}%`);
            this.tickTimes = [];
        }
    }

    randomPlayer() {
        return this.spectatablePlayers[util.randomInt(0, this.spectatablePlayers.length - 1)];
    }

    addPlayer(socketSend: (msg: ArrayBuffer | Uint8Array) => void, closeSocket: () => void): Player {
        let pos: Vec2;

        switch (this.config.spawn.mode) {
        case SpawnMode.Center:
            pos = v2.copy(this.map.center);
            break;
        case SpawnMode.Fixed:
            pos = v2.copy(this.config.spawn.pos);
            break;
        case SpawnMode.Random:
            pos = this.map.getRandomSpawnPos();
            break;
        }

        const player = new Player(
            this,
            pos,
            socketSend,
            closeSocket
        );

        if (this.aliveCount >= 1 && !this.started) {
            this.started = true;
            this.gas.advanceGasStage();
        }

        return player;
    }

    handleMsg(buff: ArrayBuffer | Buffer, player: Player): void {
        const msgStream = new net.MsgStream(buff);
        const type = msgStream.deserializeMsgType();
        const stream = msgStream.stream;
        switch (type) {
        case net.MsgType.Input: {
            const inputMsg = new InputMsg();
            inputMsg.deserialize(stream);
            player.handleInput(inputMsg);
            break;
        }
        case net.MsgType.Join: {
            // Ignore joinMsgs from players that already joined
            // I was too lazy to create a `joined` field so just check for that
            // The initial value is 0 and its set to Date.now() on this code
            if (player.joinedTime !== 0) return;
            const joinMsg = new JoinMsg();
            joinMsg.deserialize(stream);

            if (joinMsg.matchPriv){//mode is either duos or squads
                const parsedMatchPriv: {
                    groupId: number
                    teamMode: TeamMode
                } = JSON.parse(joinMsg.matchPriv);
    
                if (this.config.map != "faction"){
                    player.groupId = player.teamId = parsedMatchPriv.groupId;
                    if (!this.teams.has(parsedMatchPriv.groupId)){
                        this.teams.set(parsedMatchPriv.groupId, [player]);
                    }else{
                        this.teams.get(parsedMatchPriv.groupId)!.push(player);
                    }
                    player.groupStatusDirty = true;
                    player.playerStatusDirty = true;
                }
                this.teamMode = parsedMatchPriv.teamMode;    
            }

            if (joinMsg.protocol !== GameConfig.protocolVersion) {
                const disconnectMsg = new DisconnectMsg();
                disconnectMsg.reason = "index-invalid-protocol";
                player.sendMsg(net.MsgType.Disconnect, disconnectMsg);
                setTimeout(() => {
                    player.closeSocket();
                }, 1);
                return;
            }

            let name = joinMsg.name;
            if (name.trim() === "") name = "Player";
            player.name = name;

            this.logger.log(`Player ${name} joined`);

            player.joinedTime = Date.now();

            player.isMobile = joinMsg.isMobile;

            /**
            * Checks if an item is present in the player's loadout
            */
            const isItemInLoadout = (item: string, category: string) => {
                if (!UnlockDefs.unlock_default.unlocks.includes(item)) return false;

                const def = GameObjectDefs[item];
                if (!def || def.type !== category) return false;

                return true;
            };

            if (isItemInLoadout(joinMsg.loadout.outfit, "outfit")) {
                player.outfit = joinMsg.loadout.outfit;
            }

            if (isItemInLoadout(joinMsg.loadout.melee, "melee")) {
                player.weapons[GameConfig.WeaponSlot.Melee].type = joinMsg.loadout.melee;
            }

            if (isItemInLoadout(joinMsg.loadout.heal, "heal")) {
                player.loadout.heal = joinMsg.loadout.heal;
            }
            if (isItemInLoadout(joinMsg.loadout.boost, "boost")) {
                player.loadout.boost = joinMsg.loadout.boost;
            }

            const emotes = joinMsg.loadout.emotes;
            for (let i = 0; i < emotes.length; i++) {
                const emote = emotes[i];

                if ((i < 4 && emote === "") || (!isItemInLoadout(emote, "emote") && emote !== "")) {
                    player.loadout.emotes.push(GameConfig.defaultEmoteLoadout[i]);
                    continue;
                }

                player.loadout.emotes.push(emote);
            }

            this.newPlayers.push(player);
            this.grid.addObject(player);
            this.connectedPlayers.add(player);
            this.players.add(player);
            this.livingPlayers.add(player);
            this.spectatablePlayers.push(player);
            this.aliveCountDirty = true;
            break;
        }
        case net.MsgType.Emote: {
            const emoteMsg = new EmoteMsg();
            emoteMsg.deserialize(stream);

            this.emotes.push(new Emote(player.__id, emoteMsg.pos, emoteMsg.type, emoteMsg.isPing));
            break;
        }
        case net.MsgType.DropItem: {
            const dropMsg = new DropItemMsg();
            dropMsg.deserialize(stream);
            player.dropItem(dropMsg);
            break;
        }
        case net.MsgType.Spectate: {
            const spectateMsg = new SpectateMsg();
            spectateMsg.deserialize(stream);
            player.spectate(spectateMsg);
            break;
        }
        }
    }

    isGameOver() {
        return !this.stopped && this.started && this.aliveCount == 1;
    }

    removePlayer(player: Player): void {
        player.disconnected = true;
        const teammates = this.teams.get(player.teamId)!;
        teammates.forEach(t => {
            t.groupStatusDirty = true
            t.playerStatusDirty = true
        });

        if (!player.dead) {
            this.aliveCountDirty = true;
            this.livingPlayers.delete(player);
            this.spectatablePlayers.splice(this.spectatablePlayers.indexOf(player), 1);
        }
        player.spectating = undefined;
        this.connectedPlayers.delete(player);

        if (this.aliveCount == 0) {
            this.end();
            return;
        }

        if (!player.dead && this.isGameOver()) {
            this.initGameEnd(this.spectatablePlayers[0], player);
        }
    }

    /**
     * sends out GameOverMsgs to 1st place, 2nd place, and all their spectators before actually ending the game and closing all sockets
     */
    initGameEnd(winner: Player, runnerUp: Player): void {
        if (runnerUp.dead) { // if not dead, means they left while still alive and their socket closed
            runnerUp.addGameOverMsg(winner.teamId);
        }
        for (const spectator of runnerUp.spectators) {
            spectator.addGameOverMsg(winner.teamId);
        }

        winner.addGameOverMsg(winner.teamId);
        for (const spectator of winner.spectators) {
            spectator.addGameOverMsg(winner.teamId);
        }
        setTimeout(() => {
            this.end();
        }, 750);
    }

    end(): void {
        this.stopped = true;
        this.allowJoin = false;
        for (const player of this.connectedPlayers) {
            player.closeSocket();
        }
        this.logger.log("Game Ended");
    }
}
