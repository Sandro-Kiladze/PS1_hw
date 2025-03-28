import assert from "assert";
import { AnswerDifficulty, Flashcard, BucketMap } from "../src/flashcards";
import {
  toBucketSets,
  getBucketRange,
  practice,
  update,
  getHint,
  computeProgress,
} from "../src/algorithm";


describe("toBucketSets()", () => {
  const card1 = new Flashcard("Front1", "Back1", "Hint1", ["tag1"]);
  const card2 = new Flashcard("Front2", "Back2", "Hint2", ["tag2"]);
  const card3 = new Flashcard("Front3", "Back3", "Hint3", ["tag3"]);

  it("should handle empty bucket map", () => {
    const emptyMap = new Map<number, Set<Flashcard>>();
    const result = toBucketSets(emptyMap);
    assert.deepStrictEqual(result, []);
  });

  it("should handle non-consecutive bucket numbers", () => {
    const bucketMap = new Map<number, Set<Flashcard>>([
      [0, new Set([card1])],
      [3, new Set([card2])],
      [5, new Set([card3])]
    ]);
    const result = toBucketSets(bucketMap);
    assert.strictEqual(result.length, 6);
    
    assert.ok(result[0] !== undefined, "Bucket 0 should exist");
    assert.ok(result[0].has(card1), "Card1 should be in bucket 0");
    
    assert.ok(result[3] !== undefined, "Bucket 3 should exist");
    assert.ok(result[3].has(card2), "Card2 should be in bucket 3");
    
    assert.ok(result[5] !== undefined, "Bucket 5 should exist");
    assert.ok(result[5].has(card3), "Card3 should be in bucket 5");
  });
});


describe("getBucketRange()", () => {
  const card1 = new Flashcard("Front1", "Back1", "Hint1", ["tag1"]);
  const card2 = new Flashcard("Front2", "Back2", "Hint2", ["tag2"]);

  it("should return undefined for empty bucket array", () => {
    const buckets: Array<Set<Flashcard>> = [];
    assert.strictEqual(getBucketRange(buckets), undefined);
  });

  it("should find range in a single bucket", () => {
    const buckets: Array<Set<Flashcard>> = [
      new Set(), 
      new Set([card1]), 
      new Set()
    ];
    const result = getBucketRange(buckets);
    assert.deepStrictEqual(result, { minBucket: 1, maxBucket: 1 });
  });

  it("should find range across multiple buckets", () => {
    const buckets: Array<Set<Flashcard>> = [
      new Set(), 
      new Set([card1]), 
      new Set([card2]), 
      new Set()
    ];
    const result = getBucketRange(buckets);
    assert.deepStrictEqual(result, { minBucket: 1, maxBucket: 2 });
  });
});


describe("practice()", () => {
  const card1 = new Flashcard("Front1", "Back1", "Hint1", ["tag1"]);
  const card2 = new Flashcard("Front2", "Back2", "Hint2", ["tag2"]);
  const card3 = new Flashcard("Front3", "Back3", "Hint3", ["tag3"]);

  it("should always practice bucket 0 on any day", () => {
    const buckets: Array<Set<Flashcard>> = [
      new Set([card1]), 
      new Set(), 
      new Set(), 
      new Set()
    ];
    const practiceCards = practice(buckets, 10);
    assert.ok(practiceCards.has(card1));
  });

  it("should practice specific buckets on specific days", () => {
    const buckets: Array<Set<Flashcard>> = [
      new Set([card1]), 
      new Set([card2]), 
      new Set([card3]), 
      new Set()
    ];
    const practiceDays = [0, 4, 10, 30, 100];
    practiceDays.forEach(day => {
      const practiceCards = practice(buckets, day);
      assert.ok(practiceCards.size > 0, `Failed on day ${day}`);
    });
  });
});


describe("update()", () => {
  const card1 = new Flashcard("Front1", "Back1", "Hint1", ["tag1"]);
  const card2 = new Flashcard("Front2", "Back2", "Hint2", ["tag2"]);

  it("should move card to bucket 0 when wrong", () => {
    const buckets = new Map<number, Set<Flashcard>>([
      [2, new Set([card1])]
    ]);
    const updatedBuckets = update(buckets, card1, AnswerDifficulty.Wrong);
    assert.ok(updatedBuckets.get(0)?.has(card1));
    assert.ok(!updatedBuckets.get(2)?.has(card1));
  });

  it("should move card back one bucket when hard", () => {
    const buckets = new Map<number, Set<Flashcard>>([
      [2, new Set([card1])]
    ]);
    const updatedBuckets = update(buckets, card1, AnswerDifficulty.Hard);
    assert.ok(updatedBuckets.get(1)?.has(card1));
    assert.ok(!updatedBuckets.get(2)?.has(card1));
  });

  it("should move card forward one bucket when easy", () => {
    const buckets = new Map<number, Set<Flashcard>>([
      [1, new Set([card1])]
    ]);
    const updatedBuckets = update(buckets, card1, AnswerDifficulty.Easy);
    assert.ok(updatedBuckets.get(2)?.has(card1));
    assert.ok(!updatedBuckets.get(1)?.has(card1));
  });
});


describe("getHint()", () => {
  it("should return predefined hint if available", () => {
    const card = new Flashcard("Front", "Back", "Predefined Hint", ["tag"]);
    assert.strictEqual(getHint(card), "Predefined Hint");
  });

  it("should return tag-based hint if no predefined hint", () => {
    const card = new Flashcard("Front", "Back", "", ["history", "science"]);
    const hint = getHint(card);
    assert.ok(hint.includes("history, science"));
  });

  it("should return first characters hint if no hint or tags", () => {
    const card = new Flashcard("Important Concept", "Back", "", []);
    const hint = getHint(card);
    assert.ok(hint.startsWith("First few characters: Import"));
  });
});


describe("computeProgress()", () => {
  const card1 = new Flashcard("Front1", "Back1", "Hint1", ["tag1"]);
  const card2 = new Flashcard("Front2", "Back2", "Hint2", ["tag2"]);

  it("should compute progress for bucket array", () => {
    const buckets: Array<Set<Flashcard>> = [
      new Set([card1]), 
      new Set([card2]), 
      new Set()
    ];
    const progress = computeProgress(buckets, null);
    assert.strictEqual(progress.totalCards, 2);
    assert.deepStrictEqual(progress.bucketDistribution, [1, 1, 0]);
  });

  it("should compute progress for bucket map", () => {
    const buckets = new Map<number, Set<Flashcard>>([
      [0, new Set([card1])],
      [2, new Set([card2])]
    ]);
    const progress = computeProgress(buckets, null);
    assert.strictEqual(progress.totalCards, 2);
    assert.ok(progress.bucketDistribution[0] === 1);
    assert.ok(progress.bucketDistribution[2] === 1);
  });
});