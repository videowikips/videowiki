import wiki from 'wikijs'
import request from 'request'
import async from 'async'
import slug from 'slug'

import Article from '../../models/Article'
import User from '../../models/User'

import { paragraphs, splitter, textToSpeech } from '../../utils'

import { getSectionText } from '../../controllers/wiki';
// import { oldUpdatedSlides } from './updatedSections';
import * as Diff from 'diff' ;



const bottest = function(req, res) {
    const title = 'Shah_Rukh_Khan';
    updateArticle(title, (err, result) =>{
        if(err) return res.json({err: JSON.strigify(err)})
        return res.json(result)
    });
}

const updateArticle = function(title, callback) {
    getLatestData(title, (err, data) => {
       
        Article.find({title: title }, (err, articles) => {
            if(err) return callback(err);
            // return callback(err, articles);
            updateArticleSlides(articles[0].slides, data.slides, (err2, result) => {
                callback(err2, {result, sections: data.sections});
            });

        });

        // updateArticleSlides(data.slides, (err, result) => {
        //     callback(err, result);
        // });

    })


}

const updateArticleSlides = function(oldUpdatedSlides, slides, callback) {

        const oldSlidesText = oldUpdatedSlides.map(obj => obj.text);
        const slidesText = slides.map(obj => obj.text);

        // var diffs = Diff.diffArrays(oldSlidesText, slidesText);

        // Batch the removed and added slides
        // var addedSlidesBatch = [];
        // var removedSlidesBatch = [];
        // diffs.forEach( difference => {
        //     if(difference.added) addedSlidesBatch = [ ...addedSlidesBatch, ...difference.value]
        //     if(difference.removed) removedSlidesBatch = [...removedSlidesBatch ,...difference.value ]
        // });
        var diffs = getDifferences(oldSlidesText, slidesText)  ;
        var addedSlidesBatch = diffs.addedBatch;
        var removedSlidesBatch = diffs.removedBatch;
        // get the slides array after removing the deleted slides
        var removedSlidesArray = getSlidesPosition(oldUpdatedSlides, removedSlidesBatch);
        var updatedSlides  = removeDeletedSlides(oldUpdatedSlides, removedSlidesBatch);
        // get the slides array after inserting the new slides
        var addedSlidesArray = getSlidesPosition(slides, addedSlidesBatch);
        // fetch old media to updated slides, 
        addedSlidesArray = fetchUpdatedSlidesMeta(addedSlidesArray, removedSlidesArray);

        updatedSlides = addNewSlides(oldUpdatedSlides, addedSlidesArray);
        
        // updated slides have position intersect between added and removed slides
        // recalculate the position attribute on the slides ;
        for(var i = 0, len = updatedSlides.length; i<len; i++ ) {
            updatedSlides[i].position = i;
        }
        // TODO detect changed sections and change in article
        
       callback(null, { updatedSlides, removedSlidesBatch, addedSlidesBatch, addedSlidesArray, removedSlidesArray});
   
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

const fetchUpdatedSlidesMeta = function(addedSlidesArray, removedSlidesArray) {
    var removedSlidesMap = {} ;
    removedSlidesArray.forEach(slide => {
        if(slide.media && slide.mediaType){
            removedSlidesMap[slide.position] = [slide.media, slide.mediaType];
        }
    })

    addedSlidesArray.forEach( slide => {
        if(Object.keys(removedSlidesMap).indexOf(slide.position.toString()) > -1){
            slide.media = removedSlidesMap[slide.position.toString()][0];
            slide.mediaType = removedSlidesMap[slide.position.toString()][1];
            
        }
    });

    return addedSlidesArray;

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


const addNewSlides = function(slides, addedSlidesBatch) {
    for(var i = 0; i < addedSlidesBatch.length; i++ ){
        slides.splice(addedSlidesBatch[i].position, 0, addedSlidesBatch[i]);
    }
    return slides;
}

const removeDeletedSlides = function( slides, removedSlidesBatch, callback) {
    const slidesText = slides.map( slide => slide.text ) ;

    // collect indices to be removed from slides
    var removedIndices = [] ;
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


const getLatestData = function(title, callback){

 getSectionText(title, (err, sections) =>{

        if (err) {
            console.log(err)
            return callback(err)
        }

        getSectionsSlides(sections, (err, data) => {
            if (err) {
                console.log(err)
                return callback(err)
            }
            return callback(null, {slides: data.slides, sections: data.sections})
        })
        
        
    })
}

const getSectionsSlides = function(sections, callback) {
    
    const slides = []
    let currentPosition = 0
    sections.map((section) => {
        // Break text into 300 chars to create multiple slides
        const { text } = section
        const paras = paragraphs(text)
        let slideText = []

        paras.map((para) => {
            slideText = slideText.concat(splitter(para, 300))
        })

        section['numSlides'] = slideText.length
        section['slideStartPosition'] = currentPosition

        currentPosition += slideText.length

        slideText.forEach(function(text, index) {
            slides.push({
                text,
                position: (section['slideStartPosition'] + index),
            })
        });

    })

    return callback(null, {slides, sections})
}



export {
  bottest,
  updateArticleSlides
}

