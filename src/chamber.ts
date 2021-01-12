import {
  Request,
  Response,
  NextFunction,
} from 'express';
import {
  CorsOptions
} from 'cors';
import {
  sign as jwt_sign,
  verify as jwt_verify
} from 'jsonwebtoken';
import {
  IUser
} from './interfaces/all.interface';
import { HttpStatusCode } from './enums/http-codes.enum';
import { Conversations } from './models/conversations.model';
import { Users } from './models/user.model';

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

export enum DURATIONS {
  SECOND = DURATION_1_SECOND,
  MINUTE = DURATION_1_MINUTE,
  HOUR = DURATION_1_HOUR,
  DAY = DURATION_1_DAY_FULL,
  WEEK = DURATION_1_WEEK,
}

export enum REACTIONS {
  LIKE = 1,
  DISLIKE,
  LOVE,
  CLAP,
  IDEA,
  CONFUSED,
  EXCITED,
  CARE,
  LAUGH,
  WOW,
  SAD,
  UPSET,
  FIRE,
  ONE_HUNDRED,
}

export enum REACTION_TYPES {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE',
  LOVE = 'LOVE',
  CLAP = 'CLAP',
  IDEA = 'IDEA',
  CONFUSED = 'CONFUSED',
  EXCITED = 'EXCITED',
  CARE = 'CARE',
  LAUGH = 'LAUGH',
  WOW = 'WOW',
  SAD = 'SAD',
  UPSET = 'UPSET',
  FIRE = 'FIRE',
  ONE_HUNDRED = 'ONE_HUNDRED',
}

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
  { code: "ab", name: "Abkhaz", nativeName: "аҧсуа" },
  { code: "aa", name: "Afar", nativeName: "Afaraf" },
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans" },
  { code: "ak", name: "Akan", nativeName: "Akan" },
  { code: "sq", name: "Albanian", nativeName: "Shqip" },
  { code: "am", name: "Amharic", nativeName: "አማርኛ" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "an", name: "Aragonese", nativeName: "Aragonés" },
  { code: "hy", name: "Armenian", nativeName: "Հայերեն" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া" },
  { code: "av", name: "Avaric", nativeName: "авар мацӀ, магӀарул мацӀ" },
  { code: "ae", name: "Avestan", nativeName: "avesta" },
  { code: "ay", name: "Aymara", nativeName: "aymar aru" },
  { code: "az", name: "Azerbaijani", nativeName: "azərbaycan dili" },
  { code: "bm", name: "Bambara", nativeName: "bamanankan" },
  { code: "ba", name: "Bashkir", nativeName: "башҡорт теле" },
  { code: "eu", name: "Basque", nativeName: "euskara, euskera" },
  { code: "be", name: "Belarusian", nativeName: "Беларуская" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "bh", name: "Bihari", nativeName: "भोजपुरी" },
  { code: "bi", name: "Bislama", nativeName: "Bislama" },
  { code: "bs", name: "Bosnian", nativeName: "bosanski jezik" },
  { code: "br", name: "Breton", nativeName: "brezhoneg" },
  { code: "bg", name: "Bulgarian", nativeName: "български език" },
  { code: "my", name: "Burmese", nativeName: "ဗမာစာ" },
  { code: "ca", name: "Catalan; Valencian", nativeName: "Català" },
  { code: "ch", name: "Chamorro", nativeName: "Chamoru" },
  { code: "ce", name: "Chechen", nativeName: "нохчийн мотт" },
  { code: "ny", name: "Chichewa; Chewa; Nyanja", nativeName: "chiCheŵa, chinyanja" },
  { code: "zh", name: "Chinese", nativeName: "中文 (Zhōngwén), 汉语, 漢語" },
  { code: "cv", name: "Chuvash", nativeName: "чӑваш чӗлхи" },
  { code: "kw", name: "Cornish", nativeName: "Kernewek" },
  { code: "co", name: "Corsican", nativeName: "corsu, lingua corsa" },
  { code: "cr", name: "Cree", nativeName: "ᓀᐦᐃᔭᐍᐏᐣ" },
  { code: "hr", name: "Croatian", nativeName: "hrvatski" },
  { code: "cs", name: "Czech", nativeName: "česky, čeština" },
  { code: "da", name: "Danish", nativeName: "dansk" },
  { code: "dv", name: "Divehi; Dhivehi; Maldivian;", nativeName: "ދިވެހި" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands, Vlaams" },
  { code: "en", name: "English", nativeName: "English" },
  { code: "eo", name: "Esperanto", nativeName: "Esperanto" },
  { code: "et", name: "Estonian", nativeName: "eesti, eesti keel" },
  { code: "ee", name: "Ewe", nativeName: "Eʋegbe" },
  { code: "fo", name: "Faroese", nativeName: "føroyskt" },
  { code: "fj", name: "Fijian", nativeName: "vosa Vakaviti" },
  { code: "fi", name: "Finnish", nativeName: "suomi, suomen kieli" },
  { code: "fr", name: "French", nativeName: "français, langue française" },
  { code: "ff", name: "Fula; Fulah; Pulaar; Pular", nativeName: "Fulfulde, Pulaar, Pular" },
  { code: "gl", name: "Galician", nativeName: "Galego" },
  { code: "ka", name: "Georgian", nativeName: "ქართული" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "el", name: "Greek, Modern", nativeName: "Ελληνικά" },
  { code: "gn", name: "Guaraní", nativeName: "Avañeẽ" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "ht", name: "Haitian; Haitian Creole", nativeName: "Kreyòl ayisyen" },
  { code: "ha", name: "Hausa", nativeName: "Hausa, هَوُسَ" },
  { code: "he", name: "Hebrew (modern)", nativeName: "עברית" },
  { code: "hz", name: "Herero", nativeName: "Otjiherero" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी, हिंदी" },
  { code: "ho", name: "Hiri Motu", nativeName: "Hiri Motu" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar" },
  { code: "ia", name: "Interlingua", nativeName: "Interlingua" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "ie", name: "Interlingue", nativeName: "Originally called Occidental; then Interlingue after WWII" },
  { code: "ga", name: "Irish", nativeName: "Gaeilge" },
  { code: "ig", name: "Igbo", nativeName: "Asụsụ Igbo" },
  { code: "ik", name: "Inupiaq", nativeName: "Iñupiaq, Iñupiatun" },
  { code: "io", name: "Ido", nativeName: "Ido" },
  { code: "is", name: "Icelandic", nativeName: "Íslenska" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "iu", name: "Inuktitut", nativeName: "ᐃᓄᒃᑎᑐᑦ" },
  { code: "ja", name: "Japanese", nativeName: "日本語 (にほんご／にっぽんご)" },
  { code: "jv", name: "Javanese", nativeName: "basa Jawa" },
  { code: "kl", name: "Kalaallisut, Greenlandic", nativeName: "kalaallisut, kalaallit oqaasii" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "kr", name: "Kanuri", nativeName: "Kanuri" },
  { code: "ks", name: "Kashmiri", nativeName: "कश्मीरी, كشميري‎" },
  { code: "kk", name: "Kazakh", nativeName: "Қазақ тілі" },
  { code: "km", name: "Khmer", nativeName: "ភាសាខ្មែរ" },
  { code: "ki", name: "Kikuyu, Gikuyu", nativeName: "Gĩkũyũ" },
  { code: "rw", name: "Kinyarwanda", nativeName: "Ikinyarwanda" },
  { code: "ky", name: "Kirghiz, Kyrgyz", nativeName: "кыргыз тили" },
  { code: "kv", name: "Komi", nativeName: "коми кыв" },
  { code: "kg", name: "Kongo", nativeName: "KiKongo" },
  { code: "ko", name: "Korean", nativeName: "한국어 (韓國語), 조선말 (朝鮮語)" },
  { code: "ku", name: "Kurdish", nativeName: "Kurdî, كوردی‎" },
  { code: "kj", name: "Kwanyama, Kuanyama", nativeName: "Kuanyama" },
  { code: "la", name: "Latin", nativeName: "latine, lingua latina" },
  { code: "lb", name: "Luxembourgish, Letzeburgesch", nativeName: "Lëtzebuergesch" },
  { code: "lg", name: "Luganda", nativeName: "Luganda" },
  { code: "li", name: "Limburgish, Limburgan, Limburger", nativeName: "Limburgs" },
  { code: "ln", name: "Lingala", nativeName: "Lingála" },
  { code: "lo", name: "Lao", nativeName: "ພາສາລາວ" },
  { code: "lt", name: "Lithuanian", nativeName: "lietuvių kalba" },
  { code: "lu", name: "Luba-Katanga", nativeName: "" },
  { code: "lv", name: "Latvian", nativeName: "latviešu valoda" },
  { code: "gv", name: "Manx", nativeName: "Gaelg, Gailck" },
  { code: "mk", name: "Macedonian", nativeName: "македонски јазик" },
  { code: "mg", name: "Malagasy", nativeName: "Malagasy fiteny" },
  { code: "ms", name: "Malay", nativeName: "bahasa Melayu, بهاس ملايو‎" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "mt", name: "Maltese", nativeName: "Malti" },
  { code: "mi", name: "Māori", nativeName: "te reo Māori" },
  { code: "mr", name: "Marathi (Marāṭhī)", nativeName: "मराठी" },
  { code: "mh", name: "Marshallese", nativeName: "Kajin M̧ajeļ" },
  { code: "mn", name: "Mongolian", nativeName: "монгол" },
  { code: "na", name: "Nauru", nativeName: "Ekakairũ Naoero" },
  { code: "nv", name: "Navajo, Navaho", nativeName: "Diné bizaad, Dinékʼehǰí" },
  { code: "nb", name: "Norwegian Bokmål", nativeName: "Norsk bokmål" },
  { code: "nd", name: "North Ndebele", nativeName: "isiNdebele" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली" },
  { code: "ng", name: "Ndonga", nativeName: "Owambo" },
  { code: "nn", name: "Norwegian Nynorsk", nativeName: "Norsk nynorsk" },
  { code: "no", name: "Norwegian", nativeName: "Norsk" },
  { code: "ii", name: "Nuosu", nativeName: "ꆈꌠ꒿ Nuosuhxop" },
  { code: "nr", name: "South Ndebele", nativeName: "isiNdebele" },
  { code: "oc", name: "Occitan", nativeName: "Occitan" },
  { code: "oj", name: "Ojibwe, Ojibwa", nativeName: "ᐊᓂᔑᓈᐯᒧᐎᓐ" },
  { code: "cu", name: "Old Church Slavonic, Church Slavic, Church Slavonic, Old Bulgarian, Old Slavonic", nativeName: "ѩзыкъ словѣньскъ" },
  { code: "om", name: "Oromo", nativeName: "Afaan Oromoo" },
  { code: "or", name: "Oriya", nativeName: "ଓଡ଼ିଆ" },
  { code: "os", name: "Ossetian, Ossetic", nativeName: "ирон æвзаг" },
  { code: "pa", name: "Panjabi, Punjabi", nativeName: "ਪੰਜਾਬੀ, پنجابی‎" },
  { code: "pi", name: "Pāli", nativeName: "पाऴि" },
  { code: "fa", name: "Persian", nativeName: "فارسی" },
  { code: "pl", name: "Polish", nativeName: "polski" },
  { code: "ps", name: "Pashto, Pushto", nativeName: "پښتو" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "qu", name: "Quechua", nativeName: "Runa Simi, Kichwa" },
  { code: "rm", name: "Romansh", nativeName: "rumantsch grischun" },
  { code: "rn", name: "Kirundi", nativeName: "kiRundi" },
  { code: "ro", name: "Romanian, Moldavian, Moldovan", nativeName: "română" },
  { code: "ru", name: "Russian", nativeName: "русский язык" },
  { code: "sa", name: "Sanskrit (Saṁskṛta)", nativeName: "संस्कृतम्" },
  { code: "sc", name: "Sardinian", nativeName: "sardu" },
  { code: "sd", name: "Sindhi", nativeName: "सिन्धी, سنڌي، سندھی‎" },
  { code: "se", name: "Northern Sami", nativeName: "Davvisámegiella" },
  { code: "sm", name: "Samoan", nativeName: "gagana faa Samoa" },
  { code: "sg", name: "Sango", nativeName: "yângâ tî sängö" },
  { code: "sr", name: "Serbian", nativeName: "српски језик" },
  { code: "gd", name: "Scottish Gaelic; Gaelic", nativeName: "Gàidhlig" },
  { code: "sn", name: "Shona", nativeName: "chiShona" },
  { code: "si", name: "Sinhala, Sinhalese", nativeName: "සිංහල" },
  { code: "sk", name: "Slovak", nativeName: "slovenčina" },
  { code: "sl", name: "Slovene", nativeName: "slovenščina" },
  { code: "so", name: "Somali", nativeName: "Soomaaliga, af Soomaali" },
  { code: "st", name: "Southern Sotho", nativeName: "Sesotho" },
  { code: "es", name: "Spanish; Castilian", nativeName: "español, castellano" },
  { code: "su", name: "Sundanese", nativeName: "Basa Sunda" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili" },
  { code: "ss", name: "Swati", nativeName: "SiSwati" },
  { code: "sv", name: "Swedish", nativeName: "svenska" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "tg", name: "Tajik", nativeName: "тоҷикӣ, toğikī, تاجیکی‎" },
  { code: "th", name: "Thai", nativeName: "ไทย" },
  { code: "ti", name: "Tigrinya", nativeName: "ትግርኛ" },
  { code: "bo", name: "Tibetan Standard, Tibetan, Central", nativeName: "བོད་ཡིག" },
  { code: "tk", name: "Turkmen", nativeName: "Türkmen, Түркмен" },
  { code: "tl", name: "Tagalog", nativeName: "Wikang Tagalog, ᜏᜒᜃᜅ᜔ ᜆᜄᜎᜓᜄ᜔" },
  { code: "tn", name: "Tswana", nativeName: "Setswana" },
  { code: "to", name: "Tonga (Tonga Islands)", nativeName: "faka Tonga" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "ts", name: "Tsonga", nativeName: "Xitsonga" },
  { code: "tt", name: "Tatar", nativeName: "татарча, tatarça, تاتارچا‎" },
  { code: "tw", name: "Twi", nativeName: "Twi" },
  { code: "ty", name: "Tahitian", nativeName: "Reo Tahiti" },
  { code: "ug", name: "Uighur, Uyghur", nativeName: "Uyƣurqə, ئۇيغۇرچە‎" },
  { code: "uk", name: "Ukrainian", nativeName: "українська" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
  { code: "uz", name: "Uzbek", nativeName: "zbek, Ўзбек, أۇزبېك‎" },
  { code: "ve", name: "Venda", nativeName: "Tshivenḓa" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "vo", name: "Volapük", nativeName: "Volapük" },
  { code: "wa", name: "Walloon", nativeName: "Walon" },
  { code: "cy", name: "Welsh", nativeName: "Cymraeg" },
  { code: "wo", name: "Wolof", nativeName: "Wollof" },
  { code: "fy", name: "Western Frisian", nativeName: "Frysk" },
  { code: "xh", name: "Xhosa", nativeName: "isiXhosa" },
  { code: "yi", name: "Yiddish", nativeName: "ייִדיש" },
  { code: "yo", name: "Yoruba", nativeName: "Yorùbá" },
  { code: "za", name: "Zhuang, Chuang", nativeName: "Saɯ cueŋƅ, Saw cuengh" }
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

export enum PREMIUM_SUBSCRIPTIONS {
  MULTI_BUSINESS_PLANS = 'MULTI_BUSINESS_PLANS',
  BACKGROUND_MARKETING = 'BACKGROUND_MARKETING',
}

export enum NOTIFICATION_TARGET_TYPES {
  RESOURCE = 'RESOURCE',
  CLIQUE = 'CLIQUE',
  BUSINESS = 'BUSINESS',
  BUSINESS_PLAN = 'BUSINESS_PLAN',
  MESSAGING = 'MESSAGING',
  MESSAGE = 'MESSAGE',
  CONVERSATION = 'CONVERSATION',
}

export enum SUBSCRIPTION_TARGET_ACTIONS {
  
}

export enum SUBSCRIPTION_TARGET_ACTIONS_INFO {
  
}

export enum SUBSCRIPTION_TARGET_FREQ {
  INSTANT = 'INSTANT',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum EVENT_TYPES {
  NEW_MESSAGE = 'NEW_MESSAGE',
  NEW_MESSAGING = 'NEW_MESSAGING',
  NEW_FOLLOWER = 'NEW_FOLLOWER',
  NEW_UNFOLLOWER = 'NEW_UNFOLLOWER',
  NEW_CONVERSATION = 'NEW_CONVERSATION',
  NEW_CONVERSATION_MESSAGE = 'NEW_CONVERSATION_MESSAGE',
  CONVERSATION_MEMBER_ADDED = 'CONVERSATION_MEMBER_ADDED',
  CONVERSATION_MEMBER_REMOVED = 'CONVERSATION_MEMBER_REMOVED',
  CONVERSATION_MEMBER_LEFT = 'CONVERSATION_MEMBER_LEFT',
  NEW_CLIQUE = 'NEW_CLIQUE',
  CLIQUE_MEMBER_REQUEST = 'CLIQUE_MEMBER_REQUEST',
  CLIQUE_MEMBER_CANCEL = 'CLIQUE_MEMBER_CANCEL',
  CLIQUE_MEMBER_ACCEPT = 'CLIQUE_MEMBER_ACCEPT',
  CLIQUE_MEMBER_DECLINE = 'CLIQUE_MEMBER_DECLINE',
  CLIQUE_MEMBER_ADDED = 'CLIQUE_MEMBER_ADDED',
  CLIQUE_MEMBER_REMOVED = 'CLIQUE_MEMBER_REMOVED',
  CLIQUE_MEMBER_LEFT = 'CLIQUE_MEMBER_LEFT',
  NEW_BUSINESS_INTEREST = 'NEW_BUSINESS_INTEREST',
  BUSINESS_UNINTEREST = 'BUSINESS_UNINTEREST',
  NEW_CLIQUE_INTEREST = 'NEW_CLIQUE_INTEREST',
  CLIQUE_UNINTEREST = 'CLIQUE_UNINTEREST',
  NEW_RESOURCE_INTEREST = 'NEW_RESOURCE_INTEREST',
  RESOURCE_UNINTEREST = 'RESOURCE_UNINTEREST',
  NEW_BUSINESS_PLAN_INTEREST = 'NEW_BUSINESS_PLAN_INTEREST',
  BUSINESS_PLAN_UNINTEREST = 'BUSINESS_PLAN_UNINTEREST',
  MESSAGE_TYPING = 'MESSAGE_TYPING',
  MESSAGE_TYPING_STOPPED = 'MESSAGE_TYPING_STOPPED',
  CONVERSATION_MESSAGE_TYPING = 'CONVERSATION_MESSAGE_TYPING',
  CONVERSATION_MESSAGE_TYPING_STOPPED = 'CONVERSATION_MESSAGE_TYPING_STOPPED',
  CONVERSATION_UPDATED = 'CONVERSATION_UPDATED',
  CONVERSATION_DELETED = 'CONVERSATION_DELETED',
  CLIQUE_UPDATED = 'CLIQUE_UPDATED',
  CLIQUE_DELETED = 'CLIQUE_DELETED',
  CONNECTION_REQUEST = 'CONNECTION_REQUEST',
  CONNECTION_CANCEL = 'CONNECTION_CANCEL',
  CONNECTION_ACCEPT = 'CONNECTION_ACCEPT',
  CONNECTION_DECLINE = 'CONNECTION_DECLINE',
  CONNECTION_BROKEN = 'CONNECTION_BROKEN',
}

export enum CRON_JOB_TYPES {
  UNSUSCRIBE_PREMIUM = 'UNSUSCRIBE_PREMIUM',
}

export enum USER_TYPES {
  ENTREPRENEUR = 'ENTREPRENEUR',
  INVESTOR = 'INVESTOR',
  PARTNER = 'PARTNER',
}

export enum RESOURCE_TYPES {
  BOOK = 'BOOK',
  VIDEO = 'VIDEO',
  EVENT = 'EVENT',
  ARTICLE = 'ARTICLE',
  WEBSITE = 'WEBSITE',
  PERSON = 'PERSON',
  OTHER = 'OTHER',
}

export const isProd: boolean = process.env.NODE_ENV === 'production';

export const populate_notification_obj = async (notification_model: any) => {
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
    case EVENT_TYPES.CONVERSATION_MEMBER_ADDED: {
      const conversation_model = await Conversations.findOne({
        where: { id: notificationObj.target_id }
      });
      message = `${full_name} added you to a conversation: ${conversation_model!.get('title')}`;
      mount_prop_key = 'conversation';
      mount_value = conversation_model!.toJSON();
      break;
    }
    case EVENT_TYPES.CONVERSATION_MEMBER_REMOVED: {
      const conversation_model = await Conversations.findOne({
        where: { id: notificationObj.target_id }
      });
      message = `${full_name} removed you from a conversation: ${conversation_model!.get('title')}`;
      mount_prop_key = 'conversation';
      mount_value = conversation_model!.toJSON();
      break;
    }
    case EVENT_TYPES.NEW_FOLLOWER: {
      message = `${full_name} started following you`;
      mount_prop_key = 'user';
      mount_value = user_model!.toJSON();
      break;
    }
    // case EVENT_TYPES.NEW_MESSAGE: {
      
    // }

    case EVENT_TYPES.CONNECTION_REQUEST: {
      message = `${full_name} wants to connect with you`;
      mount_prop_key = 'user';
      mount_value = user_model!.toJSON();
      break;
    }
    case EVENT_TYPES.CONNECTION_CANCEL: {
      message = `${full_name} canceled their connection request to you`;
      mount_prop_key = 'user';
      mount_value = user_model!.toJSON();
      break;
    }
    case EVENT_TYPES.CONNECTION_ACCEPT: {
      message = `${full_name} has accepted your connection request`;
      mount_prop_key = 'user';
      mount_value = user_model!.toJSON();
      break;
    }
    case EVENT_TYPES.CONNECTION_DECLINE: {
      message = `${full_name} has declined your connection request`;
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

export function validateName(name: string) {
  if (!name) { return false; }
  if (name.constructor !== String) { return false; }
  const re = /^[a-zA-Z]{2,}$/;
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

export function validateAccountType(type: string) {
  const isValid = type in USER_TYPES;
  return isValid;
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
      const user_id: number = parseInt(request.params.you_id, 10);
      const notYou: boolean = user_id !== (<IUser> you).id;
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

export const dev_origins = [
  // dev origins
  'http://localhost:8080',
  'http://localhost:7600',
  'http://localhost:9500',
  'http://localhost:4200',
];

export const prod_origins = [
  // prod origins
  'http://rmw-hotspot-client.herokuapp.com',
  'https://rmw-hotspot-client.herokuapp.com',
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
