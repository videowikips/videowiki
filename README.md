# README #

## Website ##

https://www.videowiki.org/

## What is this repository for? ##

Have you ever wondered why there isn’t a video version of Wikipedia already? It’s 2018, streaming images and videos isn’t a big deal but Wikipedia is still predominantly a text-based encyclopedia.

**Okay, times up**

The reason for this is because videos once uploaded on the internet, cannot be edited again and Wikipedia relies on being continuously edited and updated.(Image uploading a video on YouTube, can you edit the video once you upload it? No, right?) The second major reason is that video-production is time-consuming and 💰.

VideoWiki cracks these technical challenges and proves that building a collaborative multi-media encyclopedia is possible.Anyone, including you, can edit (add images / gifs / videos) to any VideoWiki article, even without logging in.

At VideoWiki, we are a group of individuals who want to evolve Wikipedia from a text-based encyclopedia to a multi-media encyclopedia.
The future of Knowledge cannot be confined to text only. We, human beings perceive information visually and the sum of all human knowledge should also have a visual medium.
 
If you want to contribute to VideoWiki's development, jump right in :) 

## How do I get set up? ##


### clone the repo
> $ git clone 
$ cd videowiki


### Install npm dependencies
> $ npm install


### Additional Settings

Videowiki depends on 3rd party services 
- Redis ( make sure that redis is installed on your machine )
- AWS Polly ( to convert text to audios )
- AWS S3 ( for storing generated audios and article's images )
- Mailgun
- Google Captcha
- Slack

------------


### Environment variables ###


### - App configurations ###


- ENV
your app mode that you wish to run in ( development / production )
- APP_SECRET 
your app secret for express sessions
- DB_CONNECTION_URL
connection string for your mongo database

### - AWS Configurations ###


- AWS_IMAGES_BUCKET_NAME
The name of the bucket used to store images
- AWS_IMAGES_USER
The username of the user having access to the bucket 
- AWS_IMAGES_BUCKET_ACCESS_KEY
Access Key
- AWS_IMAGES_BUCKET_ACCESS_SECRET
Secret Key 
- AWS_AUDIOS_BUCKET_ACCESS_KEY
The Access key for bucket used to store generated audios
- AWS_AUDIOS_BUCKET_ACCESS_SECRET
Secret Key


### - Mailgun ###
- MAILGUN_API_KEY
Mailgun api key 
- MAILGUN_DOMAIN
Registered Mailgun domain


### - Google ###
- CAPTCHA_SECRET_KEY
Google's Captcha secret key
- GMAIL_USER
a gmail username account used for mailing (randomuser@gmail.com)
- GMAIL_PASSWORD
the password for the gmail account (mysecretpassword)


### - Slack ###
- SLACK_TOKEN
Slack token

------------


## Running develpment server frontend 
Run 
> npm run dev:client

to start development server for React frontend

## Running development server api ##
Run
> npm run dev:server

to run development server for the API

## Licenses ##

VideoWiki is open-sourced and licensed under GNU General Public License v3.0  

## Authors ##

Shout out to [**Hassan Amin**](https://github.com/hassanamin994) and [**Ankur Agarwal**](https://github.com/ankur-agarwal) who are the original contributors of VideoWiki. VideoWiki would not have existed without the work of these 2 talented developers.   

## Contribution guidelines ##

- Fork the videowiki repo.

- Make your changes in a new git branch:

> git checkout -b my-fix-branch master

- Commit your changes using a descriptive commit message

- Push your branch to GitHub:

> git push origin my-fix-branch

- In GitHub, send a pull request to videowiki:master

That's it! Thank you for your contribution!



## Who do I talk to? ##

* Repo owner - Pratik Shetty 
**Email** - pratik.shetty@tlrfindia.com 
