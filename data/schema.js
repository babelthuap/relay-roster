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
  filterCollection
} from './util';

import {
  instructors,
  students,
  courses,
  grades,
  LEVELS_ENUM,
  GRADES_ENUM
} from './database';


// Get the node interface from the Relay library.
let nodeInterface = nodeDefinitions(
  (globalId) => {let {type, id} = fromGlobalId(globalId)},
  (obj) => {}
).nodeInterface;


//**********************//
// New Type Definitions //
//**********************//

// fake connection definitions (so they can be used in the type definitions)
let courseConnection, instructorConnection, studentConnection, gradeConnection;

import personFields from "./personFields";

let instructorType = new GraphQLObjectType({
  name: 'Instructor',
  fields: () => ({
    ...personFields,
    coursesConnection: {
      type: courseConnection,
      args: connectionArgs,
      resolve: ({id}, args) => {
        let filteredCourses = findAllByPropValue.call(courses, 'instructor', id);
        return connectionFromArray(filteredCourses, args);
      },
    },
  })
});

let studentType = new GraphQLObjectType({
  name: 'Student',
  fields: () => ({
    ...personFields,
    level: {
      type: GraphQLString,
      resolve: ({level}) => LEVELS_ENUM[level - 1]
    },
    gradesConnection: {
      type: gradeConnection,
      args: connectionArgs,
      resolve: ({id}, args) => {
        let filteredGrades = findAllByPropValue.call(grades, 'student', id);
        return connectionFromArray(filteredGrades, args);
      },
    },
    GPA: {
      type: GraphQLFloat,
      resolve: ({id}) => {
        let nums = findAllByPropValue.call(grades, 'student', id).map(course => course.grade);
        let GPA = nums.reduce((total, x) => total + x, 0) / nums.length;
        return Number( GPA.toFixed(2) );
      }
    },
    coursesConnection: {
      type: courseConnection,
      args: connectionArgs,
      resolve: ({id}, args) => {
        let filteredCourses = courses.filter(course => course.students.has(id))
        return connectionFromArray(filteredCourses, args);
      },
    },
  })
});

let courseType = new GraphQLObjectType({
  name: 'Course',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    instructor: {
      type: new GraphQLNonNull(instructorType),
      resolve: ({instructor}) => findOneByPropValue.call(instructors, 'id', instructor)
    },
    studentsConnection: {
      type: studentConnection,
      args: connectionArgs,
      resolve: (obj, args) => {
        let enrolledIds = [...obj.students];
        let filteredStudents = enrolledIds.map(studentId => findOneByPropValue.call(students, 'id', studentId));
        return connectionFromArray(filteredStudents, args);
      },
    },
    gradesConnection: {
      type: gradeConnection,
      args: connectionArgs,
      resolve: ({id}, args) => {
        let filteredGrades = findAllByPropValue.call(grades, 'course', id)
        return connectionFromArray(filteredGrades, args);
      },
    },
  })
});

let gradeType = new GraphQLObjectType({
  name: 'Grade',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    student: {
      type: new GraphQLNonNull(studentType),
      resolve: ({student}) => findOneByPropValue.call(students, 'id', student)
    },
    course: {
      type: new GraphQLNonNull(courseType),
      resolve: ({course}) => findOneByPropValue.call(courses, 'id', course)
    },
    grade: {
      type: GraphQLString,
      resolve: ({grade}) => GRADES_ENUM[grade]
    },
  })
});


//******************//
// Connection Types //
//******************//

let instructorDef = connectionDefinitions({ name: 'Instructor', nodeType: instructorType });
instructorConnection = instructorDef.connectionType;

let studentDef = connectionDefinitions({ name: 'Student', nodeType: studentType });
studentConnection = studentDef.connectionType;

let courseDef = connectionDefinitions({ name: 'Course', nodeType: courseType });
courseConnection = courseDef.connectionType;

let gradeDef = connectionDefinitions({ name: 'Grade', nodeType: gradeType });
gradeConnection = gradeDef.connectionType;


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
