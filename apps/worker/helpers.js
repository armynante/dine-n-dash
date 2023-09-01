"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRedisStatus = exports.seatingCheck = exports.markCompleteIfToday = void 0;
var db_1 = __importDefault(require("./db"));
var markCompleteIfToday = function (config) { return __awaiter(void 0, void 0, void 0, function () {
    var today;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!config.day) return [3 /*break*/, 2];
                today = new Date(config.day) <= new Date();
                if (!today) return [3 /*break*/, 2];
                console.log('Watcher past start date');
                return [4 /*yield*/, db_1.default.from('worker')
                        .update({ tries: config.tries, complete: true })
                        .eq('id', config.id)
                        .select()
                        .single()];
            case 1:
                _a.sent();
                return [2 /*return*/, true];
            case 2: return [2 /*return*/];
        }
    });
}); };
exports.markCompleteIfToday = markCompleteIfToday;
var seatingCheck = function (seatings, config, watcherQueue) { return __awaiter(void 0, void 0, void 0, function () {
    var job, watcher;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!(seatings.availibleSlots === 0)) return [3 /*break*/, 3];
                console.log("No slots found for ".concat((_a = config === null || config === void 0 ? void 0 : config.venue) === null || _a === void 0 ? void 0 : _a.name, " on ").concat(config.day));
                config.tries = config.tries + 1;
                return [4 /*yield*/, watcherQueue.add(config, { delay: 1000 * 15 })];
            case 1:
                job = _b.sent();
                console.log('Job added back to queue');
                return [4 /*yield*/, db_1.default.from('worker')
                        .update({ tries: config.tries, jobId: job.id })
                        .eq('id', config.id)
                        .select()
                        .single()];
            case 2:
                watcher = (_b.sent()).data;
                console.log("Worker updated and has ".concat(watcher.tries, " tries"));
                return [2 /*return*/, true];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.seatingCheck = seatingCheck;
var logRedisStatus = function (watcherQueue) {
    watcherQueue.on('connected', function () {
        console.log('Queue connected to Redis');
    });
    watcherQueue.on('error', function (error) {
        console.log('Queue connection error: ', error);
    });
    watcherQueue.on('waiting', function (jobId) {
        console.log('Queue waiting for job: ', jobId);
    });
    watcherQueue.on('active', function (job) {
        console.log('Queue job started: ', job.id);
    });
    watcherQueue.on('completed', function (job) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log('Queue job completed: ', job.id);
            return [2 /*return*/];
        });
    }); });
    watcherQueue.on('failed', function (job, error) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log('Queue job failed: ', job.id);
            console.log(error);
            return [2 /*return*/];
        });
    }); });
    watcherQueue.on('progress', function (job, error) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log('Queue in progress: ', job.id);
            console.log(error);
            return [2 /*return*/];
        });
    }); });
    watcherQueue.on('remove', function (job) {
        console.log('Queue job removed: ', job.data);
    });
};
exports.logRedisStatus = logRedisStatus;
