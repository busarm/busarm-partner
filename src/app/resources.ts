/**
 * Use this file to define all the strings
 * you want to show to the user
 * so if any translation available,
 * user can be served the language
 * based on their selection and also
 * to avoid duplicates
 * */
import {Utils} from "./libs/Utils";

/*----------DEFINE STRING KEYS---------------*/

export enum Keys {
    dashboard_title_txt,
    trips_title_txt,
    buses_title_txt,
    account_title_txt,
    agent_txt,
    partner_txt,
    please_wait,
    refreshing_txt,
    invalid_login,
    error_connection,
    error_unexpected,
    error_access_expired,
    login_txt,
    verify_email_txt,
    refresh_txt,
    ok_txt,
    close_txt,
    retry_txt,
    email_txt,
    password_txt,
    enter_ref_code_txt,
    loading_txt,
    no_active_trip_txt,
    active_trips_txt,
    upcoming_trips_txt,
    pull_refresh_txt,
    name_txt,
    phone_txt,
    from_txt,
    to_txt,
    qty_txt,
    total_txt,
    departure_date_txt,
    departure_time_txt,
    bus_txt,
    camera_request_title_txt,
    camera_request_msg_txt,
    to_settings,
    cancel_txt,
    verify_booking_txt,
    confirm_verify_msg,
    yes_txt,
    no_txt,
    summary_txt,
    trip_txt,
    trips_txt,
    ticket_txt,
    type_txt,
    price_txt,
    unit_price_txt,
    amount_txt,
    sub_total_txt,
    booking_fee_txt,
    verify_txt,
    scan_txt,
    trip_search_hint,
    no_trip_txt,
    booked_txt,
    reserved_txt,
    reserve_txt,
    locked_txt,
    available_txt,
    view_txt,
    edit_txt,
    update_txt,
    done_txt,
    delete_txt,
    info_txt,
    add_txt,
    desc_txt,
    no_bus_txt,
    no_bus_msg,
    add_trip_txt,
    add_bus_txt,
    pickup_txt,
    select_pickup_txt,
    dropoff_txt,
    select_dropoff_txt,
    date_txt,
    time_txt,
    select_depart_date_txt,
    select_time_txt,
    status_txt,
    select_status_txt,
    bus_type_txt,
    select_bus_type_txt,
    select_type_txt,
    not_found_txt,
    location_search_hint,
    select_txt,
    submit_txt,
    add_ticket_txt,
    enter_ticket_price_txt,
    ticket_type_txt,
    select_ticket_type_txt,
    photo_txt,
    no_photo_txt,
    plate_no_txt,
    seats_txt,
    enter_bus_seats_txt,
    enter_bus_plate_no_txt,
    bus_search_hint,
    delete_trip_title_txt,
    delete_trip_msg_txt,
    delete_bus_title_txt,
    delete_bus_msg_txt,
    delete_image_title_txt,
    delete_image_msg_txt,
    select_image_source_txt,
    load_library_txt,
    use_camera_txt,
    add_logo_txt,
    logout_txt,
    logout_msg_txt,
    my_agents_txt,
    add_agent_txt,
    admin_txt,
    delete_agent_title_txt,
    delete_agent_msg_txt,
    make_admin_title_txt,
    make_admin_msg_txt,
    new_user,
    existing_user,
    remove_admin_title_txt,
    remove_admin_msg_txt,
    forgot_password_title_txt,
    forgot_password_msg_txt,
    upload_txt,
    bookings_txt,
    select_month_txt,
    unpaid_txt,
    pending_txt,
    verified_txt,
    canceled_txt,
    all_months_txt,
    no_booking_txt,
    booking_id_txt,
    transactions_txt,
    total_payments_txt,
    fees_txt,
    revenue_txt,
    balance_txt,
    overpaid_txt,
    paid_txt,
    cash_txt,
    banked_in_txt,
    make_payment_txt,
    request_payout_txt,
    history_txt,
    new_payment_txt,
    payment_reference_txt,
    new_request_txt,
    receiver_name_txt,
    receiver_bank_txt,
    receiver_account_txt,
    account_name_txt,
    bank_name_txt,
    account_number_txt,
    action_confirm_msg_txt,
    invalid_location,
    support_txt,
    terms_and_condition_txt,
    privacy_policy_txt,
    go_to_app_txt,
    pay_before_txt,
    authorizing_txt,
    error_authorize_txt,
    owner_txt,
    user_txt,
    agent_search_hint,
    save_account_info,
    my_locations_txt,
    delete_location_title_txt,
    delete_location_msg_txt,
    my_location_search_hint,
    select_location_txt,
    city_txt,
    province_txt,
    latitude_txt,
    longitude_txt,
    address_txt,
    add_location_txt,
    bus_seat_size_error,
    select_date_txt,
    repeat_txt,
    share_bus_txt,
    share_txt,
    no_bus_sharing_txt,
    delete_bus_share_title_txt,
    delete_bus_share_msg_txt,
    enter_account_id_txt,
    enter_partner_name_txt,
    partner_account_id_txt,
    partner_name_txt,
    update_available_title,
    update_available_msg,
    payment_made_txt,
    payment_not_made_txt,
    payment_type,
    permission_required_txt,
    no_camera_permission_msg,
    no_camera_msg,
    select_bank_txt,
    payment_method_txt,
    select_payment_method_txt,
    payout_fee_alert_txt,
    pay_now_txt,
    view_history_txt
}

export type StringKey = keyof typeof Keys;
type String = {[key in StringKey]: string };

/*----------DEFINE STRING KEYS---------------*/


/*----------DEFINE LANGUAGE STRINGS HERE---------------*/

/**@var String English Strings*/
const English: String = {
    dashboard_title_txt: "Dashboard",
    trips_title_txt: "Trips",
    buses_title_txt: "Buses",
    account_title_txt: "Account",
    agent_txt: "Agent",
    partner_txt: "Partner",
    please_wait: "Please Wait!",
    refreshing_txt: "Refreshing",
    invalid_login: "Invalid email or password",
    error_connection: "Unable to connect to server. Please check your connectivity settings",
    error_unexpected: "Unexpected error occurred. Please try again later",
    error_access_expired: "Access Expired. Please login again",
    login_txt: "Login",
    refresh_txt: "Refresh",
    ok_txt: "Ok",
    close_txt: "close",
    retry_txt: "retry",
    email_txt: "Email",
    password_txt: "Password",
    enter_ref_code_txt: "Enter Reference Code",
    loading_txt: "Loading Components...",
    no_active_trip_txt: "Currently no active trip for booking.",
    active_trips_txt: "Active Trips",
    upcoming_trips_txt: "Upcoming Trips",
    pull_refresh_txt: "Pull to refresh",
    name_txt: "Name",
    phone_txt: "Phone Number",
    from_txt: "From",
    to_txt: "To",
    qty_txt: "Qty",
    total_txt: "Total",
    departure_date_txt: "Departure Date",
    departure_time_txt: "Departure Time",
    bus_txt: "Bus",
    camera_request_title_txt: "Camera access required",
    camera_request_msg_txt: "Please allow access to your camera to proceed",
    to_settings: "Go to settings",
    cancel_txt: "Cancel",
    verify_booking_txt: "Verify Booking",
    confirm_verify_msg: "Are you sure you want to verify this booking and <strong>user has made full payment</strong> ?",
    yes_txt: "Yes",
    no_txt: "No",
    summary_txt: "Summary",
    trip_txt: "Trip",
    trips_txt: "Trips",
    ticket_txt: "Ticket(s)",
    type_txt: "Type",
    price_txt: "Price",
    unit_price_txt: "Unit",
    amount_txt: "Amount",
    sub_total_txt: "Sub Total",
    booking_fee_txt: "Booking Fee",
    verify_txt: "Verify",
    scan_txt: "Scan",
    trip_search_hint: "Search name, location, city, agent etc.",
    no_trip_txt: "No Trip Available",
    booked_txt: "Booked",
    locked_txt: "Locked",
    reserved_txt: "Reserved",
    available_txt: "Available",
    reserve_txt: "Reserve",
    view_txt: "View",
    edit_txt: "Edit",
    update_txt: "Update",
    done_txt: "Done",
    delete_txt: "Delete",
    info_txt: "Info",
    desc_txt: "Description",
    add_txt: "Add",
    no_bus_txt: "No Bus Available",
    no_bus_msg: "Please add a bus for this trip to be verified.",
    add_trip_txt: "Add Trip",
    add_bus_txt: "Add Bus",
    pickup_txt: "Pickup",
    select_pickup_txt: "Select Pickup Address",
    dropoff_txt: "Drop-off",
    select_dropoff_txt: "Select Drop-off Address",
    date_txt: "Date",
    time_txt: "Time",
    select_depart_date_txt: "Select Departure Date",
    select_time_txt: "Select Departure Time",
    status_txt: "Status",
    select_status_txt: "Select Trip Status",
    bus_type_txt: "Bus Type",
    select_bus_type_txt: "Select Type of Bus",
    select_type_txt: "Select Type",
    not_found_txt: "Not Found",
    location_search_hint: "Enter Location Name or Address",
    select_txt: "Select",
    submit_txt: "Submit",
    add_ticket_txt: "Add Ticket",
    enter_ticket_price_txt: "Enter Ticket Price",
    ticket_type_txt: "Ticket Type",
    select_ticket_type_txt: "Select Type of Ticket",
    photo_txt: "Photo(s)",
    no_photo_txt: "No Photo Available",
    plate_no_txt: "Plate Number",
    seats_txt: "Seat(s)",
    enter_bus_seats_txt: "Enter Number of Seats",
    enter_bus_plate_no_txt: "Enter Plate Number",
    bus_search_hint: "Search Plate Number",
    delete_trip_title_txt: "Delete Trip",
    delete_trip_msg_txt: "Are you sure you want to delete this trip? <strong>This action is irreversible.</strong>",
    delete_bus_title_txt: "Delete Bus",
    delete_bus_msg_txt: "Are you sure you want to delete this bus?",
    delete_image_title_txt: "Delete Image",
    delete_image_msg_txt: "Are you sure you want to delete this image?",
    select_image_source_txt: "Select Image source",
    load_library_txt: "Load from Library",
    use_camera_txt: "Use Camera",
    add_logo_txt: "Add Logo",
    logout_txt:"Logout",
    logout_msg_txt: "Are you sure you want to logout?",
    my_agents_txt: "My Agents",
    add_agent_txt: "Add Agent",
    admin_txt: "Admin",
    delete_agent_title_txt: "Delete Agent",
    delete_agent_msg_txt: "Are you sure you want to delete this agent?",
    make_admin_title_txt: "Make Admin",
    make_admin_msg_txt: "Are you sure you want to make this user and admin?",
    remove_admin_title_txt: "Remove Admin",
    remove_admin_msg_txt: "Are you sure you want to remove administrator privileges from this user?",
    new_user:"New User?",
    existing_user:"Existing User?",
    forgot_password_title_txt:"Forgot Password?",
    verify_email_txt:"Verify Email",
    forgot_password_msg_txt:"An email will be sent to you for authorization. Do you want to proceed?",
    upload_txt:"Upload",
    bookings_txt:"Bookings",
    select_month_txt:"Select Month",
    unpaid_txt:"Unpaid",
    pending_txt:"Pending",
    verified_txt:"Verified",
    canceled_txt:"Canceled",
    all_months_txt:"All Months",
    no_booking_txt:"No Booking Available to display !",
    booking_id_txt:"Booking Id",
    transactions_txt:"Transactions",
    total_payments_txt:"Total Payments",
    fees_txt:"Fees",
    revenue_txt:"Revenue",
    balance_txt:"Balance",
    overpaid_txt:"Overpaid",
    paid_txt:"Paid",
    cash_txt:"In Cash",
    banked_in_txt:"Banked In",
    make_payment_txt:"Make Payment",
    request_payout_txt:"Request Payout",
    history_txt:"History",
    new_payment_txt:"New Payment",
    payment_reference_txt:"Payment Reference",
    new_request_txt:"New Request",
    receiver_name_txt:"Receiver's Name",
    receiver_bank_txt:"Receiver's Bank Name",
    receiver_account_txt:"Receiver's Bank Account #",
    account_name_txt:"Account Name",
    bank_name_txt:"Bank Name",
    account_number_txt:"Account Number",
    action_confirm_msg_txt:"Are you sure you want to continue?",
    invalid_location:"Invalid location selected",
    support_txt:"Support",
    terms_and_condition_txt:"Terms and Conditions",
    privacy_policy_txt:"Privacy Policy",
    go_to_app_txt:"Go to Wecari App",
    pay_before_txt:"Pay before:",
    authorizing_txt: "Authorizing access. Please wait ...",
    error_authorize_txt: "Failed to authorize access",
    owner_txt: "Owner",
    user_txt: "User",
    agent_search_hint: "Search name or email",
    save_account_info: "Save account information",
    delete_location_title_txt: "Delete Location",
    delete_location_msg_txt: "Are you sure you want to delete this location?",
    my_locations_txt: "My Locations",
    my_location_search_hint: "Search address or city or province",
    select_location_txt: "Select Location",
    city_txt: "City",
    province_txt: "Province/State/Region",
    latitude_txt: "Latitude",
    longitude_txt: "Longitude",
    address_txt: "Longitude",
    add_location_txt: "Add Location",
    bus_seat_size_error: "Bus seats must be greater than {0}",
    select_date_txt: "Select Date",
    repeat_txt: "Repeat",
    share_bus_txt: "Share Bus",
    share_txt: "Share",
    no_bus_sharing_txt: "Bus is currently not shared with anyone",
    delete_bus_share_title_txt: "Stop Sharing",
    delete_bus_share_msg_txt: "Are you sure you want to stop sharing bus with this partner?",
    enter_account_id_txt: "Enter Partner Account Id to share with",
    enter_partner_name_txt: "Enter Partner Name",
    partner_account_id_txt: "Partner Account ID",
    partner_name_txt: "Partner Name",
    update_available_title: "Update Available",
    update_available_msg: "A new version is available. Do you want to load it?",
    payment_made_txt: "I've made payment",
    payment_not_made_txt: "I've not paid",
    payment_type: "Payment Type",
    permission_required_txt: "Permission Required",
    no_camera_permission_msg: "Failed to get camera. Please ensure this app has permission to access camera",
    no_camera_msg: "Failed to get camera",
    select_bank_txt: "Select Bank",
    payment_method_txt: "Payment Method",
    select_payment_method_txt: "Select Payment Method",
    payout_fee_alert_txt: "Transfer fee will apply for amount less than {0}",
    pay_now_txt: "Pay Now",
    view_history_txt: "View History",
};


/*----------DEFINE LANGUAGE STRINGS HERE---------------*/


/*----------DEFINE LANGUAGE KEYS---------------*/

export enum Langs {
    EN,
}

export type LangKey = keyof typeof Langs;
type Lang = {[key in LangKey]: String };

/*----------DEFINE LANGUAGE KEYS---------------*/


/*------------ADD LANGUAGES HERE------------*/

export const Languages: Lang = {
    EN: English
};

/*------------ADD LANGUAGES HERE------------*/


/*----------DEFINE ASSET KEYS---------------*/

enum AssetId {
    logo_white = "imgs/logo_white.png",
    logo_dark = "imgs/logo_dark.png",
    logo_light = "imgs/logo_light.png",
    logo_txt_white = "imgs/logo_txt_white.png",
    logo_txt_dark = "imgs/logo_txt_dark.png",
    logo_txt_light = "imgs/logo_txt_light.png",
    loading_page = "imgs/loading_page.gif",
    no_trip = "imgs/no_trip.png",
    not_found = "imgs/not_found.png",
    powered_by_google = "imgs/powered_by_google.png"
}

export type AssetKey = keyof typeof AssetId;

/*----------DEFINE ASSET KEYS---------------*/


export class Strings {

    private static defaultLanguage: String = Languages.EN;
    private static currentLanguage: String = Strings.defaultLanguage;

    /**Set Default language
     * @param lang
     * */
    public static setLanguage(lang: LangKey|string) {
        Strings.currentLanguage = Languages[lang];
    }

    /**Get String to display to user
     * @param key StringKey
     * @param lang LangKey
     * @return string
     * */
    public static getString(key: StringKey, lang?: LangKey|string): string {
        if (Utils.assertAvailable(lang)) {
            if (Utils.assertAvailable(Languages[lang][key])) {
                return Languages[lang][key];
            }
            else {
                return Strings.defaultLanguage[key];
            }
        }
        else {
            if (Utils.assertAvailable(Strings.currentLanguage[key])) {
                return Strings.currentLanguage[key];
            }
            else {
                return Strings.defaultLanguage[key];
            }
        }
    }

    /**
     * Format String
     * Strings should contain placeholders e.g {0}, {1}, {2} etc.
     * @param str string
     * @param args
     */
    public static format(str: string, ...args) {
        return str.replace(/{(\d+)}/g, function(match, number) {
          return typeof args[number] != 'undefined'
            ? args[number]
            : match
          ;
        });
      };
}

export class Assets {
    public static getPath(name: AssetKey) {
        return "assets/" + AssetId[name];
    }
}
