import wiki from 'wikijs'
import request from 'request'
import async from 'async'
import slug from 'slug'

import Article from '../../models/Article'
import User from '../../models/User'

import { paragraphs, splitter, textToSpeech } from '../../utils'

import { getSectionText } from '../../controllers/wiki';
import { oldUpdatedSlides } from './updatedSections';
import * as Diff from 'diff' ;

const title = 'Albert_Einstein';


const bottest = function(req, res) {

    getLatestSlides(title, (err, slides) => {
        if(err) return console.log(err);

        const oldSlidesText = oldUpdatedSlides.map(obj => obj.text);
        const slidesText = slides.map(obj => obj.text);

        var diffs = Diff.diffArrays(oldSlidesText, slidesText);
        var  updatedSlides ;
        // Batch the removed and added slides
        var addedSlidesBatch = [];
        var removedSlidesBatch = [];
        diffs.forEach( difference => {
            if(difference.added) addedSlidesBatch = [ ...addedSlidesBatch, ...difference.value]
            if(difference.removed) removedSlidesBatch = [...removedSlidesBatch ,...difference.value ]
        });

        updatedSlides  = removeDeletedSlides(oldUpdatedSlides, removedSlidesBatch);
        
        res.json({ updatedSlides, removedSlidesBatch, addedSlidesBatch})
    })
   
}

const addNewSlides = function(slides, addedSlidesBatch) {

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


const getLatestSlides = function(title, callback){

 getSectionText(title, (err, sections) =>{

        if (err) {
            console.log(err)
            return callback(err)
        }

        getSectionsSlides(sections, (err, slides) => {
            if (err) {
                console.log(err)
                return callback(err)
            }
            return callback(null, slides)
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

    return callback(null, slides)
}



export {
  bottest
}

