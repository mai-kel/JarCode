import pytest
import io
from PIL import Image
from django.urls import reverse
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from courses.models import Course, Chapter, Lesson, LessonImage
from courses.factories import CourseFactory, ChapterFactory, LessonFactory
from users.factories import UserFactory
from unittest.mock import patch


@pytest.mark.django_db
def test_list_courses_authenticated(api_client):
    user = UserFactory()
    api_client.force_authenticate(user=user)
    CourseFactory.create_batch(3)
    url = reverse('course-list')

    response = api_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 3


@pytest.mark.django_db
def test_list_courses_unauthenticated(api_client):
    url = reverse('course-list')

    response = api_client.get(url)

    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_create_course_success(api_client):
    user = UserFactory(is_content_creator=True)
    api_client.force_authenticate(user=user)
    url = reverse('course-list')
    data = {
        "title": "New Course",
        "description": "Description of the course"
    }

    response = api_client.post(url, data)

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['title'] == data['title']
    assert Course.objects.count() == 1
    assert Course.objects.get().owner == user


@pytest.mark.django_db
def test_create_course_fails_not_content_creator(api_client):
    user = UserFactory(is_content_creator=False)
    api_client.force_authenticate(user=user)
    url = reverse('course-list')
    data = {
        "title": "New Course",
        "description": "Description"
    }

    response = api_client.post(url, data)

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert Course.objects.count() == 0


@pytest.mark.django_db
def test_create_course_unauthenticated(api_client):
    url = reverse('course-list')
    data = {
        "title": "New Course",
        "description": "Description"
    }

    response = api_client.post(url, data)

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert Course.objects.count() == 0


@pytest.mark.django_db
def test_update_course_owner(api_client):
    user = UserFactory(is_content_creator=True)
    course = CourseFactory(owner=user)
    api_client.force_authenticate(user=user)
    url = reverse('course-detail', kwargs={'pk': course.pk})
    data = {"title": "Updated Title"}

    response = api_client.patch(url, data)

    assert response.status_code == status.HTTP_200_OK
    course.refresh_from_db()
    assert course.title == "Updated Title"


@pytest.mark.django_db
def test_update_course_non_owner(api_client):
    owner = UserFactory(is_content_creator=True)
    other_user = UserFactory(is_content_creator=True)
    course = CourseFactory(owner=owner)
    api_client.force_authenticate(user=other_user)
    url = reverse('course-detail', kwargs={'pk': course.pk})
    data = {"title": "Hacked Title"}

    response = api_client.patch(url, data)

    assert response.status_code == status.HTTP_403_FORBIDDEN
    course.refresh_from_db()
    assert course.title != "Hacked Title"


@pytest.mark.django_db
def test_delete_course_owner(api_client):
    user = UserFactory(is_content_creator=True)
    course = CourseFactory(owner=user)
    api_client.force_authenticate(user=user)
    url = reverse('course-detail', kwargs={'pk': course.pk})

    response = api_client.delete(url)

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert Course.objects.count() == 0


@pytest.mark.django_db
def test_delete_course_non_owner(api_client):
    owner = UserFactory(is_content_creator=True)
    other_user = UserFactory(is_content_creator=True)
    course = CourseFactory(owner=owner)
    api_client.force_authenticate(user=other_user)
    url = reverse('course-detail', kwargs={'pk': course.pk})

    response = api_client.delete(url)

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert Course.objects.count() == 1


@pytest.mark.django_db
def test_filter_courses_by_title(api_client):
    user = UserFactory()
    api_client.force_authenticate(user=user)
    CourseFactory(title="Python for Beginners")
    CourseFactory(title="Advanced Java")
    url = reverse('course-list')

    response = api_client.get(url, {'title': 'Python'})

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 1
    assert response.data['results'][0]['title'] == "Python for Beginners"


@pytest.mark.django_db
def test_filter_courses_by_owner(api_client):
    user = UserFactory()
    api_client.force_authenticate(user=user)
    user1 = UserFactory()
    user2 = UserFactory()
    course1 = CourseFactory(owner=user1)
    CourseFactory(owner=user2)
    url = reverse('course-list')

    response = api_client.get(url, {'owner': user1.id})

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 1
    assert response.data['results'][0]['id'] == course1.id


@pytest.mark.django_db
def test_course_pagination_traversal(api_client):
    user = UserFactory()
    api_client.force_authenticate(user=user)

    courses = CourseFactory.create_batch(7, owner=user)
    expected_order = sorted(courses, key=lambda c: c.id, reverse=True)

    url = reverse('course-list')

    with patch('courses.pagination.CourseCursorPagination.page_size', 3):

        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        data = response.data

        assert len(data['results']) == 3
        assert data['results'][0]['id'] == expected_order[0].id
        assert data['results'][2]['id'] == expected_order[2].id
        assert data['next'] is not None
        assert data['previous'] is None

        response = api_client.get(data['next'])
        assert response.status_code == status.HTTP_200_OK
        data = response.data

        assert len(data['results']) == 3
        assert data['results'][0]['id'] == expected_order[3].id
        assert data['next'] is not None
        assert data['previous'] is not None

        response = api_client.get(data['next'])
        assert response.status_code == status.HTTP_200_OK
        data = response.data

        assert len(data['results']) == 1
        assert data['results'][0]['id'] == expected_order[6].id
        assert data['next'] is None
        assert data['previous'] is not None

        response = api_client.get(data['previous'])
        assert response.status_code == status.HTTP_200_OK
        data = response.data

        assert len(data['results']) == 3
        assert data['results'][0]['id'] == expected_order[3].id


@pytest.mark.django_db
def test_create_chapter_owner(api_client):
    user = UserFactory(is_content_creator=True)
    course = CourseFactory(owner=user)
    api_client.force_authenticate(user=user)
    url = reverse('course-chapters-list', kwargs={'course_pk': course.pk})
    data = {"title": "Chapter 1"}

    response = api_client.post(url, data)

    assert response.status_code == status.HTTP_201_CREATED
    assert Chapter.objects.count() == 1
    chapter = Chapter.objects.get()
    assert chapter.course == course
    assert chapter.position == 1


@pytest.mark.django_db
def test_create_chapter_non_owner(api_client):
    owner = UserFactory(is_content_creator=True)
    other_user = UserFactory(is_content_creator=True)
    course = CourseFactory(owner=owner)
    api_client.force_authenticate(user=other_user)
    url = reverse('course-chapters-list', kwargs={'course_pk': course.pk})
    data = {"title": "Chapter 1"}

    response = api_client.post(url, data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "You can only add chapters to your own courses" in str(response.data)
    assert Chapter.objects.count() == 0


@pytest.mark.django_db
def test_chapter_position_auto_increment(api_client):
    user = UserFactory(is_content_creator=True)
    course = CourseFactory(owner=user)
    api_client.force_authenticate(user=user)
    url = reverse('course-chapters-list', kwargs={'course_pk': course.pk})

    api_client.post(url, {"title": "C1"})
    api_client.post(url, {"title": "C2"})

    chapters = Chapter.objects.filter(course=course).order_by('position')
    assert chapters.count() == 2
    assert chapters[0].position == 1
    assert chapters[1].position == 2


@pytest.mark.django_db
def test_create_chapter_invalid_course_pk(api_client):
    user = UserFactory(is_content_creator=True)
    api_client.force_authenticate(user=user)
    url = reverse('course-chapters-list', kwargs={'course_pk': 9999})
    data = {"title": "Chapter 1"}

    response = api_client.post(url, data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Course does not exist" in str(response.data)


@pytest.mark.django_db
def test_create_lesson_owner(api_client):
    user = UserFactory(is_content_creator=True)
    course = CourseFactory(owner=user)
    chapter = ChapterFactory(course=course, position=1)
    api_client.force_authenticate(user=user)

    url = reverse('chapter-lessons-list', kwargs={
        'course_pk': course.pk,
        'chapter_pk': chapter.pk
        })
    data = {
        "title": "Lesson 1",
        "content": "<p>Content</p>"
    }

    response = api_client.post(url, data)

    assert response.status_code == status.HTTP_201_CREATED
    assert Lesson.objects.count() == 1
    lesson = Lesson.objects.get()
    assert lesson.chapter == chapter
    assert lesson.position == 1


@pytest.mark.django_db
def test_create_lesson_non_owner(api_client):
    owner = UserFactory(is_content_creator=True)
    other_user = UserFactory(is_content_creator=True)
    course = CourseFactory(owner=owner)
    chapter = ChapterFactory(course=course)
    api_client.force_authenticate(user=other_user)

    url = reverse('chapter-lessons-list', kwargs={
        'course_pk': course.pk,
        'chapter_pk': chapter.pk
        })
    data = {
        "title": "Lesson 1",
        "content": "<p>Content</p>"
    }

    response = api_client.post(url, data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "You can only add lessons to your own chapters" in str(response.data)
    assert Lesson.objects.count() == 0


@pytest.mark.django_db
def test_create_lesson_sanitization(api_client):
    user = UserFactory(is_content_creator=True)
    course = CourseFactory(owner=user)
    chapter = ChapterFactory(course=course)
    api_client.force_authenticate(user=user)

    url = reverse('chapter-lessons-list', kwargs={
        'course_pk': course.pk,
        'chapter_pk': chapter.pk
        })

    dirty_html = '<script>alert("XSS")</script><b>Bold</b>'
    data = {
        "title": "Sanitized Lesson",
        "content": dirty_html
    }

    response = api_client.post(url, data)
    assert response.status_code == status.HTTP_201_CREATED

    lesson = Lesson.objects.get()
    assert "<script>" not in lesson.content
    assert "<b>Bold</b>" in lesson.content


@pytest.mark.django_db
def test_lesson_position_auto_increment(api_client):
    user = UserFactory(is_content_creator=True)
    course = CourseFactory(owner=user)
    chapter = ChapterFactory(course=course)
    api_client.force_authenticate(user=user)

    url = reverse('chapter-lessons-list', kwargs={
        'course_pk': course.pk,
        'chapter_pk': chapter.pk
        })

    api_client.post(url, {"title": "L1", "content": "c"})
    api_client.post(url, {"title": "L2", "content": "c"})

    lessons = Lesson.objects.filter(chapter=chapter).order_by('position')
    assert lessons.count() == 2
    assert lessons[0].position == 1
    assert lessons[1].position == 2


@pytest.mark.django_db
def test_create_lesson_invalid_chapter_pk(api_client):
    user = UserFactory(is_content_creator=True)
    course = CourseFactory(owner=user)
    api_client.force_authenticate(user=user)
    url = reverse('chapter-lessons-list', kwargs={
        'course_pk': course.pk,
        'chapter_pk': 9999
        })

    data = {"title": "L1", "content": "c"}
    response = api_client.post(url, data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Chapter does not exist" in str(response.data)


@pytest.mark.django_db
def test_upload_lesson_image_success(api_client):
    user = UserFactory(is_content_creator=True)
    course = CourseFactory(owner=user)
    chapter = ChapterFactory(course=course)
    lesson = LessonFactory(chapter=chapter)
    api_client.force_authenticate(user=user)

    url = reverse('upload-image')

    image_file = io.BytesIO()
    image = Image.new('RGB', (100, 100), 'white')
    image.save(image_file, 'JPEG')
    image_file.seek(0)

    file = SimpleUploadedFile("test.jpg",
                              image_file.read(),
                              content_type="image/jpeg")

    data = {
        "lesson": lesson.id,
        "image": file
    }

    response = api_client.post(url, data, format='multipart')

    assert response.status_code == status.HTTP_201_CREATED
    assert 'location' in response.data
    assert LessonImage.objects.count() == 1
    assert LessonImage.objects.get().lesson == lesson


@pytest.mark.django_db
def test_upload_lesson_image_non_owner(api_client):
    owner = UserFactory(is_content_creator=True)
    other_user = UserFactory(is_content_creator=True)
    course = CourseFactory(owner=owner)
    chapter = ChapterFactory(course=course)
    lesson = LessonFactory(chapter=chapter)
    api_client.force_authenticate(user=other_user)

    url = reverse('upload-image')

    image_file = io.BytesIO()
    image = Image.new('RGB', (100, 100), 'white')
    image.save(image_file, 'JPEG')
    image_file.seek(0)
    file = SimpleUploadedFile("test.jpg",
                              image_file.read(),
                              content_type="image/jpeg")

    data = {
        "lesson": lesson.id,
        "image": file
    }

    response = api_client.post(url, data, format='multipart')

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "You do not have permission to add images to this lesson" in str(response.data)
    assert LessonImage.objects.count() == 0


@pytest.mark.django_db
def test_upload_lesson_image_invalid_file(api_client):
    user = UserFactory(is_content_creator=True)
    course = CourseFactory(owner=user)
    chapter = ChapterFactory(course=course)
    lesson = LessonFactory(chapter=chapter)
    api_client.force_authenticate(user=user)

    url = reverse('upload-image')
    data = {
        "lesson": lesson.id,
        "image": "not-an-image"
    }

    response = api_client.post(url, data, format='multipart')

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert LessonImage.objects.count() == 0


@pytest.mark.django_db
def test_upload_lesson_image_unauthenticated(api_client):
    lesson = LessonFactory()
    url = reverse('upload-image')

    data = {"lesson": lesson.id}

    response = api_client.post(url, data)

    assert response.status_code == status.HTTP_403_FORBIDDEN
