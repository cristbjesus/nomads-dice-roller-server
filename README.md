# Nomads Dice Roller Server

Nomads Dice Roller Server is a simple cloud application. It allows users to share their dice rolls through a microservice that is integrated with [Stream](https://getstream.io/).

### Setup Node Environment

You'll need to create a new node server. Open a new terminal within the project directory and run:

1. Initialize a new project: `npm i`
2. run the development server with `npm run dev`

### Deploying your system

First build your application with `npm run build`.
Then deploy your application using AWS Elastic Beanstalk, init a new application (`eb init`) and create a new environment (`eb create`) to deploy your service! Don't forget you can use `eb deploy` to push changes.
