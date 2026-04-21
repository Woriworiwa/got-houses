import { House } from '../../core/models/house.model';

export const makeHouse = (name: string): House => ({
  url: 'https://anapioficeandfire.com/api/houses/1',
  name,
  region: '',
  coatOfArms: '',
  words: '',
  titles: [],
  seats: [],
  currentLord: '',
  heir: '',
  overlord: '',
  founded: '',
  founder: '',
  diedOut: '',
  ancestralWeapons: [],
  cadetBranches: [],
  swornMembers: [],
});
