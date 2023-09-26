export interface EmailMSG {
  to: string;
  from: string;
  subject: string;
  body: string;
  html?: string;
}

export interface Watcher extends SeatingQuery {
  id: string;
  tries: number;
  jobId: string;
  failed: number;
  user: User;
}

export interface SeatingQuery {
  venue: Restaurant;
  partySize: number;
  startTime: string;
  endTime: string;
  day: Date;
  user: User;
}

export interface WatcherMessage {
  id: string;
  message: Watcher;
  delay: number;
}

export interface ConfirmBookingRequest {
  book_token: string;
  user: User;
}

export interface ConfirmBookingResponse {
  reservation_id: string;
}

export interface WatcherOptions {
  clear?: boolean;
}

export interface ResyLoginResponse {
  resyToken: string;
  resyRefreshToken: string;
  resyGuestId: string;
  resyId: string;
  resyPaymentMethodId: string;
  resyLegacyToken: string;
  resyEmail: string;
}

export interface ResyUserConfig {
  resyEmail?: string;
  resyToken?: string;
  resyApiKey?: string;
  resyPaymentMethodId?: string;
}

export interface ProxyConfig {
  username: string;
  password: string;
  host: string;
  port: number;
}

export interface watchCliConfig {
  clear?: boolean;
  list?: boolean;
  exit?: boolean;
  add?: boolean;
  delete?: boolean;
}

export type User = {
  id: string;
  resyId?: string;
  resyEmail?: string;
  resyPassword?: string;
  resyGuestId?: string;
  resyPaymentMethodId?: string;
  resyLegacyToken?: string;
  resyToken?: string;
  password: string;
  email: string;
  phoneNumber: string;
}
export interface Restaurant {
  name: string;
  id: string;
  city: string;
  slug: string;
  url: string;
}

export interface Options {
  debug?: boolean;
  single?: boolean;
  screenshots?: boolean;
  timeout?: number;
}

export interface Slot {
  id: string;
  time: string;
  type: string;
}

export type SearchConfig = {
  resyToken: string
  query: string
  openTableToken: string,
  lat: number | string,
  lng: number | string
}

export type VenueSeatingRequest = {
  venueId: string;
  site: string;
  name: string;
};

export interface SeatingResponse {
  bookingSiteId: string;
  venueName: string;
  bookingSite: string;
  availibleSlots: number;
  slots: Seating[];
}

export type BookingRequest = {
  party_size: number;
  day: string;
  config_id: string;
  commit?: number;
  user: User;
}


export interface Seating {
  readonly title: string;
  readonly endTime: string | null;
  readonly startTime: string;
  readonly dateTime: string;
  readonly tableType: string;
  readonly partySize: number;
  readonly partySizeMin: string | number;
  readonly partySizeMax: string | number;
  venue: VenueSeatingRequest;
  bookingData: {
    bookingSiteId: string;
    bookingSite: string;
    bookingToken: BookingSite;
    otSlotHash?: string;
    config_id: string;
  }
}

export interface BaseReservationQuery {
  readonly partySize: number | string;
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly startTime: Date;
  readonly endTime: Date;
}

export interface ReservationQuery extends BaseReservationQuery {
    venues?: VenueSeatingRequest[];
}

export interface SingleResQry extends BaseReservationQuery {
  venue: VenueSeatingRequest;
  user?: User;
  day: Date;
}

export interface MultiDayResQry extends BaseReservationQuery {
  venue: VenueSeatingRequest;
  days: string[];
}

// Internal interface that is used to format
// a request for a time slot from the Resy API
export interface ResyReservationQuery {
  readonly resyToken: string;
}

export type ResyHeaderConfig = {
  Authorization: string,
  'Content-Type': ContentType,
  accept: string,

  // referer: string,
  // authority: string,
  // origin: string,
  'accept-encoding': string,

  // 'x-origin': string
  'accept-language': string
  'x-resy-auth-token': string
  'x-resy-universal-auth': string
};

export interface ResySearchConfig {
  resyToken:string,
  query:string,
  lat:number | string,
  lng:number | string,
}

export interface ResyReservationParams {
  day: string;
  party_size: number | string;
  venue_id: string;
  lat: number | string;
  long: number | string;
}

export interface ResyBookingRequest {
  readonly party_size: string | number;
  readonly day: string;
  readonly config_id: string;
}

export interface ResyUser {
    email: string
    firstName: string
    lastName: string
    resyId: string
    paymentMethodId: string
    phone: string
    configId: string
    updatedOn?: number
}

export interface ResyBookingRequestResponse {
  cancelationFee: string
  cancelationCutoff: string
  cancelationNotice: string
  bookToken: string
  bookTokenExpiration: string
}

// object coming back from Resy api
export interface ResyAPISlot {
  title: string
  config: {
    type: string
    token: string
    id: string
  }
  date: {
    day: string
    start: string
    end: string
  }
  size: {
    min: number | string
    max: number | string
  }
}

/* eslint-disable no-unused-vars */
// Internal interface that is used to format
// a request for a time slot from the Resy API

export enum ContentType {
  FORM = 'multipart/form-data',
  WWW = 'application/x-www-form-urlencoded',
  JSON = 'application/json'
}

export interface DropDownOption {
  name: string;
  value: string;
}

export interface ISubmitResult {
  success: boolean;
  message: string;
}

export enum StatusType {
  SUCCESS = 'success',
  ERROR = 'error',
  PARTIAL = 'partial success'
}
export enum StatusCode {
  SUCCESS = 200,
  ERROR = 500,
  PARTIAL = 204
}

export interface Venue {
  bookingUrl: string;
  address: unknown;
  cuisine: string[]
  description: unknown;
  googlePlaceData: Record<string, unknown> | null
  googlePlaceId: string | null
  id: string | number
  infatuationData: Record<string, unknown> | null
  lat: string
  lng: string
  location: string
  michelinData: Record<string, unknown> | null
  name: string
  neighborhood: string
  phone_number: string | null
  phone: unknown;
  city: string
  region: string
  locality: string
  site: string
  siteId: string
  slug: unknown;
  thumbnails: [string] | null
  urlSlug: string | null
  venueType: unknown;
  website: unknown;
}

export interface VenueSearchResponse {
  hits: Venue[] | []
  count: number
  message: string | null
}

export type dayType =`${string}-${string}-${string}`

export enum BookingSite {
  RESY = 'resy',
  OPEN_TABLE = 'opentable'
}

