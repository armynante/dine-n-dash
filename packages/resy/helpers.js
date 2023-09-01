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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDayDates = exports.oneMonthFromNow = exports.withinTimeSlot = exports.formatUSToMil = exports.xDaysInFuture = exports.formatMilToUS = exports.delay = exports.dateDiffArray = exports.prettyDate = exports.numStrArryToDayStr = exports.dayStrArrToDayNum = exports.dayNumberToDayString = exports.dateToDayString = exports.dayStringToDayNumber = exports.formatVenues = exports.parseResySeatingResponse = exports.formatNextSlotParams = exports.parseNextSlotResponse = exports.formatResyBookingRequest = exports.formatResyBookingResponse = exports.formatUserResponse = exports.cleanResyReservationDays = exports.formatParams = exports.formatResyTokenRequest = exports.formatHeader = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// types
var diner_utilities_1 = require("diner-utilities");
var lodash_1 = __importDefault(require("lodash"));
var flatten = lodash_1.default.flatten, keys = lodash_1.default.keys, times = lodash_1.default.times;
var dayjs_1 = __importDefault(require("dayjs"));
var advancedFormat_1 = __importDefault(require("dayjs/plugin/advancedFormat"));
dayjs_1.default.extend(advancedFormat_1.default);
// Header required for resy api
// eslint-disable-next-line max-len
var formatHeader = function (authToken, contentType) {
    var APIKEY = 'ResyAPI api_key="AIcdK2rLXG6TYwJseSbmrBAy3RP81ocd"';
    if (!APIKEY) {
        throw new Error('RESY_API_KEY is not set');
    }
    var header = {
        'Authorization': APIKEY,
        'Content-Type': contentType,
        'accept': 'application/json, text/plain, */*',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'x-resy-auth-token': authToken,
        'x-resy-universal-auth': authToken
    };
    return header;
};
exports.formatHeader = formatHeader;
// formatDetails for Resy API
var formatResyTokenRequest = function (request) {
    return __assign(__assign({}, request), { commit: 1 });
};
exports.formatResyTokenRequest = formatResyTokenRequest;
/**
 * @description - formats the request for the Resy API
 */
function formatParams(request) {
    var day = request.day, partySize = request.partySize, venue = request.venue;
    var params = {
        day: (0, dayjs_1.default)(day).format('YYYY-MM-DD'),
        lat: 0,
        long: 0,
        party_size: partySize,
        // @ts-ignore
        venue_id: venue.id
    };
    return params;
}
exports.formatParams = formatParams;
var cleanResyReservationDays = function (data) {
    var flat = flatten(data);
    var clean = {};
    flat.forEach(function (venue) {
        Object.keys(venue.slots).forEach(function (day) {
            clean[day] = [];
        });
    });
    flat.forEach(function (venue) {
        var day = keys(venue.slots)[0];
        if (day) {
            var slug = {
                slots: venue.slots[day],
                venueId: venue.venueId,
                venueName: venue.venueName
            };
            clean[day].push(slug);
        }
    });
    return clean;
};
exports.cleanResyReservationDays = cleanResyReservationDays;
// format the user response
function formatUserResponse(res) {
    var data = res.data;
    return {
        configId: data.token,
        email: data.em_address,
        firstName: data.first_name,
        lastName: data.last_name,
        paymentMethodId: data.payment_method_id,
        phone: data.mobile_number,
        resyId: data.id,
        updatedOn: Date.now()
    };
}
exports.formatUserResponse = formatUserResponse;
// eslint-disable-next-line max-len
var formatResyBookingResponse = function (res) {
    var data = res.data;
    if (!data) {
        throw new Error('No data returned from Resy API');
    }
    return __assign({ bookToken: data.book_token.value, bookTokenExpiration: data.book_token.date_expires, cancelationCutoff: data.cancellation.refund.date_cut_off, cancelationFee: data.cancellation.display.fee, cancelationNotice: data.cancellation.display.policy }, data);
};
exports.formatResyBookingResponse = formatResyBookingResponse;
// eslint-disable-next-line max-len
var formatSlots = function (slots, startTime, endTime, venue, partySize) {
    var hits = slots.map(function (slot) {
        return {
            bookingData: {
                bookingSiteId: slot.config.id,
                bookingSite: diner_utilities_1.Types.BookingSite.RESY,
                bookingToken: slot.config.token,
                dateTime: new Date(slot.date.start),
                config_id: slot.config.token,
            },
            endTime: slot.date.end,
            partySize: partySize,
            partySizeMax: slot.size.max,
            partySizeMin: slot.size.min,
            dateTime: slot.date.start,
            startTime: slot.date.start,
            tableType: slot.config.type,
            title: (0, exports.formatMilToUS)(slot.date.start),
            venue: venue
        };
    });
    if (startTime && endTime && hits.length > 0) {
        hits = hits.filter(function (slot) {
            try {
                var slotTime = new Date(slot.startTime.split(' ').join('T'));
                var normalTime = new Date(slotTime);
                normalTime.setHours(normalTime.getHours() + 4);
                var start = new Date(startTime);
                var end = new Date(endTime);
                return normalTime >= start && normalTime <= end;
            }
            catch (err) {
                console.log(err);
                return false;
            }
        });
    }
    return hits;
};
// eslint-disable-next-line max-len
var formatResyBookingRequest = function (bookingToken, paymentId) {
    return {
        book_token: bookingToken,
        source_id: 'resy.com-venue-details',
        struct_payment_method: JSON.stringify({ id: paymentId || null })
    };
};
exports.formatResyBookingRequest = formatResyBookingRequest;
/**
 * @example
 * parseNextSlotResponse( resyResp ) => {
 *  nextAvailibleSlot: '2020-01-01T12:00:00.000Z',
 *  lastCalenderDay: '2020-01-01T12:00:00.000Z',
 *  parsedSlots: [ { startTime: '2020-01-01T12:00:00.000Z', endTime: '2020-01-01T12:00:00.000Z' } ]
 * }
 * @description - formats the response from the Resy API
 * @param {AxiosResponse} res - the response from the Resy API
 * @returns {SeatingResponse} - the formatted response
 * */
var parseNextSlotResponse = function (response, venueName) {
    var data = response.data;
    var availableSlots = data.scheduled
        // @ts-ignore
        .filter(function (slot) {
        return slot.inventory.reservation === 'available';
    });
    // @ts-ignore
    var parsedSlots = availableSlots.map(function (slot) {
        // log(slot,'data','slot');
        if (slot.inventory.reservation === 'available') {
            return slot.date;
        }
        else {
            return null;
        }
    });
    return {
        venueName: venueName,
        nextAvailableSlot: parsedSlots[0] || null,
        lastCalendarDay: data.last_calendar_day,
        parsedSlots: parsedSlots
    };
};
exports.parseNextSlotResponse = parseNextSlotResponse;
/**
 * @example
 * parseResyReservationResponse( resyResp ) => {
 *  venueId: '123',
 *  partySize: 2,
 *  day: '2022-01-01'
 * }) => {
 *  venue_id: '123',
 *  num_seats: 2,
 *  start_date: '2022-01-01',
 *  end_date: '2022-02-01'
 * }
 * @param venueId
 * @param partySize
 * @param day
 * @returns
 */
var formatNextSlotParams = function (venueId, partySize, day) {
    var endDate = (0, exports.oneMonthFromNow)(day);
    return {
        venue_id: venueId,
        num_seats: partySize,
        start_date: day,
        end_date: endDate
    };
};
exports.formatNextSlotParams = formatNextSlotParams;
/**
 * @description Formats the reservation search response from Resy and
 * filters out the seatings that are not in the specified time range
 * for a specific day.
 * @example
 * formatVenueSearchResponse( res, '10:00', '11:00' )
 * returns {
      venueId: 1234,
      venueName: 'Pizza Hut',
      availibleSlots: 12,
      seatings: [{
        title: "7:00 pm",
        tableType: "Outdoor",
        startTime: "19:00",
        endTime: "21:00",
        partySizeMin: "2",
        partySizeMax: "4",
        id: "XXXXXXX",
        bookingToken: "XXXXXXXX"
      }]
    };
 *
 */
function parseResySeatingResponse(res, startTime, endTime, venue, partySize) {
    var _a, _b;
    var data = res.data;
    if (((_b = (_a = data === null || data === void 0 ? void 0 : data.results) === null || _a === void 0 ? void 0 : _a.venues) === null || _b === void 0 ? void 0 : _b.length) > 0) {
        var slots = formatSlots(data.results.venues[0].slots, startTime, endTime, venue, partySize);
        return {
            bookingSiteId: data.results.venues[0].venue.id.resy,
            venueName: data.results.venues[0].venue.name,
            bookingSite: diner_utilities_1.Types.BookingSite.RESY,
            availibleSlots: slots.length,
            slots: slots,
        };
    }
    else {
        return {
            availibleSlots: 0,
            slots: [],
            bookingSite: diner_utilities_1.Types.BookingSite.RESY,
            bookingSiteId: '',
            venueName: ''
        };
    }
}
exports.parseResySeatingResponse = parseResySeatingResponse;
function formatVenues(response) {
    var _a, _b;
    var slug = { count: 0, hits: [], message: 'no results' };
    try {
        if (!response) {
            return slug;
        }
        // Remove junk from the response like cusine types and other stuff
        var venues = (_b = (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.search) === null || _b === void 0 ? void 0 : _b.hits;
        return {
            count: venues.length,
            venues: venues.map(function (venue) {
                return {
                    id: venue.id.resy,
                    name: venue.name,
                    slug: venue.url_slug,
                    locality: venue.locality,
                    region: venue.region,
                    neighborhood: venue.neighborhood,
                    data: venue
                };
            })
        };
    }
    catch (e) {
        console.error('Error in formatVenues', e);
        throw e;
    }
}
exports.formatVenues = formatVenues;
var dayNumber = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6
};
var dayStringToDayNumber = function (dayString) {
    return dayNumber[dayString.toLowerCase()];
};
exports.dayStringToDayNumber = dayStringToDayNumber;
var dateToDayString = function (date) {
    var firstDayDate = date.getDate() < 10 ? "0".concat(date.getDate()) : date.getDate();
    var firstDayMonth = "".concat(date.getMonth() + 1);
    var firstDayYear = date.getFullYear();
    return "".concat(firstDayYear, "-").concat(firstDayMonth, "-").concat(firstDayDate);
};
exports.dateToDayString = dateToDayString;
var dayNumberToDayString = function (dayNum) {
    // lookup the day number in the dayNumber object and return the key
    // @ts-ignore
    var day = keys(dayNumber).find(function (key) { return dayNumber[key] === dayNum; });
    if (day) {
        var dayString = day.charAt(0).toUpperCase() + day.slice(1);
        return dayString;
    }
    else {
        return '';
    }
};
exports.dayNumberToDayString = dayNumberToDayString;
/**
 * @example
 * dayStrArrToDayNum([ 'Monday', 'Tuesday' ]) => [ 1, 2 ];
 * @description
 * Takes an array of day strings and returns an array of day numbers
 * that can be used by DateTime
 * @param dayStrArr - ['Monday', 'Tuesday', 'Wednesday']
 * @returns Monday, August the 8th, 2022
 */
var dayStrArrToDayNum = function (dayStrArr) {
    return dayStrArr.map(exports.dayStringToDayNumber);
};
exports.dayStrArrToDayNum = dayStrArrToDayNum;
/**
 * @example
 * numStrArryToDayStr([0,1]) => [ 'Monday', 'Tuesday' ];
 * @description
 * Takes an array of day numbers and returns an array of day strings
 * that can be used by DayPicker
 * @param dayNumArr - [0,1,2]
 * @returns Monday, August the 8th, 2022
 */
var numStrArryToDayStr = function (dayNumArr) {
    return dayNumArr.map(exports.dayNumberToDayString);
};
exports.numStrArryToDayStr = numStrArryToDayStr;
/**
 * @param startDate - 2022-08-10
 * @returns Monday, August the 8th, 2022
 */
var prettyDate = function (startDate) {
    return (0, dayjs_1.default)(startDate).format('dddd [the] Do, YYYY');
};
exports.prettyDate = prettyDate;
/**
 * Builds an array of formatted date strings for a given range of days.
 * Example: ['2020-01-01', '2020-01-02']
 * @param start "2020-01-01"
 * @param end "2020-01-02"
 * @returns Array of times between start and end in the format YYYY-MM-DD
 */
var dateDiffArray = function (start, end, weekDays) {
    var startDate = (0, dayjs_1.default)(start);
    var endDate = (0, dayjs_1.default)(end);
    var numDays = endDate.diff(startDate, 'day');
    var days = [start];
    times(numDays, function (day) {
        if (weekDays) {
            var dayOfWeek = startDate.add(day, 'day').day();
            if (weekDays.includes(dayOfWeek)) {
                days.push(startDate.add(day, 'day').format('YYYY-MM-DD'));
            }
        }
        else {
            days.push(startDate.add(day + 1, 'day').format('YYYY-MM-DD'));
        }
    });
    return days;
};
exports.dateDiffArray = dateDiffArray;
/**
 * @example
 * delay( 1000 ) => Promise
 * @description
 * Returns a promise that resolves after a specified number of milliseconds
 * used to delay the execution of external API calls
 */
var delay = function (milDelay) {
    milDelay = milDelay || 2000;
    return new Promise(function (done) {
        setTimeout(function () {
            done();
        }, milDelay);
    });
};
exports.delay = delay;
/**
 * Formats the start time to something that is more presentable.
 * @example "19:30" => "7:30 pm"
 */
var formatMilToUS = function (day) {
    var date = new Date(day);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours || 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
};
exports.formatMilToUS = formatMilToUS;
var xDaysInFuture = function (days) {
    var date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};
exports.xDaysInFuture = xDaysInFuture;
var formatUSToMil = function (time) {
    return (0, dayjs_1.default)(time).format('YYYY-DD-DD HH:mm:ss');
};
exports.formatUSToMil = formatUSToMil;
// See if time is with in the specified time range
// returns true if time is within the range
// eslint-disable-next-line max-len
function withinTimeSlot(day, startTime, endTime) {
    var start = new Date(day);
    var startHours = startTime.split(':')[0];
    var startMinutes = startTime.split(':')[1];
    start.setHours(parseInt(startHours));
    start.setMinutes(parseInt(startMinutes));
    var end = new Date(day);
    var endHours = endTime.split(':')[0];
    var endMinutes = endTime.split(':')[1];
    end.setHours(parseInt(endHours));
    end.setMinutes(parseInt(endMinutes));
    var timeToCheck = new Date(day);
    if (timeToCheck >= start && timeToCheck <= end) {
        return true;
    }
    else {
        return false;
    }
}
exports.withinTimeSlot = withinTimeSlot;
// give a date one month from now
// 2022-05-29 -> 2022-06-29
var oneMonthFromNow = function (day) {
    var date = new Date(day);
    var month = date.getMonth();
    if (month === 11) {
        date.setMonth(0);
        date.setFullYear(date.getFullYear() + 1);
    }
    else {
        date.setMonth(month + 1);
    }
    return date.toISOString().slice(0, 10);
};
exports.oneMonthFromNow = oneMonthFromNow;
/**
 * @description Gives you all future days of a weekday
 * @param day
 * @param numOfWeeks
 */
var getDayDates = function (day, numOfWeeks) {
    var dates = [];
    var today = new Date();
    // find the date that is X weeks from now
    var futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + (7 * numOfWeeks));
    while (today < futureDate) {
        if (today.getDay() === day) {
            dates.push(new Date(today));
        }
        today.setDate(today.getDate() + 1);
    }
    return dates;
};
exports.getDayDates = getDayDates;
