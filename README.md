# BQTop

This repository contains the BQTop utility for viewing running and finished Big-Query jobs.

![See it in action](BQTop.gif)

## Setup

### Firebase

1. In your google cloud project create a Firebase project.
2. Go to overview page and press `Add Firebase to your web app`
3. Copy the following keys: `apiKey, authDomain, databaseURL storageBucket`
4. Navigate to the Service Accounts tab in your project's settings page.
5. Select your Firebase project.
6. Click the Generate New Private Key button at the bottom of the Firebase Admin SDK section of the Service Accounts tab.
7. After you click the button, a JSON file containing your service account's credentials will be downloaded.
8. Rename the file `bqtop-service-account.json` and save it in the `cli` directory.
9. Install firebase-tools `npm install -g firebase-tools`
9. Install gcloud tools. Please follow the [official documentation](https://cloud.google.com/sdk/downloads)
10. Run `./install.sh projectId`

### Local Python App
1. Make sure the you have python 3 installed.
2. Go to the cli directory and run `pip install -r requirements.txt` 
3. Create a config file (config.json) with the values you copied in the Firebase setup process. 

```
{
     "apiKey": "apiKey",
     "authDomain": "projectId.firebaseapp.com",
     "databaseURL": "https://databaseName.firebaseio.com",
     "storageBucket": "projectId.appspot.com",
     "serviceAccount": "bqtop-service-account.json"
 }
 ```

