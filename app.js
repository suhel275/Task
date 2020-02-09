var fs = require('fs');
var moment = require('moment');

/*** variables declaration ***/

const regex = /Civil Engineering/;
let pointsCategorization = {};
let totalPoints = 0;
let qualifications = [];
let proSkills = 0;
let expSkills = 0;
let expProjetcs = 0;
let famProjects = 0;
let startDate, endDate, diffDays, diffYears;

/*** parsing the JSON ***/

const bufferData = fs.readFileSync('data.json');
const dataJSON = bufferData.toString();
const data = JSON.parse(dataJSON);

/*** working with Qualifications ***/

const eduArr = data.ResumeParserData.SegregatedQualification.EducationSplit;
for (let el of eduArr) {
  qualifications.push({
    name: el.Institution.Name,
    degree: el.Degree
  });
}

/***  Working with experience ***/

const skillArr = data.ResumeParserData.SkillKeywords.SkillSet;
for (let el of skillArr) {
  if (
    el.Skill === 'Road Construction' ||
    el.Skill === 'Highway Construction' ||
    el.Skill === 'Bridge Construction' ||
    el.Skill === 'Airfield Construction'
  ) {
    if (el.ExperienceInMonths > proSkills) {
      proSkills = el.ExperienceInMonths;
    }
  } else if (
    el.Skill === 'Construction' ||
    el.Skill === 'Construction Supervision' ||
    el.Skill === 'Structural Concrete'
  ) {
    if (el.ExperienceInMonths > expSkills) {
      expSkills = el.ExperienceInMonths;
    }
  }
}
proSkills = proSkills / 12;
expSkills = expSkills / 12;

/*** Working with Projects ***/

const workHistoryArr = data.ResumeParserData.SegregatedExperience.WorkHistory;
for (let el of workHistoryArr) {
  if (
    el.JobProfile.FormattedName === 'Senior Quality CUM Material Expert' ||
    el.JobProfile.FormattedName === 'Geotechnical Engineer in Construction' ||
    el.JobProfile.FormattedName ===
      'Construction Supervision of Highway projects'
  ) {
    for (let subEl of el.Projects) {
      if (subEl.ProjectName !== '') {
        expProjetcs++;
      }
    }
  } else if (
    el.JobProfile.FormattedName === 'material property of road' ||
    el.JobProfile.FormattedName === 'bridge construction material'
  ) {
    for (let subEl of el.Projects) {
      if (subEl.ProjectName !== '') {
        famProjetcs++;
      }
    }
  }
}

/*** Working with Permanent Employment ***/

const permanentEmp = workHistoryArr.every(el => {
  // if employee worked for less than 1 year in any company,
  // it will return false and [permanentEmp] will have false value.
  startDate = moment('01/06/2013', 'D/M/YYYY');
  endDate = moment('31/05/2014', 'D/M/YYYY');
  diffDays = endDate.diff(startDate, 'days');
  diffYears = diffDays / 365;
  return diffYears >= 1;
});

/*** Points Calculation ***/

/* Points for Qualifications */

for (let el of qualifications) {
  if (regex.test(el.degree)) {
    pointsCategorization.qualificationPoints = 21;
  }
  if (
    el.degree === 'Post Graduate Degree in Geo-Technical Engineering' ||
    el.degree ===
      'Post Graduate Degree in Soil Mechanics and Foundation Engineering'
  ) {
    pointsCategorization.qualificationPoints = 25;
  }
}

/* Points for Professional Experience */

if (proSkills >= 12) {
  pointsCategorization.proSkillsPoints =
    proSkills - 12 > 4 ? 15 : proSkills - 12 + 11;
} else {
  pointsCategorization.proSkillsPoints = 0;
}

/* Points for Experience */

if (expSkills >= 6) {
  pointsCategorization.expSkillsPoints =
    (expSkills - 6) * 2.5 > 5 ? 25 : (expSkills - 6) * 2.5 + 20;
} else {
  pointsCategorization.expSkillsPoints = 0;
}

/* Points for Experience Projects */

if (expProjetcs >= 2) {
  pointsCategorization.expProjetcsPoints =
    (expProjetcs - 2) * 2.5 > 5 ? 25 : (expProjetcs - 2) * 2.5 + 20;
} else {
  pointsCategorization.expProjetcsPoints = 0;
}

/* Points for Familiarity Projects */

if (famProjects < 1) {
  pointsCategorization.familiarityProjectsPoints = 0;
} else if (famProjects === 1) {
  pointsCategorization.familiarityProjectsPoints = 4;
} else {
  pointsCategorization.familiarityProjectsPoints = 5;
}

/* Points for Permanent Employment */
if (permanentEmp === true) {
  pointsCategorization.permanentEmploymentPoints = 5;
} else {
  pointsCategorization.permanentEmploymentPoints = 0;
}

/* Calculating Total Points */

for (let el in pointsCategorization) {
  totalPoints = totalPoints + pointsCategorization[el];
}
pointsCategorization.totalPoints = totalPoints;

/*** Displaying Points for Every Category ***/

for (let el in pointsCategorization) {
  console.log(`${el} are ${pointsCategorization[el]}`);
}
