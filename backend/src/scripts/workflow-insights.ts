import { supabaseAdmin } from '../config/supabase.js';
import { insightsService } from '../modules/insights/insights.service.js';

/**
 * Render Workflow Runner: Classroom Insights Synthesis
 * Synthesizes diagnostic mastery insights across all enrolled subjects
 */
async function runInsightsSynthesisWorkflow() {
  console.log('========================================================');
  console.log('🚀 [Render Workflow] Starting Classroom Insights Synthesis');
  console.log('========================================================');

  // 1. Fetch all active subject offerings
  const { data: subjects, error } = await supabaseAdmin
    .from('teacher_subjects')
    .select('id, subject, class_name');

  if (error) {
    console.error('❌ Failed to fetch subjects:', error.message);
    process.exit(1);
  }

  if (!subjects || subjects.length === 0) {
    console.log('ℹ️ No active subject offerings found.');
    return;
  }

  console.log(`📋 Found ${subjects.length} active subject offering(s) to analyze.`);

  for (const sub of subjects) {
    console.log(`\n⏳ Synthesizing insights for "${sub.subject}" (${sub.class_name || 'Standard'})...`);
    try {
      const result = await insightsService.generateInsights(sub.id);
      console.log(`✅ Generated ${result.insights?.length ?? 0} diagnostic insight(s) for "${sub.subject}".`);
    } catch (err) {
      console.error(`❌ Failed to synthesize insights for "${sub.subject}":`, err);
    }
  }

  console.log('\n🏁 [Render Workflow] Insights synthesis execution completed.');
}

runInsightsSynthesisWorkflow().catch((err) => {
  console.error('Fatal workflow error:', err);
  process.exit(1);
});
