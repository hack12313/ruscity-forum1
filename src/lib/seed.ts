import { db } from "@/db";
import { categories, subforums, users } from "@/db/schema";
import { hashPassword } from "./auth";

export async function seedDatabase() {
  // Check if already seeded
  const existingCategories = await db.select().from(categories).limit(1);
  if (existingCategories.length > 0) return;

  // Create admin user
  const adminHash = await hashPassword("Admin123!");
  await db
    .insert(users)
    .values({
      username: "admin",
      displayName: "Администратор",
      email: "admin@ruscitylife.ru",
      passwordHash: adminHash,
      role: "admin",
      bio: "Главный администратор сервера RusCity Life RP",
    })
    .onConflictDoNothing();

  // Create categories
  const cats = await db
    .insert(categories)
    .values([
      {
        name: "📢 Официальная информация",
        description: "Новости, обновления и официальные объявления сервера",
        icon: "📢",
        sortOrder: 1,
      },
      {
        name: "🎮 Об игре",
        description: "Обсуждение игровых механик, персонажей и мира GTA 5 RP",
        icon: "🎮",
        sortOrder: 2,
      },
      {
        name: "🏙️ Городская жизнь",
        description: "Бизнес, фракции, организации и городская деятельность",
        icon: "🏙️",
        sortOrder: 3,
      },
      {
        name: "⚖️ Жалобы и апелляции",
        description: "Жалобы на игроков, апелляции банов и решение споров",
        icon: "⚖️",
        sortOrder: 4,
      },
      {
        name: "💬 Общение",
        description: "Общение вне игры, знакомства, флуд",
        icon: "💬",
        sortOrder: 5,
      },
    ])
    .returning();

  // Create subforums
  await db.insert(subforums).values([
    // Официальная информация
    {
      categoryId: cats[0].id,
      name: "Новости сервера",
      description: "Официальные новости и обновления RusCity Life RP",
      icon: "📰",
      sortOrder: 1,
    },
    {
      categoryId: cats[0].id,
      name: "Правила сервера",
      description: "Правила поведения на сервере и форуме",
      icon: "📜",
      sortOrder: 2,
    },
    {
      categoryId: cats[0].id,
      name: "Набор в администрацию",
      description: "Заявки на вступление в команду администраторов",
      icon: "🎖️",
      sortOrder: 3,
    },
    // Об игре
    {
      categoryId: cats[1].id,
      name: "Гайды и обучение",
      description: "Полезные гайды по игровым механикам",
      icon: "📖",
      sortOrder: 1,
    },
    {
      categoryId: cats[1].id,
      name: "Предложения",
      description: "Ваши идеи по улучшению сервера",
      icon: "💡",
      sortOrder: 2,
    },
    {
      categoryId: cats[1].id,
      name: "Репорты об ошибках",
      description: "Сообщайте об ошибках и багах",
      icon: "🐛",
      sortOrder: 3,
    },
    // Городская жизнь
    {
      categoryId: cats[2].id,
      name: "Фракции и организации",
      description: "Обсуждение фракций, набор в организации",
      icon: "🏢",
      sortOrder: 1,
    },
    {
      categoryId: cats[2].id,
      name: "Бизнес и экономика",
      description: "Торговля, бизнес-предложения, аукционы",
      icon: "💰",
      sortOrder: 2,
    },
    {
      categoryId: cats[2].id,
      name: "Недвижимость",
      description: "Покупка, продажа и аренда недвижимости",
      icon: "🏠",
      sortOrder: 3,
    },
    // Жалобы и апелляции
    {
      categoryId: cats[3].id,
      name: "Жалобы на игроков",
      description: "Подача жалоб на нарушителей правил",
      icon: "🚨",
      sortOrder: 1,
    },
    {
      categoryId: cats[3].id,
      name: "Апелляции банов",
      description: "Оспаривание блокировок аккаунта",
      icon: "🔓",
      sortOrder: 2,
    },
    // Общение
    {
      categoryId: cats[4].id,
      name: "Флудильня",
      description: "Свободное общение на любые темы",
      icon: "🗣️",
      sortOrder: 1,
    },
    {
      categoryId: cats[4].id,
      name: "Медиа",
      description: "Скриншоты, видео, стримы с сервера",
      icon: "📸",
      sortOrder: 2,
    },
    {
      categoryId: cats[4].id,
      name: "Знакомства",
      description: "Знакомства с другими игроками",
      icon: "👥",
      sortOrder: 3,
    },
  ]);
}
