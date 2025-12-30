import pytest
from unittest.mock import patch
from django.urls import reverse
from rest_framework import status
from problems.models import Problem
from problems.factories import ProblemFactory
from users.factories import UserFactory


@pytest.mark.django_db
def test_list_problems_authenticated(api_client):
    user = UserFactory()
    api_client.force_authenticate(user=user)
    ProblemFactory.create_batch(3)
    url = reverse('problem-list')

    response = api_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 3


@pytest.mark.django_db
def test_list_problems_unauthenticated(api_client):
    url = reverse('problem-list')

    response = api_client.get(url)

    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_create_problem_success(api_client):
    user = UserFactory(is_content_creator=True)
    api_client.force_authenticate(user=user)
    url = reverse('problem-list')
    data = {
        "title": "Two Sum",
        "description": "Find indices.",
        "language": "PYTHON",
        "difficulty": "EASY",
        "starting_code": "def solution(): pass",
        "test_code": "assert solution()",
    }

    response = api_client.post(url, data)

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['title'] == data['title']
    assert Problem.objects.count() == 1
    problem = Problem.objects.get()
    assert problem.author == user


@pytest.mark.django_db
def test_create_problem_fails_not_content_creator(api_client):
    user = UserFactory(is_content_creator=False)
    api_client.force_authenticate(user=user)
    url = reverse('problem-list')
    data = {
        "title": "Unauthorized Problem",
        "description": "Desc",
        "language": "PYTHON",
        "difficulty": "EASY",
        "starting_code": "code",
        "test_code": "test"
    }

    response = api_client.post(url, data)

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert Problem.objects.count() == 0


@pytest.mark.django_db
def test_create_problem_unauthenticated(api_client):
    url = reverse('problem-list')
    data = {
        "title": "Two Sum",
        "description": "Desc",
        "language": "PYTHON",
        "difficulty": "EASY",
        "starting_code": "code",
        "test_code": "test"
    }

    response = api_client.post(url, data)

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert Problem.objects.count() == 0


@pytest.mark.django_db
def test_create_problem_invalid_choices(api_client):
    user = UserFactory(is_content_creator=True)
    api_client.force_authenticate(user=user)
    url = reverse('problem-list')
    data = {
        "title": "Bad Problem",
        "description": "Desc",
        "language": "RUBY",
        "difficulty": "IMPOSSIBLE",
        "starting_code": "code",
        "test_code": "test"
    }

    response = api_client.post(url, data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'language' in response.data
    assert 'difficulty' in response.data


@pytest.mark.django_db
def test_create_problem_sanitization(api_client):
    user = UserFactory(is_content_creator=True)
    api_client.force_authenticate(user=user)
    url = reverse('problem-list')

    dirty_html = '<script>alert("XSS")</script><b>Bold</b>'
    data = {
        "title": "Sanitized Problem",
        "description": dirty_html,
        "language": "PYTHON",
        "difficulty": "EASY",
        "starting_code": "code",
        "test_code": "test"
    }

    response = api_client.post(url, data)

    assert response.status_code == status.HTTP_201_CREATED
    problem = Problem.objects.get()
    assert "<script>" not in problem.description
    assert "<b>Bold</b>" in problem.description


@pytest.mark.django_db
def test_retrieve_problem_success(api_client):
    user = UserFactory()
    api_client.force_authenticate(user=user)
    problem = ProblemFactory()
    url = reverse('problem-detail', kwargs={'pk': problem.pk})

    response = api_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data['id'] == problem.id
    assert response.data['title'] == problem.title


@pytest.mark.django_db
def test_retrieve_problem_not_found(api_client):
    user = UserFactory()
    api_client.force_authenticate(user=user)
    url = reverse('problem-detail', kwargs={'pk': 99999})

    response = api_client.get(url)

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_update_problem_author_success(api_client):
    user = UserFactory(is_content_creator=True)
    problem = ProblemFactory(author=user)
    api_client.force_authenticate(user=user)
    url = reverse('problem-detail', kwargs={'pk': problem.pk})
    data = {"title": "Updated Title"}

    response = api_client.patch(url, data)

    assert response.status_code == status.HTTP_200_OK
    problem.refresh_from_db()
    assert problem.title == "Updated Title"


@pytest.mark.django_db
def test_update_problem_non_author(api_client):
    owner = UserFactory(is_content_creator=True)
    other_user = UserFactory(is_content_creator=True)
    problem = ProblemFactory(author=owner)
    api_client.force_authenticate(user=other_user)
    url = reverse('problem-detail', kwargs={'pk': problem.pk})
    data = {"title": "Hacked Title"}

    response = api_client.patch(url, data)

    assert response.status_code == status.HTTP_403_FORBIDDEN
    problem.refresh_from_db()
    assert problem.title != "Hacked Title"


@pytest.mark.django_db
def test_delete_problem_author(api_client):
    user = UserFactory(is_content_creator=True)
    problem = ProblemFactory(author=user)
    api_client.force_authenticate(user=user)
    url = reverse('problem-detail', kwargs={'pk': problem.pk})

    response = api_client.delete(url)

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert Problem.objects.count() == 0


@pytest.mark.django_db
def test_delete_problem_non_author(api_client):
    owner = UserFactory(is_content_creator=True)
    other_user = UserFactory(is_content_creator=True)
    problem = ProblemFactory(author=owner)
    api_client.force_authenticate(user=other_user)
    url = reverse('problem-detail', kwargs={'pk': problem.pk})

    response = api_client.delete(url)

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert Problem.objects.count() == 1


@pytest.mark.django_db
def test_filter_problems_by_title(api_client):
    user = UserFactory()
    api_client.force_authenticate(user=user)
    ProblemFactory(title="Dynamic Programming Intro")
    ProblemFactory(title="Graph Theory")
    url = reverse('problem-list')

    response = api_client.get(url, {'title': 'Dynamic'})

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 1
    assert response.data['results'][0]['title'] == "Dynamic Programming Intro"


@pytest.mark.django_db
def test_filter_problems_by_language(api_client):
    user = UserFactory()
    api_client.force_authenticate(user=user)
    p1 = ProblemFactory(language="PYTHON")
    ProblemFactory(language="JAVA")
    url = reverse('problem-list')

    response = api_client.get(url, {'language': 'PYTHON'})

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 1
    assert response.data['results'][0]['id'] == p1.id


@pytest.mark.django_db
def test_filter_problems_by_difficulty(api_client):
    user = UserFactory()
    api_client.force_authenticate(user=user)
    p1 = ProblemFactory(difficulty="HARD")
    ProblemFactory(difficulty="EASY")
    url = reverse('problem-list')

    response = api_client.get(url, {'difficulty': 'HARD'})

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 1
    assert response.data['results'][0]['id'] == p1.id


@pytest.mark.django_db
def test_filter_problems_by_author(api_client):
    user = UserFactory()
    api_client.force_authenticate(user=user)
    author1 = UserFactory()
    author2 = UserFactory()
    p1 = ProblemFactory(author=author1)
    ProblemFactory(author=author2)
    url = reverse('problem-list')

    response = api_client.get(url, {'author': author1.id})

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 1
    assert response.data['results'][0]['id'] == p1.id


@pytest.mark.django_db
def test_problem_pagination(api_client):
    user = UserFactory()
    api_client.force_authenticate(user=user)

    problems = ProblemFactory.create_batch(7)
    expected_order = sorted(problems, key=lambda p: p.id, reverse=True)

    url = reverse('problem-list')

    with patch('problems.pagination.ProblemCursorPagination.page_size', 3):
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        data = response.data

        assert len(data['results']) == 3
        assert data['results'][0]['id'] == expected_order[0].id
        assert data['next'] is not None

        response = api_client.get(data['next'])
        assert response.status_code == status.HTTP_200_OK
        data = response.data

        assert len(data['results']) == 3
        assert data['results'][0]['id'] == expected_order[3].id
        assert data['next'] is not None

        response = api_client.get(data['next'])
        assert response.status_code == status.HTTP_200_OK
        data = response.data

        assert len(data['results']) == 1
        assert data['results'][0]['id'] == expected_order[6].id
        assert data['next'] is None
