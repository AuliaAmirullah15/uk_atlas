/**
 * ============================================================
 * PROJECTION AND COASTLINE
 * ============================================================
 * The map is stylised, but it is not invented: the coastline and the
 * region pins are projected through the *same* function from real
 * latitude/longitude. That is the point — hand-tuned percentage
 * positions drift out of agreement with the outline the moment either
 * is touched, whereas a shared projection cannot disagree with itself.
 *
 * Projection is equirectangular with a cosine correction on longitude.
 * Without that correction a degree of longitude is drawn as wide as a
 * degree of latitude, and at 54°N the UK comes out looking about 70%
 * too wide. Not a real projection for navigation; correct enough that
 * Britain looks like Britain.
 */

/** Sheet bounds. Ireland deliberately runs off the western edge. */
const LON_MIN = -8.6;
const LON_MAX = 2.1;
const LAT_MIN = 49.7;
const LAT_MAX = 58.9;

/** Mid-sheet latitude, used for the longitude squeeze. */
const MEAN_LAT_RAD = (((LAT_MIN + LAT_MAX) / 2) * Math.PI) / 180;
const LON_SQUEEZE = Math.cos(MEAN_LAT_RAD);

export const VIEW_HEIGHT = 1000;
export const VIEW_WIDTH = Math.round(
  ((LON_MAX - LON_MIN) * LON_SQUEEZE * VIEW_HEIGHT) / (LAT_MAX - LAT_MIN),
);

export function project(lat: number, lon: number): { x: number; y: number } {
  const x =
    ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * VIEW_WIDTH;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * VIEW_HEIGHT;
  return { x, y };
}

/** [lat, lon] pairs. */
type Coord = [number, number];

function toPath(coords: Coord[], close = true): string {
  const points = coords.map(([lat, lon]) => {
    const { x, y } = project(lat, lon);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return `M ${points.join(" L ")}${close ? " Z" : ""}`;
}

/*
  Great Britain, clockwise from Cape Wrath. Headlands and estuary mouths
  only — the west coast of Scotland in particular is radically simplified,
  because at this scale every sea loch would read as noise.
*/
const GREAT_BRITAIN: Coord[] = [
  [58.62, -5.0], // Cape Wrath
  [58.67, -3.37], // Dunnet Head
  [58.64, -3.02], // Duncansby Head
  [58.11, -3.65], // Helmsdale
  [57.6, -4.05], // Inverness, head of the Moray Firth
  [57.69, -2.0], // Fraserburgh
  [57.15, -2.09], // Aberdeen
  [56.71, -2.47], // Montrose
  [56.28, -2.59], // Fife Ness
  [56.06, -2.72], // North Berwick
  [55.91, -2.13], // St Abb's Head
  [55.77, -2.0], // Berwick-upon-Tweed
  [55.02, -1.42], // Tynemouth
  [54.69, -1.19], // Hartlepool
  [54.49, -0.61], // Whitby
  [54.12, -0.08], // Flamborough Head
  [53.58, 0.11], // Spurn Head
  [53.14, 0.34], // Skegness
  [52.94, 0.49], // Hunstanton
  [52.93, 1.3], // Cromer
  [52.61, 1.73], // Great Yarmouth
  [52.09, 1.57], // Orford Ness
  [51.94, 1.29], // Harwich
  [51.53, 0.71], // Thames, Southend
  [51.38, 1.44], // North Foreland
  [51.13, 1.33], // Dover
  [50.91, 0.98], // Dungeness
  [50.74, 0.25], // Beachy Head
  [50.73, -0.79], // Selsey Bill
  [50.9, -1.4], // Southampton Water
  [50.51, -2.46], // Portland Bill
  [50.72, -2.93], // Lyme Regis
  [50.22, -3.65], // Start Point
  [50.35, -4.14], // Plymouth
  [49.96, -5.2], // Lizard Point
  [50.07, -5.72], // Land's End
  [50.42, -5.08], // Newquay
  [51.02, -4.53], // Hartland Point
  [51.21, -4.12], // Ilfracombe
  [51.22, -3.0], // Bridgwater Bay
  [51.5, -2.7], // Avonmouth
  [51.65, -2.68], // Chepstow
  [51.55, -2.99], // Newport
  [51.46, -3.17], // Cardiff
  [51.61, -3.94], // Swansea
  [51.57, -4.33], // Worm's Head
  [51.67, -4.7], // Tenby
  [51.6, -4.94], // St Govan's Head
  [51.9, -5.31], // St David's Head
  [52.08, -4.66], // Cardigan
  [52.41, -4.08], // Aberystwyth
  [52.72, -4.06], // Barmouth
  [52.8, -4.71], // Aberdaron, tip of Llyn
  [53.31, -4.63], // Holyhead
  [53.28, -3.83], // Conwy
  [53.35, -3.32], // Point of Ayr
  [53.4, -3.02], // Wirral
  [53.65, -3.01], // Southport
  [53.82, -3.06], // Blackpool
  [54.07, -2.87], // Morecambe
  [54.06, -3.23], // Barrow
  [54.51, -3.61], // St Bees Head
  [54.87, -3.38], // Silloth
  [54.99, -3.06], // Solway, Gretna
  [54.96, -3.6], // Dumfries
  [54.83, -4.05], // Kirkcudbright
  [54.63, -4.86], // Mull of Galloway
  [54.9, -5.03], // Stranraer
  [55.46, -4.63], // Ayr
  [55.9, -4.9], // Firth of Clyde
  [55.3, -5.6], // Mull of Kintyre
  [56.1, -5.65], // Kintyre, west side
  [56.41, -5.47], // Oban
  [56.73, -6.23], // Ardnamurchan Point
  [57.0, -5.83], // Mallaig
  [57.28, -5.72], // Kyle of Lochalsh
  [57.9, -5.16], // Ullapool
  [58.24, -5.39], // Point of Stoer
];

/*
  Ireland. Only Northern Ireland is in this atlas, but drawing the island
  truncated at the border would be a lie about the geography, so the whole
  island is drawn and simply runs off the western edge of the sheet — the
  way a real OS sheet ends mid-landmass.
*/
const IRELAND: Coord[] = [
  [55.38, -7.37], // Malin Head
  [55.21, -6.15], // Fair Head
  [54.85, -5.79], // Larne
  [54.64, -5.53], // Donaghadee
  [54.33, -5.56], // Strangford mouth
  [54.25, -5.85], // Dundrum Bay
  [54.03, -6.2], // Carlingford Lough
  [53.72, -6.35], // Drogheda
  [53.39, -6.07], // Howth
  [52.96, -6.0], // Wicklow Head
  [52.17, -6.36], // Carnsore Point
  [51.9, -7.8], // south coast, running off-sheet
  [51.6, -10.5],
  [53.0, -10.6],
  [54.2, -10.0],
  [55.1, -8.4],
];

/*
  The Northern Ireland border, heavily simplified. Drawn dashed and
  labelled as approximate, because the real line is famously convoluted
  and a smooth six-point curve should not pretend otherwise.
*/
const NI_BORDER: Coord[] = [
  [54.03, -6.2], // Carlingford Lough
  [54.12, -6.65],
  [54.2, -7.15],
  [54.42, -7.35],
  [54.5, -7.85],
  [54.65, -8.12],
  [54.9, -7.55],
  [55.05, -7.3], // Lough Foyle
];

/*
  Internal nation borders, simplified. Without these, Wales and Scotland
  are invisible as places — the outline alone reads as one undifferentiated
  island, which rather undercuts an atlas organised by nation and region.
*/
const SCOTLAND_ENGLAND_BORDER: Coord[] = [
  [54.98, -3.05], // Solway Firth
  [55.07, -2.85],
  [55.2, -2.55],
  [55.4, -2.3],
  [55.6, -2.1],
  [55.77, -2.02], // Berwick-upon-Tweed
];

const WALES_ENGLAND_BORDER: Coord[] = [
  [53.29, -3.1], // Dee estuary
  [53.05, -2.95],
  [52.9, -3.05],
  [52.7, -2.85],
  [52.5, -3.0],
  [52.3, -2.95],
  [52.0, -2.95],
  [51.8, -2.75],
  [51.63, -2.66], // Severn, near Chepstow
];

export const GB_PATH = toPath(GREAT_BRITAIN);
export const IRELAND_PATH = toPath(IRELAND);
export const NI_BORDER_PATH = toPath(NI_BORDER, false);
export const SCOTLAND_BORDER_PATH = toPath(SCOTLAND_ENGLAND_BORDER, false);
export const WALES_BORDER_PATH = toPath(WALES_ENGLAND_BORDER, false);

/**
 * National Grid ticks every whole degree, for the sheet margin.
 * Decorative — no data is read from them.
 */
export function graticule(): { verticals: number[]; horizontals: number[] } {
  const verticals: number[] = [];
  for (let lon = Math.ceil(LON_MIN); lon <= LON_MAX; lon += 1) {
    verticals.push(project(0, lon).x);
  }
  const horizontals: number[] = [];
  for (let lat = Math.ceil(LAT_MIN); lat <= LAT_MAX; lat += 1) {
    horizontals.push(project(lat, 0).y);
  }
  return { verticals, horizontals };
}
