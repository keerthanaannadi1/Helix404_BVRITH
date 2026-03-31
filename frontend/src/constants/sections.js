export const SECTION_DEFINITIONS = [
  { key: 'generalPoints', label: 'General Points' },
  { key: 'facultyJoined', label: 'Faculty Joined / Relieved' },
  { key: 'facultyAchievements', label: 'Faculty Achievements' },
  { key: 'studentAchievements', label: 'Student Achievements' },
  { key: 'departmentAchievements', label: 'Department Achievements' },
  { key: 'facultyEvents', label: 'Faculty Events Conducted' },
  { key: 'studentEvents', label: 'Student Events Conducted' },
  { key: 'nonTechEvents', label: 'Non Technical Events Conducted' },
  { key: 'industryVisits', label: 'Industry / College Visits' },
  { key: 'hackathons', label: 'Hackathon / External Event Participation' },
  { key: 'facultyFDP', label: 'Faculty FDP / Certification Attendance' },
  { key: 'facultyVisits', label: 'Faculty Visits' },
  { key: 'patents', label: 'Patents Published' },
  { key: 'vedicProgramsStudents', label: 'VEDIC Programs (Students)' },
  { key: 'vedicProgramsFaculty', label: 'VEDIC Programs (Faculty)' },
  { key: 'placements', label: 'Placements' },
  { key: 'mous', label: 'MoUs Signed' },
  { key: 'skillDevelopment', label: 'Skill Development Programs' }
]

export const SECTION_FIELDS = {
  generalPoints: [
    { name: 'content', label: 'Content', type: 'textarea', required: true },
    { name: 'type', label: 'Type', type: 'select', required: true, options: ['meeting', 'announcement', 'other'] }
  ],
  facultyJoined: [
    { name: 'facultyName', label: 'Faculty Name', type: 'text', required: true },
    { name: 'designation', label: 'Designation', type: 'text', required: true },
    { name: 'dateOfJoining', label: 'Date Of Joining', type: 'date', required: false },
    { name: 'dateOfRelieving', label: 'Date Of Relieving', type: 'date', required: false }
  ],
  facultyAchievements: [
    { name: 'facultyName', label: 'Faculty Name', type: 'text', required: true },
    { name: 'details', label: 'Achievement Details', type: 'textarea', required: true },
    { name: 'date', label: 'Date', type: 'date', required: false }
  ],
  studentAchievements: [
    { name: 'studentName', label: 'Student Name', type: 'text', required: true },
    { name: 'rollNo', label: 'Roll Number', type: 'text', required: true },
    { name: 'details', label: 'Achievement Details', type: 'textarea', required: true },
    { name: 'date', label: 'Date', type: 'date', required: false }
  ],
  departmentAchievements: [
    { name: 'details', label: 'Department Achievement Details', type: 'textarea', required: true },
    { name: 'date', label: 'Date', type: 'date', required: false }
  ],
  facultyEvents: [
    { name: 'eventName', label: 'Event Name', type: 'text', required: true },
    { name: 'resourcePerson', label: 'Resource Person / Guest', type: 'text', required: true },
    { name: 'coordinator', label: 'Coordinator Name', type: 'text', required: true },
    { name: 'facultyCount', label: 'Faculty Participation Count', type: 'number', required: false },
    { name: 'dateFrom', label: 'Date From', type: 'date', required: false },
    { name: 'dateTo', label: 'Date To', type: 'date', required: false }
  ],
  studentEvents: [
    { name: 'eventName', label: 'Event Name / Topic', type: 'text', required: true },
    { name: 'resourcePerson', label: 'Resource Person / Guest', type: 'text', required: true },
    { name: 'coordinator', label: 'Coordinator Name', type: 'text', required: true },
    { name: 'studentsCount', label: 'Student Participation Count', type: 'number', required: false },
    { name: 'dateFrom', label: 'Date From', type: 'date', required: false },
    { name: 'dateTo', label: 'Date To', type: 'date', required: false }
  ],
  nonTechEvents: [
    { name: 'eventName', label: 'Event Name / Topic', type: 'text', required: true },
    { name: 'resourcePerson', label: 'Resource Person / Guest', type: 'text', required: true },
    { name: 'coordinator', label: 'Coordinator Name', type: 'text', required: true },
    { name: 'studentsCount', label: 'Student Participation Count', type: 'number', required: false },
    { name: 'dateFrom', label: 'Date From', type: 'date', required: false },
    { name: 'dateTo', label: 'Date To', type: 'date', required: false }
  ],
  industryVisits: [
    { name: 'industryName', label: 'Industry / College Name', type: 'text', required: true },
    { name: 'location', label: 'Location', type: 'text', required: true },
    { name: 'coordinator', label: 'Coordinator Name', type: 'text', required: true },
    { name: 'studentsCount', label: 'Student Count', type: 'number', required: false },
    { name: 'dateFrom', label: 'Date From', type: 'date', required: false },
    { name: 'dateTo', label: 'Date To', type: 'date', required: false }
  ],
  hackathons: [
    { name: 'eventName', label: 'Event / Hackathon Name', type: 'text', required: true },
    { name: 'conductedBy', label: 'Conducted By', type: 'text', required: true },
    { name: 'mentorDetails', label: 'Mentor Details', type: 'text', required: true },
    { name: 'studentsCount', label: 'Student Participation Count', type: 'number', required: false },
    { name: 'dateFrom', label: 'Date From', type: 'date', required: false },
    { name: 'dateTo', label: 'Date To', type: 'date', required: false }
  ],
  facultyFDP: [
    { name: 'facultyName', label: 'Faculty Name', type: 'text', required: true },
    { name: 'workshopName', label: 'Workshop / FDP / Certification Name', type: 'text', required: true },
    { name: 'organizedBy', label: 'Organized By', type: 'text', required: true },
    { name: 'dateFrom', label: 'Date From', type: 'date', required: false },
    { name: 'dateTo', label: 'Date To', type: 'date', required: false }
  ],
  facultyVisits: [
    { name: 'facultyName', label: 'Faculty Name', type: 'text', required: true },
    { name: 'visitedInstitution', label: 'Visited Institution', type: 'text', required: true },
    { name: 'location', label: 'Location', type: 'text', required: true },
    { name: 'dateFrom', label: 'Date From', type: 'date', required: false },
    { name: 'dateTo', label: 'Date To', type: 'date', required: false }
  ],
  patents: [
    { name: 'facultyName', label: 'Faculty Name', type: 'text', required: true },
    { name: 'patentTitle', label: 'Patent Title', type: 'textarea', required: true },
    { name: 'applicationNo', label: 'Application Number', type: 'text', required: true },
    { name: 'publicationDate', label: 'Publication Date', type: 'date', required: false }
  ],
  vedicProgramsStudents: [
    { name: 'programName', label: 'Program Name', type: 'text', required: true },
    { name: 'studentsCount', label: 'Student Count', type: 'number', required: false },
    { name: 'dateFrom', label: 'Date From', type: 'date', required: false },
    { name: 'dateTo', label: 'Date To', type: 'date', required: false },
    { name: 'center', label: 'VEDIC Centre', type: 'select', required: true, options: ['VEDIC Hyd', "VEDIC B'lore"] }
  ],
  vedicProgramsFaculty: [
    { name: 'facultyName', label: 'Faculty Name', type: 'text', required: true },
    { name: 'workshopName', label: 'Workshop / FDP Name', type: 'text', required: true },
    { name: 'association', label: 'In Association With', type: 'text', required: false },
    { name: 'dateFrom', label: 'Date From', type: 'date', required: false },
    { name: 'dateTo', label: 'Date To', type: 'date', required: false },
    { name: 'center', label: 'VEDIC Centre', type: 'select', required: true, options: ['VEDIC Hyd', "VEDIC B'lore"] }
  ],
  placements: [
    { name: 'companyName', label: 'Company Name', type: 'text', required: true },
    { name: 'studentsPlaced', label: 'Students Placed', type: 'number', required: false },
    { name: 'package', label: 'Package', type: 'text', required: false }
  ],
  mous: [
    { name: 'organizationName', label: 'Organization Name', type: 'text', required: true },
    { name: 'signingDate', label: 'Signing Date', type: 'date', required: false },
    { name: 'validity', label: 'MoU Validity', type: 'text', required: false },
    { name: 'purpose', label: 'Purpose', type: 'textarea', required: true }
  ],
  skillDevelopment: [
    { name: 'programName', label: 'Program Name', type: 'text', required: true },
    { name: 'coordinator', label: 'Coordinator Name', type: 'text', required: true },
    { name: 'topic', label: 'Topic', type: 'textarea', required: true },
    { name: 'studentsCount', label: 'Student Count', type: 'number', required: false },
    { name: 'sessions', label: 'Sessions', type: 'number', required: false }
  ]
}

export const FALLBACK_SECTION_FIELDS = [
  { name: 'details', label: 'Details', type: 'textarea', required: true }
]
