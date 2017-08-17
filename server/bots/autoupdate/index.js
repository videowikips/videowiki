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
    const title = req.params.title || 'The_Dewarists';

    // Article.findOne({title, published: true}, (err, article) => {
    //     if(err) return res.json(err);
    //     if(!article) return res.end('No published article with this title!');

    //     updateArticle(article, (err, result) =>{
    //         if(err) return res.json({err: JSON.strigify(err)})
    //         return res.json(result)
    //     });
    // });
    runBot(4);
}
const runBot = function(limitPerOperation){
    // get number of articles to be updated
    Article
    .find({ published: true })
    .select('title')
    .exec( (err, result) => {
        if(err) return callback(err);
        // setup a queue for performing updates on article sets
        const numberOfArticles = result.length;
        var q = articlesQueue();

        for(var i = 0; i < numberOfArticles; i+=limitPerOperation) {
            q.push({skip: i, limitPerOperation: limitPerOperation});
        }

        q.drain =function(){
            console.log("------------------- Successfully updated all articles ----------------------");
        };

    })

}

const articlesQueue = function(){
    return async.queue((task, callback) => {

        Article
        .find({ published: true })
        .sort({ created_at: 1 })
        .skip( task.skip )
        .limit( task.limitPerOperation )
        .exec((err, articles) => {
            if(err) return callback(err);
            if(!articles) return callback(null); // end of articles
            updateArticles(articles, (err, results)=>{
                console.log('task done ' + task.skip + "  " + task.limitPerOperation);
                
                saveUpdatedArticles(results.map( result => result.value.article ), (err, result) =>{
                    console.log(err, result);
                    return callback(err, result);
                });
            });
        })
    })
} 

const saveUpdatedArticles = function(articles, callback) {
    var updateArray = [];

    articles.forEach( article => {
        var query = { 
            updateOne: {
                filter: { _id: article._id },
                update: { $set: { "slides": article.slides, "sections": article.sections } }
        }};
        updateArray.push(query);
    });

    Article.bulkWrite(updateArray)
        .then(res =>  callback(null, res))
        .catch(err => callback(err));
}

const updateArticles = function(articles, callback) {
     var articleUpdateFunctionArray = []; 
     articles.forEach( article => {
        function a(callback) {
            console.log('updating article...');
            updateArticle(article, (err, newArticle) => {
                return callback(err,newArticle);
            })
        }
        articleUpdateFunctionArray.push(a);
     })
     
    async.parallel(async.reflectAll(articleUpdateFunctionArray), (err, results) => {
        if(err) return console.log(err);
        return callback(null, results);
    })
}

const updateArticle = function(article, callback) {
    getLatestData(article.title, (err, data) => {
       
        if(err) return callback(err);
        // compares the old articles with new articles fetched from wikipedia
        updateArticleSlides(article.slides, data.slides, (err2, result) => {
            if(err2) return callback(err2);

            article.slides = result.slides;
            article.sections = data.sections;
            return callback(null, {article, result});
        });

    })


}
// compares the old articles with new articles fetched from wikipedia
const updateArticleSlides = function(oldUpdatedSlides, slides, callback) {

        const oldSlidesText = oldUpdatedSlides.map(obj => obj.text);
        const slidesText = slides.map(obj => obj.text);

        // Batch the removed and added slides
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
        
        // recalculate the position attribute on the slides ;
        for(var i = 0, len = updatedSlides.length; i<len; i++ ) {
            updatedSlides[i].position = i;
        }
        
       callback(null, { slides: updatedSlides, removedSlidesBatch, addedSlidesBatch, addedSlidesArray, removedSlidesArray});
   
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

// updated slides have position intersect between added and removed slides
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
    // TODO generate audio for new slides
    for(var i = 0; i < addedSlidesBatch.length; i++ ){
        slides.splice(addedSlidesBatch[i].position, 0, addedSlidesBatch[i]);
    }
    return slides;
}

const removeDeletedSlides = function( slides, removedSlidesBatch, callback) {
    const slidesText = slides.map( slide => slide.text ) ;
    // TODO delete audio of removed slides

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

