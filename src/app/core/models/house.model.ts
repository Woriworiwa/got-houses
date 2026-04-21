export interface House {
  url: string;
  name: string;
  region: string;
  coatOfArms: string;
  words: string;
  titles: string[];
  seats: string[];
  currentLord: string;
  heir: string;
  overlord: string;
  founded: string;
  founder: string;
  diedOut: string;
  ancestralWeapons: string[];
  cadetBranches: string[];
  swornMembers: string[];
}

/**
 * Extracts the numeric ID from a house URL.
 * e.g. "https://anapioficeandfire.com/api/v2/houses/378" => 378
 */
export function houseIdFromUrl(url: string): number {
  const parts = url.split('/');
  return Number(parts[parts.length - 1]);
}
