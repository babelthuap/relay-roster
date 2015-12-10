import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
} from 'graphql';

let personFields = {
  id: { type: new GraphQLNonNull(GraphQLID) },
  name: { type: GraphQLString },
  firstName: {
    type: GraphQLString,
    resolve: ({name}) => name.split(' ')[0]
  },
  lastName: {
    type: GraphQLString,
    resolve: ({name}) => name.split(' ').slice(-1)[0]
  },
  age: { type: GraphQLInt },
  gender: { type: GraphQLString },
};

export default personFields;
