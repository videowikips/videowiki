import * as Diff from 'diff' ;
import diff from 'deep-diff';

const removeDeletedSlides = function( slides, removedSlidesBatch, callback) {
    const slidesText = slides.map( slide => slide.text ) ;
    // TODO delete audio of removed slides

    // collect indices to be removed from slides
    var removedIndices = [] ;
    var removedSlidesBatch = removedSlidesBatch.map(slide => slide.text);
    removedSlidesBatch.forEach( (slide) => removedIndices.push(slidesText.indexOf(slide)));

    // sort the indeces to be removed in ascending order 
    // to remove slides from the end of the array using removedIndices.pop()
    removedIndices.sort(function(a, b){ return a-b });
    // remove deleted slides from main slides array
    while(removedIndices.length){
      slides.splice(removedIndices.pop(), 1);
    }
    
    return slides; 
}

// gets the added slide with position from the original slides array fetched from wikipedia 
const getSlidesPosition = function(slides, slidesText) {
    var addedSlidesArray = [] ;

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
    // var removedSlidesMap = {} ;
    var removedSlidesText = removedSlidesArray.map(slide => slide.text);
    var addedslidesText = addedSlidesArray.map(slide => slide.text);
    var oldUpdatedSlidesText = oldUpdatedSlides.map(slide => slide.text);
    var updatedslidesArray = [];

    addedslidesText.forEach( (addedSlide, index1) => {
        removedSlidesText.forEach( (removedSlide, index2) => {
            var removedslideArray = removedSlide.split(' ');
            var addedslideArray = addedSlide.split(' ');
            var diffs = diff(removedslideArray, addedslideArray);
            var editCount = 0;
            if(diffs) {
                diffs.forEach( (d, i) => { 
                    if(d.kind == 'E' && 
                      ( (diffs[i-1] && diffs[i-1].lhs != d.rhs) || (diffs[i+1] && diffs[i+1].rhs != d.lhs )) )
                        editCount ++ ;
                        
                    } );
                console.log(editCount, removedslideArray.length , 'edit count ',(editCount / removedslideArray.length * 100) + "% " )
                console.log(diffs)
                // if the difference of edit between two slides is < 25% of the old slide length
                // then it's the same slide, really!
                if((editCount / removedslideArray.length * 100) < 25 ) {
                    console.log('same edited slide', addedSlidesArray[index1]);
                    addedSlidesArray[index1].media = removedSlidesArray[index2].media; 
                    addedSlidesArray[index1].mediaType = removedSlidesArray[index2].mediaType; 
                    updatedslidesArray.push(addedSlidesArray[index1]);
                }

            } else { 
                // its exactly the same text!
                console.log('same slide');
                addedSlidesArray[index1].media = removedSlidesArray[index2].media; 
                addedSlidesArray[index1].mediaType = removedSlidesArray[index2].mediaType; 
                addedSlidesArray[index1].audio = removedSlidesArray[index2].audio; 
                updatedslidesArray.push(addedSlidesArray[index1]);
                // remove audio to protect it from being deleted
                removedSlidesArray[index2].audio = '';
                removedSlidesArray.splice(index2, 1);
            }
        })
    })

    return {addedSlidesArray, updatedslidesArray};

}

// gets the differences between two string arrays
const getDifferences = function( oldArray, newArray) {
        var diffs = Diff.diffArrays(oldArray, newArray);

        // Batch the removed and added slides
        var addedBatch = [];
        var removedBatch = [];
        diffs.forEach( difference => {
            if(difference.added) addedBatch = [ ...addedBatch, ...difference.value]
            if(difference.removed) removedBatch = [...removedBatch ,...difference.value ]
        });

        return { addedBatch, removedBatch };
}



export {
    removeDeletedSlides,
    getSlidesPosition,
    fetchUpdatedSlidesMeta,
    getDifferences
}