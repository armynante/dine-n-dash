import axios, { AxiosProxyConfig } from 'axios';
import FormData from 'form-data';
import { formatHeader, formatParams, formatResyBookingResponse, formatVenues, parseResySeatingResponse } from './helpers.js';
const RESY_SEARCH_URL='https://api.resy.com/3/venuesearch/search';
const RESY_BOOKING_URL='https://api.resy.com/3/book';
const RESY_REQUEST_BOOKING_URL='https://api.resy.com/3/details';
import { Types } from 'diner-utilities';

export class ResyService {
    private agent: AxiosProxyConfig;
    private apiKey: string;

    constructor(proxyAgent:AxiosProxyConfig, resyApiKey: string) {
        if (!resyApiKey) {
            throw new Error('Missing resyApiKey variable');
        }
        this.agent = proxyAgent;
        this.apiKey = 'ResyAPI api_key="AIcdK2rLXG6TYwJseSbmrBAy3RP81ocd"';
    }


    checkUserTokens(userConfig:Types.User, keys: string[]): void {
        const configKeys = Object.keys(userConfig);

        const missingKeys = keys.filter((key:string) => {
            return !configKeys.includes(key);
        });
  
        if (missingKeys.length) {
            throw new Error(`Missing keys: ${missingKeys.join(', ')}`);
        }
    }

    async login(email: string, password: string) : Promise<Types.ResyLoginResponse> {
        const data = `email=${email}&password=${password}`;
  
        const config = {
            method: 'post',
            url: 'https://api.resy.com/3/auth/password',
            headers: {
                'host': 'api.resy.com',
                'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
                'accept': '*/*',
                'connection': 'keep-alive',
                'user-agent': 'Resy/2.42 (com.resy.ResyApp; build:2652; iOS 15.5.0) Alamofire/5.6.1',
                'accept-language': 'en-US;q=1.0',
                'authorization': this.apiKey,
                'accept-encoding': 'br;q=1.0, gzip;q=0.9, deflate;q=0.8',
            },
            data: data,
            proxy: this.agent,
        };
  
        const { data:resyResponse } = await axios(config);

        if (!resyResponse.token) {
            throw new Error('No Resy token found');
        }
  
        return {
            resyToken: resyResponse.token.toString(),
            resyRefreshToken: resyResponse.refresh_token.toString(),
            resyGuestId: resyResponse.guest_id.toString(),
            resyId: resyResponse.id.toString(),
            resyPaymentMethodId: resyResponse.payment_method_id.toString(),
            resyLegacyToken: resyResponse.legacy_token.toString(),
            resyEmail: email,
        };
    } 

    async seatings(query:Types.SeatingQuery) {
        const reservationUrl = 'https://api.resy.com/4/find';
        const { startTime, endTime, venue, partySize, user } = query;

        this.checkUserTokens(user,['resyToken','resyEmail']);

        const headers = formatHeader(user.resyToken!, Types.ContentType.JSON);
        const params = formatParams(query);
    
        const resyResponse = await axios.get(reservationUrl, { headers, params, proxy: this.agent});
  
        const slots = parseResySeatingResponse(
            resyResponse,
            startTime,
            endTime,
            venue,
            partySize as number
        );

        return slots;
    }

    async searchVenues(user:Types.User, venueName:string) {
        console.info('Searching for venue', venueName);
    
        this.checkUserTokens(user,['resyToken','resyEmail']);

        const querySlug = {
            'query': venueName,
            'geo': {
                'longitude':  -73.985428,
                'latitude': 40.748817,
            }
        };
        try {
            const headers = formatHeader(user.resyToken!, Types.ContentType.JSON);
            console.log(headers);
            const response = await axios.post(RESY_SEARCH_URL, querySlug, { headers, proxy: this.agent });
            console.log(response.headers);
            const venuesFormated = formatVenues(response);
            return venuesFormated;
        } catch (error) {
            console.error('Error in searchResyVenues!!!', error);
            throw new Error('Error in searchResyVenues');
        }
    }

    async requestBooking(bookingRequest: Types.BookingRequest) {

        this.checkUserTokens(bookingRequest.user,['resyToken']);

        // remove the user from the booking request
        const { config_id, party_size, day} = bookingRequest;
        const request = { config_id, party_size, day };

        bookingRequest.commit = 1;
        const headers = formatHeader(bookingRequest.user.resyToken!, Types.ContentType.JSON);
        const response = await axios.post(RESY_REQUEST_BOOKING_URL!, request, { headers, proxy: this.agent });
        const booking = formatResyBookingResponse(response);
        return booking;
    }

    async confirmBooking(confirmBookingRequest:Types.ConfirmBookingRequest) {
        const { book_token, user } = confirmBookingRequest;

        this.checkUserTokens(user,['resyToken','resyPaymentMethodId']);

        const headers = formatHeader(user.resyToken!, Types.ContentType.FORM);
        const data = new FormData();
        data.append('book_token', book_token);
        data.append('struct_payment_method', `{"id":${user.resyPaymentMethodId}}`);
        data.append('source_id', 'resy.com-venue-details');
        const bookingResp = axios({
            method: 'post',
            url: RESY_BOOKING_URL,
            headers: headers,
            proxy: this.agent,
            data
        });
        return bookingResp;
    }
}