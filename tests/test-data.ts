export const MOCK_CURRICULUM = {
  title: "Python for Beginners",
  description: "Learn the basics of Python programming.",
  targetAudience: "Beginners",
  difficultyLevel: "Beginner",
  estimatedTotalDuration: "2 Weeks",
  modules: [
    {
      title: "Introduction",
      description: "Setup and Basics",
      lessons: [
        {
          title: "Install Python",
          duration: "10m",
          type: "Video",
          objectives: ["Install Python 3"]
        }
      ]
    },
    {
      title: "Variables",
      description: "Storing data",
      lessons: [
        {
          title: "Int and Strings",
          duration: "15m",
          type: "Text",
          objectives: ["Understand types"]
        }
      ]
    }
  ]
};

export const MOCK_ASSESSMENT = {
  id: "101",
  title: "Intro Quiz",
  targetContext: "Introduction",
  type: "Quiz",
  totalPoints: 10,
  questions: [
    {
      id: 1,
      text: "What is Python?",
      type: "Multiple Choice",
      options: ["A snake", "A language"],
      correctAnswer: "A language",
      points: 5
    }
  ]
};

export const MOCK_ADAPTED_CURRICULUM = {
  ...MOCK_CURRICULUM,
  difficultyLevel: "Advanced",
  modules: [
    {
      title: "Advanced Introduction",
      description: "Deep dive into internals",
      lessons: [
        {
          title: "Python Memory Management",
          duration: "30m",
          type: "Video",
          objectives: ["Understand Heap"]
        }
      ]
    }
  ]
};
