import React, {Component} from 'react';

import FirestoreControll from './FirestoreControll';
import StorageControll from './StorageControll';
import './App.css';

import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

// Initialize Firebase
// TODO: Replace with your project's customized code snippet
var config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: `${process.env.REACT_APP_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: "gs://my-first-app-20180523.appspot.com/",
};
firebase.initializeApp(config);
// Initialize Cloud Firestore through Firebase
const firestore = firebase.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true};
firestore.settings(settings);

// Get a reference to the storage service, which is used to create references in your storage bucket
const storage = firebase.storage();
// Create a storage reference from our storage service
const storageRef = storage.ref();
const coursesRef = storageRef.child('courses');

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

    // await this.getAllCourses();
  }

  // Make sure we un-register Firebase observers when the component unmounts.
  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  /***********************************
  *
  * Firestore関連メソッド
  *
  ***********************************/

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
    const collectionRef = firestore
      .collection("courses")
      .doc(courseId)
      .collection("lessons");

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
    const collectionRef = firestore
      .collection("courses")
      .doc(courseId)
      .collection("lessons")
      .doc(lessonId)
      .collection("subscribers");

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
      const docRef = await firestore
        .collection("courses")
        .add(data);
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
      const docRef = await firestore
        .collection("courses")
        .doc(this.courseIdRef.current.value)
        .collection("lessons")
        .add(data);
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
      const docRef = await firestore
        .collection("courses")
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

  updateCourse = async (courseId) => {
    const data = {
      name: "コース名-update",
      "lecturer.name": "katada",
      updated: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      const docRef = await firestore
        .collection("courses")
        .doc(this.courseIdRef.current.value)
        .update(data);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error updating courses document: ", e);
      window.alert('エラー')
    }
  }

  updateLesson = async (courseId, lessonId) => {
    const data = {
      title: "レッスン名-update",
      updated: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      const docRef = await firestore
        .collection("courses")
        .doc(this.courseIdRef.current.value)
        .collection("lessons")
        .doc(this.lessonIdRef.current.value)
        .update(data);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error updating lessons document: ", e);
      window.alert('エラー')
    }
  }

  updateSubscriber = async (courseId, lessonId, subscriberId) => {
    const data = {
      message: "よろしくお願いします！-update",
      updated: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      const docRef = await firestore
        .collection("courses")
        .doc(this.courseIdRef.current.value)
        .collection("lessons")
        .doc(this.lessonIdRef.current.value)
        .collection("subscribers")
        .doc(this.subscriberIdRef.current.value)
        .update(data);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error updating subscribers document: ", e);
      window.alert('エラー')
    }
  }

  deleteCourse = async (courseId) => {
    try {
      await firestore
        .collection("courses")
        .doc(this.courseIdRef.current.value)
        .delete();
      console.log("Document successfully deleted!");
    } catch (e) {
      console.error("Error deleting courses document: ", e);
      window.alert('エラー')
    }
  }

  deleteLesson = async (courseId, lessonId) => {
    try {
      await firestore
        .collection("courses")
        .doc(this.courseIdRef.current.value)
        .collection("lessons")
        .doc(this.lessonIdRef.current.value)
        .delete();
      console.log("Document successfully deleted!");
    } catch (e) {
      console.error("Error deleting lessons document: ", e);
      window.alert('エラー')
    }
  }

  deleteSubscriber = async (courseId, lessonId, subscriberId) => {
    try {
      await firestore
        .collection("courses")
        .doc(this.courseIdRef.current.value)
        .collection("lessons")
        .doc(this.lessonIdRef.current.value)
        .collection("subscribers")
        .doc(this.subscriberIdRef.current.value)
        .delete();
      console.log("Document successfully deleted!");
    } catch (e) {
      console.error("Error deleting subscribers document: ", e);
      window.alert('エラー')
    }
  }

  /***********************************
  *
  * Storage関連メソッド
  *
  ***********************************/

  // ファイルアップロード
  handleFileChange = async (e) => {
    const file = e.target.files[0];

    // create ref
    const courseRef = coursesRef.child(`${this.courseIdRef.current.value}/noimage.png`);

    try {
      const uploadTask = courseRef.put(file);

      // Listen for state changes, errors, and completion of the upload.
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      },
      (error) => {

        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/unauthorized':
            console.error('storage/unauthorized');
            // User doesn't have permission to access the object
            break;

          case 'storage/canceled':
            console.error('storage/canceled');
            // User canceled the upload
            break;

          case 'storage/unknown':
            console.error('storage/unknown');
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
      },
      async () => {
        // Upload completed successfully, now we can get the download URL
        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
        console.log('File available at', downloadURL);
      });
    } catch (e) {
      console.error(e);
    }
  };

  render() {
    const authComponent = !this.state.isSignedIn ? (
      <React.Fragment>
        <p>Please sign-in:</p>
        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/>
        <div id="loader">Loading...</div>
        <br />
      </React.Fragment>
    ) : (
      <React.Fragment>
        <p>Welcome {firebase.auth().currentUser.displayName}! You are now signed-in!</p>
        <a onClick={() => firebase.auth().signOut()}>Sign-out</a>
      </React.Fragment>
    );

    const FirestoreControllMethods = {
      addCourse: this.addCourse,
      updateCourse: this.updateCourse,
      deleteCourse: this.deleteCourse,
      addLesson: this.addLesson,
      updateLesson: this.updateLesson,
      deleteLesson: this.deleteLesson,
      addSubscriber: this.addSubscriber,
      updateSubscriber: this.updateSubscriber,
      deleteSubscriber: this.deleteSubscriber,
    };

    const StorageControllMethods = {
      handleFileChange: this.handleFileChange,
    };

    return (
      <React.Fragment>
        <div>
          <h1>My App</h1>
          {authComponent}
        </div>
        <p>courseId:<input type="text" ref={this.courseIdRef} /></p>
        <p>lessonId:<input type="text" ref={this.lessonIdRef} /></p>
        <p>subscriberId:<input type="text" ref={this.subscriberIdRef} /></p>
        <FirestoreControll methods={FirestoreControllMethods} />
        <StorageControll methods={StorageControllMethods} />
      </React.Fragment>
    );
  }
}

export default App;
