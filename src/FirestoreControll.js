import React, {Component} from 'react';

export default class FirestoreControll extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div>
        <h2>Firestore</h2>
        <h3>講座</h3>
        <a onClick={this.props.methods.addCourse}>addCourse</a>
        <br/>
        <a onClick={this.props.methods.updateCourse}>updateCourse</a>
        <br/>
        <a onClick={this.props.methods.deleteCourse}>deleteCourse</a>
        <h3>レッスン</h3>
        <a onClick={this.props.methods.addLesson}>addLesson</a>
        <br/>
        <a onClick={this.props.methods.updateLesson}>updateLesson</a>
        <br/>
        <a onClick={this.props.methods.deleteLesson}>deleteLesson</a>
        <h3>申込者</h3>
        <a onClick={this.props.methods.addSubscriber}>addSubscriber</a>
        <br/>
        <a onClick={this.props.methods.updateSubscriber}>updateSubscriber</a>
        <br/>
        <a onClick={this.props.methods.deleteSubscriber}>deleteSubscriber</a>
      </div>
    );
  }
}
