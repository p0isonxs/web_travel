import fs from 'node:fs/promises'
import process from 'node:process'
import pg from 'pg'

const { Client } = pg

const projectRef = process.env.SUPABASE_PROJECT_REF
const password = process.env.SUPABASE_DB_PASSWORD
const sqlFile = process.argv[2]

if (!projectRef || !password || !sqlFile) {
  console.error('Usage: SUPABASE_PROJECT_REF=... SUPABASE_DB_PASSWORD=... node scripts/apply-supabase-sql.mjs <sql-file>')
  process.exit(1)
}

const sql = await fs.readFile(sqlFile, 'utf8')

const candidates = [
  `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`,
  `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`,
]

let lastError = null

for (const connectionString of candidates) {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    enableChannelBinding: false,
  })

  try {
    console.log(`Trying ${connectionString.replace(password, '***')}`)
    await client.connect()
    await client.query(sql)
    console.log('SQL applied successfully')
    await client.end()
    process.exit(0)
  } catch (error) {
    lastError = error
    console.error(`Connection failed: ${error.message}`)
    try {
      await client.end()
    } catch {}
  }
}

console.error('All connection attempts failed')
if (lastError) {
  console.error(lastError)
}
process.exit(1)
