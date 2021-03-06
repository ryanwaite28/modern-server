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
import {
  IModelValidator,
  IUser,
  PlainObject
} from './interfaces/common.interface';
import { HttpStatusCode } from './enums/http-codes.enum';
import { Conversations } from './models/conversations.model';
import { Users } from './models/user.model';
import {
  COMMON_EVENT_TYPES,
  COMMON_USER_TYPES
} from './enums/common.enum';
import { ServiceMethodAsyncResults, ServiceMethodResults } from './types/common.types';
import { IUploadFile, store_image } from '../../cloudinary-manager';
import { UploadedFile } from 'express-fileupload';
import { IMyModel, MyModelStatic, MyModelStaticGeneric } from './models/common.model-types';
import { CreateOptions, DestroyOptions, FindOptions, UpdateOptions } from 'sequelize/types';
import { Model } from 'sequelize';


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



// https://www.predictiveindex.com/reference-profiles/
export const predictiveIndexProfilesList = [
  // Analytical profiles
  'Analyzer',
  'Controller',
  'Specialist',
  'Strategist',
  'Venturer',
  // Social profiles
  'Altruist',
  'Captain',
  'Collaborator',
  'Maverick',
  'Persuader',
  'Promoter',
  //Stabilizing profiles
  'Adapter',
  'Craftsman',
  'Guardian',
  'Operator',
  // Persistent profiles
  'Individualist',
  'Scholar',
];
// https://www.gallup.com/cliftonstrengths/en/253715/34-cliftonstrengths-themes.aspx
export const gallupStrengthsList = [
  // STRATEGIC THINKING
  'Analytical',
  'Context',
  'Futuristic',
  'Ideation',
  'Input',
  'Intellection',
  'Learner',
  'Strategic',
  // RELATIONSHIP BUILDING
  'Adaptability',
  'Connectedness',
  'Developer',
  'Empathy',
  'Harmony',
  'Includer',
  'Individualization',
  'Positivity',
  'Relator',
  // INFLUENCING
  'Activator',
  'Command',
  'Communication',
  'Competition',
  'Maximizer',
  'Self-Assurance',
  'Significance',
  'Woo',
  // EXECUTING
  'Achiever',
  'Arranger',
  'Belief',
  'Consistency',
  'Deliberative',
  'Discipline',
  'Focus',
  'Responsibility',
  'Restorative',
];
export const employmentTypes = [
  'Contractor',
  'Apprentice',
  'Intern',
  'Part-Time',
  'Full-Time',
];
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
  'displayname',
  'public',
  'can_message',
  'can_converse',
  'stripe_customer_account_id',
  'stripe_account_id',
  'stripe_account_verified',
  'platform_subscription_id',
  'can_converse',
  'email',
  'phone',
  'bio',
  'headline',
  'icon_link',
  'uuid',
  'created_at',
  'updated_at',
  'deleted_at',
];

// https://stackoverflow.com/questions/6903823/regex-for-youtube-id/6904504
export const youtube_regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;

export const user_attrs_med = [
  ...user_attrs_slim,
];

const isAppEnvSet: boolean = ('APP_ENV' in process.env);
const isDevEnv: boolean = isAppEnvSet && process.env.APP_ENV === "DEV";

export const isProd: boolean = (process.env.NODE_ENV === 'production') && !isDevEnv;

export const COMMON_STATUSES =  Object.freeze({
  PENDING: `PENDING`,
  CANCELED: `CANCELED`,
  ACCEPTED: `ACCEPTED`,
  DECLINED: `DECLINED`,
  OPEN: `OPEN`,
});

export const populate_common_notification_obj = async (notification_model: any) => {
  const notificationObj = notification_model.toJSON();
  const user_model = await Users.findOne({
    where: { id: notificationObj.from_id },
    attributes: user_attrs_slim
  });
  const full_name = getUserFullName(<IUser> user_model!.toJSON());
  let message = '';
  let mount_prop_key = '';
  let mount_value = null;

  switch (notificationObj.event) {
    case COMMON_EVENT_TYPES.CONVERSATION_MEMBER_ADDED: {
      const conversation_model = await Conversations.findOne({
        where: { id: notificationObj.target_id }
      });
      message = `${full_name} added you to a conversation: ${conversation_model!.get('title')}`;
      mount_prop_key = 'conversation';
      mount_value = conversation_model!.toJSON();
      break;
    }
    case COMMON_EVENT_TYPES.CONVERSATION_MEMBER_REMOVED: {
      const conversation_model = await Conversations.findOne({
        where: { id: notificationObj.target_id }
      });
      message = `${full_name} removed you from a conversation: ${conversation_model!.get('title')}`;
      mount_prop_key = 'conversation';
      mount_value = conversation_model!.toJSON();
      break;
    }
    case COMMON_EVENT_TYPES.NEW_FOLLOWER: {
      message = `${full_name} started following you`;
      mount_prop_key = 'user';
      mount_value = user_model!.toJSON();
      break;
    }
    case COMMON_EVENT_TYPES.NEW_UNFOLLOWER: {
      message = `${full_name} unfollowed you`;
      mount_prop_key = 'user';
      mount_value = user_model!.toJSON();
      break;
    }
  }

  notificationObj.from = user_model!.toJSON();
  notificationObj.message = message;
  notificationObj[mount_prop_key] = mount_value;

  return notificationObj;
}

export const getUserFullName = (user: IUser) => {
  if (user) {
    const { firstname, middlename, lastname } = user;
    const middle = middlename
      ? ` ${middlename} `
      : ` `;

    const displayName = `${firstname}${middle}${lastname}`;
    return displayName;
  } else {
    return '';
  }
};

// export const getUserEventName = (you_id: number) => {
//   return `FOR-USER:${you_id}`;
// };

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

export function validateCommonAccountType(type: string) {
  const isValid = type in COMMON_USER_TYPES;
  return isValid;
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

export const optionalValidatorCheck = (arg: any, fn: (arg: any) => boolean) => !arg || fn(arg);
export const requiredValidatorCheck = (arg: any, fn: (arg: any) => boolean) => !!arg && fn(arg);



export const genericTextValidator = (arg: any) => !!arg && typeof(arg) === 'string' && (/^[a-zA-Z0-9\s\'\-\_\.\@\$\#]{1,250}/).test(arg);
export const phoneValidator = (arg: any) => (/^[0-9]{10,15}$/).test(arg);
export const stringValidator = (arg: any) => typeof(arg) === 'string';
export const numberValidator = (arg: any) => typeof(arg) === 'number';
export const booleanValidator = (arg: any) => typeof(arg) === 'boolean';
export const dateObjValidator = (arg: any) => typeof(arg) === 'object' && arg.constructor === Date;
export const notNullValidator = (arg: any) => arg !== null;



export const optional_textValidator = (arg: any) => {
  console.log({ arg });
  return optionalValidatorCheck(arg, genericTextValidator);
};
export const required_textValidator = (arg: any) => requiredValidatorCheck(arg, genericTextValidator);

export const optional_emailValidator = (arg: any) => optionalValidatorCheck(arg, validateEmail);
export const required_emailValidator = (arg: any) => requiredValidatorCheck(arg, validateEmail);

export const optional_phoneValidator = (arg: any) => optionalValidatorCheck(arg, phoneValidator);
export const required_phoneValidator = (arg: any) => requiredValidatorCheck(arg, phoneValidator);

export const optional_stringValidator = (arg: any) => optionalValidatorCheck(arg, stringValidator);
export const required_stringValidator = (arg: any) => requiredValidatorCheck(arg, stringValidator);

export const optional_numberValidator = (arg: any) => optionalValidatorCheck(arg, numberValidator);
export const required_numberValidator = (arg: any) => requiredValidatorCheck(arg, numberValidator);

export const optional_booleanValidator = (arg: any) => optionalValidatorCheck(arg, booleanValidator);
export const required_booleanValidator = (arg: any) => requiredValidatorCheck(arg, booleanValidator);

export const optional_notNullValidator = (arg: any) => optionalValidatorCheck(arg, notNullValidator);
export const required_notNullValidator = (arg: any) => requiredValidatorCheck(arg, notNullValidator);



export const stripeValidators = Object.freeze({
  customerId: (arg: any) => !!arg && typeof(arg) === 'string' && (/^cus_[a-zA-Z0-9]{19,35}/).test(arg),
  paymentMethodId: (arg: any) => !!arg && typeof(arg) === 'string' && (/^pm_[a-zA-Z0-9]{19,35}/).test(arg),
});

export function uniqueValue() {
  return String(Date.now()) +
    Math.random().toString(36).substr(2, 34) +
    Math.random().toString(36).substr(2, 34);
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
  // console.log(`generateJWT:`, { data });
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
    // console.log(`decodeJWT:`, { data });
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
  you?: IUser;
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
      const notYou: boolean = you_id !== (<IUser> you).id;
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
      you: (<IUser> you),
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



export const whitelist_domains = process.env[`CORS_WHITELIST_ORIGINS`] ? process.env[`CORS_WHITELIST_ORIGINS`].split(',') : [];
console.log({ whitelist_domains });

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

export const validateData = (options: {
  data: any,
  validators: IModelValidator[],
  mutateObj?: any
}): ServiceMethodResults => {
  const { data, validators, mutateObj } = options;
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
          message: prop.errorMessage ? `${prop.name} ${prop.errorMessage}` : `${prop.name} is invalid.`
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
  options?: {
    treatNotFoundAsError: boolean,

    mutateObj?: PlainObject,
    id_prop?: string,
    link_prop?: string;
  }
): ServiceMethodAsyncResults => {
  if (!image_file) {
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.NOT_FOUND,
      error: options && options.hasOwnProperty('treatNotFoundAsError') ? options.treatNotFoundAsError : true,
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

  if (options && options.mutateObj && options.id_prop && options.link_prop) {
    options.mutateObj[options.id_prop] = image_results.result.public_id;
    options.mutateObj[options.link_prop] = image_results.result.secure_url;
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
  { field: `username`, name: `Username`, validator: validateUsername, errorMessage: `must be: at least 2 characters, alphanumeric, dashes, underscores, periods` },
  { field: `displayname`, name: `DisplayName`, validator: validateDisplayName, errorMessage: `must be: at least 2 characters, alphanumeric, dashes, underscores, periods, spaces`, },
  { field: `firstname`, name: `First Name`, validator: validateName, errorMessage: `must be: at least 2 characters, letters only`, },
  { field: `middlename`, name: `Middle Name`, validator: (arg: any) => !arg || validateName(arg), errorMessage: `must be: at least 2 characters, letters only`, },
  { field: `lastname`, name: `Last Name`, validator: validateName, errorMessage: `must be: at least 2 characters, letters only`, },
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


export const check_model_args = async (options: {
  model_id?: number,
  model?: IMyModel,
  model_name?: string,
  get_model_fn: (id: number) => Promise<IMyModel | null>
}) => {
  const { model_id, model, model_name, get_model_fn } = options;
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
  const model_model: IMyModel | null = model || await get_model_fn(model_id!);
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

export const convertModel = <T> (model: IMyModel | Model | null) => {
  return model ? (<any> model.toJSON()) as T : null;
}

export const convertModels = <T> (models: (IMyModel | Model)[]) => {
  return models.map((model) => (<any> model.toJSON()) as T);
}

export const convertModelCurry = <T> () => (model: IMyModel | Model | null) => {
  return model ? (<any> model.toJSON()) as T : null;
}

export const convertModelsCurry = <T> () => (models: (IMyModel | Model)[]) => {
  return models.map((model) => (<any> model.toJSON()) as T);
}




export const create_model_crud_repo_from_model_class = <T = any> (givenModelClass: MyModelStatic | Model) => {
  const convertTypeCurry = convertModelCurry<T>();
  const convertTypeListCurry = convertModelsCurry<T>();
  const modelClass = givenModelClass as MyModelStatic;

  const create = (createObj: any) => {
    const results = modelClass.create(createObj)
    .then((model: IMyModel) => {
      const converted = convertTypeCurry(model);
      return converted!;
    });
    return (results as any) as Promise<T>;
  };

  const findOne = (findOptions: FindOptions) => {
    const results = modelClass.findOne(findOptions)
    .then((model) => {
      const converted = convertTypeCurry(model);
      return converted;
    });
    return (results as any) as Promise<T | null>;
  };
  const findById = (id: number, findOptions?: FindOptions) => {
    const find = findOptions
      ? modelClass.findOne({ ...findOptions, where: { id }, })
      : modelClass.findOne({ where: { id } });

    const results = find.then((model) => {
      const converted = convertTypeCurry(model);
      return converted;
    });
    return (results as any) as Promise<T | null>;
  };
  const findAll = (findOptions: FindOptions) => {
    const results = modelClass.findAll(findOptions)
    .then((models) => {
      const converted = convertTypeListCurry(models);
      return converted;
    });
    return (results as any) as Promise<(T)[]>;
  };

  const update = (updateObj: any, options: UpdateOptions) => {
    const results = modelClass.update(updateObj, options)
    .then((updates) => {
      const converted = updates[1].map(convertTypeCurry); //(updates[1] && updateObj[1][0]);
      // return updates;
      const returnValue = [updates[0], converted] as [number, (T|null)[]];
      return returnValue;
    });
    return (results as any) as Promise<[number, (T | null)[]]>;
  };
  const updateById = (id: number, updateObj: any) => {
    const results = modelClass.update(updateObj, { where: { id }, returning: true })
    .then(async (updates: any) => {
      console.log(updates);
      const fresh = await findById(id);
      // return updates;
      const returnValue = [updates[0], fresh] as [number, (T|null)];
      return returnValue;
    });
    return (results as any) as Promise<[number, T | null]>;
  };

  const deleteFn = (destroyOptions: DestroyOptions) => {
    const results = modelClass.destroy(destroyOptions);
    return results;
  };
  const deleteById = (id: number) => {
    const results = modelClass.destroy({ where: { id } });
    return results;
  };

  return {
    create,
  
    findOne,
    findAll,
    findById,

    update,
    updateById,

    delete: deleteFn,
    deleteById,
  };
};