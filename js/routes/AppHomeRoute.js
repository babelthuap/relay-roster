import Relay from 'react-relay';

export default class extends Relay.Route {
  static queries = {
    students: () => Relay.QL`
      query {
        students
      }
    `,
  };
  static routeName = 'AppHomeRoute';
}
