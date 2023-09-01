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
exports.watcherQueue = void 0;
var bull_1 = __importDefault(require("bull"));
var diner_utilities_1 = require("diner-utilities");
var db_1 = __importDefault(require("./db"));
var diner_resy_1 = require("diner-resy");
var helpers_1 = require("./helpers");
var RESY_API_KEY = process.env.RESY_API_KEY;
var RESERVATION_INTERVAL = process.env.RESERVATION_INTERVAL ? parseInt(process.env.RESERVATION_INTERVAL) : 1000 * 10; // 10 seconds
var agent = (0, diner_utilities_1.ProxyAgent)({
    host: process.env.PROXY_HOST,
    port: parseInt(process.env.PROXY_PORT),
    username: process.env.PROXY_USERNAME,
    password: process.env.PROXY_PASSWORD,
});
var Resy = new diner_resy_1.ResyService(agent, RESY_API_KEY);
var Text = new diner_utilities_1.TextMSG(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN, process.env.TWILIO_PHONE_NUMBER);
exports.watcherQueue = new bull_1.default('watcherQueue', {
    redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
    },
});
(0, helpers_1.logRedisStatus)(exports.watcherQueue);
exports.watcherQueue.process(function (job) { return __awaiter(void 0, void 0, void 0, function () {
    var watcherConfig, isToday, seatings, noSeatings, slot, bookingRequest, confirmed, error_1;
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                watcherConfig = job.data;
                _j.label = 1;
            case 1:
                _j.trys.push([1, 8, , 10]);
                return [4 /*yield*/, (0, helpers_1.markCompleteIfToday)(watcherConfig)];
            case 2:
                isToday = _j.sent();
                if (isToday)
                    return [2 /*return*/];
                console.log('Watcher running for', (_a = watcherConfig === null || watcherConfig === void 0 ? void 0 : watcherConfig.venue) === null || _a === void 0 ? void 0 : _a.name);
                console.log('Pulling seatings...');
                return [4 /*yield*/, Resy.seatings(watcherConfig)];
            case 3:
                seatings = _j.sent();
                console.log("Seatings: ".concat(seatings === null || seatings === void 0 ? void 0 : seatings.availibleSlots, " slots"));
                return [4 /*yield*/, (0, helpers_1.seatingCheck)(seatings, watcherConfig, exports.watcherQueue)];
            case 4:
                noSeatings = _j.sent();
                if (noSeatings)
                    return [2 /*return*/];
                console.log("Attempting to book ".concat((_b = watcherConfig === null || watcherConfig === void 0 ? void 0 : watcherConfig.venue) === null || _b === void 0 ? void 0 : _b.name, " on ").concat(watcherConfig.day));
                slot = seatings.slots[0];
                return [4 /*yield*/, Resy.requestBooking({
                        config_id: slot.bookingData.config_id,
                        party_size: slot.partySize,
                        day: slot.dateTime,
                        user: watcherConfig.user,
                    })];
            case 5:
                bookingRequest = _j.sent();
                return [4 /*yield*/, Resy.confirmBooking({
                        book_token: bookingRequest.bookToken,
                        user: watcherConfig.user,
                    })];
            case 6:
                confirmed = (_j.sent()).data;
                if (confirmed.reservation_id) {
                    console.log("Sending text to ".concat(watcherConfig.user.phoneNumber));
                    Text.sendText(watcherConfig.user.phoneNumber, "Found a table at ".concat((_c = watcherConfig === null || watcherConfig === void 0 ? void 0 : watcherConfig.venue) === null || _c === void 0 ? void 0 : _c.name, " for ").concat(watcherConfig === null || watcherConfig === void 0 ? void 0 : watcherConfig.partySize));
                }
                else {
                    console.log("Booking failed for ".concat((_e = (_d = job === null || job === void 0 ? void 0 : job.data) === null || _d === void 0 ? void 0 : _d.venue) === null || _e === void 0 ? void 0 : _e.name));
                }
                console.log('Updating worker');
                return [4 /*yield*/, db_1.default.from('worker').client
                        .update({
                        complete: true,
                    })
                        .eq('id', (_f = job === null || job === void 0 ? void 0 : job.data) === null || _f === void 0 ? void 0 : _f.id)
                        .single()];
            case 7:
                _j.sent();
                console.log('Worker updated');
                return [2 /*return*/, confirmed];
            case 8:
                error_1 = _j.sent();
                console.log("Booking failed for ".concat((_h = (_g = job === null || job === void 0 ? void 0 : job.data) === null || _g === void 0 ? void 0 : _g.venue) === null || _h === void 0 ? void 0 : _h.name));
                console.log(error_1);
                return [4 /*yield*/, db_1.default.from('worker').client
                        .update({
                        complete: true,
                    })
                        .eq('id', watcherConfig === null || watcherConfig === void 0 ? void 0 : watcherConfig.id)
                        .single()];
            case 9:
                _j.sent();
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); });
exports.watcherQueue.on('failed', function (job, error) { return __awaiter(void 0, void 0, void 0, function () {
    var watcherConfig, _a, data, dbError, _b, updateData, updateError, error_2;
    var _c, _d, _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                watcherConfig = job.data;
                _g.label = 1;
            case 1:
                _g.trys.push([1, 6, , 7]);
                console.log("Watcher job failed with error ".concat(error));
                return [4 /*yield*/, db_1.default
                        .from('worker')
                        .select()
                        .eq('id', job.data.id)
                        .single()];
            case 2:
                _a = _g.sent(), data = _a.data, dbError = _a.error;
                if (dbError) {
                    console.log('Watcher job failed with db error');
                    console.log(dbError);
                    console.log(job);
                    throw dbError;
                }
                return [4 /*yield*/, db_1.default
                        .from('worker')
                        .update({ failed: data.failed + 1 })
                        .eq('id', (_c = job === null || job === void 0 ? void 0 : job.data) === null || _c === void 0 ? void 0 : _c.id)
                        .select()
                        .single()];
            case 3:
                _b = _g.sent(), updateData = _b.data, updateError = _b.error;
                if (updateError) {
                    console.log('Watcher job failed with update error');
                    console.log(updateError);
                    Text.sendText(watcherConfig.user.phoneNumber, "Watcher job failed with error ".concat(error === null || error === void 0 ? void 0 : error.message, " for ").concat((_d = watcherConfig === null || watcherConfig === void 0 ? void 0 : watcherConfig.venue) === null || _d === void 0 ? void 0 : _d.name));
                    throw updateError;
                }
                if (!((updateData === null || updateData === void 0 ? void 0 : updateData.failed) < 5)) return [3 /*break*/, 5];
                return [4 /*yield*/, exports.watcherQueue.add(updateData, { delay: RESERVATION_INTERVAL })];
            case 4:
                _g.sent();
                return [2 /*return*/];
            case 5:
                Text.sendText(watcherConfig.user.phoneNumber, "Watcher job failed with error ".concat(error === null || error === void 0 ? void 0 : error.message, " for ").concat((_e = watcherConfig === null || watcherConfig === void 0 ? void 0 : watcherConfig.venue) === null || _e === void 0 ? void 0 : _e.name));
                return [3 /*break*/, 7];
            case 6:
                error_2 = _g.sent();
                console.log("Watcher job failed with error for ".concat((_f = watcherConfig === null || watcherConfig === void 0 ? void 0 : watcherConfig.venue) === null || _f === void 0 ? void 0 : _f.name));
                console.log(error_2);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
