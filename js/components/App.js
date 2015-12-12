import React from 'react';
import Relay from 'react-relay';

class App extends React.Component {
  render() {
    return (
      <div>
        <h1>Student list</h1>
        <ul>
          {this.props.students.students.edges.map(edge =>
            <li key={edge.node.id}>{edge.node.name} - {edge.node.level}</li>
          )}
        </ul>
      </div>
    );
  }
}

export default Relay.createContainer(App, {
  fragments: {
    students: () => Relay.QL`
      fragment on Query {
        students(first: 2) {
          edges {
            node {
              id
              name
              level
            }
          }
        }
      }
    `,
  },
});
