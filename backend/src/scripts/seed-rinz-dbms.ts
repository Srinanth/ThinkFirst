import { supabaseAdmin } from '../config/supabase.js';

const TEACHER_SUBJECT_ID = '8b9cea02-2c6a-4856-9b79-93264c2d972c'; // Rinz DBMS Section Alpha
const TEACHER_ID = '4925878e-8442-4c5a-bde1-d4b0f690c87d'; // Rinz Logic

interface StudentSeed {
  id?: string;
  email: string;
  fullName: string;
  loginId: string;
  college: string;
  targetTier: 'mastered' | 'developing' | 'intervention';
  quizScores: number[]; // 4 scores out of 4 for quizzes 1, 2, 3, 4
}

const STUDENTS: StudentSeed[] = [
  {
    id: '969a5239-a157-4e1a-b8f9-292f2d620117',
    email: 'std2026@institution.edu',
    fullName: 'antonyamal varghese',
    loginId: 'STD-2026-0001',
    college: 'Faculty of Engineering',
    targetTier: 'mastered',
    quizScores: [3, 3, 4, 4], // 75%, 75%, 100%, 100% -> avg 87.5%
  },
  {
    id: '14edad9c-054b-46af-8591-9ae2dfb613d0',
    email: 'student.demo@thinkfirst.edu',
    fullName: 'Lucas Chen',
    loginId: 'STD-2026-0002',
    college: 'Faculty of Engineering',
    targetTier: 'mastered',
    quizScores: [3, 4, 4, 4], // 75%, 100%, 100%, 100% -> avg 93.8%
  },
  {
    id: 'e5f4b30f-d3ad-42e2-92d9-2226b6531ab7',
    email: 'emma.watson@institution.edu',
    fullName: 'Emma Watson',
    loginId: 'STD-2026-9999',
    college: 'Faculty of Engineering',
    targetTier: 'mastered',
    quizScores: [4, 4, 4, 4], // 100%, 100%, 100%, 100% -> avg 100%
  },
  {
    email: 'priya.sharma@institution.edu',
    fullName: 'Priya Sharma',
    loginId: 'STD-2026-1042',
    college: 'Faculty of Engineering',
    targetTier: 'developing',
    quizScores: [3, 3, 3, 4], // 75%, 75%, 75%, 100% -> avg 81.3%
  },
  {
    email: 'marcus.brody@institution.edu',
    fullName: 'Marcus Brody',
    loginId: 'STD-2026-2184',
    college: 'Faculty of Engineering',
    targetTier: 'developing',
    quizScores: [2, 3, 3, 3], // 50%, 75%, 75%, 75% -> avg 68.8%
  },
  {
    email: 'sarah.j@institution.edu',
    fullName: 'Sarah Jenkins',
    loginId: 'STD-2026-3295',
    college: 'Faculty of Engineering',
    targetTier: 'intervention',
    quizScores: [2, 2, 3, 3], // 50%, 50%, 75%, 75% -> avg 62.5%
  },
  {
    id: 'a967d4d9-b554-4fd3-87e4-cf2cba579905',
    email: 'antony@111.edu',
    fullName: 'antony',
    loginId: 'STD-2026-6258',
    college: 'Faculty of Engineering',
    targetTier: 'intervention',
    quizScores: [2, 2, 2, 2], // 50%, 50%, 50%, 50% -> avg 50%
  },
];

async function seed() {
  console.log('🚀 Starting Seed for Teacher Rinz DBMS Class...');

  // 1. Resolve or Create Student Accounts
  const studentIds: { [email: string]: string } = {};

  for (const s of STUDENTS) {
    let studentId = s.id;
    if (!studentId) {
      // Check if user already exists in auth
      const { data: list } = await supabaseAdmin.auth.admin.listUsers();
      const existing = list?.users.find((u) => u.email === s.email);
      if (existing) {
        studentId = existing.id;
      } else {
        const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: s.email,
          password: 'password123',
          email_confirm: true,
          user_metadata: {
            role: 'student',
            full_name: s.fullName,
            login_id: s.loginId,
            college: s.college,
          },
        });
        if (createErr) {
          console.error(`Failed to create auth user ${s.email}:`, createErr);
          continue;
        }
        studentId = newUser.user.id;
      }
    }

    studentIds[s.email] = studentId!;

    // Upsert into profiles
    await supabaseAdmin.from('profiles').upsert({
      id: studentId,
      full_name: s.fullName,
      college: s.college,
      role: 'student',
      created_at: new Date().toISOString(),
    });

    // Upsert into memberships
    await supabaseAdmin.from('memberships').upsert(
      {
        teacher_subject_id: TEACHER_SUBJECT_ID,
        student_id: studentId,
        joined_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      { onConflict: 'teacher_subject_id,student_id' }
    );

    console.log(`✅ Student registered & enrolled: ${s.fullName} (${s.email}) -> ${studentId}`);
  }

  // 2. Insert DBMS Curriculum Topics
  const TOPIC_SPECS = [
    {
      title: 'Relational Data Model & Keys',
      description: 'Candidate keys, primary keys, foreign keys, and referential integrity constraints.',
      node_type: 'topic',
    },
    {
      title: 'SQL Query Formulation & Joins',
      description: 'Complex SQL queries, multi-table inner and outer joins, aggregations, and subqueries.',
      node_type: 'topic',
    },
    {
      title: 'Database Normalization (1NF to BCNF)',
      description: 'Functional dependencies, 1NF, 2NF, 3NF, Boyce-Codd Normal Form, and lossless joins.',
      node_type: 'topic',
    },
    {
      title: 'Indexing & B+ Trees',
      description: 'Clustered and unclustered indices, B+ Tree index search, insertion, and query performance.',
      node_type: 'topic',
    },
    {
      title: 'Transactions & ACID Properties',
      description: 'Atomicity, Consistency, Isolation, Durability, transaction states, and WAL recovery.',
      node_type: 'topic',
    },
    {
      title: 'Concurrency Control & 2-Phase Locking',
      description: 'Conflict serializability, precedence graphs, strict 2PL, and deadlock detection.',
      node_type: 'topic',
    },
  ];

  const createdTopics: { [title: string]: string } = {};

  for (const spec of TOPIC_SPECS) {
    const { data: existingTopic } = await supabaseAdmin
      .from('curriculum_topics')
      .select('id')
      .eq('teacher_subject_id', TEACHER_SUBJECT_ID)
      .eq('title', spec.title)
      .maybeSingle();

    if (existingTopic) {
      createdTopics[spec.title] = existingTopic.id;
    } else {
      const { data: newTopic, error: tErr } = await supabaseAdmin
        .from('curriculum_topics')
        .insert({
          teacher_subject_id: TEACHER_SUBJECT_ID,
          title: spec.title,
          description: spec.description,
          node_type: spec.node_type,
          created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
        })
        .select('id')
        .single();

      if (tErr) {
        console.error(`Error creating topic ${spec.title}:`, tErr);
        continue;
      }
      createdTopics[spec.title] = newTopic.id;
    }
    console.log(`✅ Topic verified: "${spec.title}" (${createdTopics[spec.title]})`);
  }

  // 3. Create 4 Chronological Quizzes
  const QUIZ_SPECS = [
    {
      index: 0,
      title: 'Quiz 1: Relational Algebra & Keys Diagnostic',
      topicTitle: 'Relational Data Model & Keys',
      difficulty: 'medium',
      exam_duration: 20,
      daysAgo: 21,
      questions: [
        {
          text: 'Which of the following attributes can uniquely identify a tuple in a relational relation without redundancy?',
          options: ['Candidate Key', 'Foreign Key', 'Super Key with extra attributes', 'Secondary Index'],
          correctIndex: 0,
          explanation: 'A candidate key is a minimal superkey that uniquely identifies tuples without redundancy.',
        },
        {
          text: 'What constraint enforces that a foreign key must reference an existing primary key or be NULL?',
          options: ['Domain Integrity', 'Referential Integrity', 'Entity Integrity', 'Key Constraint'],
          correctIndex: 1,
          explanation: 'Referential integrity states that table relationships must always remain consistent.',
        },
        {
          text: 'Which relational algebra operation selects rows that satisfy a specified predicate condition?',
          options: ['Projection (π)', 'Selection (σ)', 'Cartesian Product (×)', 'Rename (ρ)'],
          correctIndex: 1,
          explanation: 'Selection (sigma) filters rows satisfying a predicate.',
        },
        {
          text: 'An entity integrity constraint requires that which key cannot contain NULL values?',
          options: ['Primary Key', 'Foreign Key', 'Alternate Key', 'Surrogate Key'],
          correctIndex: 0,
          explanation: 'Entity integrity requires primary key attributes to be non-null.',
        },
      ],
    },
    {
      index: 1,
      title: 'Quiz 2: Complex SQL & Normal Forms',
      topicTitle: 'SQL Query Formulation & Joins',
      difficulty: 'medium',
      exam_duration: 25,
      daysAgo: 14,
      questions: [
        {
          text: 'Which SQL clause is used to filter aggregated group records after a GROUP BY evaluation?',
          options: ['WHERE', 'HAVING', 'QUALIFY', 'ORDER BY'],
          correctIndex: 1,
          explanation: 'HAVING filters aggregated groups, whereas WHERE filters individual rows prior to grouping.',
        },
        {
          text: 'A relation is in Second Normal Form (2NF) if it is in 1NF and contains no:',
          options: ['Transitive dependencies', 'Partial dependencies', 'Multi-valued dependencies', 'Join dependencies'],
          correctIndex: 1,
          explanation: '2NF eliminates partial dependencies on candidate keys.',
        },
        {
          text: 'What is the key difference between 3NF and BCNF?',
          options: [
            'In BCNF, every determinant must be a candidate key',
            'BCNF allows prime attributes on the right-hand side',
            '3NF does not guarantee lossless join decomposition',
            '3NF removes multi-valued dependencies',
          ],
          correctIndex: 0,
          explanation: 'BCNF requires every determinant (left side of functional dependency) to be a superkey.',
        },
        {
          text: 'Which SQL join returns all rows from the left table regardless of whether a matching record exists on the right?',
          options: ['INNER JOIN', 'LEFT OUTER JOIN', 'FULL JOIN', 'CROSS JOIN'],
          correctIndex: 1,
          explanation: 'LEFT OUTER JOIN retains unmatched left rows populated with NULLs for right attributes.',
        },
      ],
    },
    {
      index: 2,
      title: 'Quiz 3: B+ Tree Indexing & Query Plans',
      topicTitle: 'Indexing & B+ Trees',
      difficulty: 'hard',
      exam_duration: 25,
      daysAgo: 7,
      questions: [
        {
          text: 'Why are B+ Trees preferred over B-Trees for database disk-based storage engines?',
          options: [
            'All data pointers reside only in leaf nodes, maximizing branch node fanout and range scanning speed',
            'B+ Trees require zero balancing operations during insertions',
            'B-Trees cannot store non-numeric key attributes',
            'B+ Trees consume less memory by compressing index pointers',
          ],
          correctIndex: 0,
          explanation: 'B+ Tree leaves are linked sequentially, enabling rapid range scans and higher internal node fanout.',
        },
        {
          text: 'In a clustered index, how are data records physically arranged on the disk storage volume?',
          options: [
            'In an arbitrary heap with hash bucketing',
            'In the exact physical sorting order of the indexed search key',
            'In reverse chronological arrival order',
            'In separate bitmap memory segments',
          ],
          correctIndex: 1,
          explanation: 'A clustered index determines the physical storage order of rows in the table.',
        },
        {
          text: 'What is the minimum number of keys in a non-root B+ tree node of order m?',
          options: ['ceil(m/2) - 1', 'm / 2', 'floor(m/2) + 1', 'm - 1'],
          correctIndex: 0,
          explanation: 'Each non-root node in a B+ tree of order m must hold at least ceil(m/2) - 1 keys.',
        },
        {
          text: 'Which operation triggers an index node split in a B+ Tree?',
          options: [
            'Inserting into a node that already contains the maximum m-1 keys',
            'Deleting the leftmost key of a leaf page',
            'Running a point query that misses the buffer pool cache',
            'Rebuilding the index statistics analyzer',
          ],
          correctIndex: 0,
          explanation: 'Node overflow occurs when inserting into a full node, splitting it into two half-filled nodes.',
        },
      ],
    },
    {
      index: 3,
      title: 'Quiz 4: ACID Guarantees & Concurrency',
      topicTitle: 'Transactions & ACID Properties',
      difficulty: 'hard',
      exam_duration: 30,
      daysAgo: 2,
      questions: [
        {
          text: 'Which ACID property guarantees that all operations of a transaction execute completely or none at all?',
          options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
          correctIndex: 0,
          explanation: 'Atomicity ensures all-or-nothing execution via rollback or commit.',
        },
        {
          text: 'What write-ahead logging (WAL) rule must be observed before writing a dirty buffer page to disk?',
          options: [
            'The corresponding log record must be flushed to non-volatile disk storage first',
            'All concurrent read locks must be downgraded to intent locks',
            'The transaction must immediately issue a checkpoint commit token',
            'The shadow paging directory must be recreated',
          ],
          correctIndex: 0,
          explanation: 'WAL mandates that log records describing an update must reach persistent disk before data pages.',
        },
        {
          text: 'In Strict Two-Phase Locking (Strict 2PL), when are exclusive write locks released?',
          options: [
            'Immediately after the update completes',
            'Only after the transaction commits or aborts',
            'During the shrinking phase before commit',
            'Whenever another transaction requests a read lock',
          ],
          correctIndex: 1,
          explanation: 'Strict 2PL prevents cascading aborts by holding all exclusive locks until transaction completion.',
        },
        {
          text: 'A precedence (serialization) graph contains a cycle. What does this indicate about the transaction schedule?',
          options: [
            'The schedule is conflict serializable',
            'The schedule is NOT conflict serializable',
            'The schedule has achieved deadlock freedom',
            'The transactions are executing in serial order',
          ],
          correctIndex: 1,
          explanation: 'A directed cycle in a precedence graph indicates non-serializability.',
        },
      ],
    },
  ];

  const quizIds: string[] = [];

  for (const qSpec of QUIZ_SPECS) {
    const topicId = createdTopics[qSpec.topicTitle] || Object.values(createdTopics)[0];
    const createdAt = new Date(Date.now() - qSpec.daysAgo * 86400000).toISOString();

    const { data: existingQuiz } = await supabaseAdmin
      .from('quizzes')
      .select('id')
      .eq('teacher_subject_id', TEACHER_SUBJECT_ID)
      .eq('title', qSpec.title)
      .maybeSingle();

    let quizId = existingQuiz?.id;

    if (!quizId) {
      const { data: newQuiz, error: qErr } = await supabaseAdmin
        .from('quizzes')
        .insert({
          teacher_subject_id: TEACHER_SUBJECT_ID,
          curriculum_topic_id: topicId,
          created_by: TEACHER_ID,
          title: qSpec.title,
          description: `Diagnostic assessment covering ${qSpec.topicTitle}.`,
          difficulty: qSpec.difficulty,
          question_count: qSpec.questions.length,
          exam_duration: qSpec.exam_duration,
          status: 'published',
          created_at: createdAt,
          scheduled_at: createdAt,
        })
        .select('id')
        .single();

      if (qErr) {
        console.error(`Failed to create quiz "${qSpec.title}":`, qErr);
        continue;
      }
      quizId = newQuiz.id;
    }

    quizIds.push(quizId);
    console.log(`✅ Quiz established: "${qSpec.title}" -> ${quizId}`);

    // Insert questions
    for (let i = 0; i < qSpec.questions.length; i++) {
      const question = qSpec.questions[i];
      const { data: existingQ } = await supabaseAdmin
        .from('quiz_questions')
        .select('id')
        .eq('quiz_id', quizId)
        .eq('position', i + 1)
        .maybeSingle();

      let questionId = existingQ?.id;
      if (!questionId) {
        const { data: newQ, error: qItemErr } = await supabaseAdmin
          .from('quiz_questions')
          .insert({
            quiz_id: quizId,
            curriculum_topic_id: topicId,
            question_text: question.text,
            question_type: 'multiple_choice',
            options: question.options,
            correct_answer: question.options[question.correctIndex],
            explanation: question.explanation,
            difficulty: qSpec.difficulty,
            marks: 1,
            position: i + 1,
            created_at: createdAt,
          })
          .select('id')
          .single();

        if (!qItemErr && newQ) {
          questionId = newQ.id;
        }
      }
    }

    // 4. Create Quiz Attempts and Responses for each student
    for (const student of STUDENTS) {
      const stId = studentIds[student.email];
      if (!stId) continue;

      const score = student.quizScores[qSpec.index]; // 0 to 4
      const startedAt = new Date(Date.now() - qSpec.daysAgo * 86400000 + 3600000).toISOString();
      const submittedAt = new Date(Date.now() - qSpec.daysAgo * 86400000 + 5400000).toISOString();

      const { data: existingAttempt } = await supabaseAdmin
        .from('quiz_attempts')
        .select('id')
        .eq('quiz_id', quizId)
        .eq('student_id', stId)
        .maybeSingle();

      let attemptId = existingAttempt?.id;
      if (!attemptId) {
        const { data: newAttempt, error: attErr } = await supabaseAdmin
          .from('quiz_attempts')
          .insert({
            quiz_id: quizId,
            student_id: stId,
            score: score,
            max_score: 4,
            status: 'graded',
            started_at: startedAt,
            submitted_at: submittedAt,
            graded_at: submittedAt,
          })
          .select('id')
          .single();

        if (attErr) {
          console.error(`Failed to record attempt for ${student.fullName}:`, attErr);
          continue;
        }
        attemptId = newAttempt.id;
      }
    }
  }

  // 5. Seed Realistic Student Topic Mastery
  console.log('\n📊 Seeding Student Topic Mastery & Audit History...');

  const topicIdList = Object.values(createdTopics);

  for (const student of STUDENTS) {
    const stId = studentIds[student.email];
    if (!stId) continue;

    // Determine baseline mastery according to target tier
    // Mastered: 0.82 - 0.95, Developing: 0.60 - 0.78, Intervention: 0.38 - 0.49
    let baseScore = 0.85;
    if (student.targetTier === 'mastered') baseScore = 0.88;
    else if (student.targetTier === 'developing') baseScore = 0.72;
    else baseScore = 0.45;

    for (let tIdx = 0; tIdx < topicIdList.length; tIdx++) {
      const tid = topicIdList[tIdx];
      // Slight topic variance
      const variance = (tIdx % 3 === 0 ? 0.05 : tIdx % 3 === 1 ? -0.04 : 0.02);
      const masteryScore = Math.min(0.98, Math.max(0.35, Number((baseScore + variance).toFixed(3))));
      const confidence = Number((0.75 + (tIdx * 0.03)).toFixed(2));
      const now = new Date(Date.now() - (tIdx * 2) * 86400000).toISOString();

      await supabaseAdmin.from('student_topic_mastery').upsert(
        {
          student_id: stId,
          teacher_subject_id: TEACHER_SUBJECT_ID,
          curriculum_topic_id: tid,
          mastery_score: masteryScore,
          confidence: confidence,
          last_assessed_at: now,
          updated_at: now,
        },
        { onConflict: 'student_id,teacher_subject_id,curriculum_topic_id' }
      );

      // Audit entry in history
      await supabaseAdmin.from('student_mastery_history').insert({
        student_id: stId,
        teacher_subject_id: TEACHER_SUBJECT_ID,
        curriculum_topic_id: tid,
        mastery_score: masteryScore,
        confidence: confidence,
        assessment_source: 'quiz_evaluation',
        assessed_at: now,
        source_quiz_id: quizIds[tIdx % quizIds.length],
      });
    }
    console.log(`✅ Mastery state saved for ${student.fullName} (${student.targetTier})`);
  }

  // 6. Seed Teacher Pedagogical Insights
  console.log('\n💡 Seeding Teacher Pedagogical Insights & Gaps...');

  const concurrencyTopicId = createdTopics['Concurrency Control & 2-Phase Locking'] || topicIdList[0];
  const keysTopicId = createdTopics['Relational Data Model & Keys'] || topicIdList[0];

  const INSIGHTS = [
    {
      insight_type: 'gap',
      title: 'Struggle with Concurrency Control & Strict 2-Phase Locking',
      description: '3 learners (Sarah Jenkins, antony, Marcus Brody) showed confusion between Shared and Exclusive lock acquisition phases.',
      curriculum_topic_id: concurrencyTopicId,
      status: 'active',
      evidence: {
        avgScore: 50,
        strugglingStudents: ['Sarah Jenkins', 'antony', 'Marcus Brody'],
        recommendedRemediation: 'Review serializability precedence graphs & lock compatibility matrix',
      },
    },
    {
      insight_type: 'strength',
      title: 'Solid Mastery of Relational Keys & Referential Constraints',
      description: 'The class demonstrated 88% overall accuracy identifying candidate keys and foreign key cascades on Quiz 1.',
      curriculum_topic_id: keysTopicId,
      status: 'active',
      evidence: {
        avgScore: 88,
        strongStudents: ['Emma Watson', 'Lucas Chen', 'antonyamal varghese', 'Priya Sharma'],
      },
    },
    {
      insight_type: 'recommendation',
      title: 'Deploy Practice Mission: Serializability Precedence Graphs',
      description: 'Activate automated Socratic Tutor dialogue missions for struggling students before the upcoming midterm.',
      curriculum_topic_id: concurrencyTopicId,
      status: 'active',
      evidence: {
        targetTopic: 'Concurrency Control & 2-Phase Locking',
        urgency: 'high',
      },
    },
  ];

  for (const ins of INSIGHTS) {
    const { data: existingIns } = await supabaseAdmin
      .from('teacher_insights')
      .select('id')
      .eq('teacher_subject_id', TEACHER_SUBJECT_ID)
      .eq('title', ins.title)
      .maybeSingle();

    if (!existingIns) {
      await supabaseAdmin.from('teacher_insights').insert({
        teacher_subject_id: TEACHER_SUBJECT_ID,
        insight_type: ins.insight_type,
        title: ins.title,
        description: ins.description,
        curriculum_topic_id: ins.curriculum_topic_id,
        evidence: ins.evidence,
        status: ins.status,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      });
      console.log(`✅ Teacher insight logged: "${ins.title}"`);
    }
  }

  console.log('\n🎉 Rinz DBMS Class Seed Completed Successfully!');
}

seed().catch((err) => {
  console.error('❌ Seed Script Error:', err);
  process.exit(1);
});
