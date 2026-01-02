import { http, HttpResponse } from 'msw';

const API_URL = '/api';

export const handlers = [
  // CSRF Token
  http.get(`${API_URL}/users/csrf-init/`, () => {
    return HttpResponse.json({}, { headers: { 'Set-Cookie': 'csrftoken=test-csrf-token' } });
  }),

  // Authentication
  http.post(`${API_URL}/users/login/`, async ({ request }) => {
    const body = await request.json();
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        is_content_creator: true
      });
    }
    return HttpResponse.json(
      { detail: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post(`${API_URL}/users/register/`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 1,
      email: body.email,
      first_name: body.first_name,
      last_name: body.last_name
    }, { status: 201 });
  }),

  http.post(`${API_URL}/users/logout/`, () => {
    return HttpResponse.json({});
  }),

  http.get(`${API_URL}/users/me/`, ({ request }) => {
    const authHeader = request.headers.get('Cookie');
    if (authHeader && authHeader.includes('sessionid')) {
      return HttpResponse.json({
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        is_content_creator: true
      });
    }
    return HttpResponse.json(
      { detail: 'Authentication credentials were not provided.' },
      { status: 401 }
    );
  }),

  http.put(`${API_URL}/users/me/`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 1,
      email: 'test@example.com',
      first_name: body.first_name,
      last_name: body.last_name,
      is_content_creator: true
    });
  }),

  http.post(`${API_URL}/users/verify-account/`, () => {
    return HttpResponse.json({});
  }),

  http.post(`${API_URL}/users/resend-verification-link/`, () => {
    return HttpResponse.json({});
  }),

  http.post(`${API_URL}/users/send-password-reset-link/`, () => {
    return HttpResponse.json({});
  }),

  http.put(`${API_URL}/users/change-password/`, () => {
    return HttpResponse.json({});
  }),

  // Courses
  http.get(`${API_URL}/courses/`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const cursor = url.searchParams.get('cursor');
    const owner = url.searchParams.get('owner');

    const courses = [
      { id: 1, title: 'Course 1', description: 'Description 1', owner: 1 },
      { id: 2, title: 'Course 2', description: 'Description 2', owner: 1 },
      { id: 3, title: 'Course 3', description: 'Description 3', owner: 2 }
    ];

    let filtered = courses;
    if (owner) {
      filtered = filtered.filter(c => c.owner === Number(owner));
    }
    if (search) {
      filtered = filtered.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
    }

    if (cursor) {
      return HttpResponse.json({
        results: filtered.slice(1),
        next: null,
        previous: null
      });
    }

    return HttpResponse.json({
      results: filtered.slice(0, 2),
      next: 'cursor123',
      previous: null
    });
  }),

  http.get(`${API_URL}/courses/:id/`, ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      title: `Course ${params.id}`,
      description: `Description ${params.id}`,
      owner: 1
    });
  }),

  http.post(`${API_URL}/courses/`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 1,
      ...body,
      owner: 1
    }, { status: 201 });
  }),

  http.put(`${API_URL}/courses/:id/`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: Number(params.id),
      ...body,
      owner: 1
    });
  }),

  http.delete(`${API_URL}/courses/:id/`, () => {
    return HttpResponse.json({}, { status: 204 });
  }),

  // Chapters
  http.get(`${API_URL}/courses/:courseId/chapters/`, () => {
    return HttpResponse.json({
      results: [
        { id: 1, title: 'Chapter 1', course: 1 },
        { id: 2, title: 'Chapter 2', course: 1 }
      ],
      next: null,
      previous: null
    });
  }),

  http.post(`${API_URL}/courses/:courseId/chapters/`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 1,
      ...body,
      course: Number(request.url.split('/')[5])
    }, { status: 201 });
  }),

  // Lessons
  http.get(`${API_URL}/courses/:courseId/chapters/:chapterId/lessons/`, () => {
    return HttpResponse.json({
      results: [
        { id: 1, title: 'Lesson 1', chapter: 1 },
        { id: 2, title: 'Lesson 2', chapter: 1 }
      ],
      next: null,
      previous: null
    });
  }),

  http.post(`${API_URL}/lessons/upload-image/`, async ({ request }) => {
    const formData = await request.formData();
    return HttpResponse.json({
      url: 'https://example.com/image.jpg'
    });
  }),

  // Problems
  http.get(`${API_URL}/problems/`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const cursor = url.searchParams.get('cursor');
    const owner = url.searchParams.get('owner');
    const difficulty = url.searchParams.get('difficulty');
    const language = url.searchParams.get('language');

    const problems = [
      { id: 1, title: 'Problem 1', difficulty: 'EASY', language: 'PYTHON', author: 1 },
      { id: 2, title: 'Problem 2', difficulty: 'MEDIUM', language: 'JAVA', author: 1 },
      { id: 3, title: 'Problem 3', difficulty: 'HARD', language: 'PYTHON', author: 2 }
    ];

    let filtered = problems;
    if (owner) {
      filtered = filtered.filter(p => p.author === Number(owner));
    }
    if (difficulty) {
      filtered = filtered.filter(p => p.difficulty === difficulty);
    }
    if (language) {
      filtered = filtered.filter(p => p.language === language);
    }
    if (search) {
      filtered = filtered.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
    }

    if (cursor) {
      return HttpResponse.json({
        results: filtered.slice(1),
        next: null,
        previous: null
      });
    }

    return HttpResponse.json({
      results: filtered.slice(0, 2),
      next: 'cursor123',
      previous: null
    });
  }),

  http.get(`${API_URL}/problems/:id/`, ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      title: `Problem ${params.id}`,
      description: `Description ${params.id}`,
      difficulty: 'EASY',
      language: 'PYTHON',
      starting_code: 'def solution():',
      test_code: 'assert solution() == True',
      author: 1
    });
  }),

  http.post(`${API_URL}/problems/`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 1,
      ...body,
      author: 1
    }, { status: 201 });
  }),

  http.put(`${API_URL}/problems/:id/`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: Number(params.id),
      ...body,
      author: 1
    });
  }),

  http.delete(`${API_URL}/problems/:id/`, () => {
    return HttpResponse.json({}, { status: 204 });
  }),

  // Submissions
  http.get(`${API_URL}/submissions/`, ({ request }) => {
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor');
    const problem = url.searchParams.get('problem');

    const submissions = [
      { id: 1, problem: 1, code: 'def solution(): pass', status: 'PENDING' },
      { id: 2, problem: 1, code: 'def solution(): return True', status: 'ACCEPTED' },
      { id: 3, problem: 2, code: 'public class Solution {}', status: 'REJECTED' }
    ];

    let filtered = submissions;
    if (problem) {
      filtered = filtered.filter(s => s.problem === Number(problem));
    }

    if (cursor) {
      return HttpResponse.json({
        results: filtered.slice(1),
        next: null,
        previous: null
      });
    }

    return HttpResponse.json({
      results: filtered.slice(0, 2),
      next: 'cursor123',
      previous: null
    });
  }),

  http.get(`${API_URL}/submissions/:id/`, ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      problem: 1,
      code: 'def solution(): return True',
      status: 'ACCEPTED',
      test_results: []
    });
  }),

  http.post(`${API_URL}/submissions/`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 1,
      ...body,
      status: 'PENDING'
    }, { status: 201 });
  })
];

