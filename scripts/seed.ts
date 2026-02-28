import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create test user with password test123 for testing
  const hashedPassword = await bcrypt.hash('test123', 10)
  
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {
      password: hashedPassword
    },
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      name: 'Test User'
    }
  })

  console.log('Seed data created successfully')
  console.log('Test user:', testUser.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
