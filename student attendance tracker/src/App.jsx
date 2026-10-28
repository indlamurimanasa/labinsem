import React from 'react';

function StudentCard({ name, id, course, attendance }) {
  return (
    <article className="student-card">
      <div className="student-heading">
        <div className="student-avatar" aria-hidden="true">
          {name.charAt(0)}
        </div>
        <div>
          <p className="student-label">Student</p>
          <h2>{name}</h2>
        </div>
      </div>

      <dl className="student-details">
        <div className="detail-row">
          <dt>Student ID</dt>
          <dd>{id}</dd>
        </div>
        <div className="detail-row">
          <dt>Course</dt>
          <dd>{course}</dd>
        </div>
      </dl>

      <section className="attendance" aria-label="Attendance">
        <div className="attendance-heading">
          <h3>Attendance</h3>
          <strong>{attendance}%</strong>
        </div>
        <progress value={attendance} max="100" aria-label={`${attendance}% attendance`}>
          {attendance}%
        </progress>
      </section>
    </article>
  );
}

function App() {
  const student = {
    name: 'Manasa',
    id: '101',
    course: 'ECE',
    attendance: 90,
  };

  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">Student attendance tracker</p>
        <h1>Student record</h1>
        <p>A quick overview of student details and attendance.</p>
      </header>

      <StudentCard
        name={student.name}
        id={student.id}
        course={student.course}
        attendance={student.attendance}
      />
    </main>
  );
}

export default App;
