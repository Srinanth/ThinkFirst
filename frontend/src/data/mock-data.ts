export interface ClassData {
  id: string;
  name: string;
  code: string;
  section: string;
  studentCount: number;
  overallMastery: number;
  room: string;
  schedule: string;
  trendData: { quiz: string; avgScore: number; benchmark: number }[];
  distributionData: { name: string; value: number; color: string }[];
  weakAreas: {
    topic: string;
    avgScore: number;
    subtopics: string[];
    remediation: string;
  }[];
  strongAreas: {
    topic: string;
    avgScore: number;
    subtopics: string[];
    praise: string;
  }[];
  variationSummary: {
    quizTitle: string;
    change: string;
    detail: string;
    isPositive: boolean;
  }[];
  quizzes: {
    id: string;
    title: string;
    date: string;
    topics: string[];
    completionRate: number;
    avgScore: number;
    totalQuestions: number;
    status: 'Graded' | 'In Progress' | 'Upcoming';
  }[];
  students: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    quizAverage: number;
    completedQuizzes: number;
    totalQuizzes: number;
    subtopicsMastery: number; // 0 - 100
    moduleBreakdown: { module: string; score: number }[];
    status: 'Mastered' | 'Developing' | 'Intervention Needed';
  }[];
}

export const MOCK_CLASSES: ClassData[] = [
  {
    id: 'cs-10a',
    name: 'Computer Science',
    code: 'CS-101',
    section: 'Section 10A',
    studentCount: 42,
    overallMastery: 84,
    room: 'Lab 302',
    schedule: 'Mon, Wed, Fri • 09:00 AM',
    trendData: [
      { quiz: 'Q1: Arrays', avgScore: 68, benchmark: 70 },
      { quiz: 'Q2: Recursion', avgScore: 73, benchmark: 70 },
      { quiz: 'Q3: Stacks & Queues', avgScore: 76, benchmark: 70 },
      { quiz: 'Q4: Binary Trees', avgScore: 82, benchmark: 70 },
      { quiz: 'Q5: Graph Traversal', avgScore: 88, benchmark: 70 },
      { quiz: 'Q6: Hash Maps', avgScore: 84, benchmark: 70 },
    ],
    distributionData: [
      { name: 'Mastered (>80%)', value: 24, color: '#10b981' }, // Emerald
      { name: 'Proficient (60-79%)', value: 14, color: '#f59e0b' }, // Amber
      { name: 'Needs Intervention (<60%)', value: 4, color: '#ef4444' }, // Rose
    ],
    weakAreas: [
      {
        topic: 'Dynamic Programming & Memoization',
        avgScore: 52,
        subtopics: ['Top-down Table Allocation', 'Overlapping Subproblems'],
        remediation:
          'Schedule a 30-min Socratic review on recursive tree unrolling before the next assessment.',
      },
      {
        topic: 'Bitwise Bitmasks',
        avgScore: 58,
        subtopics: ['Bit Shifting', 'XOR Parity Verification'],
        remediation:
          'Assign interactive playground exercises demonstrating binary representation.',
      },
    ],
    strongAreas: [
      {
        topic: 'Binary Search Trees & DFS',
        avgScore: 89,
        subtopics: ['In-order traversal', 'Search complexity O(log N)'],
        praise: '94% of students solved balanced insertion without hints.',
      },
      {
        topic: 'Hash Map Collision Resolution',
        avgScore: 86,
        subtopics: ['Separate Chaining', 'Load Factor Scaling'],
        praise: 'Excellent understanding of constant-time amortization.',
      },
    ],
    variationSummary: [
      {
        quizTitle: 'After Quiz #3 (Graphs & BFS)',
        change: '+8.4%',
        detail:
          'Class average improved by +8.4% following targeted remedial Socratic sessions on queue manipulation.',
        isPositive: true,
      },
      {
        quizTitle: 'After Quiz #4 (Binary Trees)',
        change: '+6.1%',
        detail:
          'Median completion time dropped by 14 minutes with 91% first-attempt submission rate.',
        isPositive: true,
      },
      {
        quizTitle: 'Mid-term Quiz #2 (Recursion)',
        change: '-3.2%',
        detail:
          'Temporary dip due to base-case formulation errors; addressed in classroom walkthrough.',
        isPositive: false,
      },
    ],
    quizzes: [
      {
        id: 'qz-101',
        title: 'Quiz #06 - Hash Maps & Amortization',
        date: 'Oct 21, 2026',
        topics: ['Hashing', 'Buckets', 'Load Factor'],
        completionRate: 98,
        avgScore: 84,
        totalQuestions: 15,
        status: 'Graded',
      },
      {
        id: 'qz-102',
        title: 'Quiz #05 - Graph Traversals & BFS',
        date: 'Oct 14, 2026',
        topics: ['BFS', 'DFS', 'Adjacency Lists'],
        completionRate: 100,
        avgScore: 88,
        totalQuestions: 20,
        status: 'Graded',
      },
      {
        id: 'qz-103',
        title: 'Quiz #04 - Binary Search Trees',
        date: 'Oct 07, 2026',
        topics: ['BST', 'Tree Rotation', 'In-Order Traversal'],
        completionRate: 95,
        avgScore: 82,
        totalQuestions: 18,
        status: 'Graded',
      },
      {
        id: 'qz-104',
        title: 'Quiz #07 - Dynamic Programming Prelim',
        date: 'Oct 28, 2026',
        topics: ['Memoization', 'Fibonacci Top-Down'],
        completionRate: 0,
        avgScore: 0,
        totalQuestions: 12,
        status: 'Upcoming',
      },
    ],
    students: [
      {
        id: 'STD-8821',
        name: 'Alex Rivera',
        email: 'alex.rivera@edu.org',
        avatar: 'AR',
        quizAverage: 92,
        completedQuizzes: 6,
        totalQuizzes: 6,
        subtopicsMastery: 94,
        moduleBreakdown: [
          { module: 'Arrays & Vectors', score: 96 },
          { module: 'Recursion', score: 90 },
          { module: 'Trees & Graphs', score: 95 },
        ],
        status: 'Mastered',
      },
      {
        id: 'STD-8822',
        name: 'Maya Chen',
        email: 'maya.chen@edu.org',
        avatar: 'MC',
        quizAverage: 88,
        completedQuizzes: 6,
        totalQuizzes: 6,
        subtopicsMastery: 89,
        moduleBreakdown: [
          { module: 'Arrays & Vectors', score: 92 },
          { module: 'Recursion', score: 85 },
          { module: 'Trees & Graphs', score: 90 },
        ],
        status: 'Mastered',
      },
      {
        id: 'STD-8823',
        name: 'Jordan Hayes',
        email: 'jordan.h@edu.org',
        avatar: 'JH',
        quizAverage: 74,
        completedQuizzes: 5,
        totalQuizzes: 6,
        subtopicsMastery: 72,
        moduleBreakdown: [
          { module: 'Arrays & Vectors', score: 80 },
          { module: 'Recursion', score: 68 },
          { module: 'Trees & Graphs', score: 69 },
        ],
        status: 'Developing',
      },
      {
        id: 'STD-8824',
        name: 'Liam Vance',
        email: 'liam.v@edu.org',
        avatar: 'LV',
        quizAverage: 54,
        completedQuizzes: 4,
        totalQuizzes: 6,
        subtopicsMastery: 52,
        moduleBreakdown: [
          { module: 'Arrays & Vectors', score: 62 },
          { module: 'Recursion', score: 48 },
          { module: 'Trees & Graphs', score: 46 },
        ],
        status: 'Intervention Needed',
      },
      {
        id: 'STD-8825',
        name: 'Sophia Patel',
        email: 'sophia.p@edu.org',
        avatar: 'SP',
        quizAverage: 96,
        completedQuizzes: 6,
        totalQuizzes: 6,
        subtopicsMastery: 98,
        moduleBreakdown: [
          { module: 'Arrays & Vectors', score: 100 },
          { module: 'Recursion', score: 94 },
          { module: 'Trees & Graphs', score: 98 },
        ],
        status: 'Mastered',
      },
      {
        id: 'STD-8826',
        name: 'Ethan Brooks',
        email: 'ethan.b@edu.org',
        avatar: 'EB',
        quizAverage: 67,
        completedQuizzes: 6,
        totalQuizzes: 6,
        subtopicsMastery: 65,
        moduleBreakdown: [
          { module: 'Arrays & Vectors', score: 70 },
          { module: 'Recursion', score: 62 },
          { module: 'Trees & Graphs', score: 64 },
        ],
        status: 'Developing',
      },
      {
        id: 'STD-8827',
        name: 'Chloe Zhang',
        email: 'chloe.z@edu.org',
        avatar: 'CZ',
        quizAverage: 82,
        completedQuizzes: 6,
        totalQuizzes: 6,
        subtopicsMastery: 81,
        moduleBreakdown: [
          { module: 'Arrays & Vectors', score: 85 },
          { module: 'Recursion', score: 79 },
          { module: 'Trees & Graphs', score: 80 },
        ],
        status: 'Mastered',
      },
      {
        id: 'STD-8828',
        name: 'Marcus Thorne',
        email: 'marcus.t@edu.org',
        avatar: 'MT',
        quizAverage: 58,
        completedQuizzes: 5,
        totalQuizzes: 6,
        subtopicsMastery: 56,
        moduleBreakdown: [
          { module: 'Arrays & Vectors', score: 64 },
          { module: 'Recursion', score: 50 },
          { module: 'Trees & Graphs', score: 54 },
        ],
        status: 'Intervention Needed',
      },
    ],
  },
  {
    id: 'alg-12b',
    name: 'Advanced Algorithms',
    code: 'ALG-401',
    section: 'Section 12B',
    studentCount: 38,
    overallMastery: 76,
    room: 'Hall 405',
    schedule: 'Tue, Thu • 10:30 AM',
    trendData: [
      { quiz: 'Q1: Greedy Algorithms', avgScore: 71, benchmark: 70 },
      { quiz: 'Q2: Divide & Conquer', avgScore: 74, benchmark: 70 },
      { quiz: 'Q3: Dynamic Prog I', avgScore: 69, benchmark: 70 },
      { quiz: 'Q4: Network Flow', avgScore: 78, benchmark: 70 },
      { quiz: 'Q5: NP-Completeness', avgScore: 76, benchmark: 70 },
    ],
    distributionData: [
      { name: 'Mastered (>80%)', value: 16, color: '#10b981' },
      { name: 'Proficient (60-79%)', value: 17, color: '#f59e0b' },
      { name: 'Needs Intervention (<60%)', value: 5, color: '#ef4444' },
    ],
    weakAreas: [
      {
        topic: 'Ford-Fulkerson Residual Graphs',
        avgScore: 54,
        subtopics: ['Augmenting Paths', 'Min-Cut Theorem'],
        remediation: 'Provide visual step-through animation of residual capacities.',
      },
    ],
    strongAreas: [
      {
        topic: 'Greedy Interval Scheduling',
        avgScore: 91,
        subtopics: ['Earliest Deadline First', 'Proof by Exchange'],
        praise: 'Outstanding inductive proofs produced in exam 1.',
      },
    ],
    variationSummary: [
      {
        quizTitle: 'After Quiz #4 (Network Flow)',
        change: '+9.0%',
        detail: 'Class grasped bipartite matching reductions rapidly.',
        isPositive: true,
      },
    ],
    quizzes: [
      {
        id: 'qz-201',
        title: 'Quiz #05 - NP-Completeness & Reductions',
        date: 'Oct 19, 2026',
        topics: ['3-SAT', 'Vertex Cover', 'Poly-Time Reductions'],
        completionRate: 96,
        avgScore: 76,
        totalQuestions: 15,
        status: 'Graded',
      },
      {
        id: 'qz-202',
        title: 'Quiz #04 - Max Flow & Min Cut',
        date: 'Oct 12, 2026',
        topics: ['Ford-Fulkerson', 'Edmonds-Karp'],
        completionRate: 100,
        avgScore: 78,
        totalQuestions: 15,
        status: 'Graded',
      },
    ],
    students: [
      {
        id: 'STD-9101',
        name: 'Rachel Sterling',
        email: 'rachel.s@edu.org',
        avatar: 'RS',
        quizAverage: 88,
        completedQuizzes: 5,
        totalQuizzes: 5,
        subtopicsMastery: 87,
        moduleBreakdown: [
          { module: 'Greedy', score: 94 },
          { module: 'Divide & Conquer', score: 86 },
          { module: 'Flows', score: 82 },
        ],
        status: 'Mastered',
      },
      {
        id: 'STD-9102',
        name: 'Devon Miller',
        email: 'devon.m@edu.org',
        avatar: 'DM',
        quizAverage: 59,
        completedQuizzes: 4,
        totalQuizzes: 5,
        subtopicsMastery: 57,
        moduleBreakdown: [
          { module: 'Greedy', score: 70 },
          { module: 'Divide & Conquer', score: 55 },
          { module: 'Flows', score: 46 },
        ],
        status: 'Intervention Needed',
      },
    ],
  },
  {
    id: 'db-11a',
    name: 'Database Systems',
    code: 'DBS-204',
    section: 'Section 11A',
    studentCount: 35,
    overallMastery: 71,
    room: 'Seminar 204',
    schedule: 'Mon, Wed • 01:00 PM',
    trendData: [
      { quiz: 'Q1: Relational Algebra', avgScore: 65, benchmark: 70 },
      { quiz: 'Q2: SQL Join Optimization', avgScore: 70, benchmark: 70 },
      { quiz: 'Q3: Normal Forms & BCNF', avgScore: 68, benchmark: 70 },
      { quiz: 'Q4: ACID & Transactions', avgScore: 75, benchmark: 70 },
    ],
    distributionData: [
      { name: 'Mastered (>80%)', value: 12, color: '#10b981' },
      { name: 'Proficient (60-79%)', value: 16, color: '#f59e0b' },
      { name: 'Needs Intervention (<60%)', value: 7, color: '#ef4444' },
    ],
    weakAreas: [
      {
        topic: 'Lossless Decomposition into BCNF',
        avgScore: 49,
        subtopics: ['Functional Dependencies', 'Closure Sets'],
        remediation: 'Provide guided schema normalization worksheets.',
      },
    ],
    strongAreas: [
      {
        topic: 'Indexing & B+ Trees',
        avgScore: 84,
        subtopics: ['Leaf Nodes', 'Clustered Indexes'],
        praise: 'Strong comprehension of disk I/O reduction strategies.',
      },
    ],
    variationSummary: [
      {
        quizTitle: 'After Quiz #4 (Transactions)',
        change: '+7.0%',
        detail: 'Solid gain following concurrency isolation demo.',
        isPositive: true,
      },
    ],
    quizzes: [
      {
        id: 'qz-301',
        title: 'Quiz #04 - Isolation Levels & MVCC',
        date: 'Oct 20, 2026',
        topics: ['Deadlocks', 'Dirty Reads', 'Serializable'],
        completionRate: 94,
        avgScore: 75,
        totalQuestions: 16,
        status: 'Graded',
      },
    ],
    students: [
      {
        id: 'STD-7201',
        name: 'Kavita Rao',
        email: 'kavita.r@edu.org',
        avatar: 'KR',
        quizAverage: 91,
        completedQuizzes: 4,
        totalQuizzes: 4,
        subtopicsMastery: 92,
        moduleBreakdown: [
          { module: 'Relational Model', score: 95 },
          { module: 'Normalization', score: 88 },
          { module: 'Transactions', score: 92 },
        ],
        status: 'Mastered',
      },
    ],
  },
  {
    id: 'ml-11b',
    name: 'Machine Learning Fundamentals',
    code: 'ML-302',
    section: 'Section 11B',
    studentCount: 33,
    overallMastery: 82,
    room: 'Amphitheater 501',
    schedule: 'Friday • 02:00 PM',
    trendData: [
      { quiz: 'Q1: Linear Regression & Cost', avgScore: 79, benchmark: 70 },
      { quiz: 'Q2: Gradient Descent Ops', avgScore: 81, benchmark: 70 },
      { quiz: 'Q3: Logistic Classification', avgScore: 84, benchmark: 70 },
      { quiz: 'Q4: Regularization & L1/L2', avgScore: 83, benchmark: 70 },
    ],
    distributionData: [
      { name: 'Mastered (>80%)', value: 21, color: '#10b981' },
      { name: 'Proficient (60-79%)', value: 9, color: '#f59e0b' },
      { name: 'Needs Intervention (<60%)', value: 3, color: '#ef4444' },
    ],
    weakAreas: [
      {
        topic: 'Bias-Variance Tradeoff Curves',
        avgScore: 61,
        subtopics: ['Overfitting', 'Cross-Validation k-fold'],
        remediation: 'Live hyperparameter tuning demo in Jupyter.',
      },
    ],
    strongAreas: [
      {
        topic: 'Logistic Regression & Sigmoid',
        avgScore: 92,
        subtopics: ['Cross-entropy loss', 'Decision boundary'],
        praise: '97% mastery on classification thresholds.',
      },
    ],
    variationSummary: [
      {
        quizTitle: 'After Quiz #3 (Classification)',
        change: '+3.0%',
        detail: 'Steady upward trend in mathematical derivations.',
        isPositive: true,
      },
    ],
    quizzes: [
      {
        id: 'qz-401',
        title: 'Quiz #04 - Regularization & Overfitting',
        date: 'Oct 22, 2026',
        topics: ['Ridge (L2)', 'Lasso (L1)', 'Sparsity'],
        completionRate: 100,
        avgScore: 83,
        totalQuestions: 18,
        status: 'Graded',
      },
    ],
    students: [
      {
        id: 'STD-6401',
        name: 'Zara Washington',
        email: 'zara.w@edu.org',
        avatar: 'ZW',
        quizAverage: 94,
        completedQuizzes: 4,
        totalQuizzes: 4,
        subtopicsMastery: 95,
        moduleBreakdown: [
          { module: 'Regression', score: 98 },
          { module: 'Classification', score: 92 },
          { module: 'Regularization', score: 94 },
        ],
        status: 'Mastered',
      },
    ],
  },
];
