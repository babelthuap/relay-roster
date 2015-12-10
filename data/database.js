/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

//***************************//
// Seed The Pretend Database //
//***************************//

let instructors = [
  {id: 13, name: "Cade Hercules Nichols", age: 2, gender: "male"},
  {id: 42, name: "Samer The Hammer Buna", age: 7, gender: "male"}
];

let students = [
  {id: 7, name: "Nicholas Babelthuap Neumann-Chun", age: 126, gender: "male", level: 1},
  {id: 9, name: "Sarah Papaya Lyon", age: 125, gender: "female", level: 3}
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


module.exports = {
  instructors: instructors,
  students: students,
  courses: courses,
  grades: grades,
  LEVELS_ENUM: LEVELS_ENUM,
  GRADES_ENUM: GRADES_ENUM,
};
