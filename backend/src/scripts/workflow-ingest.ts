import { supabaseAdmin } from '../config/supabase.js';
import { materialsService } from '../modules/materials/materials.service.js';

/**
 * Render Workflow Runner: Learning Materials Ingestion Pipeline
 * Processes pending materials, chunks semantically, and stores 768-dim embeddings
 */
async function runIngestionWorkflow() {
  console.log('========================================================');
  console.log('🚀 [Render Workflow] Starting Notes Ingestion Pipeline');
  console.log('========================================================');

  // 1. Fetch pending materials
  const { data: pendingMaterials, error } = await supabaseAdmin
    .from('learning_materials')
    .select('id, title, file_path, processing_status, teacher_subject_id')
    .eq('processing_status', 'pending');

  if (error) {
    console.error('❌ Failed to fetch pending materials:', error.message);
    process.exit(1);
  }

  if (!pendingMaterials || pendingMaterials.length === 0) {
    console.log('✅ No pending materials found. All learning materials are up to date.');
    return;
  }

  console.log(`📋 Found ${pendingMaterials.length} pending material(s) for vector embedding.`);

  for (const mat of pendingMaterials) {
    console.log(`\n⏳ Processing: "${mat.title}" (${mat.id})...`);
    try {
      // Re-trigger ingestion
      await materialsService.ingestMaterialText(mat.id, mat.title);
      console.log(`✅ Successfully processed and embedded "${mat.title}".`);
    } catch (err) {
      console.error(`❌ Failed to process "${mat.title}":`, err);
    }
  }

  console.log('\n🏁 [Render Workflow] Ingestion pipeline execution completed.');
}

runIngestionWorkflow().catch((err) => {
  console.error('Fatal workflow error:', err);
  process.exit(1);
});
