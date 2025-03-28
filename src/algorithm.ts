/**
 * Problem Set 1: Flashcards - Algorithm Functions
 *
 * This file contains the implementations for the flashcard algorithm functions
 * as described in the problem set handout.
 *
 * Please DO NOT modify the signatures of the exported functions in this file,
 * or you risk failing the autograder.
 */

import { Flashcard, AnswerDifficulty, BucketMap } from "./flashcards";

/**
 * Converts a Map representation of learning buckets into an Array-of-Set representation.
 *
 * @param buckets Map where keys are bucket numbers and values are sets of Flashcards.
 * @returns Array of Sets, where element at index i is the set of flashcards in bucket i.
 *          Buckets with no cards will have empty sets in the array.
 * @spec.requires buckets is a valid representation of flashcard buckets.
 */
export function toBucketSets(buckets: BucketMap): Array<Set<Flashcard>> {
  const maxBucket = Math.max(...buckets.keys(), -1);
  const bucketArray: Array<Set<Flashcard>> = Array.from(
    { length: maxBucket + 1 },
    () => new Set<Flashcard>()
  );
  for (const [bucketNumber, flashcardSet] of buckets.entries()) {
    bucketArray[bucketNumber] = flashcardSet;
  }
  return bucketArray;
}

/**
 * Finds the range of buckets that contain flashcards, as a rough measure of progress.
 *
 * @param buckets Array-of-Set representation of buckets.
 * @returns object with minBucket and maxBucket properties representing the range,
 *          or undefined if no buckets contain cards.
 * @spec.requires buckets is a valid Array-of-Set representation of flashcard buckets.
 */
export function getBucketRange(
  buckets: Array<Set<Flashcard>>
): { minBucket: number; maxBucket: number } | undefined {
  let minBucket = buckets.findIndex(bucket => bucket.size > 0);
  if (minBucket === -1) {
    return undefined;
  }
  let maxBucket = buckets.reduceRight((foundIndex, bucket, index) => 
    foundIndex === -1 && bucket.size > 0 ? index : foundIndex, -1);
  
  return { minBucket, maxBucket };
}

/**
 * Selects cards to practice on a particular day.
 *
 * @param buckets Array-of-Set representation of buckets.
 * @param day current day number (starting from 0).
 * @returns a Set of Flashcards that should be practiced on day `day`,
 *          according to the Modified-Leitner algorithm.
 * @spec.requires buckets is a valid Array-of-Set representation of flashcard buckets.
 */
export function practice(
  buckets: Array<Set<Flashcard>>,
  day: number
): Set<Flashcard> {
  const practiceCards = new Set<Flashcard>();
  const practiceBuckets = [
    0,           
    1,           
    2,           
    3,           
    4            
  ];
  
  // practiceBuckets.forEach((bucketIndex, index) => {
  //   if (index === 0 || day % ([4, 10, 30, 100][index - 1]) === 0) {
  //     // Add all cards from this bucket to practice set
  //     for (const card of buckets[bucketIndex] || []) {
  //       practiceCards.add(card);
  //     }
  //   }
  // });
  
  return practiceCards;
}

/**
 * Updates a card's bucket number after a practice trial.
 *
 * @param buckets Map representation of learning buckets.
 * @param card flashcard that was practiced.
 * @param difficulty how well the user did on the card in this practice trial.
 * @returns updated Map of learning buckets.
 * @spec.requires buckets is a valid representation of flashcard buckets.
 */
export function update(
  buckets: BucketMap,
  card: Flashcard,
  difficulty: AnswerDifficulty
): BucketMap {
  // Create a new map to avoid mutating the original
  const updatedBuckets = new Map(buckets);
  
  // Find the current bucket of the card
  let currentBucket = -1;
  for (const [bucketNum, cardSet] of updatedBuckets.entries()) {
    if (cardSet.has(card)) {
      currentBucket = bucketNum;
      cardSet.delete(card);
      break;
    }
  }
  
  // If card not found in any bucket, start from bucket 0
  if (currentBucket === -1) {
    currentBucket = 0;
  }
  
  // Determine new bucket based on difficulty
  let newBucket;
  switch (difficulty) {
    case AnswerDifficulty.Wrong:
      newBucket = 0;  // Move back to first bucket if wrong
      break;
    case AnswerDifficulty.Hard:
      newBucket = Math.max(0, currentBucket - 1);  // Move back one bucket
      break;
    case AnswerDifficulty.Easy:
      newBucket = Math.min(4, currentBucket + 1);  // Move forward one bucket
      break;
  }
  
  // Add card to the new bucket
  if (!updatedBuckets.has(newBucket)) {
    updatedBuckets.set(newBucket, new Set());
  }
  updatedBuckets.get(newBucket)!.add(card);
  
  return updatedBuckets;
}

/**
 * Generates a hint for a flashcard.
 *
 * @param card flashcard to hint
 * @returns a hint for the front of the flashcard.
 * @spec.requires card is a valid Flashcard.
 */
export function getHint(card: Flashcard): string {
  if (card.hint && card.hint.trim() !== '') {
    return card.hint;
  }
  if (card.tags.length > 0) {
    return `Try to remember a card related to: ${card.tags.join(', ')}`;
  }
  return `First few characters: ${card.front.slice(0, 5)}...`;
}
/**
 * Computes statistics about the user's learning progress.
 *
 * @param buckets representation of learning buckets.
 * @param history representation of user's answer history.
 * @returns statistics about learning progress.
 * @spec.requires [SPEC TO BE DEFINED]
 */
export function computeProgress(buckets: any, history: any): any {
  let totalCards = 0;
  const bucketDistribution: number[] = [];
  
  if (Array.isArray(buckets)) {
    // If buckets is an array of sets (from toBucketSets)
    buckets.forEach((bucket, index) => {
      const bucketSize = bucket.size;
      totalCards += bucketSize;
      bucketDistribution[index] = bucketSize;
    });
  } else if (buckets instanceof Map) {
    // If buckets is a Map
    for (const [bucketNum, cardSet] of buckets.entries()) {
      const bucketSize = cardSet.size;
      totalCards += bucketSize;
      bucketDistribution[bucketNum] = bucketSize;
    }
  }
  
  return {
    totalCards,
    bucketDistribution,
  }
}
