export interface SimpleResponseObject {
    status: boolean;
    msg?: string;
    data?: any | string;
}

export interface PingObject extends SimpleResponseObject {
    env?: string;
    ip?: string;
}

export interface SessionObject extends SimpleResponseObject {
    updated?: boolean;
    data?: Session;
}

export interface Session {
    session_token?: string;
    encryption_key?: string;
    configs: Config;
    country?: Country;
    countries?: Country[];
    bank: BankAccount;
    user: UserInfo;
}

export interface Config {
    allow_cancel_booking: string;
    allow_international: string;
    allow_multiple_countries: string;
    allow_multiple_languages: string;
    allow_payment: string;
    allow_reservation: string;
    booking_cancellation: string;
    google_api_key: string;
}

/*----USER INFO RESPONSE ------*/

export interface UserInfoObject extends SimpleResponseObject {
    data?: UserInfo;
}

export interface UsersObject extends SimpleResponseObject {
    data?: UserInfo[];
}

export interface UserInfo {
    id?: string;
    agent_id?: string;
    name?: string;
    email?: string;
    dial_code?: string;
    phone?: string;
    lang?: string;
    is_active?: boolean | number;
    is_admin?: boolean | number;
    is_agent?: boolean | number;
    is_partner?: boolean | number;
    partner_id?: string;
    partner_logo?: string;
    partner_name?: string;
    partner_active?: boolean | number;
    partner_verified?: boolean | number;
    account_id?: string;
    suspended?: string;
    verified?: string;
    country?: Country;
    permissions?: string[];
    allow_international?: boolean | number;
    allow_multi_countries?: boolean | number;
    bank_account?: BankAccount;
}

export interface BankAccount {
    account_id: number;
    account_name: string;
    account_number: string;
    bank_name: string;
    bank_code: string;
    swift_code: string;
    branch_name: string;
    branch_code: string;
}

export interface Country {
    country_img?: string;
    country_code?: string;
    country_name?: string;
    currency_code?: string;
    dial_code?: string;
    lat?: string;
    lng?: string;
    booking_fee?: string;
    is_active?: string;
    is_default?: string;
    tz_text?: string;
    tz_value?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
}

/*----BOOKING INFO RESPONSE ------*/

export interface BookingsInfoObject extends SimpleResponseObject {
    data?: BookingInfo[];
}

export interface BookingInfoObject extends SimpleResponseObject {
    data?: BookingInfo;
}
export interface BookingInfo {
    reference_code?: string;
    booking_id?: string;
    trip_id?: string;
    currency_code?: string;
    sub_total?: string;
    booking_fee?: string;
    total?: string;
    is_reserved?: string;
    status_id?: string;
    status: string;
    date_created?: string;
    booking_date?: string;
    booking_time?: string;
    user_email?: string;
    user_name?: string;
    user_phone?: string;
    trip?: TripInfo;
    tickets?: BookingTicketInfo[];
    qrcode_url?: string;
    seats: SeatsInfo[];
    payment_type: string;
}

/*----TRIP INFO RESPONSE ------*/

export interface TripsInfoObject extends SimpleResponseObject {
    data?: TripInfo[];
}

export interface TripInfoObject extends SimpleResponseObject {
    data?: TripInfo;
}

export interface TripInfo {
    trip_id?: string;
    status_id?: string;
    status: string;
    pickup_loc_id?: string;
    pickup_loc_name?: string;
    pickup_loc_address?: string;
    pickup_loc_lat?: string;
    pickup_loc_lng?: string;
    pickup_city_id?: string;
    pickup_city?: string;
    pickup_prov_name?: string;
    pickup_prov_code?: string;
    pickup_loc_type?: string;
    dropoff_loc_id?: string;
    dropoff_loc_name?: string;
    dropoff_loc_address?: string;
    dropoff_loc_lat?: string;
    dropoff_loc_lng?: string;
    dropoff_city_id?: string;
    dropoff_city?: string;
    dropoff_prov_name?: string;
    dropoff_prov_code?: string;
    dropoff_loc_type?: string;
    ticket_id?: string;
    price?: string;
    currency_code?: string;
    agent_id?: string;
    agent_name?: string;
    agent_email?: string;
    partner_id?: string;
    partner_name?: string;
    partner_logo?: string;
    verified?: string;
    bus_type_id?: string;
    bus_type?: string;
    bus_seats?: string;
    trip_date?: string;
    date?: string;
    time?: string;
    locked_seats?: string;
    booked_seats?: string;
    reserved_seats?: string;
    available_seats?: string;
    bus_id?: string;
    bus?: BusInfo;
    tickets?: TicketInfo[];
    trip_seats?: SeatsInfo[];
}

export interface SeatsInfo {
    trip_id: string;
    seat_id: string;
    status: string;
    booking_id?: string;
    temp_booking_id?: string;
    booking_status_id?: string;
    date_locked?: string;
    date_reserved?: string;
    date_created?: string;
}

/*----TICKET INFO RESPONSE ------*/

export interface TicketsInfoObject extends SimpleResponseObject {
    data?: TicketInfo[];
}

export interface TicketInfoObject extends SimpleResponseObject {
    data?: TicketInfo;
}

export interface TicketInfo {
    ticket_id?: string;
    type_id?: string;
    name?: string;
    currency_code?: string;
    price?: string;
    description?: string;
    allow_deactivate?: string | number | boolean | any;
    is_active?: string | number | boolean | any;
}

export interface BookingTicketInfo {
    qty?: number;
    ticket_id?: string;
    type_id?: string;
    name?: string;
    currency_code?: string;
    price?: string;
    amount?: string;
    description?: string;
}

/*----TICKET TYPES RESPONSE ------*/

export interface TicketTypesObject extends SimpleResponseObject {
    data?: TicketType[];
}

export interface TicketType {
    id?: string;
    name?: string;
    description?: string;
    is_default?: string
}

/*----BUS INFO RESPONSE ------*/

export interface BusesInfoObject extends SimpleResponseObject {
    data?: BusInfo[];
}

export interface BusInfoObject extends SimpleResponseObject {
    data?: BusInfo;
}

export interface BusInfo {
    id?: string;
    plate_num?: string;
    description?: string;
    seats?: string;
    type?: string;
    shared?: string;
    shared_partners?: BusSharedPartner[];
    type_id?: string;
    images?: BusImage[];
    available?: string;
}

export interface BusSharedPartner {
    bus_id?: string;
    partner_id?: string;
    title?: string;
}

export interface BusImage {
    id?: string;
    img?: string;
    show?: boolean;
}

/*----TRIP STATUS RESPONSE ------*/

export interface TripStatusObject extends SimpleResponseObject {
    data?: TripStatus[];
}

export interface TripStatus {
    status_id?: string;
    status?: string;
    type_id?: string;
}

/*----BUS TYPE RESPONSE ------*/

export interface BusTypeObject extends SimpleResponseObject {
    data?: BusType[];
}

export interface BusType {
    id?: string;
    name?: string;
    seats?: string;
}

/*----LOCATION REQUEST ------*/

export interface LocationRequest {
    name?: string;
    address?: string;
    city?: string;
    province?: string;
    country?: string;
    country_code?: string;
    lat?: string;
    lng?: string;
    type?: string;
}

/*----LOCATION RESPONSE ------*/

export interface LocationObject extends SimpleResponseObject {
    data?: LocationType[];
}

export interface Location {
    is_active?: boolean | number | string;
    loc_id?: number;
    loc_name?: string;
    loc_address?: string;
    lat?: number;
    lng?: number;
    type_id?: number;
    city_id?: number;
    city_name?: string;
    prov_code?: string;
    prov_name?: string;
    country_code?: string;
    country_name?: string;
}

/*----LOCATION TYPE RESPONSE ------*/

export interface LocationTypeObject extends SimpleResponseObject {
    data?: LocationType[];
}

export interface LocationType {
    id?: string;
    name?: string;
}

/*------PAYIN TRANSACTION RESPONSE*/
export interface PayInTransactionObject extends SimpleResponseObject {
    data?: PayInTransaction;
}

/*------PAYOUT TRANSACTION RESPONSE*/
export interface PayOutTransactionObject extends SimpleResponseObject {
    data?: PayOutTransaction;
}

/*------BANKS RESPONSE*/
export interface BanksObject extends SimpleResponseObject {
    data?: Bank[];
}

/*------DASHBOARD RESPONSE*/

export interface DashboardObject extends SimpleResponseObject {
    data?: Dashboard;
}

export interface Dashboard {
    alert: Alert;
    active_trips: TripInfo[];
    booking_months?: BookingMonth[];
    bookings?: Bookings;
    transactions?: {
        bookings: {
            currency_code: string;
            amount: number;
            amount_details: AmmoutDetails[];
        };
        payin: PayInTransaction;
        payout: PayOutTransaction;
    };
}

export interface Alert {
    status: boolean;
    type: string;
    title: string;
    desc: string;
    action: string;
}

export interface AmmoutDetails {
    title: string;
    currency_code: string;
    info: string;
    amount: number;
    amount_details: this[];
}

export interface PayInTransactionRequest {
    request_id: number;
    status_id: string;
    status_info: string;
    status: string;
    date_from: string;
    date_to: string;
    payment_reference: string;
    currency_code: string;
    amount: number;
    date_created: string;
    payment_url: string;
}

export interface PayInTransaction {
    currency_code: string;
    amount: number;
    amount_details: AmmoutDetails[];
    paid: number;
    overpaid: number;
    balance: number;
    from: string;
    to: string;
    last_day_to_action: string;
    action_required: boolean;
    requests: PayInTransactionRequest[];
    info: string;
    alert: string;
    payment_reference: string;
    payment_available: boolean;
}

export interface PayOutTransactionRequest {
    request_id: number;
    status_id: string;
    status: string;
    status_info: string;
    date_from: string;
    date_to: string;
    receiver_name: string;
    receiver_bank: string;
    receiver_bank_code: string;
    receiver_account_no: string;
    currency_code: string;
    amount: number;
    transfer_fee: number;
    date_created: string;
}

export interface PayOutTransaction {
    currency_code: string;
    amount: number;
    amount_details: AmmoutDetails[];
    paid: number;
    overpaid: number;
    balance: number;
    from: string;
    to: string;
    action_required: boolean;
    requests: PayOutTransactionRequest[];
    info: string;
    payment_methods: PaymentMethod[];
}

export interface PaymentMethod {
    method_id: string;
    method_name?: string;
    method_value?: string;
    country_code?: string;
    provider?: string;
    fees: number;
    fees_percent: number;
    transfer_fee: number;
    transfer_fee_percent?: number;
    transfer_minimum?: number;
    transfer_type?: string;
    use_payment?: number;
    is_default?: number;
    is_active?: number;
    use_transfer?: number;
}

export interface Bank {
    name: string;
    code: string;
    country: string;
    currency: string;
    type: string;
}

export interface BookingMonth {
    month?: string;
    year?: string;
    max_date: string;
    min_date: string;
    display_date: string;
    count?: number;
}

export interface Bookings {
    verified: number;
    pending: number;
    unpaid: number;
    paid: number;
    canceled?: number;
}

export interface Booking {
    booking_id: string;
    status_id: string;
    status: string;
    currency_code: string;
    total: number;
    payment_type: string;
    date_created: string;
    updated_at: string;
}
export interface Transaction {
    transaction_id: string;
}
