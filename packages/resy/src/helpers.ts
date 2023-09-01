/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// types
import { Types } from 'diner-utilities';
import pkg from 'lodash';
const { flatten, keys, times } = pkg;
import { AxiosResponse } from 'axios';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
dayjs.extend(advancedFormat);

// Header required for resy api
// eslint-disable-next-line max-len
export const formatHeader = (authToken:string, contentType: Types.ContentType) => {
    const APIKEY = 'ResyAPI api_key="AIcdK2rLXG6TYwJseSbmrBAy3RP81ocd"';
    if (!APIKEY) { throw new Error('RESY_API_KEY is not set'); }
    const header:Types.ResyHeaderConfig = {
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

// formatDetails for Resy API
export const formatResyTokenRequest = (request:Types.ResyBookingRequest) => {
    return { ...request, commit: 1 };
};

/**
 * @description - formats the request for the Resy API
 */
export function formatParams (request: Types.SeatingQuery) : Types.ResyReservationParams {
    const { day, partySize, venue } = request;
    const params = {
        day: dayjs(day).format('YYYY-MM-DD'),
        lat: 0, // required
        long: 0, // required
        party_size: partySize,
        // @ts-ignore
        venue_id: venue.id
    };
    return params;
}

export const cleanResyReservationDays = (data:any) => {
    const flat = flatten(data);
    const clean:any = {};
    flat.forEach((venue:any) => {
        Object.keys(venue.slots).forEach((day) => {
            clean[day] = [ ];
        });
    }
    );
    flat.forEach((venue:any) => {
        const day = keys(venue.slots)[0];
        if (day) {
            const slug = {
                slots: venue.slots[day],
                venueId: venue.venueId,
                venueName: venue.venueName
            };
            clean[day].push(slug);
        }
    });
    return clean;
};

// format the user response
export function formatUserResponse (res:AxiosResponse) :Types.ResyUser {
    const data = res.data;
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

// eslint-disable-next-line max-len
export const formatResyBookingResponse = (res:AxiosResponse) :Types.ResyBookingRequestResponse => {
    const { data } = res;

    if (!data) { throw new Error('No data returned from Resy API'); }
    return {
        bookToken: data.book_token.value,
        bookTokenExpiration: data.book_token.date_expires,
        cancelationCutoff: data.cancellation.refund.date_cut_off,
        cancelationFee: data.cancellation.display.fee,
        cancelationNotice: data.cancellation.display.policy,
        ...data
    };
};

// eslint-disable-next-line max-len
const formatSlots = (slots: any[], startTime:string, endTime:string, venue:any, partySize:number) : Types.Seating[] => {
    let hits: Types.Seating[] = slots.map((slot) => {
        return {
            bookingData: {
                bookingSiteId: slot.config.id,
                bookingSite: Types.BookingSite.RESY,
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
            title: formatMilToUS(slot.date.start),
            venue: venue
        };
    });

    if (startTime && endTime && hits.length > 0) {
        hits = hits.filter((slot) => {
            try {
                const slotTime = new Date(slot.startTime.split(' ').join('T'));
                const normalTime = new Date(slotTime);
                normalTime.setHours(normalTime.getHours() + 4);
                const start = new Date(startTime);
                const end = new Date(endTime);

                return normalTime >= start && normalTime <= end;
            } catch (err) {
                console.log(err);
                return false;
            }
        });
    }
    return hits;
};

// eslint-disable-next-line max-len
export const formatResyBookingRequest = (bookingToken:string, paymentId:string) => {
    return {
        book_token: bookingToken,
        source_id: 'resy.com-venue-details',
        struct_payment_method: JSON.stringify({ id: paymentId || null })
    };
};

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
export const parseNextSlotResponse = (
    response:AxiosResponse, venueName:string
) => {
    const data = response.data;

    const availableSlots = data.scheduled

    // @ts-ignore
        .filter(slot => {
            return slot.inventory.reservation === 'available';
        });

    // @ts-ignore
    const parsedSlots = availableSlots.map((slot) => {
    // log(slot,'data','slot');
        if (slot.inventory.reservation === 'available') {
            return slot.date;
        } else {
            return null;
        }
    });

    return {
        venueName,
        nextAvailableSlot: parsedSlots[0] || null,
        lastCalendarDay: data.last_calendar_day,
        parsedSlots
    };
};

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
export const formatNextSlotParams = (
    venueId:string | number, partySize:string | number, day:string
) => {
    const endDate = oneMonthFromNow(day);
    return {
        venue_id: venueId,
        num_seats: partySize,
        start_date: day,
        end_date: endDate
    };
};

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
export function parseResySeatingResponse (
    res:AxiosResponse,
    startTime:string,
    endTime:string,
    venue:any,
    partySize:number
) : Types.SeatingResponse {
    const data = res.data;
    if (data?.results?.venues?.length > 0) {
        const slots = formatSlots(
            data.results.venues[0].slots,
            startTime,
            endTime,
            venue,
            partySize
        );
        return {
            bookingSiteId: data.results.venues[0].venue.id.resy,
            venueName: data.results.venues[0].venue.name,
            bookingSite: Types.BookingSite.RESY,
            availibleSlots: slots.length,
            slots: slots,
        };
    } else {
        return {
            availibleSlots: 0,
            slots: [],
            bookingSite: Types.BookingSite.RESY,
            bookingSiteId: '',
            venueName: ''
        };
    }
}

export function formatVenues (response:AxiosResponse | null) {
    const slug:any = { count: 0, hits: [], message: 'no results' };

    try {
        if (!response) {
            return slug;
        }

        // Remove junk from the response like cusine types and other stuff
        const venues = response?.data?.search?.hits;
        return {
            count: venues.length,
            venues: venues.map((venue:any) => {
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
    } catch (e) {
        console.error('Error in formatVenues', e);
        throw e;
    }
}

const dayNumber = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6
} as Record<string, number>;

export const dayStringToDayNumber = function (dayString:string):number {
    return dayNumber[ dayString.toLowerCase() ];
};

export const dateToDayString = function (date:Date) {
    const firstDayDate = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    const firstDayMonth = `${date.getMonth() + 1}`;
    const firstDayYear = date.getFullYear();
    return `${firstDayYear}-${firstDayMonth}-${firstDayDate}`;
};

export const dayNumberToDayString = function (dayNum:number):string {
    // lookup the day number in the dayNumber object and return the key
    // @ts-ignore
    const day = keys(dayNumber).find(key => dayNumber[ key ] === dayNum);
    if (day) {
        const dayString = day.charAt(0).toUpperCase() + day.slice(1);
        return dayString;
    } else {
        return '';
    }
};

/**
 * @example
 * dayStrArrToDayNum([ 'Monday', 'Tuesday' ]) => [ 1, 2 ];
 * @description
 * Takes an array of day strings and returns an array of day numbers
 * that can be used by DateTime
 * @param dayStrArr - ['Monday', 'Tuesday', 'Wednesday']
 * @returns Monday, August the 8th, 2022
 */
export const dayStrArrToDayNum = function (dayStrArr:string[]):number[] {
    return dayStrArr.map(dayStringToDayNumber);
};

/**
 * @example
 * numStrArryToDayStr([0,1]) => [ 'Monday', 'Tuesday' ];
 * @description
 * Takes an array of day numbers and returns an array of day strings
 * that can be used by DayPicker
 * @param dayNumArr - [0,1,2]
 * @returns Monday, August the 8th, 2022
 */
export const numStrArryToDayStr = function (dayNumArr:number[]):string[] {
    return dayNumArr.map(dayNumberToDayString);
};

/**
 * @param startDate - 2022-08-10
 * @returns Monday, August the 8th, 2022
 */
export const prettyDate = function (startDate:string) {
    return dayjs(startDate).format('dddd [the] Do, YYYY');
};

/**
 * Builds an array of formatted date strings for a given range of days.
 * Example: ['2020-01-01', '2020-01-02']
 * @param start "2020-01-01"
 * @param end "2020-01-02"
 * @returns Array of times between start and end in the format YYYY-MM-DD
 */
export const dateDiffArray = (

    start:string, end:string, weekDays?:number[]
) :string[] => {
    const startDate = dayjs(start);
    const endDate = dayjs(end);
    const numDays = endDate.diff(startDate, 'day');

    const days = [ start ];
    times(numDays, (day:number) => {
        if  (weekDays) {
            const dayOfWeek = startDate.add(day, 'day').day();
            if (weekDays.includes(dayOfWeek)) {
                days.push(startDate.add(day, 'day').format('YYYY-MM-DD'));
            }
        } else {
            days.push(startDate.add(day + 1, 'day').format('YYYY-MM-DD'));
        }
    });
    return days;
};

/**
 * @example
 * delay( 1000 ) => Promise
 * @description
 * Returns a promise that resolves after a specified number of milliseconds
 * used to delay the execution of external API calls
 */
export const delay = (milDelay:number):Promise<void> => {
    milDelay = milDelay || 2000;
    return new Promise(done => {
        setTimeout(() => {
            done();
        }, milDelay);
    });
};

/**
 * Formats the start time to something that is more presentable.
 * @example "19:30" => "7:30 pm"
 */
export const formatMilToUS = (day:string) : string => {
    const date = new Date(day);
    let hours = date.getHours();
    let minutes: string | number = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours || 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const strTime = hours + ':' + minutes + ' ' + ampm;

    return strTime;
};

export const xDaysInFuture = (days:number) : Date => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};

export const formatUSToMil = (time:string) : string => {
    return dayjs(time).format('YYYY-DD-DD HH:mm:ss');
};

// See if time is with in the specified time range
// returns true if time is within the range
// eslint-disable-next-line max-len
export function withinTimeSlot (day:string, startTime:string, endTime:string) : boolean {
    const start = new Date(day);
    const startHours = startTime.split(':')[0];
    const startMinutes = startTime.split(':')[1];
    start.setHours(parseInt(startHours));
    start.setMinutes(parseInt(startMinutes));

    const end = new Date(day);
    const endHours = endTime.split(':')[0];
    const endMinutes = endTime.split(':')[1];
    end.setHours(parseInt(endHours));
    end.setMinutes(parseInt(endMinutes));

    const timeToCheck = new Date(day);

    if (timeToCheck >= start && timeToCheck <= end) {
        return true;
    } else {
        return false;
    }
}

// give a date one month from now
// 2022-05-29 -> 2022-06-29
export const oneMonthFromNow = (day:string) : string => {
    const date:Date = new Date(day);
    const month:number = date.getMonth();
    if (month === 11) {
        date.setMonth(0);
        date.setFullYear(date.getFullYear() + 1);
    } else {
        date.setMonth(month + 1);
    }

    return date.toISOString().slice(0, 10);
};

/**
 * @description Gives you all future days of a weekday
 * @param day
 * @param numOfWeeks
 */
export const getDayDates = (day:number, numOfWeeks:number) : Date[] => {
    const dates:Date[] = [];
    const today = new Date();

    // find the date that is X weeks from now
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + (7 * numOfWeeks));

    while (today < futureDate) {
        if (today.getDay() === day) {
            dates.push(new Date(today));
        }
        today.setDate(today.getDate() + 1);
    }
    return dates;
};