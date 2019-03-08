import * as Diff from 'diff' ;
import diff from 'deep-diff';
import { deleteAudios } from '../../utils'
const console = process.console;

const removeDeletedSlides = function( slides, removedSlidesArray, addedSlidesArray, callback) {
    if(removedSlidesArray && removedSlidesArray.length > 0){
        const slidesText = slides.map( slide => slide.text ) ;
        const addedSlidesAudios = addedSlidesArray.filter(slide => {return slide.audio}).map( slide => slide.audio);
        let removedAudios = JSON.parse(JSON.stringify(removedSlidesArray));
        // escape audios for only updated position slides
        removedAudios = removedAudios.filter(slide => {return slide.audio} ).filter(slide => {return addedSlidesAudios.indexOf(slide.audio) == -1 });
        // extract audio name to be removed from S3
        removedAudios = removedAudios.filter(slide => {return slide.audio;} ).map( slide => slide.audio.split('/')[3] );
        // delete audio of removed slides
        deleteAudios(removedAudios, (err, data) => {
            if(err) console.log(err);
            else {
                console.log('Unused audios Deleted Successfully! ', data);
            }
            // collect indices to be removed from slides
            let removedIndices = [] ;
            let removedSlidesBatch = removedSlidesArray.map(slide => slide.text);
            removedSlidesBatch.forEach( (slide) => removedIndices.push(slidesText.indexOf(slide)));

            // sort the indeces to be removed in ascending order 
            // to remove slides from the end of the array using removedIndices.pop()
            removedIndices.sort(function(a, b){ return a-b });
            // remove deleted slides from main slides array
            while(removedIndices.length){
                slides.splice(removedIndices.pop(), 1);
            }
            
            return callback(null, slides);
        });
    } else {
        return callback(null, slides);
    }
    
}

// gets the added slide with position from the original slides array fetched from wikipedia 
const getSlidesPosition = function(slides, slidesText) {
    let addedSlidesArray = [] ;

    if(Array.isArray(slidesText)){
        // filter the slides array and return only with text included in slidesText
        addedSlidesArray = slides.filter((slide) => {
            return slidesText.indexOf(slide.text) > -1;
        });
    }
    
    return addedSlidesArray;
}


// updated slides have position intersect between added and removed slides
const fetchUpdatedSlidesMeta = function(oldUpdatedSlides, addedSlidesArray, removedSlidesArray) {
    // let removedSlidesMap = {} ;
    let removedSlidesText = removedSlidesArray.map(slide => slide.text);
    let addedslidesText = addedSlidesArray.map(slide => slide.text);
    let oldUpdatedSlidesText = oldUpdatedSlides.map(slide => slide.text);
    let updatedslidesArray = [];

    addedslidesText.forEach( (addedSlide, index1) => {
        removedSlidesText.forEach( (removedSlide, index2) => {
            let removedslideArray = removedSlide.split(' ');
            let addedslideArray = addedSlide.split(' ');
            let diffs = diff(removedslideArray, addedslideArray);
            let editCount = 0;
            if(diffs) {
                diffs.forEach( (d, i) => { 
                    if(d.kind == 'E' && 
                      ( (diffs[i-1] && diffs[i-1].lhs != d.rhs) || (diffs[i+1] && diffs[i+1].rhs != d.lhs )) )
                        editCount ++ ;
                        
                    } );
                // if the difference of edit between two slides is < 70% of the old slide length
                // then it's the same slide, really!
                if((editCount / removedslideArray.length * 100) < 70 ) {
                    addedSlidesArray[index1].media = removedSlidesArray[index2].media; 
                    addedSlidesArray[index1].mediaType = removedSlidesArray[index2].mediaType; 
                    if (updatedslidesArray.map(slide => slide.text).indexOf(addedSlidesArray[index1].text) < 0)
                    updatedslidesArray.push(addedSlidesArray[index1]);
                }

            } else { 
                // its exactly the same text!
                addedSlidesArray[index1].media = removedSlidesArray[index2].media; 
                addedSlidesArray[index1].mediaType = removedSlidesArray[index2].mediaType; 
                addedSlidesArray[index1].audio = removedSlidesArray[index2].audio; 
                updatedslidesArray.push(addedSlidesArray[index1]);
                // remove audio to protect it from being deleted
                removedSlidesArray[index2].audio = '';
                // removedSlidesArray.splice(index2, 1,{});
            }
        })
    })

    return {addedSlidesArray, updatedslidesArray};

}

// gets the differences between two string arrays
const getDifferences = function( oldArray, newArray) {
        let diffs = Diff.diffArrays(oldArray, newArray);

        // Batch the removed and added slides
        let addedBatch = [];
        let removedBatch = [];
        diffs.forEach( difference => {
            if(difference.added) addedBatch = [ ...addedBatch, ...difference.value]
            if(difference.removed) removedBatch = [...removedBatch ,...difference.value ]
        });

        return { addedBatch, removedBatch };
}

// adds media for slides that doesn't have any
const addRandomMediaOnSlides = function(slides, addedSlidesArray) {
    const mediaArray = slides.filter(slide => slide.media ).map(slide => [slide.media, slide.mediaType] );
    const defaultMediaPath = '/img/upload-media.png';
    let randIndex ; 

    // revert to default media link 
    addedSlidesArray.forEach( slide => {
        if(!slide.media) {
            slide.media = defaultMediaPath ;
            slide.mediaType = 'image';
        }
    });

    return addedSlidesArray;
    
    // if(mediaArray && mediaArray.length > 0){
    //     // there's some media in the article !
    //     addedSlidesArray.forEach( slide => {
    //         // if there's no media on the added slide, generate random index and add random media 
    //         if(!slide.media) {
    //             randIndex = Math.floor(Math.random() * (mediaArray.length - 1));
    //             slide.media = mediaArray[randIndex][0];
    //             slide.mediaType = mediaArray[randIndex][1];
    //         }
    //     });   
    // } else {
    //     // there's no media ! revert to default media link 
    //     addedSlidesArray.forEach( slide => {
    //         if(!slide.media) {
    //             slide.media = defaultMediaPath ;
    //             slide.mediaType = 'image';
    //         }
    //     });
    // }
}

// Gets the matching section for the current new section from the old sections
function getMatchingSection(oldSections, newSections, sectionIndex) {
  const section = newSections[sectionIndex];
  // Get matching section based on title, tocleve and tocnumber
  let matchinSection = oldSections.find((sec) => (section.title === sec.title && section.toclevel === sec.toclevel && section.tocnumber === sec.tocnumber));

  // if doesnt exist, search by prev/following sections
  if (!matchinSection) {
    if (sectionIndex !== 0 && sectionIndex !== newSections.length - 1) {
      // Has prev and next sections
      const prevSection = newSections[sectionIndex - 1];
      const nextSection = newSections[sectionIndex + 1];
      matchinSection = oldSections.find((sec, secIndex) => {
        if (secIndex === 0 || secIndex === oldSections.length - 1) return false;
        return sec.title === section.title && oldSections[secIndex - 1].title === prevSection.title && oldSections[secIndex + 1].title === nextSection.title;
      });
    } else if (sectionIndex === 0 && sectionIndex !== newSections.length - 1) {
      // Has only next section ( first section )
      const nextSection = newSections[sectionIndex + 1];
      matchinSection = oldSections.find((sec, secIndex) => {
        if (secIndex === oldSections.length - 1) return false;
        return sec.title === section.title && oldSections[secIndex + 1].title === nextSection.title;
      });
    } else if (sectionIndex !== 0 && sectionIndex === newSections.length - 1) {
      // Has only prev section ( last section )
      const prevSection = newSections[sectionIndex - 1];
      matchinSection = oldSections.find((sec, secIndex) => {
        if (secIndex === 0) return false;
        return sec.title === section.title && oldSections[secIndex - 1].title === prevSection.title;
      });
    }
  }
  // Last resort, find section by title
  if (!matchinSection) {
    matchinSection = oldSections.find((sec) => sec.title === section.title);
  }

  // If the section wasn't found by now, it might have been renamed
  // Check if the section was renamed by comparing prev/following sections titles
  if (!matchinSection) {
    if (sectionIndex !== 0 && sectionIndex !== newSections.length - 1) {
      // Has prev and next sections
      const prevSection = newSections[sectionIndex - 1];
      const nextSection = newSections[sectionIndex + 1];
      matchinSection = oldSections.find((sec, secIndex) => {
        if (secIndex === 0 || secIndex === oldSections.length - 1) return false;
        return section.toclevel === sec.toclevel && section.tocnumber === sec.tocnumber && oldSections[secIndex - 1].title === prevSection.title && oldSections[secIndex + 1].title === nextSection.title;
      });
    } else if (sectionIndex === 0 && sectionIndex !== newSections.length - 1) {
      // Has only next section ( first section )
      const nextSection = newSections[sectionIndex + 1];
      matchinSection = oldSections.find((sec, secIndex) => {
        if (secIndex === oldSections.length - 1) return false;
        return section.toclevel === sec.toclevel && section.tocnumber === sec.tocnumber && oldSections[secIndex + 1].title === nextSection.title;
      });
    } else if (sectionIndex !== 0 && sectionIndex === newSections.length - 1) {
      // Has only prev section ( last section )
      const prevSection = newSections[sectionIndex - 1];
      matchinSection = oldSections.find((sec, secIndex) => {
        if (secIndex === 0) return false;
        return section.toclevel === sec.toclevel && section.tocnumber === sec.tocnumber && oldSections[secIndex - 1].title === prevSection.title;
      });
    }
  }

  return matchinSection;
}

export {
    removeDeletedSlides,
    getSlidesPosition,
    fetchUpdatedSlidesMeta,
    getDifferences,
    addRandomMediaOnSlides,
    getMatchingSection,
}
