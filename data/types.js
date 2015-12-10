import{
  GraphQLFloat,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
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

import personFields from "./personFields";


//**********************//
// New Type Definitions //
//**********************//

// fake connection definitions (so they can be used in the type definitions)
let courseConnection, instructorConnection, studentConnection, gradeConnection;

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


module.exports = {
  instructorType: instructorType,
  studentType: studentType,
  courseType: courseType,
  gradeType: gradeType,
  instructorConnection: instructorConnection,
  studentConnection: studentConnection,
  courseConnection: courseConnection,
  gradeConnection: gradeConnection,
}
