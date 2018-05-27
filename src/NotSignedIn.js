import React, {Component} from 'react';

// import firebase from 'firebase/app';
// import 'firebase/auth';
// import 'firebase/firestore';

export default class App extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    this.getAll();
  }

  getAll = async () => {
    const collectionRef = this.props.firestore.collection("users");

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
    return (
      <div>
        <h1>講座リスト</h1>
      </div>
    );
  }
}
