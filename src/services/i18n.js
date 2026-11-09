// Multilingual Translation Service for SETU (Smart Education & Technical Innovation Portal)
// Supports English (EN), Hindi (HI - हिंदी), and Santhali (SAT - ᱥᱟᱱᱛᱟᱲᱤ)

const TRANSLATIONS = {
  EN: {
    // Nav & Common
    govTag: 'Government of Jharkhand • Dept. of Higher & Technical Education',
    platformName: 'SETU',
    sihTag: 'SIH 26043',
    home: 'Home',
    submitChallenge: 'Submit Challenge',
    exploreIssues: 'Explore Issues',
    universityHub: 'University Hub',
    industryCsr: 'Industry & CSR',
    stateAnalytics: 'State Analytics',
    portalLogin: 'Portal Login',
    signOut: 'Sign Out',
    reducedMotion: 'Reduced Motion',
    motionOff: 'Motion Off',

    // Hero Section
    heroTitleLine1: 'Transforming Jharkhand’s',
    heroTitleLine2: 'Societal Challenges into',
    heroTitleHighlight: 'University Innovation.',
    heroSubtitle: 'A digital platform connecting citizens, local bodies across 24 districts with Higher Education Institutions (BIT Mesra, NIT Jamshedpur, IIT-ISM Dhanbad) and Industry CSR leaders for AI-classified, demand-driven problem solving.',
    btnSubmitChallenge: 'Submit Societal Challenge',
    btnExploreLive: 'Explore Live Projects',
    pulseTitle: 'Jharkhand Ecosystem Live Pulse',
    nepTag: 'NEP 2020 Aligned',
    statCrowdsourced: '1,480+',
    labelCrowdsourced: 'Challenges Crowdsourced',
    statHeis: '48 HEIs',
    labelHeis: 'Universities & Labs',
    statCsr: '₹14.5 Cr',
    labelCsr: 'Industry CSR Pledged',
    statPatents: '38 Patents',
    labelPatents: 'Startups & IP Filed',
    districtsActive: '24 Districts Active (Dumka, Ranchi, Dhanbad...)',
    watchFlow: 'Watch Platform Flow',

    // Intake & Chat
    chatHeaderTitle: 'SETU AI Societal Problem Intake & Intelligence Radar',
    chatHeaderSub: 'Crowdsource local challenges across Jharkhand for HEI R&D and Industry CSR funding',
    chatPlaceholder: 'Describe the problem in your locality (e.g. fluoride contamination in Dumka water, cold storage in Khunti)...',
    btnSubmitIssue: 'Submit Challenge for AI Deduplication',
    selectDistrict: 'Select District',
    selectDomain: 'Select Domain Sector',

    // Issue Explorer
    explorerTitle: 'Live Societal Challenges Gallery',
    explorerSub: 'Filter verified problems submitted by citizens across Jharkhand districts and track HEI matching status.',
    searchPlaceholder: 'Search challenges by keyword, district, or keyword...',

    // University Hub
    univTitle: 'University R&D & Multidisciplinary Hub',
    univSub: 'Faculty members, PhD scholars, and undergraduate teams build prototypes for verified Jharkhand challenges with NEP 2020 credits.',

    // Footer
    footerGovt: 'Government of Jharkhand',
    footerDept: 'Department of Higher & Technical Education',
    footerCopyright: '© 2026 SETU Portal. Smart India Hackathon PS ID 26043. Team codemasts.'
  },

  HI: {
    // Nav & Common
    govTag: 'झारखंड सरकार • उच्च एवं तकनीकी शिक्षा विभाग',
    platformName: 'सेतु (SETU)',
    sihTag: 'एसआईएच 26043',
    home: 'मुख्य पृष्ठ',
    submitChallenge: 'चुनौती दर्ज करें',
    exploreIssues: 'समस्याएं देखें',
    universityHub: 'विश्वविद्यालय केंद्र',
    industryCsr: 'उद्योग एवं सीएसआर',
    stateAnalytics: 'राज्य विश्लेषण',
    portalLogin: 'पोर्टल लॉगिन',
    signOut: 'साइन आउट',
    reducedMotion: 'कम मोशन',
    motionOff: 'मोशन बंद',

    // Hero Section
    heroTitleLine1: 'झारखंड की सामाजिक',
    heroTitleLine2: 'चुनौतियों का',
    heroTitleHighlight: 'विश्वविद्यालयी समाधान।',
    heroSubtitle: 'एक डिजिटल प्लेटफॉर्म जो 24 जिलों के नागरिकों, पंचायती राज संस्थाओं को उच्च शिक्षण संस्थानों (बीआईटी मेसरा, एनआईटी जमशेदपुर, आईआईटी-आईएसएम धनबाद) और उद्योग सीएसआर से जोड़ता है।',
    btnSubmitChallenge: 'सामाजिक चुनौती दर्ज करें',
    btnExploreLive: 'लाइव प्रोजेक्ट्स देखें',
    pulseTitle: 'झारखंड पारिस्थितिकी तंत्र लाइव स्थिति',
    nepTag: 'एनईपी 2020 संरेखित',
    statCrowdsourced: '1,480+',
    labelCrowdsourced: 'क्राउडसोर्स्ड चुनौतियां',
    statHeis: '48 एचईआई',
    labelHeis: 'विश्वविद्यालय और प्रयोगशालाएं',
    statCsr: '₹14.5 करोड़',
    labelCsr: 'उद्योग सीएसआर वित्तपोषण',
    statPatents: '38 पेटेंट',
    labelPatents: 'स्टार्टअप और आईपी पंजीकृत',
    districtsActive: '24 जिले सक्रिय (दुमका, रांची, धनबाद...)',
    watchFlow: 'प्लेटफॉर्म प्रक्रिया देखें',

    // Intake & Chat
    chatHeaderTitle: 'सेतु एआई सामाजिक समस्या दर्ज और विश्लेषण केंद्र',
    chatHeaderSub: 'विश्वविद्यालय अनुसंधान और उद्योग सीएसआर फंडिंग के लिए झारखंड भर से स्थानीय समस्याओं का संकलन',
    chatPlaceholder: 'अपने क्षेत्र की समस्या का वर्णन करें (उदा. दुमका में फ्लोराइड युक्त पानी, खूंटी में कोल्ड स्टोरेज)...',
    btnSubmitIssue: 'एआई डिडुप्लीकेशन के लिए चुनौती दर्ज करें',
    selectDistrict: 'जिला चुनें',
    selectDomain: 'क्षेत्र चुनें',

    // Issue Explorer
    explorerTitle: 'लाइव सामाजिक चुनौती दीर्घा',
    explorerSub: 'झारखंड के जिलों से नागरिकों द्वारा दर्ज सत्यापित समस्याओं को फ़िल्टर करें और विश्वविद्यालय मिलान स्थिति ट्रैक करें।',
    searchPlaceholder: 'कीवर्ड, जिला या क्षेत्र द्वारा चुनौतियां खोजें...',

    // University Hub
    univTitle: 'विश्वविद्यालय आरएंडडी और बहुविषयक केंद्र',
    univSub: 'संकाय सदस्य, शोधार्थी और छात्र एनईपी 2020 क्रेडिट के साथ झारखंड की सत्यापित समस्याओं के लिए प्रोटोटाइप बनाते हैं।',

    // Footer
    footerGovt: 'झारखंड सरकार',
    footerDept: 'उच्च एवं तकनीकी शिक्षा विभाग',
    footerCopyright: '© 2026 सेतु पोर्टल। स्मार्ट इंडिया हैकाथॉन पीएस आईडी 26043। टीम कोडमास्ट्स।'
  },

  SAT: {
    // Nav & Common
    govTag: 'ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱥᱚᱨᱠᱟᱨ • ᱪᱮᱛᱟᱱ ᱟᱨ ᱛᱟᱠᱱᱤᱠᱤ ᱥᱤᱠᱷᱱᱟᱹᱛ ᱵᱤᱵᱷᱟᱜᱽ',
    platformName: 'ᱥᱮᱛᱩ (SETU)',
    sihTag: 'SIH 26043',
    home: 'ᱳᱲᱟᱜ',
    submitChallenge: 'ᱮᱴᱠᱮᱴᱚᱬᱮ ᱮᱢ',
    exploreIssues: 'ᱮᱴᱠᱮᱴᱚᱬᱮ ᱧᱮᱞ',
    universityHub: 'ᱵᱤᱨᱫᱟᱹᱜᱟᱲ ᱠᱮᱱᱫᱽᱨᱚ',
    industryCsr: 'ᱤᱱᱰᱚᱥᱴᱨᱤ ᱟᱨ CSR',
    stateAnalytics: 'ᱯᱚᱱᱚᱛ ᱞᱮᱠᱷᱟ',
    portalLogin: 'ᱯᱳᱨᱴᱟᱞ ᱞᱚᱜᱤᱱ',
    signOut: 'ᱳᱰᱳᱠ',
    reducedMotion: 'ᱠᱚᱢ ᱢᱳᱥᱚᱱ',
    motionOff: 'ᱢᱳᱥᱚᱱ ᱵᱚᱱᱫᱚ',

    // Hero Section
    heroTitleLine1: 'ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱨᱮᱱᱟᱜ',
    heroTitleLine2: 'ᱥᱟᱶᱛᱟ ᱮᱴᱠᱮᱴᱚᱬᱮ',
    heroTitleHighlight: 'ᱵᱤᱨᱫᱟᱹᱜᱟᱲ ᱥᱚᱞᱦᱮ᱾',
    heroSubtitle: '᱒᱔ ᱜᱚᱴᱟᱝ ᱡᱤᱞᱟᱹ ᱨᱮᱱ ᱱᱟᱜᱚᱨᱤᱠ ᱟᱨ ᱵᱤᱨᱫᱟᱹᱜᱟᱲ (BIT Mesra, NIT Jamshedpur, IIT-ISM Dhanbad) ᱟᱨ CSR ᱜᱟᱶᱛᱟ ᱠᱚ ᱡᱚᱲᱟᱣ ᱞᱟᱹᱜᱤᱫ ᱰᱤᱡᱤᱴᱟᱞ ᱯᱞᱮᱴᱯᱷᱚᱨᱢ᱾',
    btnSubmitChallenge: 'ᱥᱟᱶᱛᱟ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱮᱢ',
    btnExploreLive: 'ᱞᱟᱭᱤᱵᱽ ᱯᱨᱳᱡᱮᱠᱴ ᱧᱮᱞ',
    pulseTitle: 'ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱞᱟᱭᱤᱵᱽ ᱯᱟᱞᱥ',
    nepTag: 'NEP 2020 ᱥᱟᱶ',
    statCrowdsourced: '᱑,᱔᱘᱐+',
    labelCrowdsourced: 'ᱮᱴᱠᱮᱴᱚᱬᱮ ᱠᱚ ᱮᱢ ᱟᱠᱟᱱᱟ',
    statHeis: '᱔᱘ HEIs',
    labelHeis: 'ᱵᱤᱨᱫᱟᱹᱜᱟᱲ ᱟᱨ ᱞᱮᱵᱽ',
    statCsr: '₹᱑᱔.᱕ ᱠᱳᱴᱤ',
    labelCsr: 'CSR ᱴᱟᱠᱟ',
    statPatents: '᱓᱘ ᱯᱮᱴᱮᱱᱴ',
    labelPatents: 'ᱥᱴᱟᱨᱴᱚᱯ ᱟᱨ IP',
    districtsActive: '᱒᱔ ᱡᱤᱞᱟᱹ ᱪᱟᱹᱞᱩ (ᱫᱩᱢᱠᱟ, ᱨᱟᱺᱪᱤ, ᱫᱷᱟᱱᱵᱟᱫᱽ...)',
    watchFlow: 'ᱯᱞᱮᱴᱯᱷᱚᱨᱢ ᱧᱮᱞ',

    // Intake & Chat
    chatHeaderTitle: 'ᱥᱮᱛᱩ AI ᱥᱟᱶᱛᱟ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱧᱟᱢ ᱟᱨ ᱞᱮᱠᱷᱟ',
    chatHeaderSub: 'ᱵᱤᱨᱫᱟᱹᱜᱟᱲ रिसर्च ᱟᱨ CSR ᱴᱟᱠᱟ ᱞᱟᱹᱜᱤᱫ ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱨᱮᱱᱟᱜ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱥᱟᱵ',
    chatPlaceholder: 'ᱟᱢᱟᱜ ᱟᱹᱛᱩ/ᱴᱚᱞᱟ ᱨᱮᱱᱟᱜ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱞᱟᱹᱭ ᱢᱮ...',
    btnSubmitIssue: 'AI ᱛᱮ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱮᱢ',
    selectDistrict: 'ᱡᱤᱞᱟᱹ ᱪᱟ line',
    selectDomain: 'ᱠᱟᱹᱢᱤ ᱴᱚᱴᱷᱟ ᱪᱟ line',

    // Issue Explorer
    explorerTitle: 'ᱞᱟᱭᱤᱵᱽ ᱥᱟᱶᱛᱟ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱜᱮᱞᱟᱨᱤ',
    explorerSub: 'ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱡᱤᱞᱟᱹ ᱨᱮᱱᱟᱜ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱠᱚ ᱯᱷᱤᱞᱴᱚᱨ ᱢᱮ᱾',
    searchPlaceholder: 'ᱠᱤᱣᱚᱨᱰ ᱵᱟᱝᱢᱟ ᱡᱤᱞᱟᱹ ᱛᱮ ᱥᱮᱸᱫᱽᱨᱟᱭ ᱢᱮ...',

    // University Hub
    univTitle: 'ᱵᱤᱨᱫᱟᱹᱜᱟᱲ R&D ᱟᱨ ᱴᱤᱢ',
    univSub: 'NEP 2020 ᱠᱨᱮᱰᱤᱴ ᱥᱟᱶ ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱨᱮᱱᱟᱜ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱥᱚᱞᱦᱮ ᱢᱮ᱾',

    // Footer
    footerGovt: 'ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱥᱚᱨᱠᱟᱨ',
    footerDept: 'ᱪᱮᱛᱟᱱ ᱟᱨ ᱛᱟᱠᱱᱤᱠᱤ ᱥᱤᱠᱷᱱᱟᱹᱛ ᱵᱤᱵᱷᱟᱜᱽ',
    footerCopyright: '© ᱒᱐᱒᱖ ᱥᱮᱛᱩ ᱯᱳᱨᱴᱟᱞ᱾ SIH 26043. ᱴᱤᱢ codemasts.'
  }
};

let currentLang = 'EN';

export function getLanguage() {
  return currentLang;
}

export function setLanguage(langCode) {
  if (TRANSLATIONS[langCode]) {
    currentLang = langCode;
    window.dispatchEvent(new CustomEvent('setu-lang-changed', { detail: langCode }));
  }
}

export function t(key) {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.EN;
  return dict[key] || TRANSLATIONS.EN[key] || key;
}

export default {
  getLanguage,
  setLanguage,
  t
};
