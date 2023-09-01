import { Types } from 'diner-utilities';
import { AxiosResponse } from 'axios';
import { ResyBookingRequestResponse, ResyReservationParams, SeatingQuery } from 'diner-utilities/types';
export declare const formatHeader: (authToken: string, contentType: Types.ContentType) => Types.ResyHeaderConfig;
export declare const formatResyTokenRequest: (request: Types.ResyBookingRequest) => {
    commit: number;
    party_size: string | number;
    day: string;
    config_id: string;
};
/**
 * @description - formats the request for the Resy API
 */
export declare function formatParams(request: SeatingQuery): ResyReservationParams;
export declare const cleanResyReservationDays: (data: any) => any;
export declare function formatUserResponse(res: AxiosResponse): Types.ResyUser;
export declare const formatResyBookingResponse: (res: AxiosResponse) => ResyBookingRequestResponse;
export declare const formatResyBookingRequest: (bookingToken: string, paymentId: string) => {
    book_token: string;
    source_id: string;
    struct_payment_method: string;
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
export declare const parseNextSlotResponse: (response: AxiosResponse, venueName: string) => {
    venueName: string;
    nextAvailableSlot: any;
    lastCalendarDay: any;
    parsedSlots: any;
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
export declare const formatNextSlotParams: (venueId: string | number, partySize: string | number, day: string) => {
    venue_id: string | number;
    num_seats: string | number;
    start_date: string;
    end_date: string;
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
export declare function parseResySeatingResponse(res: AxiosResponse, startTime: string, endTime: string, venue: any, partySize: number): Types.SeatingResponse;
export declare function formatVenues(response: AxiosResponse | null): any;
export declare const dayStringToDayNumber: (dayString: string) => number;
export declare const dateToDayString: (date: Date) => string;
export declare const dayNumberToDayString: (dayNum: number) => string;
/**
 * @example
 * dayStrArrToDayNum([ 'Monday', 'Tuesday' ]) => [ 1, 2 ];
 * @description
 * Takes an array of day strings and returns an array of day numbers
 * that can be used by DateTime
 * @param dayStrArr - ['Monday', 'Tuesday', 'Wednesday']
 * @returns Monday, August the 8th, 2022
 */
export declare const dayStrArrToDayNum: (dayStrArr: string[]) => number[];
/**
 * @example
 * numStrArryToDayStr([0,1]) => [ 'Monday', 'Tuesday' ];
 * @description
 * Takes an array of day numbers and returns an array of day strings
 * that can be used by DayPicker
 * @param dayNumArr - [0,1,2]
 * @returns Monday, August the 8th, 2022
 */
export declare const numStrArryToDayStr: (dayNumArr: number[]) => string[];
/**
 * @param startDate - 2022-08-10
 * @returns Monday, August the 8th, 2022
 */
export declare const prettyDate: (startDate: string) => string;
/**
 * Builds an array of formatted date strings for a given range of days.
 * Example: ['2020-01-01', '2020-01-02']
 * @param start "2020-01-01"
 * @param end "2020-01-02"
 * @returns Array of times between start and end in the format YYYY-MM-DD
 */
export declare const dateDiffArray: (start: string, end: string, weekDays?: number[]) => string[];
/**
 * @example
 * delay( 1000 ) => Promise
 * @description
 * Returns a promise that resolves after a specified number of milliseconds
 * used to delay the execution of external API calls
 */
export declare const delay: (milDelay: number) => Promise<void>;
/**
 * Formats the start time to something that is more presentable.
 * @example "19:30" => "7:30 pm"
 */
export declare const formatMilToUS: (day: string) => string;
export declare const xDaysInFuture: (days: number) => Date;
export declare const formatUSToMil: (time: string) => string;
export declare function withinTimeSlot(day: string, startTime: string, endTime: string): boolean;
export declare const oneMonthFromNow: (day: string) => string;
/**
 * @description Gives you all future days of a weekday
 * @param day
 * @param numOfWeeks
 */
export declare const getDayDates: (day: number, numOfWeeks: number) => Date[];
