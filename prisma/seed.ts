import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('Start seeding...')

  // 1. Seed Categories
  const categories = [
    { name: "CITY", displayName: "City" },
    { name: "COMMUNITY_EVENTS", displayName: "Community Events" },
    { name: "CRIME_SAFETY", displayName: "Crime & Safety" },
    { name: "CULTURE", displayName: "Culture" },
    { name: "DISCOUNTS_BENEFITS", displayName: "Discounts & Benefits" },
    { name: "EMERGENCIES", displayName: "Emergencies" },
    { name: "FOR_SENIORS", displayName: "For Seniors" },
    { name: "HEALTH", displayName: "Health" },
    { name: "KIDS_FAMILY", displayName: "Kids & Family" }
  ]

  console.log('Seeding categories...')
  const createdCategories = []
  for (const cat of categories) {
    const upserted = await prisma.category.upsert({
      where: { name: cat.name },
      update: { displayName: cat.displayName },
      create: cat,
    })
    createdCategories.push(upserted)
    console.log(` Created category: ${upserted.name}`)
  }

  // 2. Seed Sample Announcements
  console.log('Seeding announcements...')
  
  const announcements = [
    {
      title: "Urban Marathon 2026",
      content: "Join the annual city marathon starting from the main square. Registration is now open!",
      publicationDate: new Date("2026-02-01T08:00:00Z"),
      categories: ["CITY", "COMMUNITY_EVENTS"]
    },
    {
      title: "Free Health Checkups",
      content: "Local clinics are offering free health screenings for seniors this weekend.",
      publicationDate: new Date("2026-02-10T10:30:00Z"),
      categories: ["HEALTH", "FOR_SENIORS"]
    },
    {
      title: "New Public Library Hours",
      content: "The central library will now stay open until 10 PM on weekdays.",
      publicationDate: new Date("2026-02-15T09:00:00Z"),
      categories: ["CULTURE", "KIDS_FAMILY"]
    }
  ]

  for (const ann of announcements) {
    // Find category IDs by name
    const catIds = createdCategories
      .filter(c => ann.categories.includes(c.name))
      .map(c => ({ id: c.id }))

    await prisma.announcement.create({
      data: {
        title: ann.title,
        content: ann.content,
        publicationDate: ann.publicationDate,
        categories: {
          connect: catIds
        }
      }
    })
    console.log(` Created announcement: ${ann.title}`)
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })