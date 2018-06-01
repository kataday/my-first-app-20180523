import React, {Component} from 'react';

export default class StorageControll extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div>
        <h2>Storage</h2>
        <p><input type="file" onChange={this.props.methods.handleFileChange} /></p>
      </div>
    );
  }
}
