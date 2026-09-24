import { AttendanceRecord, AttendanceStatus, OverallAttendanceSummary, Subject, SubjectAttendanceSummary } from './types';

/**
 * Calculates attendance percentage based on the mandatory college formula:
 * Percentage = Present / (Total Conducted - Approved Leave) * 100
 *
 * Approved Leave is NOT counted as Present, but is deducted from the denominator.
 */
export function calculateAttendancePercentage(
  presentCount: number,
  totalConducted: number,
  approvedLeaveCount: number
): number {
  const effectiveTotal = totalConducted - approvedLeaveCount;
  if (effectiveTotal <= 0) {
    return 100.0; // If no effective lectures held yet, default to full standing
  }
  const percentage = (presentCount / effectiveTotal) * 100;
  return Math.round(percentage * 100) / 100; // 2 decimal places
}

/**
 * Calculates the exact number of consecutive lectures a student must attend
 * to bring their attendance up to or above the required threshold.
 *
 * Formula:
 * (P + X) / (D + X) >= T
 * X * (1 - T) >= T * D - P
 * X = ceil((T * D - P) / (1 - T))
 */
export function calculateConsecutiveLecturesNeeded(
  presentCount: number,
  totalConducted: number,
  approvedLeaveCount: number,
  thresholdPercentage: number = 75
): number {
  const effectiveTotal = totalConducted - approvedLeaveCount;
  if (effectiveTotal <= 0) return 0;

  const currentPercentage = (presentCount / effectiveTotal) * 100;
  if (currentPercentage >= thresholdPercentage) {
    return 0;
  }

  const T = thresholdPercentage / 100;
  const numerator = T * effectiveTotal - presentCount;
  const denominator = 1 - T;

  if (denominator <= 0) return 0;

  const required = Math.ceil(numerator / denominator);
  return Math.max(0, required);
}

/**
 * Summarizes attendance records for a student across all subjects
 */
export function computeStudentAttendanceSummary(
  studentId: string,
  subjects: Subject[],
  records: AttendanceRecord[],
  lecturesMap: Map<string, { id: string; date: string; startTime: string; endTime: string; subjectId: string; roomId: string; status: string }>,
  professorsMap: Map<string, { name: string }>,
  roomsMap: Map<string, { code: string; name: string }>,
  thresholdPercentage: number = 75
): OverallAttendanceSummary {
  let grandTotalConducted = 0;
  let grandPresentCount = 0;
  let grandAbsentCount = 0;
  let grandApprovedLeaveCount = 0;

  const subjectSummaries: SubjectAttendanceSummary[] = subjects.map((subject) => {
    // Find all records belonging to this student for lectures of this subject
    const subjectRecords = records.filter((r) => {
      if (r.studentId !== studentId) return false;
      const lecture = lecturesMap.get(r.lectureId);
      return lecture && lecture.subjectId === subject.id && lecture.status === 'conducted';
    });

    let present = 0;
    let absent = 0;
    let approvedLeave = 0;

    const formattedRecords = subjectRecords.map((rec) => {
      const lec = lecturesMap.get(rec.lectureId);
      const room = lec ? roomsMap.get(lec.roomId) : undefined;
      if (rec.status === 'present') present++;
      else if (rec.status === 'absent') absent++;
      else if (rec.status === 'approved_leave') approvedLeave++;

      return {
        lectureId: rec.lectureId,
        date: lec?.date || '',
        time: lec ? `${lec.startTime} - ${lec.endTime}` : '',
        room: room ? `${room.code}` : 'TBD',
        status: rec.status,
      };
    });

    const totalConducted = present + absent + approvedLeave;
    const percentage = calculateAttendancePercentage(present, totalConducted, approvedLeave);
    const consecutive = calculateConsecutiveLecturesNeeded(present, totalConducted, approvedLeave, thresholdPercentage);

    grandTotalConducted += totalConducted;
    grandPresentCount += present;
    grandAbsentCount += absent;
    grandApprovedLeaveCount += approvedLeave;

    const prof = professorsMap.get(subject.professorId);

    return {
      subjectId: subject.id,
      subjectCode: subject.code,
      subjectName: subject.name,
      professorName: prof?.name || 'Faculty',
      totalConducted,
      presentCount: present,
      absentCount: absent,
      approvedLeaveCount: approvedLeave,
      percentage,
      isLowAttendance: percentage < thresholdPercentage ? percentage : 0,
      consecutiveRequiredToRecover: consecutive,
      records: formattedRecords.sort((a, b) => b.date.localeCompare(a.date)),
    };
  });

  const overallPercentage = calculateAttendancePercentage(
    grandPresentCount,
    grandTotalConducted,
    grandApprovedLeaveCount
  );

  const overallConsecutive = calculateConsecutiveLecturesNeeded(
    grandPresentCount,
    grandTotalConducted,
    grandApprovedLeaveCount,
    thresholdPercentage
  );

  return {
    totalConducted: grandTotalConducted,
    presentCount: grandPresentCount,
    absentCount: grandAbsentCount,
    approvedLeaveCount: grandApprovedLeaveCount,
    overallPercentage,
    isBelowThreshold: overallPercentage < thresholdPercentage,
    consecutiveRequiredToRecover: overallConsecutive,
    threshold: thresholdPercentage,
    subjects: subjectSummaries,
  };
}
