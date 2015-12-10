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

// import { } from './database';


//***************************//
// Seed The Pretend Database //
//***************************//

let instructors = [
  {id: 13, firstName: "Cade", lastName: "Nichols", age: 2, gender: "male"},
  {id: 42, firstName: "Samer", lastName: "Buna", age: 7, gender: "male"}
];

let students = [
  {id: 7, firstName: "Nicholas", lastName: "Neumann-Chun", age: 126, gender: "male", level: 1},
  {id: 9, firstName: "Sarah", lastName: "Lyon", age: 125, gender: "female", level: 3}
];

let LEVELS_ENUM = ["FRESHMAN", "SOPHMORE", "JUNIOR", "SENIOR"];

let courses = [
  {id: 101, name: "Skydiving", instructor: 13, students: new Set([7])},
  {id: 102, name: "ReactCamp", instructor: 42, students: new Set([7, 9])}
];

let grades = [
  {id: Math.random(), student: 7, course: 101, grade: 0},
  {id: Math.random(), student: 7, course: 102, grade: 2},
  {id: Math.random(), student: 9, course: 102, grade: 4}
];

let GRADES_ENUM = ["F", "D", "C", "B", "A"];


//***************************//
// Methods to Query Database //
//***************************//

Array.prototype.findOneByPropValue = function(prop, value) {
  for (let i = 0; i < this.length; ++i) {
    if (this[i][prop] == value) return this[i];
  }
  return null;
}

Array.prototype.findAllByPropValue = function(prop, value) {
  let results = [];
  for (let i = 0; i < this.length; ++i) {
    if (this[i][prop] == value) {
      results.push(this[i]);
    }
  }
  return results;
}


/**
 * We get the node interface and field from the Relay library.
 *
 * The first method defines the way we resolve an ID to its object.
 * The second defines the way we resolve an object to its GraphQL type.
 */
let {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    let {type, id} = fromGlobalId(globalId);
    // if (type === 'User') {
    //   return getUser(id);
    // } else if (type === 'Widget') {
    //   return getWidget(id);
    // } else {
    //   return null;
    // }
  },
  (obj) => {
    // if (obj instanceof User) {
    //   return userType;
    // } else if (obj instanceof Widget)  {
    //   return widgetType;
    // } else {
    //   return null;
    // }
  }
);


//**********************//
// New Type Definitions //
//**********************//

let instructorType = new GraphQLObjectType({
  name: 'Instructor',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    fullName: {
      type: GraphQLString,
      resolve: ({firstName, lastName}) => `Professor ${firstName} ${lastName}`
    },
    age: { type: GraphQLInt },
    gender: { type: GraphQLString },
    courses: {
      type: new GraphQLList(courseType),
      resolve: ({id}) => courses.findAllByPropValue('instructor', id)
    }
  })
});

let studentType = new GraphQLObjectType({
  name: 'Student',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    fullName: {
      type: GraphQLString,
      resolve: ({firstName, lastName}) => `${firstName} ${lastName}`
    },
    age: { type: GraphQLInt },
    gender: { type: GraphQLString },
    level: {
      type: GraphQLString,
      resolve: ({level}) => LEVELS_ENUM[level - 1]
    },
    grades: {
      type: new GraphQLList(gradeType),
      resolve: ({id}) => grades.findAllByPropValue('student', id)
    },
    GPA: {
      type: GraphQLFloat,
      resolve: ({id}) => {
        let nums = grades.findAllByPropValue('student', id).map(course => course.grade);
        let GPA = nums.reduce((total, x) => total + x, 0) / nums.length;
        return Number( GPA.toFixed(2) );
      }
    },
    courses: {
      type: new GraphQLList(courseType),
      resolve: ({id}) => courses.filter(course => course.students.has(id))
    }
  })
});

let courseType = new GraphQLObjectType({
  name: 'Course',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    instructor: {
      type: new GraphQLNonNull(instructorType),
      resolve: ({instructor}) => instructors.findOneByPropValue('id', instructor)
    },
    students: {
      type: new GraphQLList(studentType),
      resolve: obj => {
        let studentList = [...obj.students];
        return studentList.map(studentId => students.findOneByPropValue('id', studentId));
      }
    }
  })
});

let gradeType = new GraphQLObjectType({
  name: 'Grade',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    student: {
      type: new GraphQLNonNull(studentType),
      resolve: ({student}) => students.findOneByPropValue('id', student)
    },
    course: {
      type: new GraphQLNonNull(courseType),
      resolve: ({course}) => courses.findOneByPropValue('id', course)
    },
    grade: {
      type: GraphQLString,
      resolve: ({grade}) => GRADES_ENUM[grade]
    }
  })
});


//******************//
// Connection Types //
//******************//

let {connectionType: instructorConnection} =
  connectionDefinitions({name: 'Instructor', nodeType: instructorType});


//*******************//
// Utility Functions //
//*******************//

let escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function filterCollection(collection, filter, filterBy, defaultFilter) {
  if (!filter) return collection;

  if (!filterBy) filterBy = defaultFilter;

  if (isNaN(Number(filter))) { // test for number input
    // Filter Collection Such That Letters Do Not Have To Be Consecutive!!!!
    let reRaw = '.*' + filter.split('').map(escapeRegExp).join('.*') + '.*';
    let re = new RegExp(reRaw, 'i');
    return collection.filter(item => re.test(item[filterBy]));
  } else {
    filter = Number(filter);
    return collection.findAllByPropValue(filterBy, filter);
  }
}


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
        let filteredInstructors = filterCollection(instructors, args.filter, args.filterBy, 'firstName');
        return connectionFromArray(filteredInstructors, args)
      },
    },

    students: {
      type: new GraphQLList(studentType),
      args: {
        filter: { type: GraphQLString },
        filterBy: { type: GraphQLString }
      },
      resolve: (_, {filter, filterBy}) => filterCollection(students, filter, filterBy, 'firstName')
    },

    courses: {
      type: new GraphQLList(courseType),
      args: {
        filter: { type: GraphQLString },
        filterBy: { type: GraphQLString }
      },
      resolve: (_, {filter, filterBy}) => filterCollection(courses, filter, filterBy, 'name')
    },

    grades: {
      type: new GraphQLList(gradeType),
      resolve: () => grades
    }

  }),
  interfaces: [nodeInterface]
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
