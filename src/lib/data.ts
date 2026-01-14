import { PlaceHolderImages } from "./placeholder-images";

export const dummySchedule = [
    { time: "09:00 - 10:00", subject: "Data Structures", venue: "C-201" },
    { time: "10:00 - 11:00", subject: "Algorithms", venue: "C-202" },
    { time: "11:15 - 12:15", subject: "Database Systems", venue: "Lab 3" },
    { time: "14:00 - 15:00", subject: "Operating Systems", venue: "C-105" },
];

export const dummyAnnouncements = [
    {
        title: "HackOverflow 2024 Registrations Open",
        category: "Hackathons",
        date: "July 20, 2024",
        image: PlaceHolderImages.find(img => img.id === 'announcement-1')!
    },
    {
        title: "Guest Lecture on Quantum Computing",
        category: "Events",
        date: "July 22, 2024",
        image: PlaceHolderImages.find(img => img.id === 'announcement-2')!
    },
    {
        title: "Robotics Club Recruitment Drive",
        category: "Clubs",
        date: "July 25, 2024",
        image: PlaceHolderImages.find(img => img.id === 'announcement-3')!
    },
];

export const dummyCourses = [
  { id: 'PS', name: 'Probability and Statistics', abbr: 'PS' },
  { id: 'DSA', name: 'Data Structures and Algorithms', abbr: 'DSA' },
  { id: 'SS', name: 'Signals and Systems', abbr: 'SS' },
  { id: 'CA', name: 'Computer Architecture', abbr: 'CA' },
  { id: 'BEC', name: 'Basic Electronics and Circuit', abbr: 'BEC' },
  { id: 'OPC', name: 'Operational Communication', abbr: 'OPC' },
  { id: 'EDL', name: 'Ethics in Everyday Life', abbr: 'EDL' },
  { id: 'AIV', name: 'AI and Visual Culture', abbr: 'AIV' },
  { id: 'CCN', name: 'Computer and Communication Networks', abbr: 'CCN' },
  { id: 'FSD', name: 'FSD1 – Fundamentals of FSD', abbr: 'FSD' },
  { id: 'FFSD', name: 'FSD1 - Fundamentals of FSD', abbr: 'FFSD' },
  { id: 'AI', name: 'Artificial Intelligence', abbr: 'AI' },
  { id: 'ToC', name: 'Theory of Computation', abbr: 'ToC' },
  { id: 'AC', name: 'Analog Circuits', abbr: 'AC' },
  { id: 'EMTL', name: 'Electromagnetics and Transmission Lines', abbr: 'EMTL' },
  { id: 'FComm', name: 'Fundamentals of Communication', abbr: 'FComm' },
  { id: 'AIKR', name: 'Artificial Intelligence & Knowledge Representation', abbr: 'AIKR' },
  { id: 'DL', name: 'Deep Learning', abbr: 'DL' },
  { id: 'IDA', name: 'Introduction to Data Analysis', abbr: 'IDA' },
  { id: 'ACS', name: 'Advanced Communication Skills', abbr: 'ACS' },
  { id: 'LR', name: 'Logical and Reasoning', abbr: 'LR' },
  { id: 'ADA', name: 'Advanced Data Analytics', abbr: 'ADA' },
  { id: 'RL', name: 'Reinforcement Learning', abbr: 'RL' },
  { id: 'CDP', name: 'Compressed Domain Processing', abbr: 'CDP' },
  { id: 'DIP', name: 'Digital Image Processing', abbr: 'DIP' },
  { id: 'MOT', name: 'Mathematical Optimization Techniques', abbr: 'MOT' },
  { id: 'FDA', name: 'Financial Data Analysis', abbr: 'FDA' },
  { id: 'IDHV', name: 'Introduction Data Handling & Visualization', abbr: 'IDHV' },
  { id: 'DSY', name: 'Data Security', abbr: 'DSY' },
  { id: 'IS', name: 'Internet Security', abbr: 'IS' },
  { id: 'BCI', name: 'Brain Computer Interaction', abbr: 'BCI' },
  { id: 'GEOTA', name: 'Geospatial Technologies and Applications', abbr: 'GEOTA' },
  { id: 'MML', name: 'Mathematics for Machine Learning', abbr: 'MML' },
  { id: 'SPEECH', name: 'Speech Processing', abbr: 'SPEECH' },
  { id: 'IOT', name: 'Internet of Things', abbr: 'IOT' },
  { id: 'IAS', name: 'Intelligent Autonomous Systems', abbr: 'IAS' },
  { id: 'MSA', name: 'Micro Sensors and Actuators', abbr: 'MSA' },
  { id: 'ONE', name: 'Opto and Nano Electronics', abbr: 'ONE' },
  { id: 'HDL', name: 'Verilog Hardware Description Language', abbr: 'HDL' },
  { id: 'PE', name: 'Power Electronics', abbr: 'PE' },
  { id: 'AVLSI', name: 'Advanced VLSI', abbr: 'AVLSI' },
  { id: 'SOC', name: 'System on Chip', abbr: 'SOC' },
  { id: 'CB', name: 'Computational Biology', abbr: 'CB' },
  { id: 'UBC', name: 'Ubiquitous Computing', abbr: 'UBC' },
  { id: 'WN', name: 'Wireless Networks', abbr: 'WN' }
];

export const dummyFaculty = [
  {"id":"faculty-ps-1","name":"Dr. Mansoori","email":"ps1@iiits.in","courseName":"Probability and Statistics","courseAbbr":"PS","branch":"CSE,ECE,AIDS","section":"1","ugYear":["1"]},
  {"id":"faculty-ps-2","name":"Dr. Jahnabi Chakravarty","email":"ps2@iiits.in","courseName":"Probability and Statistics","courseAbbr":"PS","branch":"CSE,ECE,AIDS","section":"2","ugYear":["1"]},
  {"id":"faculty-ps-3","name":"Dr. Jahnabi Chakravarty","email":"ps3@iiits.in","courseName":"Probability and Statistics","courseAbbr":"PS","branch":"CSE,ECE,AIDS","section":"3","ugYear":["1"]},
  {"id":"faculty-ps-4","name":"Dr. Narendra Singh Yadav","email":"ps4@iiits.in","courseName":"Probability and Statistics","courseAbbr":"PS","branch":"CSE,ECE,AIDS","section":"4","ugYear":["1"]},
  {"id":"faculty-ps-5","name":"Dr. Narendra Singh Yadav","email":"ps5@iiits.in","courseName":"Probability and Statistics","courseAbbr":"PS","branch":"CSE,ECE,AIDS","section":"5","ugYear":["1"]},
  {"id":"faculty-dsa-1","name":"Dr. A U G Sankaranrao","email":"dsa1@iiits.in","courseName":"Data Structures and Algorithms","courseAbbr":"DSA","branch":"CSE,ECE,AIDS","section":"1","ugYear":["1"]},
  {"id":"faculty-dsa-2","name":"Dr. A U G Sankaranrao","email":"dsa2@iiits.in","courseName":"Data Structures and Algorithms","courseAbbr":"DSA","branch":"CSE,ECE,AIDS","section":"2","ugYear":["1"]},
  {"id":"faculty-dsa-3","name":"Dr. Viswanath Pulabagari","email":"dsa3@iiits.in","courseName":"Data Structures and Algorithms","courseAbbr":"DSA","branch":"CSE,ECE,AIDS","section":"3","ugYear":["1"]},
  {"id":"faculty-dsa-4","name":"Dr. Viswanath Pulabagari","email":"dsa4@iiits.in","courseName":"Data Structures and Algorithms","courseAbbr":"DSA","branch":"CSE,ECE,AIDS","section":"4","ugYear":["1"]},
  {"id":"faculty-ss-1","name":"Dr. Divyambham","email":"ss1@iiits.in","courseName":"Signals and Systems","courseAbbr":"SS","branch":"CSE,AIDS","section":"1","ugYear":["1"]},
  {"id":"faculty-ss-2","name":"Dr. Anish Chand Turlapaty","email":"ss2@iiits.in","courseName":"Signals and Systems","courseAbbr":"SS","branch":"CSE,AIDS","section":"2","ugYear":["1"]},
  {"id":"faculty-ss-3","name":"Dr. Achintya Sarkar","email":"ss3@iiits.in","courseName":"Signals and Systems","courseAbbr":"SS","branch":"CSE,AIDS","section":"3","ugYear":["1"]},
  {"id":"faculty-ss-4","name":"Dr. Achintya Sarkar","email":"ss4@iiits.in","courseName":"Signals and Systems","courseAbbr":"SS","branch":"CSE,AIDS","section":"4","ugYear":["1"]},
  {"id":"faculty-ca-1","name":"Dr. Santhosh A","email":"ca1@iiits.in","courseName":"Computer Architecture","courseAbbr":"CA","branch":"CSE,AIDS","section":"1","ugYear":["1"]},
  {"id":"faculty-ca-2","name":"Dr. Bheemappa Halavar","email":"ca2@iiits.in","courseName":"Computer Architecture","courseAbbr":"CA","branch":"CSE,AIDS","section":"2","ugYear":["1"]},
  {"id":"faculty-ca-3","name":"Dr. Bheemappa Halavar","email":"ca3@iiits.in","courseName":"Computer Architecture","courseAbbr":"CA","branch":"CSE,AIDS","section":"3","ugYear":["1"]},
  {"id":"faculty-ca-4","name":"Dr. Kartick Sutradhar","email":"ca4@iiits.in","courseName":"Computer Architecture","courseAbbr":"CA","branch":"CSE,AIDS","section":"4","ugYear":["1"]},
  {"id":"faculty-bec-1","name":"Dr. Raja Vara Prasad Y / Mrs. Srivalli","email":"bec@iiits.in","courseName":"Basic Electronics and Circuit","courseAbbr":"BEC","branch":"ECE","section":"Common","ugYear":["1"]},
  {"id":"faculty-opc-1","name":"Dr. Vinay Kumar","email":"opc1@iiits.in","courseName":"Operational Communication","courseAbbr":"OPC","branch":"CSE,ECE,AIDS","section":"1","ugYear":["1"]},
  {"id":"faculty-opc-2","name":"Dr. Vinay Kumar","email":"opc2@iiits.in","courseName":"Operational Communication","courseAbbr":"OPC","branch":"CSE,ECE,AIDS","section":"2","ugYear":["1"]},
  {"id":"faculty-opc-3","name":"Dr. Krishna Swamy","email":"opc3@iiits.in","courseName":"Operational Communication","courseAbbr":"OPC","branch":"CSE,ECE,AIDS","section":"3","ugYear":["1"]},
  {"id":"faculty-opc-4","name":"Dr. Krishna Swamy","email":"opc4@iiits.in","courseName":"Operational Communication","courseAbbr":"OPC","branch":"CSE,ECE,AIDS","section":"4","ugYear":["1"]},
  {"id":"faculty-edl-1","name":"Dr. Rosemaria Regy Mathew","email":"edl1@iiits.in","courseName":"Ethics in Everyday Life","courseAbbr":"EDL","branch":"CSE,ECE,AIDS","section":"1","ugYear":["1"]},
  {"id":"faculty-edl-2","name":"Dr. Rosemaria Regy Mathew","email":"edl2@iiits.in","courseName":"Ethics in Everyday Life","courseAbbr":"EDL","branch":"CSE,ECE,AIDS","section":"2","ugYear":["1"]},
  {"id":"faculty-aiv-1","name":"Dr. Rosemaria Regy Mathew","email":"aiv1@iiits.in","courseName":"AI and Visual Culture","courseAbbr":"AIV","branch":"CSE,ECE,AIDS","section":"1","ugYear":["1"]},
  {"id":"faculty-aiv-2","name":"Dr. Rosemaria Regy Mathew","email":"aiv2@iiits.in","courseName":"AI and Visual Culture","courseAbbr":"AIV","branch":"CSE,ECE,AIDS","section":"2","ugYear":["1"]},
  {"id":"faculty-ccn-1","name":"Dr. Hemant Kumar","email":"cn1@iiits.in","courseName":"Computer and Communication Networks","courseAbbr":"CCN","branch":"CSE,ECE,AIDS","section":"1","ugYear":["2"]},
  {"id":"faculty-ccn-2","name":"Dr. U Somalatha","email":"cn2@iiits.in","courseName":"Computer and Communication Networks","courseAbbr":"CCN","branch":"CSE,ECE,AIDS","section":"2","ugYear":["2"]},
  {"id":"faculty-ccn-3","name":"Dr. Raja Vara Prasad Y","email":"cn3@iiits.in","courseName":"Computer and Communication Networks","courseAbbr":"CCN","branch":"CSE,ECE,AIDS","section":"3","ugYear":["2"]},
  {"id":"faculty-ccn-4","name":"Dr. Rajeev Kumar","email":"cn4@iiits.in","courseName":"Computer and Communication Networks","courseAbbr":"CCN","branch":"CSE,ECE,AIDS","section":"4","ugYear":["2"]},
  {"id":"faculty-ffsd-1","name":"Dr. D. Mallikarjuna Reddy","email":"ffsd1@iiits.in","courseName":"FSD1 - Fundamentals of FSD","courseAbbr":"FFSD","branch":"CSE","section":"1","ugYear":["2"]},
  {"id":"faculty-ffsd-2","name":"Dr. Anushree Bablani","email":"ffsd2@iiits.in","courseName":"FSD1 - Fundamentals of FSD","courseAbbr":"FFSD","branch":"CSE","section":"2","ugYear":["2"]},
  {"id":"faculty-ffsd-3","name":"Dr. Mrinmoy Ghosh","email":"ffsd3@iiits.in","courseName":"FSD1 - Fundamentals of FSD","courseAbbr":"FFSD","branch":"CSE","section":"3","ugYear":["2"]},
  {"id":"faculty-ai-1","name":"Dr. Priyambada Subudhi","email":"ai1@iiits.in","courseName":"Artificial Intelligence","courseAbbr":"AI","branch":"CSE","section":"1","ugYear":["2"]},
  {"id":"faculty-ai-2","name":"Dr. Piyush Joshi","email":"ai2@iiits.in","courseName":"Artificial Intelligence","courseAbbr":"AI","branch":"CSE","section":"2","ugYear":["2"]},
  {"id":"faculty-ai-3","name":"Dr. Bulla Rajesh","email":"ai3@iiits.in","courseName":"Artificial Intelligence","courseAbbr":"AI","branch":"CSE","section":"3","ugYear":["2"]},
  {"id":"faculty-toc-1","name":"Dr. D Mallikarjuna Reddy","email":"toc1@iiits.in","courseName":"Theory of Computation","courseAbbr":"ToC","branch":"CSE","section":"1","ugYear":["2"]},
  {"id":"faculty-toc-2","name":"Dr. Kartick Sutradhar","email":"toc2@iiits.in","courseName":"Theory of Computation","courseAbbr":"ToC","branch":"CSE","section":"2","ugYear":["2"]},
  {"id":"faculty-toc-3","name":"Dr. B N Pavan Kumar","email":"toc3@iiits.in","courseName":"Theory of Computation","courseAbbr":"ToC","branch":"CSE","section":"3","ugYear":["2"]},
  {"id":"faculty-ac-1","name":"Dr. Paul Brainerd","email":"ac@iiits.in","courseName":"Analog Circuits","courseAbbr":"AC","branch":"ECE","section":"Common","ugYear":["2"]},
  {"id":"faculty-emtl-1","name":"Dr. Lokendra Chauhan","email":"emtl@iiits.in","courseName":"Electromagnetics and Transmission Lines","courseAbbr":"EMTL","branch":"ECE","section":"Common","ugYear":["2"]},
  {"id":"faculty-fcomm-1","name":"Dr. Rajeev Kumar","email":"fcomm@iiits.in","courseName":"Fundamentals of Communication","courseAbbr":"FComm","branch":"ECE","section":"Common","ugYear":["2"]},
  {"id":"faculty-aikr-1","name":"Dr. Anushree Bablani","email":"aikr@iiits.in","courseName":"Artificial Intelligence & Knowledge Representation","courseAbbr":"AIKR","branch":"AIDS","section":"Common","ugYear":["2"]},
  {"id":"faculty-dl-2-1","name":"Dr. Pavan Kumar Perepu","email":"dl@iiits.in","courseName":"Deep Learning","courseAbbr":"DL","branch":"AIDS","section":"Common","ugYear":["2"]},
  {"id":"faculty-ida-1","name":"Dr. Pavan Kumar Perepu","email":"ida@iiits.in","courseName":"Introduction to Data Analysis","courseAbbr":"IDA","branch":"AIDS","section":"Common","ugYear":["2"]},
  {"id":"faculty-acs-1","name":"Dr. Vinay Kumar","email":"acs1@iiits.in","courseName":"Advanced Communication Skills","courseAbbr":"ACS","branch":"CSE,ECE,AIDS","section":"1","ugYear":["2"]},
  {"id":"faculty-acs-2","name":"Dr. Vinay Kumar","email":"acs2@iiits.in","courseName":"Advanced Communication Skills","courseAbbr":"ACS","branch":"CSE,ECE,AIDS","section":"2","ugYear":["2"]},
  {"id":"faculty-acs-3","name":"Dr. Krishna Swamy","email":"acs3@iiits.in","courseName":"Advanced Communication Skills","courseAbbr":"ACS","branch":"CSE,ECE,AIDS","section":"3","ugYear":["2"]},
  {"id":"faculty-acs-4","name":"Dr. Krishna Swamy","email":"acs4@iiits.in","courseName":"Advanced Communication Skills","courseAbbr":"ACS","branch":"CSE,ECE,AIDS","section":"4","ugYear":["2"]},
  {"id":"faculty-lr-1","name":"Mrs. Shabhana Imran","email":"lr1@iiits.in","courseName":"Logical and Reasoning","courseAbbr":"LR","branch":"CSE,ECE,AIDS","section":"1","ugYear":["2"]},
  {"id":"faculty-lr-2","name":"Mrs. Shabhana Imran","email":"lr2@iiits.in","courseName":"Logical and Reasoning","courseAbbr":"LR","branch":"CSE,ECE,AIDS","section":"2","ugYear":["2"]},
  {"id":"faculty-lr-3","name":"Mrs. Shabhana Imran","email":"lr3@iiits.in","courseName":"Logical and Reasoning","courseAbbr":"LR","branch":"CSE,ECE,AIDS","section":"3","ugYear":["2"]},
  {"id":"faculty-lr-4","name":"Mrs. Shabhana Imran","email":"lr4@iiits.in","courseName":"Logical and Reasoning","courseAbbr":"LR","branch":"CSE,ECE,AIDS","section":"4","ugYear":["2"]},
  {"id":"faculty-ada-1","name":"Dr. Mainak Thakur","email":"ada@iiits.in","courseName":"Advanced Data Analytics","courseAbbr":"ADA","branch":"CSE,AIDS","section":"Common","ugYear":["3"]},
  {"id":"faculty-dl-3-1","name":"Dr. Shaik Mohammad Rafi","email":"dl-3@iiits.in","courseName":"Deep Learning","courseAbbr":"DL","branch":"CSE","section":"Common","ugYear":["3"]},
  {"id":"faculty-rl-1","name":"Dr. Arun PV","email":"rl@iiits.in","courseName":"Reinforcement Learning","courseAbbr":"RL","branch":"CSE,AIDS","section":"Common","ugYear":["3"]},
  {"id":"faculty-mot-1","name":"Dr. Mohd Shanawaz Mansoori","email":"mot@iiits.in","courseName":"Mathematical Optimization Techniques","courseAbbr":"MOT","branch":"SE,DS,PEAI","section":"Common","ugYear":["3"]},
  {"id":"faculty-fda-1","name":"Dr. Shiv Mohan","email":"fda@iiits.in","courseName":"Financial Data Analysis","courseAbbr":"FDA","branch":"SE,DS,PEAI","section":"Common","ugYear":["3"]},
  {"id":"faculty-idhv-1","name":"Dr. Mainak Thakur / Dr. Rajendra Prasath","email":"idhv@iiits.in","courseName":"Introduction Data Handling & Visualization","courseAbbr":"IDHV","branch":"SE,DS,PEAI","section":"Common","ugYear":["3"]},
  {"id":"faculty-dsy-1","name":"Dr. U Somalatha","email":"dsy@iiits.in","courseName":"Data Security","courseAbbr":"DSY","branch":"CSE,AI,DS,Cybersec","section":"Common","ugYear":["3"]},
  {"id":"faculty-is-1","name":"Dr. Kamalakanta Sethi","email":"is1@iiits.in","courseName":"Internet Security","courseAbbr":"IS","branch":"PE,CSE,Cybersec","section":"1","ugYear":["3"]},
  {"id":"faculty-is-2","name":"Dr. Kamalakanta Sethi","email":"is2@iiits.in","courseName":"Internet Security","courseAbbr":"IS","branch":"PE,CSE,Cybersec","section":"2","ugYear":["3"]},
  {"id":"faculty-bci-1","name":"Dr. Kamalakanta Sethi","email":"bci@iiits.in","courseName":"Brain Computer Interaction","courseAbbr":"BCI","branch":"PE,CSE","section":"Common","ugYear":["3"]},
  {"id":"faculty-geota-1","name":"Dr. Arun PV","email":"geota@iiits.in","courseName":"Geospatial Technologies and Applications","courseAbbr":"GEOTA","branch":"CSE,ECE,AIDS","section":"Common","ugYear":["3"]},
  {"id":"faculty-mml-1","name":"Dr. Selvi R","email":"mml@iiits.in","courseName":"Mathematics for Machine Learning","courseAbbr":"MML","branch":"CSE,ECE,AIDS","section":"Common","ugYear":["3"]},
  {"id":"faculty-speech-1","name":"Dr. Shaik Mohammad Rafi","email":"spp@iiits.in","courseName":"Speech Processing","courseAbbr":"SPEECH","branch":"CSE,ECE,AIDS","section":"Common","ugYear":["3"]},
  {"id":"faculty-iot-1","name":"Dr. Lokendra Chouhan","email":"iot@iiits.in","courseName":"Internet of Things","courseAbbr":"IOT","branch":"ECE","section":"Common","ugYear":["3"]},
  {"id":"faculty-ias-1","name":"Dr. Sakthi Swaroop","email":"ias@iiits.in","courseName":"Intelligent Autonomous Systems","courseAbbr":"IAS","branch":"ECE","section":"Common","ugYear":["3"]},
  {"id":"faculty-msa-1","name":"Dr. Priyanka Dwivedi","email":"msa@iiits.in","courseName":"Micro Sensors and Actuators","courseAbbr":"MSA","branch":"ECE","section":"Common","ugYear":["3"]},
  {"id":"faculty-one-1","name":"Dr. Visaprasad Kotamaraju","email":"one@iiits.in","courseName":"Opto and Nano Electronics","courseAbbr":"ONE","branch":"ECE","section":"Common","ugYear":["3"]},
  {"id":"faculty-hdl-1","name":"Dr. V. Ramesh Kumar","email":"hdl@iiits.in","courseName":"Verilog Hardware Description Language","courseAbbr":"HDL","branch":"ECE","section":"Common","ugYear":["3"]},
  {"id":"faculty-pe-1","name":"Dr. Paul Brainerd","email":"pe@iiits.in","courseName":"Power Electronics","courseAbbr":"PE","branch":"ECE","section":"Common","ugYear":["3"]},
  {"id":"faculty-cdp-1","name":"Dr. Bulla Rajesh","email":"cdp@iiits.in","courseName":"Compressed Domain Processing","courseAbbr":"CDP","branch":"CSE","section":"Common","ugYear":["4"]},
  {"id":"faculty-dip-1","name":"Dr. Mrinmoy Ghosh","email":"dip@iiits.in","courseName":"Digital Image Processing","courseAbbr":"DIP","branch":"CSE,ECE","section":"Common","ugYear":["4"]},
  {"id":"faculty-avlsi-1","name":"Dr. Priyanka Dwivedi","email":"avlsi@iiits.in","courseName":"Advanced VLSI","courseAbbr":"AVLSI","branch":"CSE","section":"Common","ugYear":["4"]},
  {"id":"faculty-soc-1","name":"Dr. V. Ramesh Kumar","email":"soc@iiits.in","courseName":"System on Chip","courseAbbr":"SOC","branch":"CSE","section":"Common","ugYear":["4"]},
  {"id":"faculty-cb-1","name":"Dr. Santhosh A","email":"cb@iiits.in","courseName":"Computational Biology","courseAbbr":"CB","branch":"CSE","section":"Common","ugYear":["4"]},
  {"id":"faculty-ubc-1","name":"Dr. Hemant Kumar","email":"ubc@iiits.in","courseName":"Ubiquitous Computing","courseAbbr":"UBC","branch":"CSE","section":"Common","ugYear":["4"]},
  {"id":"faculty-wn-1","name":"Dr. Hrishikesh Venkataraman","email":"wn@iiits.in","courseName":"Wireless Networks","courseAbbr":"WN","branch":"CSE,ECE","section":"Common","ugYear":["4"]}
];

const ug2TimetableRaw = [
    { "time": "08:45-09:45", "Monday": ["ACS4 G06", "TOC1 G05"], "Tuesday": ["FFSD1 G06", "DL 112", "AC G05"], "Wednesday": ["TOC1 G05", "TOC3 G06", "ACS4 B03", "IDA 112"], "Thursday": ["FFSD1 Lab 103", "LR4 G05"], "Friday": ["FFSD3 G06", "DL 112"], "Saturday": [] },
    { "time": "09:45-10:45", "Monday": ["CCN1 G06", "CCN3 G07"], "Tuesday": ["FFSD1 G06", "ACS2 G09", "CCN4 G04"], "Wednesday": ["EMTL G06", "TOC2 G05", "AIKR 104"], "Thursday": ["FFSD1 Lab 103", "LR4 G05", "IDA Lab 104"], "Friday": ["ACS1 B03", "FFSD3 G06"], "Saturday": [] },
    { "time": "10:45-11:00", "Monday": ["BREAK"], "Tuesday": ["BREAK"], "Wednesday": ["BREAK"], "Thursday": ["BREAK"], "Friday": ["BREAK"], "Saturday": [] },
    { "time": "11:00-12:00", "Monday": ["CCN4 G05", "FFSD2 G06", "DL Lab 104"], "Tuesday": ["CCN1 G06", "TOC2 G07", "TOC3 G05"], "Wednesday": ["AC Lab 102/114", "DL Lab 106", "FFSD3 G06"], "Thursday": ["ACS3 G05", "FCOMM G06"], "Friday": ["AC G06", "AIKR 104", "AI2 G05"], "Saturday": [] },
    { "time": "12:00-13:00", "Monday": ["FFSD2 G06", "EMTL B03", "DL Lab 104"], "Tuesday": ["AIKR 104"], "Wednesday": ["AC Lab 102/114", "DL Lab 106", "AI1 G05", "AI3 G06"], "Thursday": ["AI2 G06", "AI3 G07", "AI1 G04"], "Friday": ["TOC1 G06", "TOC2 G04", "TOC3 G05", "FCOMM G07"], "Saturday": [] },
    { "time": "13:00-14:00", "Monday": ["LUNCH"], "Tuesday": ["LUNCH"], "Wednesday": ["LUNCH"], "Thursday": ["LUNCH"], "Friday": ["LUNCH"], "Saturday": [] },
    { "time": "14:15-15:15", "Monday": ["AIKR G05", "FCOMM Lab 114/102", "TOC2 G06", "AI G04"], "Tuesday": ["IDA 112", "EMTL G06", "TOC1 G07", "AI2 B03"], "Wednesday": ["FFSD3 Lab G05", "AI2 G06", "DL 112"], "Thursday": ["ACS2 B03", "CCN4 G06", "LR3 G07"], "Friday": ["FFSD1 G06", "ACS3 G07"], "Saturday": [] },
    { "time": "15:15-16:15", "Monday": ["FCOMM Lab 114/102", "ACS1 G06", "AI3 G07", "CCN2 G05"], "Tuesday": ["CCN2 G06", "AC G05", "CCN3 G04", "AI1 G07"], "Wednesday": ["CCN1 B03", "CCN2 G06", "FFSD3 Lab G05"], "Thursday": ["EMTL G06", "LR3 G07", "FFSD2 Lab G05"], "Friday": ["CCN2 G08", "CCN4 G06", "CCN1 G05", "CCN3 G07"], "Saturday": [] },
     { "time": "16:15-16:30", "Monday": ["BREAK"], "Tuesday": ["BREAK"], "Wednesday": ["BREAK"], "Thursday": ["BREAK"], "Friday": ["BREAK"], "Saturday": [] },
    { "time": "16:30-17:30", "Monday": ["IDA 112", "TOC3 G05"], "Tuesday": ["FFSD2 G05", "FCOMM G06", "AI3 G04"], "Wednesday": ["Faculty Meeting"], "Thursday": ["LR1 G07", "CCN3 G06", "FFSD2 Lab G05"], "Friday": ["BTP/Honors"], "Saturday": [] },
    { "time": "17:30-18:30", "Monday": [], "Tuesday": [], "Wednesday": ["LR2 G05"], "Thursday": ["LR1 G07"], "Friday": [], "Saturday": [] }
];

const transformTimetable = (rawTimetable: any[]) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const timetable: any = {};
    days.forEach(day => {
        timetable[day] = rawTimetable.map(slot => ({
            time: slot.time,
            entries: slot[day] || []
        }));
    });
    return timetable;
};

export const dummyTimetable = {
  "UG1": {
    "heading": "UG-1 Timetable",
    "semester": "Spring 2026",
    "timetable": {
      "Monday": [
        { "time": "08:45-09:45", "entries": ["DSA1 G09", "DSA4 G08", "SS2 Lab 103", "OPC3 G07"] },
        { "time": "09:45-10:45", "entries": ["SS2 Lab 103", "PS3 G08"] },
        { "time": "10:45-11:00", "entries": ["BREAK"] },
        { "time": "11:00-12:00", "entries": ["CA2 G09", "PS1 G07", "SS3 Lab 103"] },
        { "time": "12:00-13:00", "entries": ["SS3 Lab 103", "PS2 G09", "CA1 G08", "BEC G07"] },
        { "time": "13:00-14:00", "entries": ["LUNCH"] },
        { "time": "14:15-15:15", "entries": ["SS1 G08", "DSA2 Lab 103", "SS4 G09"] },
        { "time": "15:15-16:15", "entries": ["DSA2 Lab 103", "OPC4 G08"] },
        { "time": "16:15-16:30", "entries": ["BREAK"] },
        { "time": "16:30-17:30", "entries": ["CA4 G08", "PS5 G09", "CA3 G07"] }
      ],
      "Tuesday": [
        { "time": "08:45-09:45", "entries": ["CA4 Lab 103", "BEC Lab 114/102"] },
        { "time": "09:45-10:45", "entries": ["BEC Lab 114/102", "CA4 Lab 103"] },
        { "time": "10:45-11:00", "entries": ["BREAK"] },
        { "time": "11:00-12:00", "entries": ["CA2 Lab 103", "DSA1 G09", "DSA3 G08"] },
        { "time": "12:00-13:00", "entries": ["CA2 Lab 103", "SS1 G09", "SS3 G07"] },
        { "time": "13:00-14:00", "entries": ["LUNCH"] },
        { "time": "14:15-15:15", "entries": ["PS2 G09", "DSA3 Lab 103", "OPC1 G08"] },
        { "time": "15:15-16:15", "entries": ["DSA2 G08", "DSA3 Lab 103", "PS1 G09"] },
        { "time": "16:15-16:30", "entries": ["BREAK"] },
        { "time": "16:30-17:30", "entries": ["SS2 G09", "SS4 G08", "CA1 G07"] }
      ],
      "Wednesday": [
        { "time": "08:45-09:45", "entries": ["DSA1 Lab 103", "PS2 G09", "PS5 G08", "CA3 G07"] },
        { "time": "09:45-10:45", "entries": ["SS2 G08", "DSA1 Lab 103"] },
        { "time": "10:45-11:00", "entries": ["BREAK"] },
        { "time": "11:00-12:00", "entries": ["CA2 G08", "CA1 G07", "DSA4 Lab 103"] },
        { "time": "12:00-13:00", "entries": ["DSA4 Lab 103", "PS4 G09", "PS3 G08"] },
        { "time": "13:00-14:00", "entries": ["LUNCH"] },
        { "time": "14:15-15:15", "entries": ["CA3 Lab 103"] },
        { "time": "15:15-16:15", "entries": ["OPC4 G08", "SS1 G09", "DSA2 G08", "CA3 Lab 103", "PS1 G09"] },
        { "time": "16:15-16:30", "entries": ["BREAK"] },
        { "time": "16:30-17:30", "entries": ["Faculty meeting"] }
      ],
      "Thursday": [
        { "time": "08:45-09:45", "entries": ["PS4 G09", "PS2 G08", "CA3 G07"] },
        { "time": "09:45-10:45", "entries": ["DSA4 G09", "DSA1 G08", "SS3 G07", "OPC2 G06"] },
        { "time": "10:45-11:00", "entries": ["BREAK"] },
        { "time": "11:00-12:00", "entries": ["CA1 Lab 103", "CA2 G09", "CA4 G08"] },
        { "time": "12:00-13:00", "entries": ["CA1 Lab 103", "PS3 G09", "PS4 G08", "SS4 G05"] },
        { "time": "13:00-14:00", "entries": ["LUNCH"] },
        { "time": "14:15-15:15", "entries": ["BEC G09", "SS1 Lab 103"] },
        { "time": "15:15-16:15", "entries": ["SS1 Lab 103", "DSA3 G08", "PS5 G09"] },
        { "time": "16:15-16:30", "entries": ["BREAK"] },
        { "time": "16:30-17:30", "entries": ["AIV2 G08"] }
      ],
      "Friday": [
        { "time": "08:45-09:45", "entries": ["SS3 G09", "SS2 G08", "PS5 G07"] },
        { "time": "09:45-10:45", "entries": ["DSA4 G09", "CA4 G08"] },
        { "time": "10:45-11:00", "entries": ["BREAK"] },
        { "time": "11:00-12:00", "entries": ["PS3 G09", "PS4 G08", "PS1 G07"] },
        { "time": "12:00-13:00", "entries": ["OPC3 G09", "OPC2 B03", "BEC G08"] },
        { "time": "13:00-14:00", "entries": ["LUNCH"] },
        { "time": "14:15-15:15", "entries": ["DSA3 G09", "DSA2 G08", "SS4 Lab 103"] },
        { "time": "15:15-16:15", "entries": ["SS4 Lab 103", "OPC1 G09"] },
        { "time": "16:15-16:30", "entries": ["BREAK"] },
        { "time": "16:30-17:30", "entries": ["AIV1 G09"] }
      ],
      "Saturday": [
        { "time": "08:45-09:45", "entries": ["EDL1/G09"] },
        { "time": "09:45-10:45", "entries": ["EDL1/G09"] },
        { "time": "11:00-12:00", "entries": ["EDL2/G09"] },
        { "time": "12:00-13:00", "entries": ["EDL2/G09"] }
      ]
    }
  },
  "UG2": {
    "heading": "UG-2 Timetable",
    "timetable": transformTimetable(ug2TimetableRaw)
  },
  "UG3": {
    "heading": "UG-3 Timetable",
    "timetable": { "Monday": [], "Tuesday": [], "Wednesday": [], "Thursday": [], "Friday": [], "Saturday": [] }
  },
  "UG4": {
    "heading": "UG-4 Timetable",
    "timetable": { "Monday": [], "Tuesday": [], "Wednesday": [], "Thursday": [], "Friday": [], "Saturday": [] }
  }
};

    