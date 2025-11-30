'use strict';

const CREW_ROSTER = [
  { name: 'Captain Jean-Luc Picard', slug: 'Jean-Luc_Picard', crewKey: 'crew-captain-jean-luc-picard' },
  { name: 'Commander William Riker', slug: 'William_T._Riker', crewKey: 'crew-commander-william-riker' },
  { name: 'Commander Data', slug: 'Data', crewKey: 'crew-commander-data' },
  { name: 'Lt. Commander Geordi La Forge', slug: 'Geordi_La_Forge', crewKey: 'crew-geordi-la-forge' },
  { name: 'Lieutenant Worf', slug: 'Worf', crewKey: 'crew-lieutenant-worf' },
  { name: 'Counselor Deanna Troi', slug: 'Deanna_Troi', crewKey: 'crew-counselor-deanna-troi' },
  { name: 'Dr. Beverly Crusher', slug: 'Beverly_Crusher', crewKey: 'crew-dr-beverly-crusher' },
  { name: 'Lieutenant Nyota Uhura', slug: 'Nyota_Uhura', crewKey: 'crew-lieutenant-uhura' },
  { name: "Chief Miles O'Brien", slug: 'Miles_O%27Brien', crewKey: 'crew-chief-obrien' },
  { name: 'Quark', slug: 'Quark', crewKey: 'crew-quark' }
];

function computeSimilarity(textA, textB) {
  if (!textA || !textB) {
    return 0;
  }

  const wordsFrom = text => new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean)
  );

  const wordsA = wordsFrom(textA);
  const wordsB = wordsFrom(textB);

  if (wordsA.size === 0 || wordsB.size === 0) {
    return 0;
  }

  const intersectionSize = [...wordsA].filter(word => wordsB.has(word)).length;
  const unionSize = new Set([...wordsA, ...wordsB]).size || 1;

  return intersectionSize / unionSize;
}

module.exports = {
  CREW_ROSTER,
  computeSimilarity
};

