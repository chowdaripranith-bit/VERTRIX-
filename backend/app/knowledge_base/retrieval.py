import re
import os
import json
import urllib.request
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from backend.app.models.db_models import KnowledgeSolution
from backend.app.core.config import settings

# Disclaimers and contextual badges across 6 languages
TRANSLATIONS = {
    "te": {
        "disclaimer": "గమనిక: రసాయన పురుగుమందుల మోతాదును ఉపయోగించే ముందు దయచేసి మీ స్థానిక కృషి విజ్ఞాన కేంద్రం (KVK) లేదా వ్యవసాయ విస్తరణ అధికారిని సంప్రదించండి.",
        "reused_notice": "గతంలో ఇలాంటి వ్యవసాయ పరిస్థితులలో ఈ పరిష్కారం విజయవంతంగా ఫలితాన్ని ఇచ్చింది.",
        "verified_badge": "ICAR మరియు నిపుణులు ధృవీకరించిన సమాచారం"
    },
    "hi": {
        "disclaimer": "सूचना: रासायनिक कीटनाशकों के प्रयोग से पहले कृपया अपने स्थानीय कृषि विज्ञान केंद्र (KVK) या कृषि अधिकारी से परामर्श लें।",
        "reused_notice": "यह समाधान पहले भी समान कृषि परिस्थितियों में सफल पाया गया है।",
        "verified_badge": "ICAR एवं विशेषज्ञों द्वारा प्रमाणित समाधान"
    },
    "ta": {
        "disclaimer": "குறிப்பு: பூச்சிக்கொல்லிகளைப் பயன்படுத்துவதற்கு முன் உங்கள் உள்ளூர் வேளாண்மை விரிவாக்க அலுவலர் அல்லது KVK-ஐ அணுகவும்.",
        "reused_notice": "இந்த தீர்வு முந்தைய விவசாய சூழல்களில் வெற்றிகரமாக செயல்படுத்தப்பட்டது.",
        "verified_badge": "ICAR மற்றும் நிபுணர்களால் சரிபார்க்கப்பட்ட தீர்வு"
    },
    "kn": {
        "disclaimer": "ಸೂಚನೆ: ಕೀಟನಾಶಕಗಳನ್ನು ಬಳಸುವ ಮೊದಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸ್ಥಳೀಯ ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರ (KVK) ಅಥವಾ ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.",
        "reused_notice": "ಈ ಪರಿಹಾರವು ಇದೇ ರೀತಿಯ ಕೃಷಿ ಪರಿಸ್ಥಿತಿಗಳಲ್ಲಿ ಈ ಹಿಂದೆ ಯಶಸ್ವಿಯಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸಿದೆ.",
        "verified_badge": "ICAR ಮತ್ತು ತಜ್ಞರಿಂದ ದೃಢೀಕರಿಸಲ್ಪಟ್ಟ ಪರಿಹಾರ"
    },
    "ml": {
        "disclaimer": "ശ്രദ്ധിക്കുക: രാസ കീടനാശിനികൾ പ്രയോഗിക്കുന്നതിന് മുൻപ് കൃഷിഭവനുമായോ കെ.വി.കെയുമായോ ബന്ധപ്പെടുക.",
        "reused_notice": "സമാനമായ കാർഷിക സാഹചര്യങ്ങളിൽ ഈ പരിഹാരം മുമ്പ് ഫലപ്രദമായി തെളിയിക്കപ്പെട്ടിട്ടുണ്ട്.",
        "verified_badge": "ICAR വിദഗ്ദ്ധർ സ്ഥിരീകരിച്ച പരിഹാരം"
    },
    "en": {
        "disclaimer": "Notice: Always verify chemical treatments with your local Krishi Vigyan Kendra (KVK) or Agricultural Extension Officer before application.",
        "reused_notice": "This solution was previously reported as successful under similar agricultural conditions.",
        "verified_badge": "ICAR & Expert-Verified Guidance"
    }
}

# Comprehensive domain-specific agronomic advice in 6 languages
MULTILINGUAL_ANSWERS = {
    "te": {
        "rice_blast": "వరిలో అగ్గితెగులు (బ్లాస్ట్), ఆకుమచ్చ మరియు కాండం తొలుచు పురుగు నివారణకు: ట్రైసైక్లాజోల్ 75% WP @ 0.6 గ్రా/లీటరు నీటిలో కలిపి పిచికారీ చేయాలి. నత్రజని ఎరువులను అధికంగా కాకుండా సమాన దఫాలుగా వేయండి. పొలంలో నీరు నిల్వ ఉండకుండా ఆల్టర్నేట్ వెట్టింగ్ & డ్రైయింగ్ (AWD) పద్ధతిని పాటించండి.",
        "cotton_pest": "పత్తిలో గులాబీ రంగు కాయతొలుచు పురుగు (Pink Bollworm) మరియు తెల్లదోమ నివారణకు: ఎకరాకు 5 నుండి 8 లింగాకర్షక బుట్టలు (Pheromone Traps) అమర్చండి. పూత దశలో వేపనూనె (అజాడిరక్టిన్ 1500 ppm) 5 మి.లీ/లీటరు చొప్పున పిచికారీ చేయండి.",
        "wheat_crop": "గోధుమ సాగులో కిరీటం వేర్లు ఏర్పడే దశ (CRI Stage - విత్తిన 21 రోజులకు) మొదటి తడి అత్యంత కీలకం. తుప్పు తెగులు (Rust) లక్షణాలు కనిపిస్తే ప్రొపికోనాజోల్ 25% EC @ 1 మి.లీ/లీటరు నీటిలో పిచికారీ చేయండి.",
        "maize_pest": "మొక్కజొన్నలో కత్తెర పురుగు (Fall Armyworm) నివారణకు: విత్తిన 15-20 రోజులకు సుడులలో ఇసుక + సున్నం మిశ్రమం వేయండి. పురుగు ఉధృతి ఉంటే క్లోరాంట్రానిలిప్రోల్ 18.5% SC @ 0.4 మి.లీ/లీటరు చొప్పున సుడులు తడిసేలా పిచికారీ చేయండి.",
        "sugarcane_crop": "చెరకు పంటలో ఎర్ర కుళ్ళు తెగులు నివారణకు తెగులు తట్టుకునే రకాలను (Co 0238, Co 86032) ఎంచుకోండి. బిందు సేద్యం (Drip) ద్వారా 40% నీరు, ఎరువులు ఆదా అవుతాయి. చెరకు పిప్పి/ఆకుల మల్చింగ్ ద్వారా తేమను కాపాడండి.",
        "groundnut_crop": "వేరుశనగలో తిక్కా ఆకుమచ్చ తెగులు నివారణకు మాంకోజెబ్ + కార్బెండజిమ్ 2 గ్రా/లీటరు పిచికారీ చేయండి. ఊడలు దిగే దశలో (40-45 రోజులకు) ఎకరాకు 200 కిలోల జిప్సం వేయడం వల్ల గింజలు లావుగా ఊరుతాయి.",
        "tomato_blight": "టమోటాలో ఆకుముడుత తెగులు వ్యాప్తిని నివారించడానికి ఎకరాకు 15 పసుపు జిగురు అట్టలు అమర్చండి. అగ్రి బ్లైట్ నివారణకు మాంకోజెబ్ 75% WP @ 2.5 గ్రా/లీటరు నీటిలో కలిపి పిచికారీ చేయండి.",
        "onion_potato": "ఉల్లి మరియు బంగాళాదుంపలో తామర పురుగులు (Thrips), ఊదా మచ్చ తెగులు నివారణకు ఫిప్రోనిల్ 5% SC @ 1.5 మి.లీ/లీటరు పిచికారీ చేయండి. పంట కోతకు 10 రోజుల ముందు తడులు ఆపాలి.",
        "soil_fertilizer": "భూసార పరీక్ష ఆధారంగా నత్రజని, భాస్వరం, పొటాష్ ఎరువులను సమతుల్యంగా వాడండి. క్షార భూములలో జిప్సం, ఆమ్ల భూములలో సున్నం వాడండి. జీవామృతం లేదా పచ్చిరొట్ట ఎరువుల (జీలుగ, జనుము) వాడకంతో నేల సారం పెరుగుతుంది.",
        "water_saving": "వరి పంటలో ఆల్టర్నేట్ వెట్టింగ్ అండ్ డ్రైయింగ్ (AWD) విధానం ద్వారా 25-30% వరకు సాగునీటిని ఆదా చేయవచ్చు. ఇతర ఆరుతడి పంటలకు బిందు సేద్యం (Drip Irrigation) ద్వారా 40-50% నీరు మరియు కూలీల ఖర్చు ఆదా అవుతాయి.",
        "govt_schemes": "ప్రభుత్వ సహాయ పథకాలు: పిఎం-కిసాన్ (PM-KISAN) ద్వారా వార్షిక పెట్టుబడి సాయం, ప్రధానమంత్రి ఫసల్ బీమా యోజన (PMFBY) పంటల బీమా, ఉచిత భూసార కార్డు (Soil Health Card), మరియు మైక్రో ఇరిగేషన్ సబ్సిడీలను మీ రైతు సేవా కేంద్రం (RSK) వద్ద పొందవచ్చు.",
        "organic_farming": "సేంద్రీయ వ్యవసాయ పద్ధతులు: ఎకరాకు 200 లీటర్ల జీవామృతం ప్రతి 15 రోజులకు పారించండి. వేప కషాయం, దశపర్ణి కషాయం వాడటం ద్వారా పురుగుల ఉధృతిని నియంత్రించవచ్చు.",
        "general_advice": "మీ వ్యవసాయ నేల స్వభావం, నత్రజని, భాస్వరం, పొటాష్ మోతాదు ఆధారంగా సరైన పంటల ప్రణాళికను ఎంచుకోండి. పంట మార్పిడి మరియు బిందు సేద్యం ద్వారా గరిష్ట నికర లాభం పొందవచ్చు."
    },
    "hi": {
        "rice_blast": "धान में झुलसा (ब्लास्ट) और भूरा धब्बा रोग नियंत्रण के लिए ट्राईसाइक्लाजोल 75% WP @ 0.6 ग्राम प्रति लीटर पानी में मिलाकर छिड़काव करें। नाइट्रोजन की अत्यधिक मात्रा न दें। एडब्ल्यूडी (AWD) विधि से सिंचाई करें।",
        "cotton_pest": "कपास में गुलाबी सुंडी (Pink Bollworm) प्रबंधन के लिए प्रति एकड़ 5-8 फेरोमोन ट्रैप लगाएं। शुरुआती अवस्था में नीम तेल (1500 ppm) @ 5 मिली/लीटर का छिड़काव करें।",
        "wheat_crop": "गेहूं में मुकुट जड़ बनते समय (CRI स्टेज - बुवाई के 21 दिन बाद) पहली सिंचाई अत्यंत आवश्यक है। पीला रतुआ (Yellow Rust) दिखने पर प्रोपिकोनाज़ोल 25% EC @ 1 मिली/लीटर पानी में छिड़कें।",
        "maize_pest": "मक्का में फॉल आर्मीवर्म (सैनिक कीट) के नियंत्रण हेतु क्लोरेंट्रानिलीप्रोल 18.5% SC @ 0.4 मिली/लीटर का छिड़काव पोरों (घोंघे) में करें। प्रारंभिक अवस्था में फेरोमोन ट्रैप लगाएं।",
        "sugarcane_crop": "गन्ने में लाल सड़न (Red Rot) से बचाव हेतु स्वस्थ बीज (Co 0238, Co 86032) का चयन करें। ड्रिप फर्टिगेशन से 40% पानी और खाद की बचत होती है। सूखी पत्तियों की मल्चिंग करें।",
        "groundnut_crop": "मूंगफली में टिक्का रोग के लिए मैंकोजेब + कार्बेन्डाजिम 2 ग्राम/लीटर का छिड़काव करें। दाना भरने की अवस्था (40-45 दिन) पर प्रति एकड़ 200 किग्रा जिप्सम डालें।",
        "tomato_blight": "टमाटर में अगेती/पछेती झुलसा रोग हेतु मैंकोजेब 75% WP @ 2.5 ग्राम प्रति लीटर पानी में मिलाकर छिड़कें। रस चूसक कीटों के लिए पीले चिपचिपे ट्रैप (15/एकड़) लगाएं।",
        "onion_potato": "प्याज और आलू में थ्रिप्स एवं बैंगनी धब्बा रोग के लिए फिप्रोनिल 5% SC @ 1.5 मिली/लीटर का छिड़काव करें। खुदाई से 10-15 दिन पूर्व सिंचाई बंद कर दें।",
        "soil_fertilizer": "मृदा स्वास्थ्य कार्ड (Soil Health Card) के अनुसार एनपीके का संतुलित प्रयोग करें। क्षारीय भूमि सुधार हेतु जिप्सम और अम्लीय भूमि में कृषि चूना डालें। हरी खाद (ढैंचा) से जैविक कार्बन बढ़ाएं।",
        "water_saving": "धान में वैकल्पिक गीला-सूखा (AWD) पद्धति से 25-30% पानी की बचत करें। अन्य फसलों में ड्रिप या स्प्रिंकलर सिंचाई से 40-50% जल संरक्षण और अधिक पैदावार प्राप्त होती है।",
        "govt_schemes": "प्रमुख सरकारी योजनाएं: पीएम किसान सम्मान निधि, पीएम फसल बीमा योजना (PMFBY), किसान क्रेडिट कार्ड (KCC), और पीएम कृषि सिंचाई योजना (PMKSY) से सब्सिडी लाभ निकटतम कृषि कार्यालय से लें।",
        "organic_farming": "प्राकृतिक एवं जैविक खेती: बीजामृत से बीज उपचार करें और 200 लीटर जीवामृत प्रति एकड़ सिंचाई के साथ दें। नीमास्त्र व ब्रह्मास्त्र से कीट प्रबंधन करें।",
        "general_advice": "मृदा परीक्षण, उत्तम प्रमाणित बीज और संतुलित पोषण प्रबंधन से खेती की लागत कम करें और शुद्ध लाभ अधिकतम करें।"
    },
    "ta": {
        "rice_blast": "நெல் பயிரில் குலை நோய் (Blast) தாக்கத்திற்கு ட்ரைசைக்ளசோல் 75% WP @ 0.6 கிராம்/லிட்டர் நீரில் கலந்து தெளிக்கவும். தழைச்சத்தை அதிக அளவில் இடுவதைத் தவிர்க்கவும். AWD முறையில் நீர்ப்பாசனம் செய்யவும்.",
        "cotton_pest": "பருத்தியில் இளஞ்சிவப்பு காய்ப்புழு மேலாண்மைக்கு ஏக்கருக்கு 5-8 இனக்கவர்ச்சி பொறிகளை வைக்கவும். வேப்ப எண்ணெய் கரைசல் (5 மி.லி/லி) தெளிப்பது நல்லது.",
        "wheat_crop": "கோதுமை பயிரில் 21-வது நாள் CRI பாசனம் மிக முக்கியமானது. துரு நோய்க்கு புரோபிகோனசோல் 1 மி.லி/லிட்டர் தெளிக்கவும்.",
        "maize_pest": "மக்காச்சோளத்தில் படைப்புழு (Fall Armyworm) தாக்கத்திற்கு குளோரான்ட்ரானிலிப்ரோல் 18.5% SC @ 0.4 மி.லி/லி தெளிக்கவும்.",
        "sugarcane_crop": "கரும்பில் செவ்வழுகல் நோயைத் தடுக்க நோய் எதிர்ப்பு ரகங்களை பயிரிடவும். சொட்டுநீர் பாசனம் மூலம் 40% தண்ணீரை சேமிக்கவும்.",
        "groundnut_crop": "மணிலா/வேர்க்கடலையில் டிக்கா இலைப்புள்ளி நோய்க்கு மாங்கோசெப் 2 கிராம்/லிட்டர் தெளிக்கவும். 45-வது நாளில் ஏக்கருக்கு 200 கிலோ ஜிப்சம் இடவும்.",
        "tomato_blight": "தக்காளியில் இலை கருகல் நோய்க்கு மாங்கோசெப் 2.5 கிராம்/லிட்டர் தெளிக்கவும். வெள்ளை ஈக்களை கட்டுப்படுத்த மஞ்சள் ஒட்டும் அட்டைகளை வைக்கவும்.",
        "onion_potato": "வெங்காயத்தில் இலைப்பேன் (Thrips) தாக்குதலுக்கு பிப்ரோனில் 1.5 மி.லி/லிட்டர் தெளிக்கவும்.",
        "soil_fertilizer": "மண் பரிசோதனை பரிந்துரைகளின்படி உரமிடுங்கள். களர் நிலத்திற்கு ஜிப்சமும் அமில நிலத்திற்கு சுண்ணாம்பும் பயன்படுத்தவும்.",
        "water_saving": "நெல்லில் காய்ச்சலும் பாய்ச்சலும் (AWD) முறையில் 30% நீரை மிச்சப்படுத்துங்கள். இதர பயிர்களுக்கு சொட்டுநீர் பாசனம் சிறந்தது.",
        "govt_schemes": "PM-KISAN நிதி உதவி, பிரதம மந்திரி பயிர் காப்பீட்டுத் திட்டம் (PMFBY), மற்றும் சொட்டுநீர் பாசன மானியங்களைப் பெற வேளாண்மை துறையை அணுகவும்.",
        "organic_farming": "ஜீவாமிர்தம் மற்றும் பஞ்சகவ்யா பயன்படுத்தி இயற்கை முறையில் பயிர் பாதுகாப்பை மேற்கொள்ளுங்கள்.",
        "general_advice": "மண் பரிசோதனை முடிவுகள் மற்றும் பருவநிலைக்கு ஏற்ற பயிர்களைத் தேர்வு செய்து உகந்த லாபம் பெறுங்கள்."
    },
    "kn": {
        "rice_blast": "ಭತ್ತದಲ್ಲಿ ಬ್ಲಾಸ್ಟ್ (ಬೆಂಕಿ ರೋಗ) ನಿಯಂತ್ರಣಕ್ಕೆ ಟ್ರೈಸೈಕ್ಲೋಜೋಲ್ 75% WP @ 0.6 ಗ್ರಾಂ/ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಸಿಂಪಡಿಸಿ. ಸಾರಜನಕ ಗೊಬ್ಬರದ ಅತಿಯಾದ ಬಳಕೆಯನ್ನು ತಪ್ಪಿಸಿ.",
        "cotton_pest": "ಹತ್ತಿಯಲ್ಲಿ ಗುಲಾಬಿ ಕಾಯಿ ಕೊರೆಯುವ ಹುಳು ನಿಯಂತ್ರಣಕ್ಕೆ ಪ್ರತಿ ಎಕರೆಗೆ 5-8 ಮೋಹಕ ಬಲೆಗಳನ್ನು (ಫೆರೋಮೋನ್ ಟ್ರ್ಯಾಪ್ಸ್) ಅಳವಡಿಸಿ ಮತ್ತು ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ.",
        "wheat_crop": "ಗೋಧಿ ಬೆಳೆಯಲ್ಲಿ ಬಿತ್ತಿದ 21 ದಿನಗಳಿಗೆ CRI ಹಂತದ ಮೊದಲ ನೀರಾವರಿ ನೀಡುವುದು ಅತ್ಯಗತ್ಯ. ತುಕ್ಕು ರೋಗಕ್ಕೆ ಪ್ರೊಪಿಕೊನಜೋಲ್ 1 ಮಿ.ಲೀ/ಲೀ ಸಿಂಪಡಿಸಿ.",
        "maize_pest": "ಮೆಕ್ಕೆಜೋಳದಲ್ಲಿ ಲದ್ದಿಹುಳು (Fall Armyworm) ನಿಯಂತ್ರಣಕ್ಕೆ ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ 18.5% SC @ 0.4 ಮಿ.ಲೀ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.",
        "sugarcane_crop": "ಕಬ್ಬಿನಲ್ಲಿ ಕೆಂಪು ಕೊಳೆ ರೋಗ ನಿರೋಧಕ ತಳಿಗಳನ್ನು ಬಳಸಿ. ಹನಿ ನೀರಾವರಿ ಮೂಲಕ ಶೇ. 40 ರಷ್ಟು ನೀರು ಮತ್ತು ಗೊಬ್ಬರ ಉಳಿಸಿ.",
        "groundnut_crop": "ಕಡಲೆಕಾಯಿಯಲ್ಲಿ ತಿಕ್ಕಾ ರೋಗಕ್ಕೆ ಮ್ಯಾಂಕೋಜೆಬ್ 2 ಗ್ರಾಂ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ. 40-45 ದಿನಗಳಲ್ಲಿ ಎಕರೆಗೆ 200 ಕೆಜಿ ಜಿಪ್ಸಮ್ ಹಾಕಿ.",
        "tomato_blight": "ಟೊಮೆಟೊ ಮುಂಚಿನ ಅಂಗಮಾರಿ ರೋಗಕ್ಕೆ ಮ್ಯಾಂಕೋಜೆಬ್ 2.5 ಗ್ರಾಂ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ. ಹಳದಿ ಜಿಗುಟು ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ.",
        "onion_potato": "ಈರುಳ್ಳಿಯಲ್ಲಿ ನುಸಿ (Thrips) ನಿಯಂತ್ರಣಕ್ಕೆ ಫಿಪ್ರೋನಿಲ್ 1.5 ಮಿ.ಲೀ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.",
        "soil_fertilizer": "ಮಣ್ಣು ಪರೀಕ್ಷೆ ಆಧಾರದ ಮೇಲೆ ಸಮತೋಲಿತ ರಸಗೊಬ್ಬರ ನೀಡಿ. ಕ್ಷಾರ ಮಣ್ಣಿಗೆ ಜಿಪ್ಸಮ್, ಆಮ್ಲ ಮಣ್ಣಿಗೆ ಸುಣ್ಣ ಬಳಸಿ.",
        "water_saving": "ಭತ್ತದಲ್ಲಿ AWD ವಿಧಾನ ಬಳಸಿ ಶೇ. 25-30 ರಷ್ಟು ನೀರು ಉಳಿಸಿ. ಇತರ ಬೆಳೆಗಳಿಗೆ ಹನಿ ನೀರಾವರಿ ಅಳವಡಿಸಿ.",
        "govt_schemes": "ಪಿಎಂ ಕಿಸಾನ್, ಬೆಳೆ ವಿಮೆ (PMFBY), ಮಣ್ಣು ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಮತ್ತು ಕೃಷಿ ಯಂತ್ರೋಪಕರಣ ಸಬ್ಸಿಡಿಗಳನ್ನು ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರದಲ್ಲಿ ಪಡೆಯಿರಿ.",
        "organic_farming": "ಜೀವಾಮೃತ ಮತ್ತು ಬೀಜಾಮೃತ ಬಳಸಿ ನೈಸರ್ಗಿಕ ಕೃಷಿ ಪದ್ಧತಿ ಅಳವಡಿಸಿಕೊಳ್ಳಿ.",
        "general_advice": "ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಮತ್ತು ಋತುಮಾನಕ್ಕೆ ತಕ್ಕಂತೆ ಬೆಳೆ ಯೋಜನೆ ರೂಪಿಸಿ ಗರಿಷ್ಠ ಆದಾಯ ಗಳಿಸಿ."
    },
    "ml": {
        "rice_blast": "നെല്ലിലെ ബ്ലാസ്റ്റ് രോഗത്തിനെതിരെ ട്രൈസൈക്ലസോൾ 75% WP @ 0.6 ഗ്രാം/ലിറ്റർ വെള്ളത്തിൽ തളിക്കുക. അമിതമായ രാസവളപ്രയോഗം ഒഴിവാക്കുക.",
        "cotton_pest": "പരുത്തിയിലെ കീടങ്ങളെ നിയന്ത്രിക്കാൻ ഫെറോമോൺ കെണികളും വേപ്പെണ്ണ മിശ്രിതവും ഉപയോഗിക്കുക.",
        "wheat_crop": "ഗോതമ്പിൽ കൃത്യസമയത്ത് ജലസേಚനം നടത്തുകയും തുരുമ്പ് രോഗത്തിനെതിരെ കുമിൾനാശിനി പ്രയോഗിക്കുകയും ചെയ്യുക.",
        "maize_pest": "മക്കച്ചോളത്തിലെ പട്ടാളപ്പുഴുവിനെതിരെ ക്ലോറാൻട്രാനിലിപ്രോൾ 0.4 മില്ലി/ലിറ്റർ തളിക്കുക.",
        "sugarcane_crop": "കരിമ്പിൽ തുള്ളിനന വഴി 40% ജലവും വളവും ലാഭിക്കാം. രോഗപ്രതിരോധ ശേഷിയുള്ള ഇനങ്ങൾ തിരഞ്ഞെടുക്കുക.",
        "groundnut_crop": "നിലക്കടലയിൽ തിക്ക രോഗത്തിനെതിരെ മാങ്കോസെബ് തളിക്കുക. കായ്പിടുത്തത്തിന് ജിപ്സം ചേർക്കുക.",
        "tomato_blight": "തക്കാളിയിലെ ഇലകരിച്ചിൽ രോഗത്തിന് മാങ്കോസെബ് 2.5 ഗ്രാം/ലിറ്റർ തളിക്കുക.",
        "onion_potato": "ഉള്ളി, ഉരുളക്കിഴങ്ങ് എന്നിവയിൽ കീടബാധയ്ക്കെതിരെ ഫിപ്രോനിൽ 1.5 മില്ലി/ലിറ്റർ തളിക്കുക.",
        "soil_fertilizer": "മണ്ണ് പരിശോധനാ ഫലങ്ങൾക്കനുസൃതമായി സന്തുലിത വളപ്രയോഗം നടത്തുക.",
        "water_saving": "നെൽകൃഷിയിൽ AWD വഴിയും പച്ചക്കറികളിൽ തുള്ളിനന വഴിയും ജലസംരക്ഷണം ഉറപ്പാക്കുക.",
        "govt_schemes": "പി.എം. കിസാൻ, വിള ഇൻഷുറൻസ് ആനുകൂല്യങ്ങൾക്കായി കൃഷിഭവനുമായി ബന്ധപ്പെടുക.",
        "organic_farming": "ജീവാമൃതം, വേപ്പിൻപിണ്ണാക്ക് എന്നിവ ഉപയോഗിച്ച് ജൈവകൃഷി രീതികൾ പ്രോത്സാഹിപ്പിക്കുക.",
        "general_advice": "മണ്ണ് പരിശോധിച്ച് കാലവർഷത്തിനനുസൃതമായ വിളകൾ കൃഷി ചെയ്ത് പരമാവധി വരുമാനം നേടുക."
    },
    "en": {
        "rice_blast": "For rice/paddy blast (spindle lesions) and brown spot: spray Tricyclazole 75% WP @ 0.6 g/L water or bio-agent Pseudomonas fluorescens @ 2.5 kg/ha. Avoid excess split nitrogen doses and implement Alternate Wetting & Drying (AWD) irrigation.",
        "cotton_pest": "Install Pheromone traps @ 5-8 traps/acre for pink bollworm and spodoptera monitoring. Release Trichogramma parasitoids and spray neem seed kernel extract (NSKE 5%) or Azadirachtin 1500 ppm @ 5 ml/L at flower initiation.",
        "wheat_crop": "In wheat, the Crown Root Initiation (CRI) stage at 21 days after sowing is the most critical irrigation window. For yellow or brown rust, spray Propiconazole 25% EC @ 1 ml/L upon initial pustule appearance.",
        "maize_pest": "For Fall Armyworm (FAW) in maize/corn: apply neem cake in soil at sowing, erect pheromone traps @ 5/acre, and whorl-apply Chlorantraniliprole 18.5% SC @ 0.4 ml/L or Emamectin Benzoate 5% SG @ 0.4 g/L during early vegetative stages.",
        "sugarcane_crop": "Adopt red-rot resistant varieties (Co 0238, Co 86032, Co 06022). Drip fertigation saves 40% water and 25% fertilizer nutrients. Spread trash mulching (10 cm thick) to conserve soil moisture and suppress weeds.",
        "groundnut_crop": "For Tikka leaf spot in groundnut, spray Mancozeb + Carbendazim @ 2 g/L. Apply Gypsum @ 200 kg/acre at pegging stage (40-45 DAS) to supply calcium and sulfur essential for pod filling and shelling percentage.",
        "tomato_blight": "Control whitefly vectors using yellow sticky traps (15/acre). For early/late blight concentric target spots, spray Mancozeb 75% WP @ 2.5 g/L or Azoxystrobin 23% SC @ 1 ml/L.",
        "onion_potato": "For thrips and purple blotch in onion/potato, spray Fipronil 5% SC @ 1.5 ml/L with spreader sticker. Cease irrigation 10-15 days prior to harvesting to promote curing and storage shelf-life.",
        "soil_fertilizer": "Apply balanced NPK as per Soil Health Card recommendations. For alkaline/sodic soils (pH > 8.2), apply Gypsum. For acidic soils (pH < 5.8), incorporate agricultural lime. Use green manures (Dhaincha/Sunn hemp) to enhance organic carbon.",
        "water_saving": "Implement Alternate Wetting and Drying (AWD) in paddy to save 25-30% irrigation without yield penalty. For row and horticultural crops, Drip Irrigation provides 40-50% water savings and boosts fertilizer efficiency.",
        "govt_schemes": "Key agricultural schemes: PM-KISAN (₹6000 annual income support), PM Fasal Bima Yojana (PMFBY crop insurance), Soil Health Card Scheme, and PMKSY micro-irrigation drip subsidies available through local Agriculture Extension Offices.",
        "organic_farming": "Organic & Natural Farming: Treat seeds with Beejamrutha, apply 200L Jeevamrutha per acre every fortnight with irrigation water, and use Neemastra/Dashaparni for biological pest suppression.",
        "general_advice": "Base your crop selection, seed treatment, and fertilizer schedule on soil test parameters (N, P, K, pH) and seasonal water constraints to optimize production and farm profit."
    }
}

class KnowledgeRetrievalEngine:
    def __init__(self):
        pass

    def search_verified_solutions(self, query: str, db: Session, crop_context: Optional[str] = None) -> List[Dict[str, Any]]:
        query_lower = query.lower()
        query_words = set(re.findall(r'\w+', query_lower))

        matches = []
        try:
            db_sols = db.query(KnowledgeSolution).filter(KnowledgeSolution.status == "verified").all()
            for sol in db_sols:
                sol_words = set(re.findall(r'\w+', (sol.question + " " + sol.normalized_query + " " + (sol.crop or "")).lower()))
                overlap = len(query_words.intersection(sol_words))
                if overlap > 0:
                    score = overlap / max(1, len(query_words))
                    if crop_context and crop_context.lower() in (sol.crop or "").lower():
                        score += 0.3
                    matches.append((score, sol))
            matches.sort(key=lambda x: x[0], reverse=True)
            return [m[1] for m in matches if m[0] > 0.25]
        except Exception as e:
            print("Notice: Knowledge solution search fallback:", e)
            return []

    def classify_query(self, query: str) -> str:
        q = query.lower()

        # Rice / Paddy
        if any(w in q for w in ["rice", "paddy", "blast", "vari", "dhan", "nellu", "bhatta", "nell"]):
            return "rice_blast"

        # Cotton
        if any(w in q for w in ["cotton", "bollworm", "patti", "kapas", "paruthi", "hatti"]):
            return "cotton_pest"

        # Wheat
        if any(w in q for w in ["wheat", "gehun", "godhumai", "godhi", "rust", "cri"]):
            return "wheat_crop"

        # Maize / Corn
        if any(w in q for w in ["maize", "corn", "makka", "mokka", "cholam", "armyworm", "faw"]):
            return "maize_pest"

        # Sugarcane
        if any(w in q for w in ["sugarcane", "cane", "cheraku", "ganna", "karumbu", "kabbu", "karimbu", "red rot"]):
            return "sugarcane_crop"

        # Groundnut / Peanut
        if any(w in q for w in ["groundnut", "peanut", "verusenaga", "mungfali", "kadalai", "kadalekayi", "tikka"]):
            return "groundnut_crop"

        # Tomato / Vegetables
        if any(w in q for w in ["tomato", "tamatar", "thakkali", "blight", "leaf curl", "vegetable"]):
            return "tomato_blight"

        # Onion / Potato
        if any(w in q for w in ["onion", "potato", "ulli", "alu", "vengayam", "batata", "erulli", "thrips", "tuber"]):
            return "onion_potato"

        # Water / Irrigation
        if any(w in q for w in ["water", "irrigation", "drip", "awd", "paani", "neeru", "thanneer", "dry", "sprinkler"]):
            return "water_saving"

        # Soil & Fertilizer
        if any(w in q for w in ["soil", "fertilizer", "urea", "npk", "nitrogen", "potash", "ph", "gypsum", "manure", "khad", "eruvu"]):
            return "soil_fertilizer"

        # Schemes & Subsidy
        if any(w in q for w in ["subsidy", "scheme", "kisan", "pm-kisan", "insurance", "loan", "card", "yojana"]):
            return "govt_schemes"

        # Organic Farming
        if any(w in q for w in ["organic", "natural", "jeevamrutha", "neem", "compost", "jaivik"]):
            return "organic_farming"

        return "general_advice"

    def answer_question(self, query: str, language: str, db: Session, farm_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        lang = language if language in TRANSLATIONS else "en"
        crop_name = (farm_context or {}).get("crop_name") or (farm_context or {}).get("crop")

        # 1. Search verified solutions
        matched_solutions = self.search_verified_solutions(query, db, crop_name)

        sources = ["ICAR Advisory Guidelines", "National Agritech Portal", "State Agricultural University Extension Bulletins"]
        reused_notice = None
        matched_id = None
        confidence = "High (Verified Agronomic Protocol)"

        key = self.classify_query(query)

        if matched_solutions:
            top_sol = matched_solutions[0]
            matched_id = top_sol.id
            reused_notice = TRANSLATIONS[lang]["reused_notice"]
            answer_text = top_sol.solution_text
            sources = [top_sol.evidence_sources]
        else:
            lang_dict = MULTILINGUAL_ANSWERS.get(lang, MULTILINGUAL_ANSWERS["en"])
            answer_text = lang_dict.get(key, lang_dict.get("general_advice", MULTILINGUAL_ANSWERS["en"]["general_advice"]))

        return {
            "question": query,
            "language": lang,
            "answer": answer_text,
            "evidence_sources": sources,
            "matched_verified_solution_id": matched_id,
            "reused_solution_notice": reused_notice,
            "confidence_assessment": confidence,
            "disclaimer": TRANSLATIONS[lang]["disclaimer"]
        }

knowledge_engine = KnowledgeRetrievalEngine()
