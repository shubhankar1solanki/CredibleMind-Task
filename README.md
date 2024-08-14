# Project Setup Guide

## Prerequisites

Make sure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed. You can check if they are installed by running:

```bash
node -v
npm -v
```

## Install Root Dependencies

Navigate to the root of the project directory and install the root-level dependencies:

npm install

## Set Up Stencil Library

Navigate to the packages/stencil-library directory and install the dependencies:

cd packages/stencil-library
npm install

## Set Up React Library

Navigate to the packages/react-library directory and install the dependencies:

cd ../react-library
npm install

Build the React library:
npm run build

## Build Stencil Components

Navigate to the packages/stencil-library directory and build the Stencil components:

cd ../stencil-library
npm run build

## Set Up Consumer Application

Navigate to the consumer-app directory and install the dependencies:

cd ../consumer-app
npm install

## Start the development server for the consumer application:

npm run dev

## Tech Used

- Stencil for Web Component
- Tailwind for styling
- React for Client App
