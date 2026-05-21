# UDIG Website Frontend

## How to Set Up the UDIG Website Frontend

---

## Environment Variables

Create a `.env` file at the root of the application (where the README is located).  
It should contain the following variables:

VITE_GOOGLEMAPS_API_KEY= (Google Cloud API key used for the Google Maps Geocoding API)  
VITE_MONGO_CONTROLLER_URL= (The link to run the app, usually http://localhost:####)  
VITE_VIDEOS_API_KEY= (YouTube API key so the app can pull videos)  
VITE_VIDEOS_CHANNEL_ID= (YouTube channel ID to pull videos from)

---

## Running It Locally

### 1. Go to the correct directory

Open a terminal and make sure the path ends with `udig-website`.

- If it does NOT show `/udig-website`, run:

cd .\udig-website\

You should now see `/udig-website` in your terminal path.

---

### 2. Install dependencies

First, check if Node.js and npm are installed:

Run these separately:

node -v  
npm -v

If both return a version like `vXX.X`, continue to **Install Packages**.

---

### If npm is not installed

You need to install Node.js (which includes npm):  
https://www.geeksforgeeks.org/node-js/how-to-download-and-install-node-js-and-npm/

After installing, restart your IDE (VS Code, etc.), then re-check the versions above.

---

### Install packages

While inside `/udig-website`, run:

npm install

This installs all required dependencies to run the app locally.

---

## Run the app

Still inside `/udig-website`, run:

npm run dev

This will output a local link you can open in your browser.

---

## Update / Post to the Cloud