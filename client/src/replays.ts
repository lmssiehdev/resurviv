import base64 from "base64-js";
import Dexie, { type EntityTable } from "dexie";

export type ReplayDB = Dexie & {
    replays: EntityTable<
        {
            id: number;
            name: string;
            kills: string;
            date: number;
            data: string[];
        },
        "id"
    >;
};

class Replays {
    db = new Dexie("ReplaysDatabase") as ReplayDB;
    currentRecording: string[] = [];

    constructor() {
        this.db.version(1).stores({
            replays: `
              id,
              name,
              date,
              kills,
              data`
        });
    }

    pushMsg(msg: ArrayBuffer) {
        this.currentRecording.push(base64.fromByteArray(new Uint8Array(msg)));
    }

    saveCurrentRecording(payload: {
        name: string;
        kills: string;
    }) {
        if (this.currentRecording.length === 0) return;

        this.db.replays.add({
            id: Math.random(),
            data: this.currentRecording,
            date: new Date().getTime(),
            ...payload
        });
        this.currentRecording = [];
    }
}

export const replaysDB = new Replays();
