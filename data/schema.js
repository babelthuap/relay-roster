/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
} from 'graphql-relay';

import {
  findOneByPropValue,
  findAllByPropValue,
  filterCollection,
} from './util';

import {
  instructors,
  students,
  courses,
  grades,
  LEVELS_ENUM,
  GRADES_ENUM,
} from './database';

import {
  instructorType,
  studentType,
  courseType,
  gradeType,
  instructorConnection,
  studentConnection,
  courseConnection,
  gradeConnection,
} from './types';


//***********************************************//
// Get the node interface from the Relay library //
//***********************************************//

let nodeInterface = nodeDefinitions(
  (globalId) => {let {type, id} = fromGlobalId(globalId)},
  (obj) => {}
).nodeInterface;


//***************************//
// GraphQL Schema Definition //
//***************************//

let queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    id: globalIdField('Query'),
    
    instructors: {
      type: instructorConnection,
      args: {
        filter: { type: GraphQLString },
        filterBy: { type: GraphQLString },
        ...connectionArgs
      },
      resolve: (_, args) => {
        let filteredInstructors = filterCollection(instructors, args.filter, args.filterBy, 'name');
        return connectionFromArray(filteredInstructors, args);
      },
    },

    students: {
      type: studentConnection,
      args: {
        filter: { type: GraphQLString },
        filterBy: { type: GraphQLString },
        ...connectionArgs
      },
      resolve: (_, args) => {
        let filteredStudents = filterCollection(students, args.filter, args.filterBy, 'name');
        return connectionFromArray(filteredStudents, args);
      },
    },

    courses: {
      type: courseConnection,
      args: {
        filter: { type: GraphQLString },
        filterBy: { type: GraphQLString },
        ...connectionArgs
      },
      resolve: (_, args) => {
        let filteredCourses = filterCollection(courses, args.filter, args.filterBy, 'name');
        return connectionFromArray(filteredCourses, args);
      },
    },

    grades: {
      type: gradeConnection,
      args: connectionArgs,
      resolve: (_, args) => connectionFromArray(grades, args),
    },

  }),
  interfaces: [nodeInterface],
});

/**
 * This is the type that will be the root of our mutations,
 * and the entry point into performing writes in our schema.
 */
let mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    // Add your own mutations here
  })
});

/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */
export let Schema = new GraphQLSchema({
  query: queryType,
  // Uncomment the following after adding some mutation fields:
  // mutation: mutationType
});
