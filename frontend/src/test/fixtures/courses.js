export const mockCourse = {
  id: 1,
  title: 'Test Course',
  description: 'Test Description',
  owner: 1
};

export const mockCourses = [
  mockCourse,
  {
    id: 2,
    title: 'Another Course',
    description: 'Another Description',
    owner: 1
  },
  {
    id: 3,
    title: 'Third Course',
    description: 'Third Description',
    owner: 2
  }
];

export const mockChapter = {
  id: 1,
  title: 'Test Chapter',
  course: 1
};

export const mockChapters = [
  mockChapter,
  {
    id: 2,
    title: 'Another Chapter',
    course: 1
  }
];

export const mockLesson = {
  id: 1,
  title: 'Test Lesson',
  content: 'Test Content',
  chapter: 1
};

export const mockLessons = [
  mockLesson,
  {
    id: 2,
    title: 'Another Lesson',
    content: 'Another Content',
    chapter: 1
  }
];

