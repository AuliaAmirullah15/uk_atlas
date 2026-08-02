/**
 * ============================================================
 * "WHICH REGION SUITS YOU?"
 * ============================================================
 * A recommender, not a personality test. Every question asks what the
 * *visitor* wants (landscape, pace, food, weather tolerance) and the
 * options weight regions by what those places actually offer.
 *
 * That framing is deliberate. A quiz that told you "you're Yorkshire:
 * blunt and thrifty" would be characterising the people who live there,
 * which lands very differently if you are one of them. Weighting on
 * terrain, food and events keeps the claims checkable and the joke
 * pointed at scenery rather than at anyone's personality.
 *
 * Weights are 0 to 3 and deliberately overlapping: several regions can
 * legitimately answer "I want mountains", and a recommender that pretends
 * otherwise is just a lookup table wearing a costume.
 */

import { REGIONS, type Region } from "@/lib/regions";

type Slug = Region["slug"];
type Weights = Partial<Record<Slug, number>>;

export type QuizOption = {
  id: string;
  label: string;
  weights: Weights;
};

export type QuizQuestion = {
  id: string;
  /** The legend for the fieldset. Must read as a full question. */
  prompt: string;
  options: QuizOption[];
};

export const QUESTIONS: QuizQuestion[] = [
  {
    id: "landscape",
    prompt: "What do you want out of the window?",
    options: [
      {
        id: "mountains",
        label: "Mountains, and the bigger the better",
        weights: {
          scotland: 3,
          wales: 3,
          "north-west-england": 3,
          "northern-ireland": 2,
          "north-east-england": 1,
          "east-midlands": 1,
        },
      },
      {
        id: "coast",
        label: "Coastline: cliffs, harbours, cold water",
        weights: {
          "south-west-england": 3,
          "northern-ireland": 3,
          "south-east-england": 2,
          "east-of-england": 2,
          "north-east-england": 2,
          scotland: 2,
          wales: 2,
        },
      },
      {
        id: "farmland",
        label: "Rolling farmland and big skies",
        weights: {
          "east-of-england": 3,
          "yorkshire-and-the-humber": 2,
          "east-midlands": 2,
          "south-east-england": 2,
          "west-midlands": 1,
        },
      },
      {
        id: "streets",
        label: "Streets, ideally with something built on them",
        weights: {
          london: 3,
          "west-midlands": 3,
          "north-west-england": 2,
          "yorkshire-and-the-humber": 1,
          scotland: 1,
        },
      },
    ],
  },
  {
    id: "afternoon",
    prompt: "It's a free afternoon. What are you doing?",
    options: [
      {
        id: "walk",
        label: "A ridge walk with no phone signal",
        weights: {
          "north-west-england": 3,
          wales: 3,
          scotland: 3,
          "east-midlands": 2,
          "yorkshire-and-the-humber": 2,
          "northern-ireland": 2,
        },
      },
      {
        id: "gallery",
        label: "A gallery, then a very long lunch",
        weights: {
          london: 3,
          "north-west-england": 2,
          "south-west-england": 2,
          scotland: 2,
          "west-midlands": 1,
        },
      },
      {
        id: "ruins",
        label: "Poking round something very old",
        weights: {
          "north-east-england": 3,
          "south-west-england": 3,
          wales: 3,
          "west-midlands": 2,
          "yorkshire-and-the-humber": 2,
          "east-of-england": 2,
        },
      },
      {
        id: "water",
        label: "Sitting near water doing very little",
        weights: {
          "east-of-england": 3,
          "south-east-england": 2,
          "north-west-england": 2,
          "south-west-england": 2,
          "northern-ireland": 1,
        },
      },
    ],
  },
  {
    id: "food",
    prompt: "Pick the meal you'd travel for.",
    options: [
      {
        id: "seafood",
        label: "Shellfish landed that morning",
        weights: {
          "east-of-england": 3,
          "south-west-england": 3,
          "south-east-england": 3,
          scotland: 2,
          "northern-ireland": 2,
          "north-east-england": 2,
        },
      },
      {
        id: "pie",
        label: "Something pastry-based, with gravy",
        weights: {
          "north-west-england": 3,
          "east-midlands": 3,
          london: 2,
          "yorkshire-and-the-humber": 2,
          "west-midlands": 2,
        },
      },
      {
        id: "cheese",
        label: "Cheese, bread and a pint of cider",
        weights: {
          "south-west-england": 3,
          "east-midlands": 3,
          wales: 2,
          "west-midlands": 2,
          "east-of-england": 1,
        },
      },
      {
        id: "spice",
        label: "Something with a serious amount of chilli in it",
        weights: {
          "west-midlands": 3,
          london: 3,
          "north-west-england": 2,
          "yorkshire-and-the-humber": 1,
        },
      },
    ],
  },
  {
    id: "pace",
    prompt: "How busy do you want it?",
    options: [
      {
        id: "city",
        label: "Proper city: noise, transport, options",
        weights: {
          london: 3,
          "west-midlands": 3,
          "north-west-england": 3,
          "yorkshire-and-the-humber": 2,
          scotland: 2,
        },
      },
      {
        id: "town",
        label: "A market town I can walk across",
        weights: {
          "yorkshire-and-the-humber": 3,
          "east-of-england": 3,
          "south-east-england": 2,
          "east-midlands": 2,
          "west-midlands": 1,
          wales: 1,
        },
      },
      {
        id: "remote",
        label: "Genuinely remote. Bring a map.",
        weights: {
          scotland: 3,
          wales: 3,
          "north-east-england": 2,
          "north-west-england": 2,
          "northern-ireland": 2,
        },
      },
    ],
  },
  {
    id: "weather",
    prompt: "Be honest about the weather.",
    options: [
      {
        id: "stoic",
        label: "I'll take rain if the views pay off",
        weights: {
          scotland: 3,
          wales: 3,
          "north-west-england": 3,
          "northern-ireland": 3,
          "north-east-england": 2,
        },
      },
      {
        id: "warm",
        label: "I want the warmest, driest option going",
        weights: {
          "south-east-england": 3,
          london: 3,
          "east-of-england": 3,
          "south-west-england": 2,
        },
      },
      {
        id: "indoors",
        label: "Doesn't matter. I'll mostly be indoors",
        weights: {
          london: 3,
          "west-midlands": 2,
          "yorkshire-and-the-humber": 2,
          "north-west-england": 2,
          scotland: 1,
        },
      },
    ],
  },
  {
    id: "evening",
    prompt: "And the evening?",
    options: [
      {
        id: "session",
        label: "A pub with live music and no stage",
        weights: {
          "northern-ireland": 3,
          scotland: 3,
          wales: 2,
          "north-east-england": 2,
          "south-west-england": 1,
        },
      },
      {
        id: "gig",
        label: "A proper venue: theatre, gig, opera, whatever",
        weights: {
          london: 3,
          "north-west-england": 3,
          "west-midlands": 2,
          "south-east-england": 2,
          "yorkshire-and-the-humber": 2,
        },
      },
      {
        id: "festival",
        label: "A field, several thousand people, questionable toilets",
        weights: {
          "south-west-england": 3,
          "east-midlands": 3,
          "east-of-england": 2,
          "yorkshire-and-the-humber": 2,
          wales: 2,
        },
      },
      {
        id: "early",
        label: "Early night. Big walk tomorrow.",
        weights: {
          "north-west-england": 3,
          wales: 2,
          scotland: 2,
          "east-midlands": 2,
          "north-east-england": 2,
        },
      },
    ],
  },
];

export type QuizAnswers = Record<string, string>;

export type ScoredRegion = {
  region: Region;
  score: number;
  /** Score as a percentage of the best achievable score. */
  match: number;
};

/**
 * Sums the weights of the chosen options per region.
 *
 * `match` is normalised against the top scorer rather than the theoretical
 * maximum. Normalising against the maximum would mean nobody ever scores
 * above about 60%, which reads as a bad result rather than a clear winner.
 */
export function scoreAnswers(answers: QuizAnswers): ScoredRegion[] {
  const totals = new Map<Slug, number>();

  for (const question of QUESTIONS) {
    const chosenId = answers[question.id];
    if (!chosenId) continue;
    const option = question.options.find((o) => o.id === chosenId);
    if (!option) continue;
    for (const [slug, weight] of Object.entries(option.weights)) {
      totals.set(slug, (totals.get(slug) ?? 0) + (weight ?? 0));
    }
  }

  const scored = REGIONS.map((region) => ({
    region,
    score: totals.get(region.slug) ?? 0,
    match: 0,
  }));

  scored.sort(
    (a, b) => b.score - a.score || a.region.name.localeCompare(b.region.name),
  );

  const best = scored[0]?.score ?? 0;
  return scored.map((entry) => ({
    ...entry,
    match: best === 0 ? 0 : Math.round((entry.score / best) * 100),
  }));
}

export const TOTAL_QUESTIONS = QUESTIONS.length;
