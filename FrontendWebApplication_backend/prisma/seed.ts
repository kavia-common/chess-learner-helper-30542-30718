import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Seed a couple of lessons
  const lessonIntro = await prisma.lesson.upsert({
    where: { id: 'seed-intro' },
    update: {},
    create: {
      id: 'seed-intro',
      title: 'Introduction to Chess',
      description: 'Basics of the game and how pieces move.',
      difficulty: 'beginner',
      modules: {
        create: [
          { title: 'Board and Pieces', order: 1, content: 'The chessboard and piece overview.' },
          { title: 'How to Move', order: 2, content: 'Movement rules for each piece.' }
        ]
      }
    }
  });

  const lessonTactics = await prisma.lesson.upsert({
    where: { id: 'seed-tactics' },
    update: {},
    create: {
      id: 'seed-tactics',
      title: 'Basic Tactics',
      description: 'Forks, pins, skewers.',
      difficulty: 'beginner'
    }
  });

  // Seed quizzes
  const quizRules = await prisma.quiz.upsert({
    where: { id: 'seed-quiz-rules' },
    update: {},
    create: {
      id: 'seed-quiz-rules',
      title: 'Rules Quiz',
      description: 'Test your knowledge of basic rules',
      questions: {
        create: [
          {
            prompt: 'How many squares on a chessboard?',
            options: JSON.stringify(['64', '81', '100', '72']),
            answer: JSON.stringify('64'),
            order: 1
          }
        ]
      }
    }
  });

  console.log('Seeded:', { lessonIntro: lessonIntro.id, lessonTactics: lessonTactics.id, quizRules: quizRules.id });
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
