import React, {Component} from 'react';
import SignedIn from './SignedIn';
import NotSignedIn from './NotSignedIn';
import './App.css';

import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase/app';
import 'firebase/auth';

// Initialize Firebase
// TODO: Replace with your project's customized code snippet
var config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: `${process.env.REACT_APP_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  // databaseURL: "https://<DATABASE_NAME>.firebaseio.com",
  // storageBucket: "<BUCKET>.appspot.com",
  // messagingSenderId: "<SENDER_ID>",
};
firebase.initializeApp(config);
// Initialize Cloud Firestore through Firebase
const firestore = firebase.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true};
firestore.settings(settings);

// Configure FirebaseUI.
const uiConfig = {
  callbacks: {
    // signInSuccess: function(currentUser, credential, redirectUrl) {
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      // User successfully signed in.
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      return false;
    },
    uiShown: function() {
      // The widget is rendered.
      // Hide the loader.
      document.getElementById('loader').style.display = 'none';
    }
  },
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
  signInSuccessUrl: '/signedIn',
  // We will display Google and Facebook as auth providers.
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID, {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      requireDisplayName: false
    }
  ]
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      isSignedIn: false
    }
  }

  // Listen to the Firebase Auth state and set the local state.
  async componentDidMount() {
    this.unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => this.setState({
      isSignedIn: !!user
    }));

    await this.getAllCourses();
    // const firstCourse = await this.getAllCourses();
    // await this.getLessonsByCourseId(firstCourse.id);
  }

  // Make sure we un-register Firebase observers when the component unmounts.
  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  // 講座一覧を取得する。
  getAllCourses = async () => {
    const collectionRef = firestore.collection("courses");

    try {
      const docs = await collectionRef.get();

      docs.forEach(async (doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log('【講座一覧】');
        console.log(doc.id, " => ", doc.data());
        console.log(`${doc.id} の【レッスン一覧】`);
        await this.getLessonsByCourseId(doc.id);
      });

      return docs.docs[0];
    } catch (e) {
      console.log("Error getting document:", e);
    }
  }

  // 指定された講座のレッスン一覧を取得する。
  getLessonsByCourseId = async (courseId) => {
    const collectionRef = firestore.collection("courses").doc(courseId).collection("lessons");

    try {
      const docs = await collectionRef.get();
      docs.forEach(function(doc) {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
      });
    } catch (e) {
      console.log("Error getting document:", e);
    }
  }

  render() {
    if (!this.state.isSignedIn) {
      return (<div>
        <h1>My App</h1>
        <p>Please sign-in:</p>
        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/>
        <div id="loader">Loading...</div>
        {/* <NotSignedIn firestore={firestore} /> */}
      </div>);
    } else {
      return (
        <SignedIn firestore={firestore} />
      );
    }
  }
}

export default App;
