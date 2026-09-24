import { NextRequest, NextResponse } from 'next/server';
import { campusDb } from '@/lib/db';
import { calculateAttendancePercentage } from '@/lib/attendanceLogic';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'json'; // 'csv' or 'json'
    const reportType = url.searchParams.get('type') || 'division'; // 'division' | 'subject' | 'student'
    const branchId = url.searchParams.get('branchId') || 'branch_cs';
    const semester = parseInt(url.searchParams.get('semester') || '3', 10);
    const division = url.searchParams.get('division') || 'A';
    const subjectId = url.searchParams.get('subjectId');

    const students = campusDb.getUsers('student').filter(
      (s) => s.branchId === branchId && s.semester === semester && s.division === division
    );
    const subjects = campusDb.getSubjects().filter((s) => s.branchId === branchId && s.semester === semester);
    const allLectures = campusDb.getLectures({ branchId, semester, division });
    const conductedLectures = allLectures.filter(
      (l) => l.status === 'conducted' && (!subjectId || l.subjectId === subjectId)
    );

    const reportRows = students.map((student) => {
      const records = campusDb.getAttendanceRecords({ studentId: student.id }).filter((r) => {
        const lec = conductedLectures.find((l) => l.id === r.lectureId);
        return !!lec;
      });

      const present = records.filter((r) => r.status === 'present').length;
      const approvedLeave = records.filter((r) => r.status === 'approved_leave').length;
      const absent = records.filter((r) => r.status === 'absent').length;
      const total = conductedLectures.length;
      const percentage = calculateAttendancePercentage(present, total, approvedLeave);

      return {
        enrollmentNo: student.enrollmentNo || student.id,
        name: student.name,
        branch: branchId.replace('branch_', '').toUpperCase(),
        semester,
        division,
        totalConducted: total,
        present,
        absent,
        approvedLeave,
        effectiveTotal: total - approvedLeave,
        percentage: `${percentage.toFixed(2)}%`,
        status: percentage >= 75 ? 'ELIGIBLE' : 'SHORTAGE_WARNING',
      };
    });

    if (format === 'csv') {
      const headers = [
        'Enrollment ID',
        'Student Name',
        'Branch',
        'Semester',
        'Division',
        'Total Conducted',
        'Present',
        'Absent',
        'Approved Leave',
        'Effective Total',
        'Attendance %',
        'Academic Status',
      ];

      const csvLines = [
        headers.join(','),
        ...reportRows.map((r) =>
          [
            `"${r.enrollmentNo}"`,
            `"${r.name}"`,
            r.branch,
            r.semester,
            r.division,
            r.totalConducted,
            r.present,
            r.absent,
            r.approvedLeave,
            r.effectiveTotal,
            `"${r.percentage}"`,
            r.status,
          ].join(',')
        ),
      ];

      const csvContent = csvLines.join('\n');
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="attendance_report_${branchId}_sem${semester}_div${division}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      metadata: {
        reportType,
        branchId,
        semester,
        division,
        subjectId,
        generatedAt: new Date().toISOString(),
        totalStudents: students.length,
        totalConductedLectures: conductedLectures.length,
      },
      rows: reportRows,
    });
  } catch (error) {
    console.error('Report export error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
