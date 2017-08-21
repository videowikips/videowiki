const mongoose = require('mongoose');
const crypto = require('crypto');
const config = require('../server/config');
const Article = require('../server/models/Article');

const expect = require('chai').expect; 
const request = require('request');
const title = 'Ankur_Warikoo';
const botTestURL = `http://localhost:4000/api/wiki/bottest/${title}`;

mongoose.connect(config.db);

const runBot = function(callback) {
    request.get({ url: botTestURL},(err, res, body) => {
        return callback(err, res, body);
    });
}

const removeRandomSlide = function(callback) {
    getArticle( (err, article) => {
        const slidesLength = article.slides.length; 
        const randomSlideIndex = Math.floor(Math.random() * (slidesLength-1));
        const removedSlide = article.slides.splice(randomSlideIndex, 1)[0];
        article.slides = reorderSlidesPosition(article.slides);

        article.save((err, a) => {
            return callback(err, removedSlide)
        });
    }); 
};

const addRandomSlide = function(callback) {
    getArticle((err, article) => {
        var slides = article.slides;

        var slide = {} 
        slide.position = Math.floor(Math.random() * (slides.length-1));
        slide.text = getRandomText();
        slide.audio = 'path/to/audio';
        slides.splice(slide.position, 0, slide);
        article.slides = reorderSlidesPosition(slides);
        article.save((err, a)=> {
            return callback(err, slide);
        });
        
    })
};

const editRandomSlide = function(callback) {
    getArticle((err, article) => {
        var slides = article.slides;
        var updatedslideIndex = Math.floor(Math.random() * (slides.length-2));
        var originalSlide = JSON.parse(JSON.stringify(article.slides[updatedslideIndex])) ; 

        var updateArray = article.slides[updatedslideIndex].text.split(' ')
        const removedPartsIndex = Math.floor(Math.random() * (updateArray.length - 2))
        updateArray.splice(removedPartsIndex, 2);
        article.slides[updatedslideIndex].text = updateArray.join(' ');
        
        Article.findOneAndUpdate({_id: article._id},
            {slides: article.slides},  {new: true},  
            (err, a ) => {
            return callback(err, {originalSlide: originalSlide, currentSlide: a.slides[updatedslideIndex]})
        })
    });
}

const getArticle = function(callback) {
    Article.findOne({title: title, published: true}, (err, article) =>{
        return callback(err, article);
    })
}

const reorderSlidesPosition = function(slides) {
    if(slides) {
        slides.forEach((slide, index) => {
            slide.position = index;
        });
    }

    return slides;
}

const getRandomText = function() {
    var randText = "";
    for( var i = 25; i <=100; i+= 25){
        randText = randText + crypto.randomBytes(25).toString('hex') + " "; 
    }
    return randText;
}

describe('Bot Test', function(){
   

    describe('Single operations', function() {
         before(function(done){
            runBot((err, res, body)=> {
                console.log('-------- Syncing Data! ---------')
                done();
            })
        });

        it('Detect added slide', function(done) {
            // remove a slide from the db then run the bot to detect change
            // as if it was added !
            removeRandomSlide((err, removedSlide) => {
                runBot((err, res, body) => {
                    var newSlides = JSON.parse(body).newarticle.slides;
                    var slidesText = newSlides.map(slide => slide.text);
                    // verify inclusion
                    expect(slidesText, 'Verify added slide inclusion').to.include(removedSlide.text);
                    // verify position
                    expect(slidesText.indexOf(removedSlide.text), 'Verify added slide position').to.equal(removedSlide.position);
                    done(); 
                })
            });
        });
        
        it('Detect removed slide', function(done) {
            // add a random slide to the db, as if it was removed later !
            addRandomSlide((err, newslide) => {
                runBot((err, res, body) => {
                    let newSlides = JSON.parse(body).newarticle.slides;
                    var slidesText = newSlides.map(slide => slide.text);
                    // verify it was removed !
                    expect(slidesText.indexOf(newslide.text)).to.equal(-1);
                });
                done();
            })
        });

        it('Detect updated slide', function(done) {
            // delete text from slide to mimic updated content !
            editRandomSlide((err, result) => {
                runBot((err, res, body) => {
                    var originalSlide = result.originalSlide;
                    var currentSlide = result.currentSlide;
                    var newSlides = JSON.parse(body).newarticle.slides;
                    var slidesText = newSlides.map(slide => slide.text);
                    // verify uninclusion 
                    expect(slidesText, 'Old text not included').not.to.contain(currentSlide.text);

                    expect(slidesText, 'New text included').to.contain(originalSlide.text);
                    expect(originalSlide.media, 'Media reserver').to.equal(currentSlide.media)
                    expect(originalSlide.mediaType, 'Media Type reserver').to.equal(currentSlide.mediaType)
                    done();
                });
            });
        });
    });

    describe('Multiple Operations', function() {
         before(function(done){
            runBot((err, res, body)=> {
                console.log('-------- Syncing Data! ---------')
                done();
            })
        });
        it('Detect removed and added slide', function(done) {
            removeRandomSlide((err, removedSlide) => {
                addRandomSlide((err2, newslide) => {
                    runBot((err3, res, body)=> {
                        var newSlides = JSON.parse(body).newarticle.slides;
                        var slidesText = newSlides.map(slide => slide.text);
                        // verify removed slide inclusion
                        expect(slidesText, 'Verify added slide inclusion').to.include(removedSlide.text);
                        // verify extra slide was removed !
                        expect(slidesText.indexOf(newslide.text)).to.equal(-1);
                        done();
                    }) 
                })
            });
        });

        it('Detect added and updated slides', function(done) {
            removeRandomSlide((err, removedSlide) => {
                editRandomSlide((err2, result) => {
                    runBot((err3, res, body) => {
                        var newSlides = JSON.parse(body).newarticle.slides;
                        var slidesText = newSlides.map(slide => slide.text);
                        var originalSlide = result.originalSlide;
                        var currentSlide = result.currentSlide;
                        // verify uninclusion of updated slide 
                        expect(slidesText, 'Old text not included').not.to.contain(currentSlide.text);
                        
                        expect(slidesText, 'New text included').to.contain(originalSlide.text);
                        expect(originalSlide.media, 'Media reserver').to.equal(currentSlide.media)
                        expect(originalSlide.mediaType, 'Media Type reserver').to.equal(currentSlide.mediaType)
                        // verify removed slide inclusion
                        expect(slidesText, 'Verify added slide inclusion').to.include(removedSlide.text);
                        done();
                    });
                });
            });
        });

        it('Detect removed and updated slides', function(done) {
            editRandomSlide((err2, result) => {
                addRandomSlide((err, newslide) => {
                    runBot((err3, res, body) => {
                        var newSlides = JSON.parse(body).newarticle.slides;
                        var slidesText = newSlides.map(slide => slide.text);
                        var originalSlide = result.originalSlide;
                        var currentSlide = result.currentSlide;

                        // verify slide was removed
                        expect(slidesText.indexOf(newslide.text)).to.equal(-1);
                        
                        // verify slide was updated
                        expect(slidesText, 'Old text not included').not.to.contain(currentSlide.text);

                        expect(slidesText, 'New text included').to.contain(originalSlide.text);
                        expect(originalSlide.media, 'Media reserver').to.equal(currentSlide.media)
                        expect(originalSlide.mediaType, 'Media Type reserver').to.equal(currentSlide.mediaType)
                        done();

                    });
                });
            });
        });

    });
})