# Record Store Day

## Setup

### Install dependencies

	npm install


### Install nodemon

	npm install -g nodemon

## Run

	npm start

## Data

A JS object is embedded into the page which has the details of each user and album

it is in the following format

```js
var data = {
  'colors': [], // Hex colors from album artwork
  'user': {}, // User object
  'album': {} // Album object
}
```

## Deployment

The site is hosted on Google Compute Engine. Inorder to dpeloy you need to install the [gcloud tools](https://cloud.google.com/sdk/) and make sure you have access to the [project](https://console.cloud.google.com/home/dashboard?project=record-store-day)

### Initialise the project 

	gcloud init

Follow the instructions to authenticate and choose `record-store-day` when prompted.

### Set the compute zone 

	gcloud config set compute/zone us-central1-a
	
### Install Kubernetes tools

	gcloud components install kubectl
	
### Get the cluster credentials

	gcloud container clusters get-credentials record-store-day --zone=us-central1-a --project=record-store-day

	
### Create a new tagged Docker image

Make sure the Docker daemon is running

	docker-machine start default
	
#### Build the image

We need to make sure we create a new tag for each image. Tags should follow this format
`gcr.io/<PROJECT_ID>/record-store-day:v1.0.0`

The current version of the app is stored in the VERSION file in the project root. Bump this each time using semver notation and update the VERSION file when you deploy. You can also check the latest version on the [Google Container Registry](https://console.cloud.google.com/kubernetes/images/tags/record-store-day?location=GLOBAL&project=record-store-day)

	docker build -t <TAG> .
	
	(e.g docker build -t gcr.io/record-store-day/record-store-day:v1.0.0 .)
	

Push to Google Container engine

	gcloud docker push <TAG>
	
	(e.g gcloud docker push gcr.io/record-store-day/record-store-day:v1.0.0)

### Update the deployment.yaml to use the new image

Open `deploy/deployment.yaml` and update the image` property to the new tag

	spec:
      containers:
      - name: record-store-day
        image: gcr.io/record-store-day/record-store-day:v1.0.0
	
### Apply the updates to the pods
	
	kubectl apply -f deploy/deployment.yaml

### Monitor the deployment

Deployments are usually very fast but if you need to monitor what's going on you can use this command
	
	kubectl describe deployment


## Libraries used
* [spotify-web-api-node](https://www.npmjs.com/package/spotify-web-api-node)
* [Soundmanager 2](http://www.schillmania.com/projects/soundmanager2/)
