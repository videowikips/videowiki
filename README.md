# README #

This README would normally document whatever steps are necessary to get your application up and running.

## What is this repository for? ##

* Quick summary
* Version
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

## How do I get set up? ##


### clone the repo
> $ git clone 
$ cd videowiki

###Install npm dependencies
> $ npm install

###Additional Settings

Videowiki depends on 3rd party services 
- AWS Polly ( to convert text to audios )
- AWS S3 ( for storing generated audios and article's images )
- Mailgun
- Google Captcha
- Slack

------------


### Environment variables

###- App configurations
####APP_SECRET 
your app secret for express sessions
####DB_CONNECTION_URL
connection string for your mongo database

### - AWS Configurations
####AWS_IMAGES_BUCKET_NAME
The name of the bucket used to store images
####AWS_IMAGES_USER
The username of the user having access to the bucket 
####AWS_IMAGES_BUCKET_ACCESS_KEY
Access Key
#### AWS_IMAGES_BUCKET_ACCESS_SECRET
Secret Key
####AWS_AUDIOS_BUCKET_ACCESS_KEY
The Access key for bucket used to store generated audios
####AWS_AUDIOS_BUCKET_ACCESS_SECRET
Secret Key

###- Mailgun
####MAILGUN_API_KEY
Mailgun api key 
####MAILGUN_DOMAIN
Registered Mailgun domain
###- Google
####CAPTCHA_SECRET_KEY
Google's Captcha secret key
####GMAIL_USER
a gmail username account used for mailing (randomuser@gmail.com)
####GMAIL_PASSWORD
the password for the gmail account (mysecretpassword)
###- Slack
####SLACK_TOKEN
Slack token

------------


##Running develpment server frontend 
Run 
> npm run dev

to start development server for React frontend

##Running development server api
Run
> node ./index.js

or
> nodemon ./index.js

to run development server for the API


## Contribution guidelines ##

* Writing tests
* Code review
* Other guidelines

## Who do I talk to? ##

* Repo owner or admin
* Other community or team contact