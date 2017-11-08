# BQTop

This repository contains the BQTop utility for viewing running and finished Big-Query jobs.

![alt text](https://github.com/doitintl/bqtop/blob/master/bqtop-ui.gif)

## Setup

### Firebase

1. In your google cloud project create a Firebase project.
2. Go to overview page and press `Add Firebase to your web app`
3. Copy the following keys: `apiKey, authDomain, databaseURL storageBucket`
4. Navigate to the [Service Accounts](https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk/) tab in your project's settings page.
5. Select your Firebase project.
6. Click the Generate New Private Key button at the bottom of the Firebase Admin SDK section of the Service Accounts tab.
7. After you click the button, a JSON file containing your service account's credentials will be downloaded.
8. Rename the file `bqtop-service-account.json` and save it in the `cli` directory.
9. Install gcloud tools. Please follow the [official documentation](https://cloud.google.com/sdk/downloads)
10. Run `./install.sh projectId`

### Local Python App
1. Make sure that you have python 3 installed.
2. Go to the cli directory and run `pip install -r requirements.txt` 
3. Create a config file (config.json) with the values you copied in the Firebase setup process. 

```python
{
     "apiKey": "apiKey",
     "authDomain": "projectId.firebaseapp.com",
     "databaseURL": "https://databaseName.firebaseio.com",
     "storageBucket": "projectId.appspot.com",
     "serviceAccount": "bqtop-service-account.json"
 }
```

### Hosted Firebase App
1. Create `.env.production` in [firebase/ui](firebase/ui) with the values you copied in the Firebase setup process.
```
REACT_APP_FIREBASE_API_KEY="apiKey"
REACT_APP_FIREBASE_AUTH_DOMAIN="authDomain"
REACT_APP_FIREBASE_DATABASE_URL="databaseURL"
REACT_APP_FIREBASE_PROJECT_ID="projectId"
REACT_APP_FIREBASE_STORAGE_BUCKET="storageBucket"
```
2. OPTIONAL: Edit firebase rules to allow specific logged in users to read data instead of any authenticated user.
