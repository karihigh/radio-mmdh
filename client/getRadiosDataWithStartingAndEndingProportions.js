const RADIOS_STATIC_SPACE_PROPORTION = 1 / 1


export default async function getRadiosDataWithStartingAndEndingProportions(
  radiosDataJsonFilePath
) {
  // The following read of the JSON file could have been done with another library but
  // given that we are already using d3, there was no reason to not use its
  // implementation
  const radiosData = await d3.json(radiosDataJsonFilePath);
  
  const radiosAmount = radiosData.length;
  // Reference to a and b
  const eachRadioSpaceProportion = 1 / (radiosAmount * (1 + (1/RADIOS_STATIC_SPACE_PROPORTION)))
  const eachStaticSpaceProportion = eachRadioSpaceProportion / RADIOS_STATIC_SPACE_PROPORTION

  let currentRadioStartingProportion = eachStaticSpaceProportion / 2
  let currentRadioEndingProportion = currentRadioStartingProportion + eachRadioSpaceProportion
  const radiosProcessedData = radiosData.map((radioData) => {
    radioData.startingDialProportion = currentRadioStartingProportion;
    radioData.endingDialProportion = currentRadioEndingProportion;
    currentRadioStartingProportion += (eachRadioSpaceProportion + eachStaticSpaceProportion)
    currentRadioEndingProportion += (eachRadioSpaceProportion + eachStaticSpaceProportion)
    return radioData;
  })

  return { radiosProcessedData, eachRadioSpaceProportion, eachStaticSpaceProportion };
}