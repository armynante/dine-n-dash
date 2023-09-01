import { SeatingResponse, Watcher } from 'diner-utilities/types';
import { Queue } from 'bull';
export declare const markCompleteIfToday: (config: Watcher) => Promise<true | undefined>;
export declare const seatingCheck: (seatings: SeatingResponse, config: Watcher, watcherQueue: Queue<Watcher>) => Promise<true | undefined>;
export declare const logRedisStatus: (watcherQueue: Queue<Watcher>) => void;
