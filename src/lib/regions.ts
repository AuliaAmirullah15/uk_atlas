/**
 * The twelve ITL 1 statistical regions of the United Kingdom: the same
 * carve-up the ONS uses, so the geography is defensible rather than vibes.
 *
 * `lat`/`lon` are the representative settlement for each region and are what
 * gets sent to Open-Meteo, so they need to be real coordinates.
 */

export type Region = {
  slug: string;
  name: string;
  /** Shown on the departure board, which is width-constrained. */
  boardName: string;
  nation: "England" | "Scotland" | "Wales" | "Northern Ireland";
  /** Representative settlement, i.e. the weather station stand-in. */
  city: string;
  lat: number;
  lon: number;
  /**
   * Which side of the pin its label sits on. Position comes from `lat`/`lon`
   * via the shared projection; this only keeps adjacent labels (Cardiff and
   * Bristol, Leeds and Manchester) from colliding.
   */
  labelSide: "left" | "right" | "above" | "below";
  blurb: string;
  /** A local turn of phrase. The fun bit. */
  phrase: { text: string; gloss: string };
  food: { name: string; note: string }[];
  festivals: { name: string; when: string; where: string }[];
  landmarks: string[];
};

export const REGIONS: Region[] = [
  {
    slug: "scotland",
    name: "Scotland",
    boardName: "EDINBURGH",
    nation: "Scotland",
    city: "Edinburgh",
    lat: 55.9533,
    lon: -3.1883,
    labelSide: "right",
    blurb:
      "Granite cities and the largest arts festival on earth, wrapped around a Highland interior that still feels genuinely wild.",
    phrase: { text: "Haste ye back", gloss: "come back soon" },
    food: [
      { name: "Haggis, neeps and tatties", note: "Burns Night, but good all winter." },
      { name: "Cullen skink", note: "Smoked haddock, potato and onion soup from Moray." },
      { name: "Arbroath smokie", note: "Hot-smoked haddock with PGI protection." },
      { name: "Cranachan", note: "Cream, raspberries, toasted oats and whisky." },
      { name: "Tunnock's teacake", note: "Made in Uddingston since 1956." },
    ],
    festivals: [
      { name: "Edinburgh Festival Fringe", when: "August", where: "Edinburgh" },
      { name: "Hogmanay", when: "31 December", where: "Nationwide" },
      { name: "Up Helly Aa", when: "Last Tuesday in January", where: "Lerwick, Shetland" },
      { name: "Celtic Connections", when: "January", where: "Glasgow" },
    ],
    landmarks: [
      "Edinburgh Castle",
      "Ben Nevis",
      "Glenfinnan Viaduct",
      "Isle of Skye",
      "Loch Ness",
    ],
  },
  {
    slug: "northern-ireland",
    name: "Northern Ireland",
    boardName: "BELFAST",
    nation: "Northern Ireland",
    city: "Belfast",
    lat: 54.5973,
    lon: -5.9301,
    labelSide: "left",
    blurb:
      "A basalt coastline of hexagonal columns and cliff-edge rope bridges, with a shipyard city that has turned its industrial past into its best museum.",
    phrase: { text: "What's the craic?", gloss: "what's the news / how are you?" },
    food: [
      { name: "Ulster fry", note: "Includes soda bread and potato bread. Non-negotiable." },
      { name: "Fadge", note: "Potato bread, fried in the pan." },
      { name: "Yellowman", note: "Brittle honeycomb toffee sold at the Ould Lammas Fair." },
      { name: "Dulse", note: "Dried seaweed, eaten like crisps." },
      { name: "Comber potatoes", note: "Early croppers with PGI status." },
    ],
    festivals: [
      { name: "Féile an Phobail", when: "August", where: "West Belfast" },
      { name: "Ould Lammas Fair", when: "Late August", where: "Ballycastle" },
      { name: "Belfast International Arts Festival", when: "October", where: "Belfast" },
    ],
    landmarks: [
      "Giant's Causeway",
      "Titanic Belfast",
      "Dark Hedges",
      "Carrick-a-Rede rope bridge",
      "Mourne Mountains",
    ],
  },
  {
    slug: "north-east-england",
    name: "North East England",
    boardName: "NEWCASTLE",
    nation: "England",
    city: "Newcastle upon Tyne",
    lat: 54.9783,
    lon: -1.6178,
    labelSide: "right",
    blurb:
      "The Roman empire's north-west frontier, a cathedral city on a gorge, and the friendliest vowels in England.",
    phrase: { text: "Why aye, man", gloss: "yes, absolutely" },
    food: [
      { name: "Stottie cake", note: "Dense flat loaf, best filled with ham and pease pudding." },
      { name: "Pease pudding", note: "Split yellow peas, slow-cooked to a savoury paste." },
      { name: "Craster kipper", note: "Oak-smoked herring, smoked in the village since 1856." },
      { name: "Singin' hinnies", note: "Griddle scones that sizzle, hence the name." },
    ],
    festivals: [
      { name: "Great North Run", when: "September", where: "Newcastle to South Shields" },
      { name: "Durham Miners' Gala", when: "July", where: "Durham" },
      { name: "Lindisfarne Festival", when: "September", where: "Beal, Northumberland" },
    ],
    landmarks: [
      "Angel of the North",
      "Hadrian's Wall",
      "Durham Cathedral",
      "Holy Island of Lindisfarne",
      "Tynemouth Priory",
    ],
  },
  {
    slug: "north-west-england",
    name: "North West England",
    boardName: "MANCHESTER",
    nation: "England",
    city: "Manchester",
    lat: 53.4808,
    lon: -2.2426,
    labelSide: "left",
    blurb:
      "Two cities that export music and football to the entire planet, with England's deepest lakes and highest fells an hour north.",
    phrase: { text: "Sound, our kid", gloss: "that's great, mate" },
    food: [
      { name: "Lancashire hotpot", note: "Lamb under sliced potato, baked slowly." },
      { name: "Eccles cake", note: "Flaky pastry packed with currants." },
      { name: "Bury black pudding", note: "Traditionally sold from a market stall with mustard." },
      { name: "Pie barm", note: "A meat and potato pie inside a buttered bread roll. Wigan's finest." },
      { name: "Manchester tart", note: "Custard, raspberry jam and desiccated coconut." },
    ],
    festivals: [
      { name: "Manchester International Festival", when: "Biennial, summer", where: "Manchester" },
      { name: "Grand National", when: "April", where: "Aintree, Liverpool" },
      { name: "Blackpool Illuminations", when: "September to January", where: "Blackpool" },
      { name: "Kendal Calling", when: "July / August", where: "Lowther Deer Park, Cumbria" },
    ],
    landmarks: [
      "Lake District",
      "Liverpool waterfront",
      "Blackpool Tower",
      "Scafell Pike",
      "Manchester's Northern Quarter",
    ],
  },
  {
    slug: "yorkshire-and-the-humber",
    name: "Yorkshire and the Humber",
    boardName: "LEEDS",
    nation: "England",
    city: "Leeds",
    lat: 53.8008,
    lon: -1.5491,
    labelSide: "right",
    blurb:
      "Limestone dales, a medieval minster city, and a clifftop abbey that gave Dracula his landing point.",
    phrase: { text: "Ey up", gloss: "hello" },
    food: [
      { name: "Yorkshire pudding", note: "Batter, hot dripping, and no apologies." },
      { name: "Parkin", note: "Sticky oat and treacle gingerbread, eaten around Bonfire Night." },
      { name: "Wensleydale", note: "Crumbly cheese, traditionally served with fruit cake." },
      { name: "Forced rhubarb", note: "Grown by candlelight in the Rhubarb Triangle. PDO protected." },
      { name: "Fat rascal", note: "A Bettys of Harrogate fruited scone with an almond face." },
    ],
    festivals: [
      { name: "Leeds Festival", when: "August bank holiday", where: "Bramham Park" },
      { name: "Whitby Goth Weekend", when: "April and October", where: "Whitby" },
      { name: "Great Yorkshire Show", when: "July", where: "Harrogate" },
      { name: "Haworth 1940s Weekend", when: "May", where: "Haworth" },
    ],
    landmarks: [
      "York Minster",
      "The Shambles, York",
      "Whitby Abbey",
      "Malham Cove",
      "Yorkshire Dales",
    ],
  },
  {
    slug: "west-midlands",
    name: "West Midlands",
    boardName: "BIRMINGHAM",
    nation: "England",
    city: "Birmingham",
    lat: 52.4862,
    lon: -1.8904,
    labelSide: "left",
    blurb:
      "The workshop of the world, the birthplace of Shakespeare, and more miles of canal than Venice.",
    phrase: { text: "Alright, bab?", gloss: "hello, love" },
    food: [
      { name: "Balti", note: "Invented in Birmingham's Balti Triangle in the 1970s." },
      { name: "Cadbury chocolate", note: "Made at Bournville since 1879." },
      { name: "Staffordshire oatcake", note: "A savoury oat pancake, rolled around cheese and bacon." },
      { name: "Faggots and peas", note: "Seasoned pork meatballs in onion gravy." },
      { name: "Pork scratchings", note: "The Black Country's contribution to the pub." },
    ],
    festivals: [
      { name: "Shakespeare's Birthday Celebrations", when: "April", where: "Stratford-upon-Avon" },
      { name: "Birmingham Pride", when: "May", where: "Birmingham" },
      { name: "Godiva Festival", when: "July", where: "Coventry" },
      { name: "Frankfurt Christmas Market", when: "November / December", where: "Birmingham" },
    ],
    landmarks: [
      "Shakespeare's Birthplace",
      "Ironbridge Gorge",
      "Coventry Cathedral",
      "Library of Birmingham",
      "Cadbury World",
    ],
  },
  {
    slug: "east-midlands",
    name: "East Midlands",
    boardName: "NOTTINGHAM",
    nation: "England",
    city: "Nottingham",
    lat: 52.9548,
    lon: -1.1581,
    labelSide: "right",
    blurb:
      "Gritstone edges and show-cave country in the Peak District, plus the pork pie and blue cheese heartland.",
    phrase: { text: "Ey up mi duck", gloss: "hello there" },
    food: [
      { name: "Melton Mowbray pork pie", note: "Hand-raised, grey-pink inside, PGI protected." },
      { name: "Stilton", note: "Only six dairies in the world may legally make it." },
      { name: "Bakewell pudding", note: "The original: flaky pastry and almond custard, not a tart." },
      { name: "Lincolnshire sausage", note: "Heavy on the sage." },
      { name: "Red Leicester", note: "Coloured with annatto, matured for a firm bite." },
    ],
    festivals: [
      { name: "Download Festival", when: "June", where: "Donington Park" },
      { name: "Goose Fair", when: "October", where: "Nottingham" },
      { name: "Robin Hood Festival", when: "August", where: "Sherwood Forest" },
    ],
    landmarks: [
      "Peak District",
      "Chatsworth House",
      "The Major Oak, Sherwood Forest",
      "Lincoln Cathedral",
      "Nottingham Castle",
    ],
  },
  {
    slug: "east-of-england",
    name: "East of England",
    boardName: "NORWICH",
    nation: "England",
    city: "Norwich",
    lat: 52.6309,
    lon: 1.2974,
    // Left, not right: Norwich is the easternmost pin, so a right-hand label
    // runs off the sheet and drags the whole page into horizontal scroll.
    labelSide: "left",
    blurb:
      "Big skies, lonely saltmarsh, and a university city where the chapel fan vaulting is the widest in the world.",
    phrase: { text: "Do different", gloss: "Norfolk's unofficial motto" },
    food: [
      { name: "Cromer crab", note: "Sweet, small-shelled, landed from crab boats off the beach." },
      { name: "Colchester oyster", note: "Farmed on the Colne since Roman occupation." },
      { name: "Samphire", note: "Picked from the tidal marshes, eaten with butter." },
      { name: "Adnams ale", note: "Brewed at Southwold since 1872." },
    ],
    festivals: [
      { name: "Latitude Festival", when: "July", where: "Henham Park, Suffolk" },
      { name: "Cambridge Folk Festival", when: "July / August", where: "Cambridge" },
      { name: "Norfolk & Norwich Festival", when: "May", where: "Norwich" },
      { name: "Aldeburgh Festival", when: "June", where: "Snape Maltings" },
    ],
    landmarks: [
      "King's College Chapel, Cambridge",
      "Norfolk Broads",
      "Ely Cathedral",
      "Holkham Beach",
      "Southwold Pier",
    ],
  },
  {
    slug: "london",
    name: "London",
    boardName: "LONDON",
    nation: "England",
    city: "London",
    lat: 51.5074,
    lon: -0.1278,
    labelSide: "right",
    blurb:
      "Two thousand years of city, layered on top of itself, where the free museums are world-class and the pie shops are older than most countries.",
    phrase: { text: "Mind the gap", gloss: "between train and platform" },
    food: [
      { name: "Pie and mash with liquor", note: "Parsley liquor, not gravy. Eel and pie houses since the 1800s." },
      { name: "Brick Lane bagel", note: "Boiled, baked, filled with salt beef. Open all night." },
      { name: "Jellied eels", note: "Once the East End's cheap protein. An acquired taste, honestly." },
      { name: "Borough Market", note: "A thousand years of trading on the south bank." },
    ],
    festivals: [
      { name: "Notting Hill Carnival", when: "August bank holiday", where: "West London" },
      { name: "London Marathon", when: "April", where: "Greenwich to The Mall" },
      { name: "Chelsea Flower Show", when: "May", where: "Royal Hospital Chelsea" },
      { name: "Lord Mayor's Show", when: "November", where: "City of London" },
    ],
    landmarks: [
      "Tower of London",
      "Palace of Westminster",
      "British Museum",
      "Tate Modern",
      "Camden Market",
    ],
  },
  {
    slug: "south-east-england",
    name: "South East England",
    boardName: "BRIGHTON",
    nation: "England",
    city: "Brighton",
    lat: 50.8225,
    lon: -0.1372,
    labelSide: "below",
    blurb:
      "Chalk cliffs, hop gardens, and a seaside city with an onion-domed royal palace that looks like it took a wrong turn from Rajasthan.",
    phrase: { text: "DFL", gloss: "Down From London, said of weekenders" },
    food: [
      { name: "Whitstable oyster", note: "Celebrated with its own July festival." },
      { name: "Banoffee pie", note: "Invented at The Hungry Monk in Jevington, East Sussex, 1971." },
      { name: "Kentish cobnuts", note: "Cultivated hazelnuts, sold fresh and green." },
      { name: "English sparkling wine", note: "Same chalk as Champagne, one geological wink away." },
      { name: "Sussex pond pudding", note: "Suet crust around a whole lemon and butter." },
    ],
    festivals: [
      { name: "Brighton Festival and Fringe", when: "May", where: "Brighton" },
      { name: "Glyndebourne Festival", when: "May to August", where: "Lewes" },
      { name: "Jack in the Green", when: "May bank holiday", where: "Hastings" },
      { name: "Goodwood Festival of Speed", when: "July", where: "Chichester" },
    ],
    landmarks: [
      "White Cliffs of Dover",
      "Seven Sisters",
      "Canterbury Cathedral",
      "Royal Pavilion, Brighton",
      "Windsor Castle",
    ],
  },
  {
    slug: "south-west-england",
    name: "South West England",
    boardName: "BRISTOL",
    nation: "England",
    city: "Bristol",
    lat: 51.4545,
    lon: -2.5879,
    // Right, not above: above puts it alongside Cardiff's label and the two
    // become ambiguous about which pin they belong to.
    labelSide: "right",
    blurb:
      "Neolithic stone circles, Roman plumbing, a 95-mile fossil coastline, and the two most contested scones in Britain.",
    phrase: { text: "Alright my lover", gloss: "hello, friend (entirely platonic)" },
    food: [
      { name: "Cornish pasty", note: "Crimped on the side, PGI protected, beef and swede inside." },
      { name: "Cream tea", note: "Cornwall: jam then cream. Devon: cream then jam. Choose carefully." },
      { name: "Clotted cream", note: "Minimum 55% butterfat. A legal definition worth respecting." },
      { name: "West Country Farmhouse Cheddar", note: "PDO: made within four counties only." },
      { name: "Stargazy pie", note: "Pilchard heads poking through the crust, Mousehole, 23 December." },
    ],
    festivals: [
      { name: "Glastonbury Festival", when: "June", where: "Worthy Farm, Pilton" },
      { name: "Bristol International Balloon Fiesta", when: "August", where: "Ashton Court" },
      { name: "Cooper's Hill Cheese-Rolling", when: "May bank holiday", where: "Brockworth" },
      { name: "'Obby 'Oss Day", when: "1 May", where: "Padstow" },
    ],
    landmarks: [
      "Stonehenge",
      "Roman Baths, Bath",
      "Eden Project",
      "St Michael's Mount",
      "Clifton Suspension Bridge",
    ],
  },
  {
    slug: "wales",
    name: "Wales",
    boardName: "CARDIFF",
    nation: "Wales",
    city: "Cardiff",
    lat: 51.4816,
    lon: -3.1791,
    labelSide: "left",
    blurb:
      "More castles per square mile than anywhere on earth, a living language, and a coast path that runs the whole way round.",
    phrase: { text: "Croeso i Gymru", gloss: "welcome to Wales" },
    food: [
      { name: "Cawl", note: "Lamb and leek broth. The national dish." },
      { name: "Welsh rarebit", note: "A proper cheese sauce with ale and mustard, grilled onto toast." },
      { name: "Bara brith", note: "'Speckled bread', a tea-soaked fruit loaf." },
      { name: "Laverbread", note: "Boiled laver seaweed, rolled in oats and fried with cockles." },
      { name: "Glamorgan sausage", note: "Caerphilly cheese, leek and breadcrumbs. No meat." },
    ],
    festivals: [
      { name: "National Eisteddfod", when: "August", where: "Alternating north / south" },
      { name: "Hay Festival", when: "May / June", where: "Hay-on-Wye" },
      { name: "Green Man Festival", when: "August", where: "Glanusk Park, Brecon Beacons" },
    ],
    landmarks: [
      "Yr Wyddfa (Snowdon)",
      "Conwy Castle",
      "Pembrokeshire Coast Path",
      "Portmeirion",
      "Brecon Beacons",
    ],
  },
];

export const REGIONS_BY_SLUG = new Map(REGIONS.map((r) => [r.slug, r]));

export function getRegion(slug: string): Region | undefined {
  return REGIONS_BY_SLUG.get(slug);
}
