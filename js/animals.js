/* =====================================================
   FAKE ANIMALS (demo data)
   Later this list will come from the shelters' real data.

   Photos: put files in img/animals/ and list their names in "photos".
   Example: photos: ['rudis-1.jpg', 'rudis-2.jpg']
   No photos listed (or the file is missing)? A big emoji on a colored
   background is shown instead.
   ===================================================== */
window.ANIMALS = [
  {
    id: 'rudis', name: 'Rudis', type: 'dog', emoji: '🐶', color: '#FFE0B8',
    age: '3 m.', sex: 'Patinas', size: 'Vidutinis',
    city: 'Vilnius', shelter: 'Vilniaus prieglauda (demo)',
    tags: ['Žaismingas', 'Draugiškas vaikams', 'Mokosi komandų'],
    description: 'Rudis – energijos pilnas vaikis, kuris myli bėgioti, ieškoti kamuoliuko ir glaustytis vakarais. Su vaikais ir kitais šunimis sutaria puikiai. Jam reikia kantraus žmogaus, kuris padėtų pramokti pirmųjų komandų.',
    photos: ['rudis-1.jpg', 'rudis-2.jpg']
  },
  {
    id: 'murka', name: 'Murka', type: 'cat', emoji: '🐱', color: '#FFD3E6',
    age: '2 m.', sex: 'Patelė', size: 'Maža',
    city: 'Kaunas', shelter: 'Kauno prieglauda (demo)',
    tags: ['Ramaus būdo', 'Murkia', 'Tinka bute'],
    description: 'Murka – švelni ir smalsi katytė. Mėgsta saulėtą palangę, o vakarais murkia ant kelių. Tinka gyventi bute, su vaikais jaučiasi saugiai.',
    photos: ['murka-1.jpg', 'murka-2.jpg']
  },
  {
    id: 'bobas', name: 'Bobas', type: 'dog', emoji: '🐕', color: '#ECE6FF',
    age: '5 m.', sex: 'Patinas', size: 'Didelis',
    city: 'Klaipėda', shelter: 'Klaipėdos prieglauda (demo)',
    tags: ['Ištikimas', 'Mėgsta ilgus pasivaikščiojimus'],
    description: 'Bobas – tikras švelnus milžinas. Ramus, ištikimas ir labai prisirišantis. Labiausiai jam patinka ilgi pasivaikščiojimai ir žmogus, su kuriuo galima dalintis dieną.',
    photos: []
  },
  {
    id: 'puke', name: 'Pūkė', type: 'cat', emoji: '😺', color: '#FFE27A',
    age: '1 m.', sex: 'Patelė', size: 'Maža',
    city: 'Vilnius', shelter: 'Vilniaus prieglauda (demo)',
    tags: ['Žaisminga', 'Pūkuota', 'Mėgsta kitas kates'],
    description: 'Pūkė – kaip mažas debesėlis su letenomis. Mėgsta gaudyti viską, kas juda, o paskui užmigti ant minkštos pagalvės. Su kitomis katėmis sutaria.',
    photos: []
  },
  {
    id: 'zaibas', name: 'Žaibas', type: 'dog', emoji: '🦮', color: '#D6F5E6',
    age: '2 m.', sex: 'Patinas', size: 'Vidutinis',
    city: 'Šiauliai', shelter: 'Šiaulių prieglauda (demo)',
    tags: ['Greitas', 'Protingas', 'Ieško aktyvaus šeimininko'],
    description: 'Žaibas – protingas ir greitas šuo, kuriam reikia veiklos. Puikiai tiktų aktyviam žmogui, mėgstančiam bėgioti ar žygiuoti.',
    photos: []
  },
  {
    id: 'mia', name: 'Mia', type: 'cat', emoji: '🐈', color: '#FFD8C2',
    age: '4 m.', sex: 'Patelė', size: 'Vidutinė',
    city: 'Panevėžys', shelter: 'Panevėžio prieglauda (demo)',
    tags: ['Rami', 'Nepriklausoma', 'Tinka laikinai globai'],
    description: 'Mia – rami ir orų dama. Pirmomis dienomis gali būti drovi, bet greitai atsiveria ir tampa tikra namų karaliene. Puikiai tiktų ir laikinai globai.',
    photos: []
  },
  {
    id: 'tomas', name: 'Tomas', type: 'cat', emoji: '😸', color: '#E3F0FF',
    age: '6 m.', sex: 'Patinas', size: 'Didelis',
    city: 'Alytus', shelter: 'Alytaus prieglauda (demo)',
    tags: ['Meilus', 'Mėgsta glamones'],
    description: 'Tomas – didelis meilužis. Eina paskui žmogų iš kambario į kambarį ir mėgsta, kad jį glostytų. Ieško namų, kuriuose būtų daug dėmesio.',
    photos: []
  },
  {
    id: 'ruda', name: 'Ruda', type: 'dog', emoji: '🐩', color: '#FFE9D6',
    age: '7 m.', sex: 'Patelė', size: 'Maža',
    city: 'Kaunas', shelter: 'Kauno prieglauda (demo)',
    tags: ['Rami', 'Tinka bute', 'Vyresnio amžiaus'],
    description: 'Ruda jau patyrusi gyvenimo, todėl labai vertina šilumą. Rami, tvarkinga, puikiai jaučiasi bute. Tiktų žmogui, kuris ieško ramaus kompanjono.',
    photos: []
  }
];

/* =====================================================
   FAKE SHELTER CONTACTS (shown only after a match)
   Keys must match the "shelter" text of the animals above.
   ===================================================== */
window.SHELTERS = {
  'Vilniaus prieglauda (demo)': { phone: '+370 600 00001', email: 'info@vilnius-prieglauda.example', address: 'Demo g. 1, Vilnius' },
  'Kauno prieglauda (demo)':    { phone: '+370 600 00002', email: 'info@kaunas-prieglauda.example',  address: 'Demo g. 2, Kaunas' },
  'Klaipėdos prieglauda (demo)':{ phone: '+370 600 00003', email: 'info@klaipeda-prieglauda.example',address: 'Demo g. 3, Klaipėda' },
  'Šiaulių prieglauda (demo)':  { phone: '+370 600 00004', email: 'info@siauliai-prieglauda.example',address: 'Demo g. 4, Šiauliai' },
  'Panevėžio prieglauda (demo)':{ phone: '+370 600 00005', email: 'info@panevezys-prieglauda.example',address: 'Demo g. 5, Panevėžys' },
  'Alytaus prieglauda (demo)':  { phone: '+370 600 00006', email: 'info@alytus-prieglauda.example',  address: 'Demo g. 6, Alytus' }
};

// Working hours (same for every demo shelter)
window.SHELTER_HOURS = [
  ['Pirmadienis – penktadienis', '10:00 – 17:00'],
  ['Šeštadienis', '10:00 – 15:00'],
  ['Sekmadienis', 'Nedirbame']
];
