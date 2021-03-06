import {
  Request,
  Response,
  NextFunction,
} from 'express';
import cors, {
  CorsOptions
} from 'cors';

import {
  sign as jwt_sign,
  verify as jwt_verify
} from 'jsonwebtoken';
import { SAFESTAR_EVENT_TYPES, SAFESTAR_PULSE_CODES } from './enums/safestar.enum';
import { get_user_by_id } from './repos/users.repo';
import { ISafestarUser } from './interfaces/safestar.interface';
import { SafestarConversations } from './models/conversation.model';
import { UploadedFile } from 'express-fileupload';
import { Model } from 'sequelize/types';
import { Watches } from './models/watch.model';
import { get_pulse_by_id } from './repos/pulses.repo';
import { IPhotoPulse, IPulse } from './interfaces/pulse.interface';
import { get_photo_pulse_by_id } from './repos/photo-pulses.repo';
import { IModelValidator, INotification, PlainObject } from '../_common/interfaces/common.interface';
import { ServiceMethodAsyncResults, ServiceMethodResults } from '../_common/types/common.types';
import { HttpStatusCode } from '../_common/enums/http-codes.enum';
import { store_image } from '../../cloudinary-manager';



export const specialCaracters = ['!', '@', '#', '$', '%', '&', '+', ')', ']', '}', ':', ';', '?'];
export const codeCharacters = ['!', '@', '#', '$', '%', '&', '|', '*', ':', '-', '_', '+'];
export const allowedImages = ['jpg', 'jpeg', 'png', 'JPG', 'JPEG', 'PNG'];

export const URL_REGEX = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;

export const DURATION_1_SECOND = 1000;
export const DURATION_1_MINUTE = DURATION_1_SECOND * 60;
export const DURATION_1_HOUR = DURATION_1_MINUTE * 60;
export const DURATION_1_DAY_HALF = DURATION_1_HOUR * 12;
export const DURATION_1_DAY_FULL = DURATION_1_HOUR * 24;
export const DURATION_1_WEEK = DURATION_1_DAY_FULL * 7;



export const hierarchyOptions = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10
];
// https://www.onetonline.org/find/
export const jobFields = [
  "Architecture and Engineering",
  "Arts, Design, Entertainment, Sports, and Media",
  "Building and Grounds Cleaning and Maintenance",
  "Business and Financial Operations",
  "Community and Social Service",
  "Computer and Mathematical",
  "Construction and Extraction",
  "Education, Training, and Library",
  "Farming, Fishing, and Forestry",
  "Food Preparation and Serving Related",
  "Healthcare Practitioners and Technical",
  "Healthcare Support",
  "Installation, Maintenance, and Repair",
  "Legal",
  "Life, Physical, and Social Science",
  "Management",
  "Military Specific",
  "Office and Administrative Support",
  "Personal Care and Service",
  "Production",
  "Protective Service",
  "Sales and Related",
  "Transportation and Material Moving"
];
// https://www.un.org/sustainabledevelopment/sustainable-development-goals/
export const causesList = [
  { unsdgName: "No Poverty", unsdgCode: 1 },
  { unsdgName: "Zero Hunger", unsdgCode: 2 },
  { unsdgName: "Good Health and Well-Being", unsdgCode: 3 },
  { unsdgName: "Quality Education", unsdgCode: 4 },
  { unsdgName: "Gender Equality", unsdgCode: 5 },
  { unsdgName: "Clean Water and Sanitation", unsdgCode: 6 },
  { unsdgName: "Affordable and Clean Energy", unsdgCode: 7 },
  { unsdgName: "Decent Work and Economic Growth", unsdgCode: 8 },
  { unsdgName: "Industry, Innovation, and Infrastructure", unsdgCode: 9 },
  { unsdgName: "Reduced Inequalities", unsdgCode: 10 },
  { unsdgName: "Sustainable Cities and Communities", unsdgCode: 11 },
  { unsdgName: "Responsible Consumption and Production", unsdgCode: 12 },
  { unsdgName: "Climate Action", unsdgCode: 13 },
  { unsdgName: "Life Below Water", unsdgCode: 14 },
  { unsdgName: "Life on Land", unsdgCode: 15 },
  { unsdgName: "Peace, Justice and Strong Institutions", unsdgCode: 16 },
  { unsdgName: "Partnerships", unsdgCode: 17 }
];
// https://stackoverflow.com/questions/3217492/list-of-language-codes-in-yaml-or-json
export const languagesList = [
  { code: "ab", name: "Abkhaz", nativeName: "??????????" },
  { code: "aa", name: "Afar", nativeName: "Afaraf" },
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans" },
  { code: "ak", name: "Akan", nativeName: "Akan" },
  { code: "sq", name: "Albanian", nativeName: "Shqip" },
  { code: "am", name: "Amharic", nativeName: "????????????" },
  { code: "ar", name: "Arabic", nativeName: "??????????????" },
  { code: "an", name: "Aragonese", nativeName: "Aragon??s" },
  { code: "hy", name: "Armenian", nativeName: "??????????????" },
  { code: "as", name: "Assamese", nativeName: "?????????????????????" },
  { code: "av", name: "Avaric", nativeName: "???????? ????????, ???????????????? ????????" },
  { code: "ae", name: "Avestan", nativeName: "avesta" },
  { code: "ay", name: "Aymara", nativeName: "aymar aru" },
  { code: "az", name: "Azerbaijani", nativeName: "az??rbaycan dili" },
  { code: "bm", name: "Bambara", nativeName: "bamanankan" },
  { code: "ba", name: "Bashkir", nativeName: "?????????????? ????????" },
  { code: "eu", name: "Basque", nativeName: "euskara, euskera" },
  { code: "be", name: "Belarusian", nativeName: "????????????????????" },
  { code: "bn", name: "Bengali", nativeName: "???????????????" },
  { code: "bh", name: "Bihari", nativeName: "?????????????????????" },
  { code: "bi", name: "Bislama", nativeName: "Bislama" },
  { code: "bs", name: "Bosnian", nativeName: "bosanski jezik" },
  { code: "br", name: "Breton", nativeName: "brezhoneg" },
  { code: "bg", name: "Bulgarian", nativeName: "?????????????????? ????????" },
  { code: "my", name: "Burmese", nativeName: "???????????????" },
  { code: "ca", name: "Catalan; Valencian", nativeName: "Catal??" },
  { code: "ch", name: "Chamorro", nativeName: "Chamoru" },
  { code: "ce", name: "Chechen", nativeName: "?????????????? ????????" },
  { code: "ny", name: "Chichewa; Chewa; Nyanja", nativeName: "chiChe??a, chinyanja" },
  { code: "zh", name: "Chinese", nativeName: "?????? (Zh??ngw??n), ??????, ??????" },
  { code: "cv", name: "Chuvash", nativeName: "?????????? ??????????" },
  { code: "kw", name: "Cornish", nativeName: "Kernewek" },
  { code: "co", name: "Corsican", nativeName: "corsu, lingua corsa" },
  { code: "cr", name: "Cree", nativeName: "?????????????????????" },
  { code: "hr", name: "Croatian", nativeName: "hrvatski" },
  { code: "cs", name: "Czech", nativeName: "??esky, ??e??tina" },
  { code: "da", name: "Danish", nativeName: "dansk" },
  { code: "dv", name: "Divehi; Dhivehi; Maldivian;", nativeName: "????????????" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands, Vlaams" },
  { code: "en", name: "English", nativeName: "English" },
  { code: "eo", name: "Esperanto", nativeName: "Esperanto" },
  { code: "et", name: "Estonian", nativeName: "eesti, eesti keel" },
  { code: "ee", name: "Ewe", nativeName: "E??egbe" },
  { code: "fo", name: "Faroese", nativeName: "f??royskt" },
  { code: "fj", name: "Fijian", nativeName: "vosa Vakaviti" },
  { code: "fi", name: "Finnish", nativeName: "suomi, suomen kieli" },
  { code: "fr", name: "French", nativeName: "fran??ais, langue fran??aise" },
  { code: "ff", name: "Fula; Fulah; Pulaar; Pular", nativeName: "Fulfulde, Pulaar, Pular" },
  { code: "gl", name: "Galician", nativeName: "Galego" },
  { code: "ka", name: "Georgian", nativeName: "?????????????????????" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "el", name: "Greek, Modern", nativeName: "????????????????" },
  { code: "gn", name: "Guaran??", nativeName: "Ava??e???" },
  { code: "gu", name: "Gujarati", nativeName: "?????????????????????" },
  { code: "ht", name: "Haitian; Haitian Creole", nativeName: "Krey??l ayisyen" },
  { code: "ha", name: "Hausa", nativeName: "Hausa, ????????????" },
  { code: "he", name: "Hebrew (modern)", nativeName: "??????????" },
  { code: "hz", name: "Herero", nativeName: "Otjiherero" },
  { code: "hi", name: "Hindi", nativeName: "??????????????????, ???????????????" },
  { code: "ho", name: "Hiri Motu", nativeName: "Hiri Motu" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar" },
  { code: "ia", name: "Interlingua", nativeName: "Interlingua" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "ie", name: "Interlingue", nativeName: "Originally called Occidental; then Interlingue after WWII" },
  { code: "ga", name: "Irish", nativeName: "Gaeilge" },
  { code: "ig", name: "Igbo", nativeName: "As???s??? Igbo" },
  { code: "ik", name: "Inupiaq", nativeName: "I??upiaq, I??upiatun" },
  { code: "io", name: "Ido", nativeName: "Ido" },
  { code: "is", name: "Icelandic", nativeName: "??slenska" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "iu", name: "Inuktitut", nativeName: "??????????????????" },
  { code: "ja", name: "Japanese", nativeName: "????????? (??????????????????????????????)" },
  { code: "jv", name: "Javanese", nativeName: "basa Jawa" },
  { code: "kl", name: "Kalaallisut, Greenlandic", nativeName: "kalaallisut, kalaallit oqaasii" },
  { code: "kn", name: "Kannada", nativeName: "???????????????" },
  { code: "kr", name: "Kanuri", nativeName: "Kanuri" },
  { code: "ks", name: "Kashmiri", nativeName: "?????????????????????, ???????????????" },
  { code: "kk", name: "Kazakh", nativeName: "?????????? ????????" },
  { code: "km", name: "Khmer", nativeName: "???????????????????????????" },
  { code: "ki", name: "Kikuyu, Gikuyu", nativeName: "G??k??y??" },
  { code: "rw", name: "Kinyarwanda", nativeName: "Ikinyarwanda" },
  { code: "ky", name: "Kirghiz, Kyrgyz", nativeName: "???????????? ????????" },
  { code: "kv", name: "Komi", nativeName: "???????? ??????" },
  { code: "kg", name: "Kongo", nativeName: "KiKongo" },
  { code: "ko", name: "Korean", nativeName: "????????? (?????????), ????????? (?????????)" },
  { code: "ku", name: "Kurdish", nativeName: "Kurd??, ?????????????" },
  { code: "kj", name: "Kwanyama, Kuanyama", nativeName: "Kuanyama" },
  { code: "la", name: "Latin", nativeName: "latine, lingua latina" },
  { code: "lb", name: "Luxembourgish, Letzeburgesch", nativeName: "L??tzebuergesch" },
  { code: "lg", name: "Luganda", nativeName: "Luganda" },
  { code: "li", name: "Limburgish, Limburgan, Limburger", nativeName: "Limburgs" },
  { code: "ln", name: "Lingala", nativeName: "Ling??la" },
  { code: "lo", name: "Lao", nativeName: "?????????????????????" },
  { code: "lt", name: "Lithuanian", nativeName: "lietuvi?? kalba" },
  { code: "lu", name: "Luba-Katanga", nativeName: "" },
  { code: "lv", name: "Latvian", nativeName: "latvie??u valoda" },
  { code: "gv", name: "Manx", nativeName: "Gaelg, Gailck" },
  { code: "mk", name: "Macedonian", nativeName: "???????????????????? ??????????" },
  { code: "mg", name: "Malagasy", nativeName: "Malagasy fiteny" },
  { code: "ms", name: "Malay", nativeName: "bahasa Melayu, ???????? ?????????????" },
  { code: "ml", name: "Malayalam", nativeName: "??????????????????" },
  { code: "mt", name: "Maltese", nativeName: "Malti" },
  { code: "mi", name: "M??ori", nativeName: "te reo M??ori" },
  { code: "mr", name: "Marathi (Mar?????h??)", nativeName: "???????????????" },
  { code: "mh", name: "Marshallese", nativeName: "Kajin M??aje??" },
  { code: "mn", name: "Mongolian", nativeName: "????????????" },
  { code: "na", name: "Nauru", nativeName: "Ekakair?? Naoero" },
  { code: "nv", name: "Navajo, Navaho", nativeName: "Din?? bizaad, Din??k??eh????" },
  { code: "nb", name: "Norwegian Bokm??l", nativeName: "Norsk bokm??l" },
  { code: "nd", name: "North Ndebele", nativeName: "isiNdebele" },
  { code: "ne", name: "Nepali", nativeName: "??????????????????" },
  { code: "ng", name: "Ndonga", nativeName: "Owambo" },
  { code: "nn", name: "Norwegian Nynorsk", nativeName: "Norsk nynorsk" },
  { code: "no", name: "Norwegian", nativeName: "Norsk" },
  { code: "ii", name: "Nuosu", nativeName: "????????? Nuosuhxop" },
  { code: "nr", name: "South Ndebele", nativeName: "isiNdebele" },
  { code: "oc", name: "Occitan", nativeName: "Occitan" },
  { code: "oj", name: "Ojibwe, Ojibwa", nativeName: "????????????????????????" },
  { code: "cu", name: "Old Church Slavonic, Church Slavic, Church Slavonic, Old Bulgarian, Old Slavonic", nativeName: "?????????? ????????????????????" },
  { code: "om", name: "Oromo", nativeName: "Afaan Oromoo" },
  { code: "or", name: "Oriya", nativeName: "???????????????" },
  { code: "os", name: "Ossetian, Ossetic", nativeName: "???????? ??????????" },
  { code: "pa", name: "Panjabi, Punjabi", nativeName: "??????????????????, ???????????????" },
  { code: "pi", name: "P??li", nativeName: "????????????" },
  { code: "fa", name: "Persian", nativeName: "??????????" },
  { code: "pl", name: "Polish", nativeName: "polski" },
  { code: "ps", name: "Pashto, Pushto", nativeName: "????????" },
  { code: "pt", name: "Portuguese", nativeName: "Portugu??s" },
  { code: "qu", name: "Quechua", nativeName: "Runa Simi, Kichwa" },
  { code: "rm", name: "Romansh", nativeName: "rumantsch grischun" },
  { code: "rn", name: "Kirundi", nativeName: "kiRundi" },
  { code: "ro", name: "Romanian, Moldavian, Moldovan", nativeName: "rom??n??" },
  { code: "ru", name: "Russian", nativeName: "?????????????? ????????" },
  { code: "sa", name: "Sanskrit (Sa???sk???ta)", nativeName: "???????????????????????????" },
  { code: "sc", name: "Sardinian", nativeName: "sardu" },
  { code: "sd", name: "Sindhi", nativeName: "??????????????????, ?????????? ?????????????" },
  { code: "se", name: "Northern Sami", nativeName: "Davvis??megiella" },
  { code: "sm", name: "Samoan", nativeName: "gagana faa Samoa" },
  { code: "sg", name: "Sango", nativeName: "y??ng?? t?? s??ng??" },
  { code: "sr", name: "Serbian", nativeName: "???????????? ??????????" },
  { code: "gd", name: "Scottish Gaelic; Gaelic", nativeName: "G??idhlig" },
  { code: "sn", name: "Shona", nativeName: "chiShona" },
  { code: "si", name: "Sinhala, Sinhalese", nativeName: "???????????????" },
  { code: "sk", name: "Slovak", nativeName: "sloven??ina" },
  { code: "sl", name: "Slovene", nativeName: "sloven????ina" },
  { code: "so", name: "Somali", nativeName: "Soomaaliga, af Soomaali" },
  { code: "st", name: "Southern Sotho", nativeName: "Sesotho" },
  { code: "es", name: "Spanish; Castilian", nativeName: "espa??ol, castellano" },
  { code: "su", name: "Sundanese", nativeName: "Basa Sunda" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili" },
  { code: "ss", name: "Swati", nativeName: "SiSwati" },
  { code: "sv", name: "Swedish", nativeName: "svenska" },
  { code: "ta", name: "Tamil", nativeName: "???????????????" },
  { code: "te", name: "Telugu", nativeName: "??????????????????" },
  { code: "tg", name: "Tajik", nativeName: "????????????, to??ik??, ???????????????" },
  { code: "th", name: "Thai", nativeName: "?????????" },
  { code: "ti", name: "Tigrinya", nativeName: "????????????" },
  { code: "bo", name: "Tibetan Standard, Tibetan, Central", nativeName: "?????????????????????" },
  { code: "tk", name: "Turkmen", nativeName: "T??rkmen, ??????????????" },
  { code: "tl", name: "Tagalog", nativeName: "Wikang Tagalog, ??????????????? ??????????????????" },
  { code: "tn", name: "Tswana", nativeName: "Setswana" },
  { code: "to", name: "Tonga (Tonga Islands)", nativeName: "faka Tonga" },
  { code: "tr", name: "Turkish", nativeName: "T??rk??e" },
  { code: "ts", name: "Tsonga", nativeName: "Xitsonga" },
  { code: "tt", name: "Tatar", nativeName: "??????????????, tatar??a, ?????????????????" },
  { code: "tw", name: "Twi", nativeName: "Twi" },
  { code: "ty", name: "Tahitian", nativeName: "Reo Tahiti" },
  { code: "ug", name: "Uighur, Uyghur", nativeName: "Uy??urq??, ???????????????????" },
  { code: "uk", name: "Ukrainian", nativeName: "????????????????????" },
  { code: "ur", name: "Urdu", nativeName: "????????" },
  { code: "uz", name: "Uzbek", nativeName: "zbek, ??????????, ???????????????" },
  { code: "ve", name: "Venda", nativeName: "Tshiven???a" },
  { code: "vi", name: "Vietnamese", nativeName: "Ti???ng Vi???t" },
  { code: "vo", name: "Volap??k", nativeName: "Volap??k" },
  { code: "wa", name: "Walloon", nativeName: "Walon" },
  { code: "cy", name: "Welsh", nativeName: "Cymraeg" },
  { code: "wo", name: "Wolof", nativeName: "Wollof" },
  { code: "fy", name: "Western Frisian", nativeName: "Frysk" },
  { code: "xh", name: "Xhosa", nativeName: "isiXhosa" },
  { code: "yi", name: "Yiddish", nativeName: "????????????" },
  { code: "yo", name: "Yoruba", nativeName: "Yor??b??" },
  { code: "za", name: "Zhuang, Chuang", nativeName: "Sa?? cue????, Saw cuengh" }
];

export const industries = [
  "Accounting",
  "Airlines / Aviation",
  "Alternative Dispute Resolution",
  "Alternative Medicine",
  "Animation",
  "Apparel / Fashion",
  "Architecture / Planning",
  "Arts / Crafts",
  "Automotive",
  "Aviation / Aerospace",
  "Banking / Mortgage",
  "Biotechnology / Greentech",
  "Broadcast Media",
  "Building Materials",
  "Business Supplies / Equipment",
  "Capital Markets / Hedge Fund / Private Equity",
  "Chemicals",
  "Civic / Social Organization",
  "Civil Engineering",
  "Commercial Real Estate",
  "Computer Games",
  "Computer Hardware",
  "Computer Networking",
  "Computer Software / Engineering",
  "Computer / Network Security",
  "Construction",
  "Consumer Electronics",
  "Consumer Goods",
  "Consumer Services",
  "Cosmetics",
  "Dairy",
  "Defense / Space",
  "Design",
  "E - Learning",
  "Education Management",
  "Electrical / Electronic Manufacturing",
  "Entertainment / Movie Production",
  "Environmental Services",
  "Events Services",
  "Executive Office",
  "Facilities Services",
  "Farming",
  "Financial Services",
  "Fine Art",
  "Fishery",
  "Food Production",
  "Food / Beverages",
  "Fundraising",
  "Furniture",
  "Gambling / Casinos",
  "Glass / Ceramics / Concrete",
  "Government Administration",
  "Government Relations",
  "Graphic Design / Web Design",
  "Health / Fitness",
  "Higher Education / Acadamia",
  "Hospital / Health Care",
  "Hospitality",
  "Human Resources / HR",
  "Import / Export",
  "Individual / Family Services",
  "Industrial Automation",
  "Information Services",
  "Information Technology / IT",
  "Insurance",
  "International Affairs",
  "International Trade / Development",
  "Internet",
  "Investment Banking / Venture",
  "Investment Management / Hedge Fund / Private Equity",
  "Judiciary",
  "Law Enforcement",
  "Law Practice / Law Firms",
  "Legal Services",
  "Legislative Office",
  "Leisure / Travel",
  "Library",
  "Logistics / Procurement",
  "Luxury Goods / Jewelry",
  "Machinery",
  "Management Consulting",
  "Maritime",
  "Market Research",
  "Marketing / Advertising / Sales",
  "Mechanical or Industrial Engineering",
  "Media Production",
  "Medical Equipment",
  "Medical Practice",
  "Mental Health Care",
  "Military Industry",
  "Mining / Metals",
  "Motion Pictures / Film",
  "Museums / Institutions",
  "Music",
  "Nanotechnology",
  "Newspapers / Journalism",
  "Non - Profit / Volunteering",
  "Oil / Energy / Solar / Greentech",
  "Online Publishing",
  "Other Industry",
  "Outsourcing / Offshoring",
  "Package / Freight Delivery",
  "Packaging / Containers",
  "Paper / Forest Products",
  "Performing Arts",
  "Pharmaceuticals",
  "Philanthropy",
  "Photography",
  "Plastics",
  "Political Organization",
  "Primary / Secondary Education",
  "Printing",
  "Professional Training",
  "Program Development",
  "Public Relations / PR",
  "Public Safety",
  "Publishing Industry",
  "Railroad Manufacture",
  "Ranching",
  "Real Estate / Mortgage",
  "Recreational Facilities / Services",
  "Religious Institutions",
  "Renewables / Environment",
  "Research Industry",
  "Restaurants",
  "Retail Industry",
  "Security / Investigations",
  "Semiconductors",
  "Shipbuilding",
  "Sporting Goods",
  "Sports",
  "Staffing / Recruiting",
  "Supermarkets",
  "Telecommunications",
  "Textiles",
  "Think Tanks",
  "Tobacco",
  "Translation / Localization",
  "Transportation",
  "Utilities",
  "Venture Capital / VC",
  "Veterinary",
  "Warehousing",
  "Wholesale",
  "Wine / Spirits",
  "Wireless",
  "Writing / Editing"
];

export const user_attrs_slim = [
  'id',
  'firstname',
  'lastname',
  'username',
  'is_public',
  'allow_messaging',
  'allow_conversations',
  'allow_watches',
  'email',
  'phone',
  'bio',
  'icon_link',
  'uuid',
  'created_at',
  'updated_at',
  'deleted_at',
  'latest_lat',
  'latest_lng',
  'latlng_last_updated',
  'push_notification_token',
];

// https://stackoverflow.com/questions/6903823/regex-for-youtube-id/6904504
export const youtube_regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;

export const user_attrs_med = [
  ...user_attrs_slim,
];



export const SAFESTAR_PULSE_CODES_GENERIC = [
  SAFESTAR_PULSE_CODES.OKAY,
  SAFESTAR_PULSE_CODES.WARNING,
  SAFESTAR_PULSE_CODES.IN_DANGER,
];
export const SAFESTAR_PULSE_CODES_OKAY = [
  SAFESTAR_PULSE_CODES.REACHED_HOME_SAFE,
  SAFESTAR_PULSE_CODES.REACHED_DESTINATION_SAFE,
];
export const SAFESTAR_PULSE_CODES_WARNING = [
  SAFESTAR_PULSE_CODES.UNKNOWN_AREA,
  SAFESTAR_PULSE_CODES.PHONE_NEAR_DEAD,
  SAFESTAR_PULSE_CODES.FEELS_UNSAFE,
  SAFESTAR_PULSE_CODES.OUTSIDE_ALONE,
];
export const SAFESTAR_PULSE_CODES_DANGER = [
  SAFESTAR_PULSE_CODES.ABUSER_NEARBY,
  SAFESTAR_PULSE_CODES.BEING_STALKED,
  SAFESTAR_PULSE_CODES.BEING_FOLLOWED,
  SAFESTAR_PULSE_CODES.APPROACHED_BY_STRANGER,
  SAFESTAR_PULSE_CODES.HARASSED_BY_STRANGER,
];
export const SAFESTAR_PULSE_CODES_ALL = [
  ...SAFESTAR_PULSE_CODES_GENERIC,
  ...SAFESTAR_PULSE_CODES_OKAY,
  ...SAFESTAR_PULSE_CODES_WARNING,
  ...SAFESTAR_PULSE_CODES_DANGER,
];



const isAppEnvSet: boolean = ('APP_ENV' in process.env);
const isDevEnv: boolean = isAppEnvSet && process.env.APP_ENV === "DEV";

export const isProd: boolean = (process.env.NODE_ENV === 'production') && !isDevEnv;

export const populate_notification_obj = async (notification_model: Model) => {
  const notificationObj = notification_model.toJSON() as INotification;
  const user_model = await get_user_by_id(notificationObj.from_id);
  const full_name = getUserFullName(user_model!);
  let message = '';
  let mount_prop_key = '';
  let mount_value = null;

  switch (notificationObj.event) {
    case SAFESTAR_EVENT_TYPES.CONVERSATION_MEMBER_REQUESTED: {
      const conversation_model = await SafestarConversations.findOne({
        where: { id: notificationObj.target_id }
      });
      message = `${full_name} wants to join your conversation: ${conversation_model!.get('title')}`;
      mount_prop_key = 'conversation';
      mount_value = conversation_model!.toJSON();
      break;
    }
    case SAFESTAR_EVENT_TYPES.CONVERSATION_MEMBER_REQUEST_CANCELED: {
      const conversation_model = await SafestarConversations.findOne({
        where: { id: notificationObj.target_id }
      });
      message = `${full_name} canceled their request to join conversation: ${conversation_model!.get('title')}`;
      mount_prop_key = 'conversation';
      mount_value = conversation_model!.toJSON();
      break;
    }
    case SAFESTAR_EVENT_TYPES.CONVERSATION_MEMBER_REQUEST_ACCEPTED: {
      const conversation_model = await SafestarConversations.findOne({
        where: { id: notificationObj.target_id }
      });
      message = `${full_name} accepted your request to join conversation: ${conversation_model!.get('title')}`;
      mount_prop_key = 'conversation';
      mount_value = conversation_model!.toJSON();
      break;
    }
    case SAFESTAR_EVENT_TYPES.CONVERSATION_MEMBER_REQUEST_REJECTED: {
      const conversation_model = await SafestarConversations.findOne({
        where: { id: notificationObj.target_id }
      });
      message = `${full_name} rejected your request to join conversation: ${conversation_model!.get('title')}`;
      mount_prop_key = 'conversation';
      mount_value = conversation_model!.toJSON();
      break;
    }
    case SAFESTAR_EVENT_TYPES.CONVERSATION_MEMBER_ADDED: {
      const conversation_model = await SafestarConversations.findOne({
        where: { id: notificationObj.target_id }
      });
      message = `${full_name} added you to a conversation: ${conversation_model!.get('title')}`;
      mount_prop_key = 'conversation';
      mount_value = conversation_model!.toJSON();
      break;
    }
    case SAFESTAR_EVENT_TYPES.CONVERSATION_MEMBER_REMOVED: {
      const conversation_model = await SafestarConversations.findOne({
        where: { id: notificationObj.target_id }
      });
      message = `${full_name} removed you from a conversation: ${conversation_model!.get('title')}`;
      mount_prop_key = 'conversation';
      mount_value = conversation_model!.toJSON();
      break;
    }

    case SAFESTAR_EVENT_TYPES.WATCH_MEMBER_REQUESTED: {
      const watch_model = await Watches.findOne({
        where: { id: notificationObj.target_id }
      });
      message = `${full_name} wants to join your watch: ${watch_model!.get('title')}`;
      mount_prop_key = 'watch';
      mount_value = watch_model!.toJSON();
      break;
    }
    case SAFESTAR_EVENT_TYPES.WATCH_MEMBER_REQUEST_CANCELED: {
      const watch_model = await Watches.findOne({
        where: { id: notificationObj.target_id }
      });
      message = `${full_name} canceled their request to join watch: ${watch_model!.get('title')}`;
      mount_prop_key = 'watch';
      mount_value = watch_model!.toJSON();
      break;
    }
    case SAFESTAR_EVENT_TYPES.WATCH_MEMBER_REQUEST_ACCEPTED: {
      const watch_model = await Watches.findOne({
        where: { id: notificationObj.target_id }
      });
      message = `${full_name} accepted your request to join watch: ${watch_model!.get('title')}`;
      mount_prop_key = 'watch';
      mount_value = watch_model!.toJSON();
      break;
    }
    case SAFESTAR_EVENT_TYPES.WATCH_MEMBER_REQUEST_REJECTED: {
      const watch_model = await Watches.findOne({
        where: { id: notificationObj.target_id }
      });
      message = `${full_name} rejected your request to join watch: ${watch_model!.get('title')}`;
      mount_prop_key = 'watch';
      mount_value = watch_model!.toJSON();
      break;
    }
    case SAFESTAR_EVENT_TYPES.WATCH_MEMBER_ADDED: {
      const watch_model = await Watches.findOne({
        where: { id: notificationObj.target_id }
      });
      message = `${full_name} added you to a watch: ${watch_model!.get('title')}`;
      mount_prop_key = 'watch';
      mount_value = watch_model!.toJSON();
      break;
    }
    case SAFESTAR_EVENT_TYPES.WATCH_MEMBER_REMOVED: {
      const watch_model = await Watches.findOne({
        where: { id: notificationObj.target_id }
      });
      message = `${full_name} removed you from a watch: ${watch_model!.get('title')}`;
      mount_prop_key = 'watch';
      mount_value = watch_model!.toJSON();
      break;
    }

    case SAFESTAR_EVENT_TYPES.NEW_PULSE: {
      const pulse: IPulse | null = await get_pulse_by_id(notificationObj.target_id);
      message = `${full_name} sent out a pulse: ${pulse!.code}`;
      mount_prop_key = 'pulse';
      mount_value = pulse;
      break;
    }
    case SAFESTAR_EVENT_TYPES.NEW_PHOTO_PULSE: {
      const photo_pulse: IPhotoPulse | null = await get_photo_pulse_by_id(notificationObj.target_id);
      message = `${full_name} sent out a photo pulse: ${photo_pulse!.code}`;
      mount_prop_key = 'photo_pulse';
      mount_value = photo_pulse;
      break;
    }
    case SAFESTAR_EVENT_TYPES.NEW_USER_LOCATION_UPDATE: {
      message = `${full_name} updated their location`;
      mount_prop_key = 'user';
      mount_value = user_model!;
      break;
    }
    case SAFESTAR_EVENT_TYPES.NEW_TRACKER: {
      message = `${full_name} started tracking you`;
      mount_prop_key = 'user';
      mount_value = user_model!;
      break;
    }
    case SAFESTAR_EVENT_TYPES.NEW_CHECKPOINT: {
      message = `${full_name} wants to check on you`;
      mount_prop_key = 'user';
      mount_value = user_model!;
      break;
    }
    case SAFESTAR_EVENT_TYPES.NEW_CHECKPOINT_RESPONSE: {
      message = `${full_name} responded to your checkpoint`;
      mount_prop_key = 'user';
      mount_value = user_model!;
      break;
    }
    case SAFESTAR_EVENT_TYPES.NEW_TRACKER_REQUEST: {
      message = `${full_name} requested to track you`;
      mount_prop_key = 'user';
      mount_value = user_model!;
      break;
    }
    case SAFESTAR_EVENT_TYPES.NEW_TRACKER_REQUEST_CANCELED: {
      message = `${full_name} canceled their request to track you`;
      mount_prop_key = 'user';
      mount_value = user_model!;
      break;
    }
    case SAFESTAR_EVENT_TYPES.NEW_TRACKER_REQUEST_ACCEPTED: {
      message = `${full_name} accepted your request to track their location`;
      mount_prop_key = 'user';
      mount_value = user_model!;
      break;
    }
    case SAFESTAR_EVENT_TYPES.NEW_TRACKER_REQUEST_REJECTED: {
      message = `${full_name} rejected your request to track their location`;
      mount_prop_key = 'user';
      mount_value = user_model!;
      break;
    }
    case SAFESTAR_EVENT_TYPES.STOP_TRACKER: {
      message = `${full_name} stopped letting you track them`;
      mount_prop_key = 'user';
      mount_value = user_model!;
      break;
    }
    case SAFESTAR_EVENT_TYPES.STOP_TRACKING: {
      message = `${full_name} stopped tracking you`;
      mount_prop_key = 'user';
      mount_value = user_model!;
      break;
    }
  }

  notificationObj.from = user_model!;
  notificationObj.message = message;
  notificationObj[mount_prop_key] = mount_value;

  return notificationObj;
}

export const getUserFullName = (user: ISafestarUser) => {
  if (user) {
    const { firstname, middlename, lastname } = user;
    const middle = middlename
      ? ` ${middlename} `
      : ` `;

    const fullName = `${firstname}${middle}${lastname}`;
    return fullName;
  } else {
    return '';
  }
};

// export const getUserEventName = (you_id: number) => {
//   return `FOR-USER:${you_id}`;
// };

export function compareUserIdArgs(you_id: number, user_id: number) {
  if (!you_id || !user_id) {
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.BAD_REQUEST,
      error: true,
      info: {
        message: `you_id and user_id is required`
      }
    };
    return serviceMethodResults;
  }
  if (user_id === you_id) {
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.BAD_REQUEST,
      error: true,
      info: {
        message: `user_id is invalid: cannot be same as you_id`
      }
    };
    return serviceMethodResults;
  }

  const serviceMethodResults: ServiceMethodResults = {
    status: HttpStatusCode.OK,
    error: false,
    info: {
      message: `user_id is valid: it is not the same as you_id`
    }
  };
  return serviceMethodResults;
}

export function addDays(dateObj: Date, number_of_days: number) {
  const dat = new Date(dateObj.valueOf());
  dat.setDate(dat.getDate() + number_of_days);
  return dat;
}

export function backDays(dateObj: Date, number_of_days: number) {
  const dat = new Date(dateObj.valueOf());
  dat.setDate(dat.getDate() - number_of_days);
  return dat;
}

export function validateEmail(email: string) {
  if (!email) { return false; }
  if (email.constructor !== String) { return false; }
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email.toLowerCase());
}

export function validatePhone(phone?: string) {
  // https://stackoverflow.com/questions/4338267/validate-phone-number-with-javascript
  if (!phone) { return false; }
  if (typeof(phone) !== 'string') { return false; }
  const re = /^[\d]+$/;
  return re.test(phone.toLowerCase()) && (phone.length === 10 || phone.length === 11);
}

export function validateName(name: string) {
  if (!name) { return false; }
  if (name.constructor !== String) { return false; }
  const re = /^[a-zA-Z\'\-']{2,100}$/;
  return re.test(name.toLowerCase());
}

export function validateNumber(num: any) {
  if (num === null || num === undefined) { return false; }
  if (typeof(num) !== 'number') { return false; }
  if (isNaN(num) || num === Infinity || num === -Infinity) { return false; }
  if (num < 0) { return false; }
  return true;
}

export function validateGender(num: any) {
  if (num === null || num === undefined) { return false; }
  if (typeof(num) !== 'number') { return false; }
  if (isNaN(num) || num === Infinity || num === -Infinity) { return false; }
  if (![0, 1, 2].includes(num)) { return false; }
  return true;
}

export function validatePersonName(value: any): boolean {
  if (!value) { return false; }
  if (value.constructor !== String) { return false; }
  const re = /^[a-zA-Z\s\'\-\_\.]{2,50}$/;
  return re.test(value.toLowerCase());
}

export function validateDisplayName(value: any): boolean {
  if (!value) { return false; }
  if (value.constructor !== String) { return false; }
  const re = /^[a-zA-Z\s\'\-\_\.]{2,50}$/;
  return re.test(value.toLowerCase());
}

export function validateUsername(value: string): boolean {
  if (!value) { return false; }
  if (value.constructor !== String) { return false; }
  const re = /^[a-zA-Z0-9\-\_\.]{2,50}$/;
  return re.test(value.toLowerCase());
}

export function validateURL(value: any): boolean {
  if (!value) { return false; }
  if (value.constructor !== String) { return false; }
  const re = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  return re.test(value.toLowerCase());
}

export function validateInteger(value: any): boolean {
  if (!value) { return false; }
  if (value.constructor !== Number) { return false; }
  const re = /^[0-9]+$/;
  return re.test(value.toString());
}

export function validatePassword(password: string) {
  if (!password) { return false; }
  if (password.constructor !== String) { return false; }

  const hasMoreThanSixCharacters = password.length > 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonalphas = /\W/.test(password);

  return (
    hasMoreThanSixCharacters
    && (hasUpperCase || hasLowerCase)
    // && hasNumbers
  );
}

export const genericTextValidator = (arg: any) => !!arg && typeof(arg) === 'string' && (/^[a-zA-Z0-9\s\'\-\_\.\@\$\#]{3,250}/).test(arg);
export const phoneValidator = (arg: any) => !!arg && (/^[0-9]{10,15}$/).test(arg);
export const stringValidator = (arg: any) => typeof(arg) === 'string';
export const numberValidator = (arg: any) => typeof(arg) === 'number';
export const booleanValidator = (arg: any) => typeof(arg) === 'boolean';
export const notNullValidator = (arg: any) => arg !== null;

export function uniqueValue() {
  return String(Date.now()) +
    Math.random().toString(36).substr(2, 34) +
    Math.random().toString(36).substr(2, 34);
}

export function newJwtToken(
  request: Request,
  you: ISafestarUser,
  shouldDeleteOld: boolean
): string {
  // create JWT
  const jwt = <string> generateJWT(you);
  return jwt;
}

export function newUserJwtToken(you: ISafestarUser): string {
  // create JWT
  const jwt = <string> generateJWT(you);
  return jwt;
}

export function capitalize(str: string) {
  if (!str) {
    return '';
  } else if (str.length < 2) {
    return str.toUpperCase();
  }
  const Str = str.toLowerCase();
  const capitalized = Str.charAt(0).toUpperCase() + Str.slice(1);
  return capitalized;
}

export function getRandomIndex(array: any[]) {
  const badInput = !array || !array.length;
  if (badInput) {
    return null;
  }
  const indexList = array.map((item, index) => index);
  const randomIndex = Math.floor(Math.random() * indexList.length);
  const item = indexList[randomIndex];
  return item;
}

export function getRandomItem(array: any[]) {
  const badInput = !array || !array.length;
  if (badInput) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  const item = array[randomIndex];
  return item;
}

export function generateJWT(data: any) {
  try {
    const jwt_token = jwt_sign(data, (<string> process.env.JWT_SECRET));
    return jwt_token || null;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export function decodeJWT(token: any) {
  try {
    const data = jwt_verify(token, (<string> process.env.JWT_SECRET));
    return data;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export function AuthorizeJWT(
  request: Request,
  checkUrlYouIdMatch: boolean = true
): {
  error: boolean;
  status: HttpStatusCode;
  message: string;
  you?: ISafestarUser;
} {
  try {
    /* First, check Authorization header */
    const auth = request.get('Authorization');
    if (!auth) {
      return {
        error: true,
        status: HttpStatusCode.UNAUTHORIZED,
        message: `Request not authorized: missing Authorization header`
      };
    }
    const isNotBearerFormat = !(/Bearer\s[^]/).test(auth);
    if (isNotBearerFormat) {
      return {
        error: true,
        status: HttpStatusCode.UNAUTHORIZED,
        message: `Request not authorized: Authorization header must be Bearer format`
      };
    }

    /* Check token validity */
    const token = auth.split(' ')[1];
    let you;
    try {
      you = decodeJWT(token) || null;
    } catch (e) {
      console.log(e);
      you = null;
    }
    if (!you) {
      return {
        error: true,
        status: HttpStatusCode.UNAUTHORIZED,
        message: `Request not authorized: invalid token`
      };
    }

    /* Check if user id match the `you_id` path param IF checkUrlIdMatch = true */
    if (checkUrlYouIdMatch) {
      const you_id: number = parseInt(request.params.you_id, 10);
      const notYou: boolean = you_id !== (<ISafestarUser> you).id;
      if (notYou) {
        return {
          error: true,
          status: HttpStatusCode.UNAUTHORIZED,
          message: `Request not authorized: You are not permitted to complete this action`
        };
      }
    }

    /* Request is okay */
    return {
      error: false,
      status: HttpStatusCode.OK,
      message: `user authorized`,
      you: (<ISafestarUser> you),
    };
  } catch (error) {
    console.log(`auth jwt error:`, error);
    return {
      error: true,
      status: HttpStatusCode.INTERNAL_SERVER_ERROR,
      message: `Request auth failed...`
    };
  }
}

export const dev_origins = [
  // dev origins
  'http://localhost:8080',
  'http://localhost:7600',
  'http://localhost:9500',
  'http://localhost:4200',
];

export const prod_origins = [
  // prod origins
  'http://rmw-safestar-client.herokuapp.com',
  'https://rmw-safestar-client.herokuapp.com',
];

export const whitelist_domains = isProd
  ? prod_origins
  : dev_origins;

export const corsOptions: CorsOptions = {
  // https://expressjs.com/en/resources/middleware/cors.html
  credentials: true,
  optionsSuccessStatus: 200,
  origin(origin: string | undefined, callback: any) {
    const useOrigin = (origin || '');
    const originIsAllowed = whitelist_domains.includes(useOrigin);
    // console.log({
    //   origin,
    //   callback,
    //   originIsAllowed,
    //   whitelist_domains,
    // });

    if (originIsAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Origin "${origin}" Not allowed by CORS`));
    }
  }
};

export const corsMiddleware = cors(corsOptions);

export const validateData = (opts: {
  data: any,
  validators: IModelValidator[],
  mutateObj?: any
}): ServiceMethodResults => {
  const { data, validators, mutateObj } = opts;
  const dataObj: any = {};

  for (const prop of validators) {
    if (!data.hasOwnProperty(prop.field)) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `${prop.name} is required.`
        }
      };
      return serviceMethodResults;
    }
    const isValid: boolean = prop.validator(data[prop.field]);
    if (!isValid) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: prop.errorMessage ? (prop.errorMessage.startsWith(prop.name) ? prop.errorMessage : `${prop.name} ${prop.errorMessage}`) : `${prop.name} is invalid.`
        }
      };
      return serviceMethodResults;
    }
    
    dataObj[prop.field] = data[prop.field];
  }

  if (mutateObj) {
    Object.assign(mutateObj, dataObj);
  }

  const serviceMethodResults: ServiceMethodResults = {
    status: HttpStatusCode.OK,
    error: false,
    info: {
      message: `validation passed.`,
      data: dataObj,
    }
  };
  return serviceMethodResults;
}

export const validateAndUploadImageFile = async (
  image_file: UploadedFile | undefined,
  opts?: {
    treatNotFoundAsError: boolean,

    mutateObj?: PlainObject,
    id_prop?: string,
    link_prop?: string;
  }
): ServiceMethodAsyncResults => {
  if (!image_file) {
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.NOT_FOUND,
      error: opts && opts.hasOwnProperty('treatNotFoundAsError') ? opts.treatNotFoundAsError : true,
      info: {
        message: `No image file found/given`
      }
    };
    return serviceMethodResults;
  }

  const type = image_file.mimetype.split('/')[1];
  const isInvalidType = !allowedImages.includes(type);
  if (isInvalidType) {
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.BAD_REQUEST,
      error: true,
      info: {
        message: 'Invalid file type: jpg, jpeg or png required...'
      }
    };
    return serviceMethodResults;
  }
  const image_results = await store_image(image_file);
  if (!image_results.result) {
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.INTERNAL_SERVER_ERROR,
      error: true,
      info: {
        message: 'Could not upload file...',
        data: image_results
      }
    };
    return serviceMethodResults;
  }

  if (opts && opts.mutateObj && opts.id_prop && opts.link_prop) {
    opts.mutateObj[opts.id_prop] = image_results.result.public_id;
    opts.mutateObj[opts.link_prop] = image_results.result.secure_url;
  }

  const serviceMethodResults: ServiceMethodResults<{
    image_results: any,
    image_id: string,
    image_link: string,
  }> = {
    status: HttpStatusCode.OK,
    error: false,
    info: {
      data: {
        image_results,
        image_id: image_results.result.public_id,
        image_link: image_results.result.secure_url
      }
    }
  };
  return serviceMethodResults;
};

export const create_user_required_props: IModelValidator[] = [
  { field: `firstname`, name: `First Name`, validator: validateName, errorMessage: `must be: at least 2 characters, letters only`, },
  { field: `middlename`, name: `Middle Name`, validator: (arg: any) => !arg || validateName(arg), errorMessage: `must be: at least 2 characters, letters only`, },
  { field: `lastname`, name: `Last Name`, validator: validateName, errorMessage: `must be: at least 2 characters, letters only`, },
  { field: `username`, name: `Username`, validator: validateUsername, errorMessage: `must be: at least 2 characters, alphanumeric, dashes, underscores, periods` },
  { field: `email`, name: `Email`, validator: validateEmail, errorMessage: `is in bad format`, },
  { field: `password`, name: `Password`, validator: validatePassword, errorMessage: `Password must be: at least 7 characters, upper and/or lower case alphanumeric`, },
  { field: `confirmPassword`, name: `Confirm Password`, validator: validatePassword, errorMessage: `Confirm Password must be: at least 7 characters, upper and/or lower case alphanumeric`, },
];

export const VALID_RATINGS = new Set([1, 2, 3, 4, 5]);
export const create_rating_required_props: IModelValidator[] = [
  { field: `user_id`, name: `User Id`, validator: (arg: any) => numberValidator(arg) && parseInt(arg) > 0, errorMessage: `is required` },
  { field: `writer_id`, name: `Writer Id`, validator: (arg: any) => numberValidator(arg) && parseInt(arg) > 0, errorMessage: `is required` },
  { field: `rating`, name: `Rating`, validator: (arg: any) => numberValidator(arg) && VALID_RATINGS.has(parseInt(arg)), errorMessage: `must be 1-5` },
  { field: `title`, name: `Title`, validator: genericTextValidator, errorMessage: `must be: at least 3 characters, alphanumeric, dashes, underscores, periods, etc` },
  { field: `summary`, name: `Summary`, validator: genericTextValidator, errorMessage: `must be: at least 3 characters, alphanumeric, dashes, underscores, periods, etc` },
];

export const create_pulse_required_props: IModelValidator[] = [
  { field: `owner_id`, name: `Owner Id`, validator: (arg: any) => numberValidator(arg) && parseInt(arg) > 0, errorMessage: `is required` },
  { field: `lat`, name: `Latitude`, validator: numberValidator, errorMessage: `is required` },
  { field: `lng`, name: `Longitude`, validator: numberValidator, errorMessage: `is required` },
  { field: `code`, name: `Pulse Code`, validator: (arg: any) => genericTextValidator(arg) && SAFESTAR_PULSE_CODES_ALL.includes(arg), errorMessage: `is invalid` },
];
export const create_pulse_message_required_props: IModelValidator[] = [
  { field: `owner_id`, name: `Owner Id`, validator: (arg: any) => numberValidator(arg) && parseInt(arg) > 0, errorMessage: `is required` },
  { field: `pulse_id`, name: `Pulse Id`, validator: (arg: any) => numberValidator(arg) && parseInt(arg) > 0, errorMessage: `is required` },
  { field: `body`, name: `Body`, validator: genericTextValidator, errorMessage: `is required` },
];



export const check_model_args = async (opts: {
  model_id?: number,
  model?: Model,
  model_name?: string,
  get_model_fn: (id: number) => Promise<Model | null>
}) => {
  const { model_id, model, model_name, get_model_fn } = opts;
  const useName = model_name || 'model';

  if (!model_id && !model) {
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.BAD_REQUEST,
      error: true,
      info: {
        message: `${useName} id or model instance is required.`
      }
    };
    return serviceMethodResults;
  }
  const model_model: Model | null = model || await get_model_fn(model_id!);
  if (!model_model) {
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.NOT_FOUND,
      error: true,
      info: {
        message: `${useName} not found...`,
      }
    };
    return serviceMethodResults;
  }

  const serviceMethodResults: ServiceMethodResults = {
    status: HttpStatusCode.OK,
    error: false,
    info: {
      data: model_model,
    }
  };
  return serviceMethodResults;
};

export const createGenericServiceMethodError = (message: string, status?: HttpStatusCode, error?: any): ServiceMethodResults => {
  const serviceMethodResults: ServiceMethodResults = {
    status: HttpStatusCode.BAD_REQUEST,
    error: true,
    info: {
      message,
      error,
    }
  };
  return serviceMethodResults;
};

export const createGenericServiceMethodSuccess = <T = any> (message?: string, data?: T): ServiceMethodResults => {
  const serviceMethodResults: ServiceMethodResults<T> = {
    status: HttpStatusCode.OK,
    error: false,
    info: {
      message,
      data,
    }
  };
  return serviceMethodResults;
};

export const convertModel = <T> (model: Model | null) => {
  return model ? (<any> model.toJSON()) as T : null;
}

export const convertModels = <T> (models: Model[]) => {
  return models.map((model) => (<any> model.toJSON()) as T);
}

export const convertModelCurry = <T> () => (model: Model | null) => {
  return model ? (<any> model.toJSON()) as T : null;
}

export const convertModelsCurry = <T> () => (models: Model[]) => {
  return models.map((model) => (<any> model.toJSON()) as T);
}

export const get_distance_haversine_distance = (params: {
  from_lat: number;
  from_lng: number;
  to_lat: number;
  to_lng: number;
}) => {
  /*  
    https://developers.google.com/maps/documentation/distance-matrix/overview#DistanceMatrixRequests
    https://cloud.google.com/blog/products/maps-platform/how-calculate-distances-map-maps-javascript-api
  */
  var M = 3958.8; // Radius of the Earth in miles
  var K = 6371.0710; // Radius of the Earth in kilometers

  var rlat1 = params.from_lat * (Math.PI/180); // Convert degrees to radians
  var rlat2 = params.to_lat * (Math.PI/180); // Convert degrees to radians
  var difflat = rlat2-rlat1; // Radian difference (latitudes)
  var difflon = (params.to_lng - params.from_lng) * (Math.PI/180); // Radian difference (longitudes)

  var d = 2 * M * Math.asin(
    Math.sqrt(
      Math.sin(difflat/2) * Math.sin(difflat/2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon/2) * Math.sin(difflon/2)
    )
  );
  return d;
}