# BQTop

This repository contains the BQTop utility for viewing running and finished Big-Query jobs.

![alt text](https://github.com/doitintl/bqtop/blob/master/bqtop-ui.gif)

## Setup

### Firebase Setup

1. In your google cloud project create a Firebase project.
2. Go to overview page and press `Add Firebase to your web app`
3. Copy the following keys: `apiKey, authDomain, databaseURL storageBucket`
4. Navigate to the Authentication page and enable Google as a sign-in provider.
5. Install gcloud tools. Please follow the [official documentation](https://cloud.google.com/sdk/downloads)

### CLI

1. Navigate to the [Service Accounts](https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk/) tab in your project's settings page.
2. Select your Firebase project.
3. Generate New Private Key at the bottom of the Firebase Admin SDK section of the Service Accounts tab.
4. After you click the button, a JSON file containing your service account's credentials will be downloaded.
5. Rename the file `bqtop-service-account.json` and save it in the `cli` directory.
6. Make sure that you have python 3 installed.
7. Go to the cli directory and run `pip install -r requirements.txt` 
8. Create a config file (config.json) with the values you copied in the Firebase setup step. 

```python
{
     "apiKey": "apiKey",
     "authDomain": "projectId.firebaseapp.com",
     "databaseURL": "https://databaseName.firebaseio.com",
     "storageBucket": "projectId.appspot.com",
     "serviceAccount": "bqtop-service-account.json"
 }
```

### Web Application

1. Edit `.env.production.template` in [firebase/ui](firebase/ui) with the values you copied in the Firebase setup process.
2. Rename `.env.production.template` to `.env.production`
3. OPTIONAL: Edit `database.rules.json` to allow specific users to read data. By default, any authenticated user can read/write to the database.
    For example:
    ```json
    {
        // ...
        ".read": "auth != null && auth.token.email_verified == true && auth.token.email == 'me@example.com'",
        ".write": "auth != null && auth.token.email_verified == true && auth.token.email == 'me@example.com'"
    }
    ```

### Deployment

- Run `./install.sh PROJECT_ID`