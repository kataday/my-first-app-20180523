import React, {Component} from 'react';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

export default class App extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    // this.getAll();
  }

  add = async () => {
    const data = {
      first: "Ada",
      last: "Lovelace",
      born: 1915,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      await this.props.firestore.collection("users").doc(firebase.auth().currentUser.uid).set(data);
      // console.log("Document written with ID: ", docRef.id);
      console.log("Document written");
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  getAll = async () => {
    // const collectionRef = this.props.firestore.collection("users");
    //
    // try {
    //   const docs = await collectionRef.get();
    //   docs.forEach(function(doc) {
    //     // doc.data() is never undefined for query doc snapshots
    //     console.log(doc.id, " => ", doc.data());
    //   });
    // } catch (e) {
    //   console.log("Error getting document:", e);
    // }

    this.props.firestore.collection("users").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
        });
    });
  }

  render() {
    return (<div>
      <h1>My App</h1>
      <p>Welcome {firebase.auth().currentUser.displayName}! You are now signed-in!</p>
      <a onClick={() => firebase.auth().signOut()}>Sign-out</a>
    </div>);
  }
}
