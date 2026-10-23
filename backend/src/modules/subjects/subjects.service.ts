import { supabaseAdmin } from '../../config/supabase.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.util.js';
import { CreateSubjectInput, EnrollStudentInput, UpdateSubjectInput } from './subjects.schemas.js';

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
   * Enroll a student into a subject offering
   */
  async enrollStudent(subjectId: string, input: EnrollStudentInput) {
    let studentId = input.studentId;

    if (!studentId && input.email) {
      // Look up student user by email via supabaseAdmin auth
      const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
      if (userError) throw new BadRequestError(userError.message);

      const target = users.users.find((u) => u.email?.toLowerCase() === input.email?.toLowerCase());
      if (!target) {
        throw new NotFoundError(`No user found with email '${input.email}'`);
      }
      studentId = target.id;
    }

    if (!studentId) {
      throw new BadRequestError('Valid student identifier required');
    }

    const { data, error } = await supabaseAdmin
      .from('memberships')
      .insert({
        teacher_subject_id: subjectId,
        student_id: studentId,
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
   * Get class roster
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
    return data.map((item) => ({
      joinedAt: item.joined_at,
      ...(item.profiles as object),
    }));
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
