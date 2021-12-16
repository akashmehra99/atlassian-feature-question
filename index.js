// returns the state of *all* features for current user
function fetchAllFeatures() {
  // in reality, this would have been a `fetch` call:
  // `fetch("/api/features/all")`
  return new Promise((resolve) => {
    const sampleFeatures = {
      "extended-summary": true,
      "feedback-dialog": false,
      "experiment-a": "control-a",
    };
    setTimeout(resolve, 100, sampleFeatures);
  });
}

class FeatureCheck {
  constructor() {
    this.fetchedFeatures = {};
    this.overRideFeatures = {};
  }

  async getAllFeatures() {
    await fetchAllFeatures()
      .then((features) => {
        this.setAllFeatures(features);
      })
      .catch((error) => {
        console.log("Error in fetching features -> ", error);
      });
  }

  setAllFeatures(features) {
    this.fetchedFeatures = { ...features, ...this.overRideFeatures };
  }

  overRideFeatureForDev(feature, value) {
    this.overRideFeatures[feature] = value;
  }

  async getFeatureState(featureName, setDefaultIndependently = false) {
    if (
      this.fetchedFeatures &&
      Object.keys(this.fetchedFeatures).length !== 0
    ) {
      return new Promise((resolve, reject) => {
        if (this.fetchedFeatures.hasOwnProperty(featureName)) {
          resolve(this.fetchedFeatures[featureName]);
        } else {
          resolve(setDefaultIndependently);
        }
      });
    } else {
      await this.getAllFeatures();
      return new Promise((resolve, reject) => {
        if (this.fetchedFeatures.hasOwnProperty(featureName)) {
          resolve(this.fetchedFeatures[featureName]);
        } else {
          resolve(setDefaultIndependently);
        }
      });
    }
  }
}

const feature = new FeatureCheck();

async function checkforFeatures() {
  await feature.getFeatureState("extended-summary").then(function (isEnabled) {
    if (isEnabled) {
      showExtendedSummary();
    } else {
      showBriefSummary();
    }
  });
  await feature.getFeatureState("feedback-dialog").then(function (isEnabled) {
    if (isEnabled) {
      makeFeedbackButtonVisible();
    }
  });

  await feature
    .getFeatureState("come-random-feature")
    .then(function (isEnabled) {
      console.log("Random feature status -> ", isEnabled);
    });
}

// src/feature-x/summary.js

function showExtendedSummary() {
  console.log("Show extended summary");
}

function showBriefSummary() {
  console.log("Show brief summary");
}

function makeFeedbackButtonVisible() {
  console.log("Make feedback button vidible");
}

checkforFeatures();
