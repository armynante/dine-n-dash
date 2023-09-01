"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.updateWatcherWithErrors = exports.bookSeating = exports.seatingCheck = exports.markCompleteIfToday = exports.resetFailures = exports.updateWatcherId = void 0;
var db_1 = __importDefault(require("./db"));
var diner_utilities_1 = require("diner-utilities");
var diner_resy_1 = require("diner-resy");
// import { SQSClient } from '@aws-sdk/client-sqs/dist-types/SQSClient';
// import { Worker } from 'utility';
var Text = new diner_utilities_1.TextMSG(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN, process.env.TWILIO_PHONE_NUMBER);
var WatcherQueue = new diner_utilities_1.Worker();
var RESY_API_KEY = process.env.RESY_API_KEY;
// const RESY_API_KEY = 'ResyAPI api_key="AIcdK2rLXG6TYwJseSbmrBAy3RP81ocd"';
var agent = (0, diner_utilities_1.ProxyAgent)({
    host: process.env.PROXY_HOST,
    port: parseInt(process.env.PROXY_PORT),
    username: process.env.PROXY_USERNAME,
    password: process.env.PROXY_PASSWORD,
});
var Resy = new diner_resy_1.ResyService(agent, RESY_API_KEY);
var updateWatcherId = function (config, jobId) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, db_1.default
                    .client
                    .from('worker')
                    .update({ jobId: jobId, tries: config.tries += 1 })
                    .eq('id', config.id)
                    .select("\n            id,\n            day,\n            partySize,\n            tries,\n            failed,\n            venue,\n            complete,\n            jobId,\n            jobError,\n            user (\n                id,\n                phoneNumber,\n                resyId,\n                resyToken,\n                resyEmail,\n                resyRefreshToken,\n                resyPaymentMethodId,\n                resyGuestId,\n                email\n            )\n                ")
                    .single()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    console.error('Watcher job failed with update error');
                    console.error(error);
                    throw error;
                }
                if (!data) {
                    console.error('No data returned from update');
                    console.error(error);
                    throw error;
                }
                return [2 /*return*/, data];
        }
    });
}); };
exports.updateWatcherId = updateWatcherId;
var resetFailures = function (config) { return __awaiter(void 0, void 0, void 0, function () {
    var today;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!config.day) return [3 /*break*/, 3];
                today = new Date(config.day) <= new Date();
                if (!today) return [3 /*break*/, 3];
                console.log('Watcher past start date');
                return [4 /*yield*/, db_1.default
                        .client
                        .from('worker')
                        .update({ failed: 0 })
                        .eq('id', config.id)
                        .select("\n            id,\n            day,\n            partySize,\n            tries,\n            venue,\n            failed,\n            complete,\n            jobId,\n            jobError,\n            user (\n                id,\n                phoneNumber,\n                resyId,\n                resyToken,\n                resyRefreshToken,\n                resyEmail,\n                resyPaymentMethodId,\n                resyGuestId,\n                email\n            )\n                ")
                        .single()];
            case 1:
                _a.sent();
                if (!config.jobId) {
                    console.error('No job id found');
                    return [2 /*return*/];
                }
                return [4 /*yield*/, WatcherQueue.deleteJob(config.jobId)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.resetFailures = resetFailures;
var markCompleteIfToday = function (config) { return __awaiter(void 0, void 0, void 0, function () {
    var today;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!config.day) return [3 /*break*/, 4];
                today = new Date(config.day) <= new Date();
                if (!today) return [3 /*break*/, 4];
                console.log('Watcher past start date');
                return [4 /*yield*/, db_1.default
                        .client
                        .from('worker')
                        .update({ tries: config.tries += 1, complete: true })
                        .eq('id', config.id)
                        .select("\n            id,\n            day,\n            partySize,\n            tries,\n            venue,\n            failed,\n            complete,\n            jobId,\n            jobError,\n            user (\n                id,\n                phoneNumber,\n                resyId,\n                resyToken,\n                resyRefreshToken,\n                resyEmail,\n                resyPaymentMethodId,\n                resyGuestId,\n                email\n            )\n                ")
                        .single()];
            case 1:
                _b.sent();
                if (!config.jobId) {
                    console.error('No job id found');
                    return [2 /*return*/];
                }
                return [4 /*yield*/, Text.sendText(config.user.phoneNumber, "Watcher completed its run without finding a table for ".concat((_a = config.venue) === null || _a === void 0 ? void 0 : _a.name, " :("))];
            case 2:
                _b.sent();
                return [4 /*yield*/, WatcherQueue.deleteJob(config.jobId)];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.markCompleteIfToday = markCompleteIfToday;
var seatingCheck = function (config) { return __awaiter(void 0, void 0, void 0, function () {
    var seatings, deleted;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, Resy.seatings(config)];
            case 1:
                seatings = _b.sent();
                if (!(seatings.availibleSlots === 0)) return [3 /*break*/, 3];
                console.log("No slots found for ".concat((_a = config === null || config === void 0 ? void 0 : config.venue) === null || _a === void 0 ? void 0 : _a.name, " on ").concat(config.day));
                console.log('Deleteing old job from queue');
                console.log("Job id: ".concat(config.jobId));
                return [4 /*yield*/, WatcherQueue.deleteJob(config.jobId)];
            case 2:
                deleted = _b.sent();
                console.log(deleted);
                console.log('Job deleted');
                return [2 /*return*/, false];
            case 3: return [2 /*return*/, seatings];
        }
    });
}); };
exports.seatingCheck = seatingCheck;
var bookSeating = function (seatings, config) { return __awaiter(void 0, void 0, void 0, function () {
    var slot, bookingRequest, confirmed;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                slot = seatings.slots[0];
                return [4 /*yield*/, Resy.requestBooking({
                        config_id: slot.bookingData.config_id,
                        party_size: slot.partySize,
                        day: slot.dateTime,
                        user: config.user,
                    })];
            case 1:
                bookingRequest = _c.sent();
                return [4 /*yield*/, Resy.confirmBooking({
                        book_token: bookingRequest.bookToken,
                        user: config.user,
                    })];
            case 2:
                confirmed = (_c.sent()).data;
                if (!confirmed.reservation_id) return [3 /*break*/, 5];
                console.log("Sending text to ".concat(config.user.phoneNumber));
                return [4 /*yield*/, db_1.default
                        .client
                        .from('worker')
                        .update({ complete: true })
                        .eq('id', config.id)
                        .select("\n            id,\n            day,\n            partySize,\n            tries,\n            venue,\n            failed,\n            complete,\n            jobId,\n            jobError,\n            user (\n                id,\n                phoneNumber,\n                resyId,\n                resyToken,\n                resyEmail,\n                resyRefreshToken,\n                resyPaymentMethodId,\n                resyGuestId,\n                email\n            )\n                ")
                        .single()];
            case 3:
                _c.sent();
                return [4 /*yield*/, Text.sendText(config.user.phoneNumber, "Found a table at ".concat((_a = config === null || config === void 0 ? void 0 : config.venue) === null || _a === void 0 ? void 0 : _a.name, " for ").concat(config === null || config === void 0 ? void 0 : config.partySize))];
            case 4:
                _c.sent();
                return [3 /*break*/, 6];
            case 5:
                console.log("Booking failed for ".concat((_b = config.venue) === null || _b === void 0 ? void 0 : _b.name));
                _c.label = 6;
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.bookSeating = bookSeating;
var updateWatcherWithErrors = function (config, jobError) { return __awaiter(void 0, void 0, void 0, function () {
    var update, error, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                update = {
                    jobError: jobError,
                    failed: config.failed += 1,
                    complete: config.failed >= 5 ? true : false,
                };
                return [4 /*yield*/, db_1.default
                        .client
                        .from('worker')
                        .update(__assign({}, update))
                        .eq('id', config.id)
                        .select("\n            id,\n            day,\n            partySize,\n            tries,\n            failed,\n            venue,\n            complete,\n            jobId,\n            jobError,\n            user (\n                id,\n                phoneNumber,\n                resyId,\n                resyToken,\n                resyEmail,\n                resyRefreshToken,\n                resyPaymentMethodId,\n                resyGuestId,\n                email\n            )\n                ")
                        .single()];
            case 1:
                error = (_b.sent()).error;
                if (error) {
                    console.error('Error updating watcher with error');
                    console.error(error);
                }
                if (!(config.failed >= 5)) return [3 /*break*/, 4];
                console.log('Watcher failed 5 times. Deleting job');
                // Text user that job failed
                return [4 /*yield*/, Text.sendText(config.user.phoneNumber, "Watcher failed 5 times for ".concat((_a = config.venue) === null || _a === void 0 ? void 0 : _a.name, "\n Killing job."))];
            case 2:
                // Text user that job failed
                _b.sent();
                return [4 /*yield*/, WatcherQueue.deleteJob(config.jobId)];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                error_1 = _b.sent();
                console.error('Error updating watcher with error');
                console.error(error_1);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.updateWatcherWithErrors = updateWatcherWithErrors;
