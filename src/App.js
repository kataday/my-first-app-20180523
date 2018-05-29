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

    this.courseIdRef = React.createRef();
    this.lessonIdRef = React.createRef();
    this.subscriberIdRef = React.createRef();
  }

  // Listen to the Firebase Auth state and set the local state.
  async componentDidMount() {
    this.unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => this.setState({
      isSignedIn: !!user
    }));

    await this.getAllCourses();
  }

  // Make sure we un-register Firebase observers when the component unmounts.
  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  // 講座一覧を取得する。
  getAllCourses = async () => {
    const collectionRef = firestore.collection("courses");

    try {
      const querySnapshots = await collectionRef.orderBy("created").get();

      console.log('【講座一覧】');
      for (let doc of querySnapshots.docs) {
        console.log(doc.id, " => ", doc.data());
        await this.getLessonsByCourseId(doc.id);
      }
    } catch (e) {
      console.log("Error getting document:", e);
    }
  }

  // 指定された講座のレッスン一覧を取得する。
  getLessonsByCourseId = async (courseId) => {
    const collectionRef = firestore.collection("courses").doc(courseId).collection("lessons");

    try {
      const querySnapshots = await collectionRef.orderBy("created").get();

      console.log(`         【レッスン一覧】`);
      for (let doc of querySnapshots.docs) {
        console.log(`         ${doc.id} => ${doc.data()}`);
        await this.getSubscribersByLessonId(courseId, doc.id);
      };
    } catch (e) {
      console.log("Error getting document:", e);
    }
  }

  // 指定されたレッスンの申込者一覧を取得する。
  getSubscribersByLessonId = async (courseId, lessonId) => {
    const collectionRef = firestore.collection("courses").doc(courseId).collection("lessons").doc(lessonId).collection("subscribers");

    try {
      const querySnapshots = await collectionRef.orderBy("created").get();

      console.log(`                   【申込者一覧】`);
      for (let doc of querySnapshots.docs) {
        console.log(`                   ${doc.id} => ${doc.data()}`);
      };
    } catch (e) {
      console.log("Error getting document:", e);
    }
  }

  // 講座の追加
  addCourse = async () => {
    const data = {
      author: this.state.isSignedIn ? firebase.auth().currentUser.uid : "",
      name: "コース名6",
      headerImage: "",
      lecturer: {
        name: "堅田 陽介",
        pr: "PRコメントPRコメントPRコメント",
        profile: "プロフィールプロフィールプロフィール",
        thumbnail: "",
      },
      created: firebase.firestore.FieldValue.serverTimestamp(),
      updated: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      const docRef = await firestore.collection("courses").add(data);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding courses document: ", e);
      window.alert('エラー')
    }
  }

  // レッスンの追加
  addLesson = async (courseId) => {
    console.log(`courseId => ${this.courseIdRef.current.value}`);

    const data = {
      title: "レッスン名",
      description: "レッスン詳細レッスン詳細レッスン詳細",
      thumbnail: "",
      created: firebase.firestore.FieldValue.serverTimestamp(),
      updated: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      const docRef = await firestore.collection("courses").doc(this.courseIdRef.current.value).collection("lessons").add(data);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding lessons document: ", e);
      window.alert('エラー')
    }
  }

  // レッスン申し込み（subscribersの追加）
  addSubscriber = async (courseId, lessonId) => {
    console.log(`courseId => ${this.courseIdRef.current.value}`);
    console.log(`lessonId => ${this.lessonIdRef.current.value}`);

    const data = {
      author: this.state.isSignedIn ? firebase.auth().currentUser.uid : "",
      message: "よろしくお願いします！",
      subscribed: firebase.firestore.FieldValue.serverTimestamp(),
      created: firebase.firestore.FieldValue.serverTimestamp(),
      updated: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      const docRef = await firestore.collection("courses")
        .doc(this.courseIdRef.current.value)
        .collection("lessons")
        .doc(this.lessonIdRef.current.value)
        .collection("subscribers")
        .add(data);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding lessons document: ", e);
      window.alert('エラー')
    }
  }

  updateCourse = () => {

  }

  updateLesson = () => {

  }

  updateSubscriber = () => {

  }

  deleteCourse = () => {

  }

  deleteLesson = () => {

  }

  deleteSubscriber = () => {
    
  }

  render() {
    if (!this.state.isSignedIn) {
      return (
          <div>
          <h1>My App</h1>
          <p>Please sign-in:</p>
          <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/>
          <div id="loader">Loading...</div>
          <br />
          <h2>講座</h2>
          <a onClick={this.addCourse}>addCourse</a>
          <br />
          <a onClick={this.updateCourse}>updateCourse</a>
          <br />
          <a onClick={this.deleteCourse}>deleteCourse</a>
          <h2>レッスン</h2>
          <a onClick={this.addLesson}>addLesson</a>
          <br />
          <a onClick={this.updateLesson}>updateLesson</a>
          <br />
          <a onClick={this.deleteLesson}>deleteLesson</a>
          <h2>申込者</h2>
          <a onClick={this.addSubscriber}>addSubscriber</a>
          <br />
          <a onClick={this.updateSubscriber}>updateSubscriber</a>
          <br />
          <a onClick={this.deleteSubscriber}>deleteSubscriber</a>
          <p>courseId:<input type="text" ref={this.courseIdRef} /></p>
          <p>lessonId:<input type="text" ref={this.lessonIdRef} /></p>
          <p>subscriberId:<input type="text" ref={this.subscriberIdRef} /></p>
          {/* <NotSignedIn firestore={firestore} /> */}
        </div>
      );
    } else {
      return (
        <React.Fragment>
          <SignedIn firestore={firestore} />
          <h2>講座</h2>
          <a onClick={this.addCourse}>addCourse</a>
          <br />
          <a onClick={this.updateCourse}>updateCourse</a>
          <br />
          <a onClick={this.deleteCourse}>deleteCourse</a>
          <h2>レッスン</h2>
          <a onClick={this.addLesson}>addLesson</a>
          <br />
          <a onClick={this.updateLesson}>updateLesson</a>
          <br />
          <a onClick={this.deleteLesson}>deleteLesson</a>
          <h2>申込者</h2>
          <a onClick={this.addSubscriber}>addSubscriber</a>
          <br />
          <a onClick={this.updateSubscriber}>updateSubscriber</a>
          <br />
          <a onClick={this.deleteSubscriber}>deleteSubscriber</a>
          <p>courseId:<input type="text" ref={this.courseIdRef} /></p>
          <p>lessonId:<input type="text" ref={this.lessonIdRef} /></p>
          <p>subscriberId:<input type="text" ref={this.subscriberIdRef} /></p>
        </React.Fragment>
      );
    }
  }
}

export default App;
