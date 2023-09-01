import { SeatingResponse, Watcher } from 'diner-utilities/types';
export declare const updateWatcherId: (config: Watcher, jobId: string) => Promise<Watcher>;
export declare const resetFailures: (config: Watcher) => Promise<void>;
export declare const markCompleteIfToday: (config: Watcher) => Promise<void>;
export declare const seatingCheck: (config: Watcher) => Promise<false | SeatingResponse>;
export declare const bookSeating: (seatings: SeatingResponse, config: Watcher) => Promise<void>;
export declare const updateWatcherWithErrors: (config: Watcher, jobError: unknown) => Promise<void>;
