/**
 * Phase 4.5 – Media migration placeholder
 *
 * Original plan: migrate legacy Prisma media/uploads into Payload.
 * Current reality:
 * - Legacy Prisma database has no media/upload tables or data.
 * - Legacy system did not manage media centrally (no legacy_media_id).
 * - Payload is using the test DB (payload-test); future media will be moved via Payload→Payload full DB migration or manual uploads in Payload Admin.
 *
 * Decision: Mark Phase 4.5 as N/A. This script exists only to make the decision explicit.
 */

const main = async () => {
  console.log('Phase 4.5 Media migration skipped: no legacy media data exists. This script is an intentional placeholder.')
  console.log('Future media handling: manual uploads in Payload Admin or Payload→Payload database migration (including file storage).')
}

main().catch((error) => {
  console.error('Unexpected error in media placeholder script:', error)
  process.exit(1)
})
