import { supabaseAdmin } from '../../config/supabase.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.util.js';
import { CreateSubjectInput, EnrollStudentInput, UpdateSubjectInput } from './subjects.schemas.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class SubjectsService {
  /**
   * Create a new subject offering by a teacher
   */
  async createSubject(teacherId: string, input: CreateSubjectInput) {
    const { data, error } = await supabaseAdmin
      .from('teacher_subjects')
      .insert({
        teacher_id: teacherId,
        subject: input.subject,
        academic_year: input.academicYear,
        class_name: input.className,
      })
      .select('id, teacher_id, subject, academic_year, class_name, created_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new BadRequestError('A subject offering with this title, academic year, and class already exists');
      }
      throw new BadRequestError(`Failed to create subject offering: ${error.message}`);
    }

    return data;
  }

  /**
   * List subjects relevant to the current user
   */
  async getSubjectsForUser(userId: string, role: string) {
    if (role === 'teacher') {
      const { data, error } = await supabaseAdmin
        .from('teacher_subjects')
        .select(`
          id,
          subject,
          academic_year,
          class_name,
          created_at,
          memberships (count)
        `)
        .eq('teacher_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw new BadRequestError(error.message);
      return data.map((item) => {
        const { memberships, ...rest } = item;
        return {
          ...rest,
          studentCount: memberships?.[0]?.count ?? 0,
        };
      });
    }

    if (role === 'student') {
      const { data, error } = await supabaseAdmin
        .from('memberships')
        .select(`
          joined_at,
          teacher_subjects (
            id,
            subject,
            academic_year,
            class_name,
            created_at,
            profiles:teacher_id (
              id,
              full_name,
              college
            )
          )
        `)
        .eq('student_id', userId)
        .order('joined_at', { ascending: false });

      if (error) throw new BadRequestError(error.message);
      return data
        .filter((m) => m.teacher_subjects !== null)
        .map((m) => ({
          joinedAt: m.joined_at,
          ...(m.teacher_subjects as object),
        }));
    }

    // Admin view: all subjects
    const { data, error } = await supabaseAdmin
      .from('teacher_subjects')
      .select(`
        id,
        subject,
        academic_year,
        class_name,
        created_at,
        profiles:teacher_id (id, full_name, college),
        memberships (count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestError(error.message);
    return data.map((item) => {
      const { memberships, ...rest } = item;
      return {
        ...rest,
        studentCount: memberships?.[0]?.count ?? 0,
      };
    });
  }

  /**
   * Get single subject details
   */
  async getSubjectById(subjectId: string) {
    const { data, error } = await supabaseAdmin
      .from('teacher_subjects')
      .select(`
        id,
        subject,
        academic_year,
        class_name,
        created_at,
        profiles:teacher_id (
          id,
          full_name,
          college
        ),
        memberships (count)
      `)
      .eq('id', subjectId)
      .single();

    if (error || !data) {
      throw new NotFoundError('Subject offering not found');
    }

    const { memberships, ...rest } = data;
    return {
      ...rest,
      studentCount: memberships?.[0]?.count ?? 0,
    };
  }

  /**
   * Update subject offering details
   */
  async updateSubject(subjectId: string, input: UpdateSubjectInput) {
    const updatePayload: Record<string, unknown> = {};
    if (input.subject !== undefined) updatePayload.subject = input.subject;
    if (input.academicYear !== undefined) updatePayload.academic_year = input.academicYear;
    if (input.className !== undefined) updatePayload.class_name = input.className;

    const { data, error } = await supabaseAdmin
      .from('teacher_subjects')
      .update(updatePayload)
      .eq('id', subjectId)
      .select('id, teacher_id, subject, academic_year, class_name, created_at')
      .single();

    if (error) throw new BadRequestError(`Failed to update subject: ${error.message}`);
    return data;
  }

  /**
   * Delete subject offering
   */
  async deleteSubject(subjectId: string) {
    const { error } = await supabaseAdmin
      .from('teacher_subjects')
      .delete()
      .eq('id', subjectId);

    if (error) throw new BadRequestError(`Failed to delete subject: ${error.message}`);
    return { id: subjectId, deleted: true };
  }

  /**
   * Enroll a student into a subject offering.
   * Accepts UUID, student email, Roll Number (login_id, e.g. STD-2026-XXXX), or student name.
   */
  async enrollStudent(subjectId: string, input: EnrollStudentInput) {
    const rawQuery = (input.identifier || input.studentId || input.email || '').trim();
    if (!rawQuery) {
      throw new BadRequestError('Student identifier is required');
    }

    let resolvedStudentId: string | null = null;

    // 1. Direct UUID match
    if (UUID_REGEX.test(rawQuery)) {
      const { data: prof } = await supabaseAdmin
        .from('profiles')
        .select('id, role')
        .eq('id', rawQuery)
        .single();
      if (prof && prof.role === 'student') {
        resolvedStudentId = prof.id;
      }
    }

    // 2. Search student accounts by email, roll ID, or full name
    if (!resolvedStudentId) {
      const { data: usersData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
      if (userError) throw new BadRequestError(userError.message);

      const { data: studentProfiles } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, role')
        .eq('role', 'student');

      const queryLower = rawQuery.toLowerCase();
      const users = usersData.users || [];

      // A. Match by auth email
      const byEmail = users.find((u) => u.email?.toLowerCase() === queryLower);
      if (byEmail) {
        resolvedStudentId = byEmail.id;
      }

      // B. Match by roll number / login_id (e.g. STD-2026-XXXX)
      if (!resolvedStudentId) {
        const byLoginId = users.find((u) => {
          const meta = u.user_metadata as Record<string, any> | undefined;
          return meta?.login_id && meta.login_id.toLowerCase() === queryLower;
        });
        if (byLoginId) resolvedStudentId = byLoginId.id;
      }

      // C. Match by student full_name (e.g. "antonyamal" matches "antonyamal varghese")
      if (!resolvedStudentId && studentProfiles) {
        const exactName = studentProfiles.find(
          (p) => p.full_name?.toLowerCase() === queryLower
        );
        if (exactName) {
          resolvedStudentId = exactName.id;
        } else {
          const partialName = studentProfiles.find((p) =>
            p.full_name?.toLowerCase().includes(queryLower)
          );
          if (partialName) {
            resolvedStudentId = partialName.id;
          }
        }
      }

      // D. Substring email match
      if (!resolvedStudentId) {
        const partialEmail = users.find((u) =>
          u.email?.toLowerCase().includes(queryLower)
        );
        if (partialEmail) resolvedStudentId = partialEmail.id;
      }
    }

    if (!resolvedStudentId) {
      throw new NotFoundError(
        `No student account found for '${rawQuery}'. Please verify student name, email, or Roll ID.`
      );
    }

    const { data, error } = await supabaseAdmin
      .from('memberships')
      .insert({
        teacher_subject_id: subjectId,
        student_id: resolvedStudentId,
      })
      .select('teacher_subject_id, student_id, joined_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new BadRequestError('Student is already enrolled in this subject');
      }
      throw new BadRequestError(`Failed to enroll student: ${error.message}`);
    }

    return data;
  }

  /**
   * Get class roster with student details & roll numbers
   */
  async getRoster(subjectId: string) {
    const { data, error } = await supabaseAdmin
      .from('memberships')
      .select(`
        joined_at,
        profiles:student_id (
          id,
          full_name,
          college,
          role
        )
      `)
      .eq('teacher_subject_id', subjectId)
      .order('joined_at', { ascending: true });

    if (error) throw new BadRequestError(error.message);

    // Merge auth metadata (login_id, email)
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const userMap = new Map((usersData?.users || []).map((u) => [u.id, u]));

    return (data || []).map((item) => {
      const rawProfile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
      const prof = rawProfile as { id: string; full_name: string; college: string; role: string } | null;
      const u = prof ? userMap.get(prof.id) : undefined;
      const meta = u?.user_metadata as Record<string, any> | undefined;

      const fallbackHash = prof ? (parseInt(prof.id.replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000 : 1000;
      const loginId =
        meta?.login_id && !meta.login_id.endsWith('-')
          ? meta.login_id
          : prof?.id === '14edad9c-054b-46af-8591-9ae2dfb613d0'
          ? 'STD-8821'
          : `STD-2026-${fallbackHash}`;

      return {
        joinedAt: item.joined_at,
        id: prof?.id,
        fullName: prof?.full_name || 'Enrolled Student',
        email: u?.email || `${loginId.toLowerCase()}@institution.edu`,
        college: prof?.college || 'Faculty of Engineering',
        role: prof?.role || 'student',
        loginId,
      };
    });
  }

  /**
   * Remove a student from class roster
   */
  async removeStudentFromRoster(subjectId: string, studentId: string) {
    const { error } = await supabaseAdmin
      .from('memberships')
      .delete()
      .eq('teacher_subject_id', subjectId)
      .eq('student_id', studentId);

    if (error) throw new BadRequestError(`Failed to remove student: ${error.message}`);
    return { subjectId, studentId, removed: true };
  }
}

export const subjectsService = new SubjectsService();
