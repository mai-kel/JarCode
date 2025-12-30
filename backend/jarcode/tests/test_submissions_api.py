import pytest
from unittest.mock import patch
from django.urls import reverse
from rest_framework import status
from submissions.models import Submission
from submissions.factories import SubmissionFactory
from problems.factories import ProblemFactory
from users.factories import UserFactory


@pytest.mark.django_db
def test_list_submissions_authenticated(api_client):
    user = UserFactory()
    problem = ProblemFactory()
    api_client.force_authenticate(user=user)

    SubmissionFactory.create_batch(3, author=user, problem=problem)
    other_problem = ProblemFactory()
    SubmissionFactory(author=user, problem=other_problem)

    url = reverse('problem-submissions-list', kwargs={'problem_pk': problem.pk})

    response = api_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 3


@pytest.mark.django_db
def test_list_submissions_unauthenticated(api_client):
    problem = ProblemFactory()
    url = reverse('problem-submissions-list', kwargs={'problem_pk': problem.pk})

    response = api_client.get(url)

    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_list_submissions_filters_other_users(api_client):
    user = UserFactory()
    other_user = UserFactory()
    problem = ProblemFactory()
    api_client.force_authenticate(user=user)

    SubmissionFactory(author=user, problem=problem)
    SubmissionFactory(author=other_user, problem=problem)

    url = reverse('problem-submissions-list', kwargs={'problem_pk': problem.pk})

    response = api_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 1
    assert response.data['results'][0]['author'] == user.id


@pytest.mark.django_db
def test_create_submission_success(api_client, broker, decode_message):
    user = UserFactory()
    problem = ProblemFactory()
    api_client.force_authenticate(user=user)

    url = reverse('problem-submissions-list', kwargs={'problem_pk': problem.pk})
    data = {
        "solution": "print('Hello World')"
    }

    response = api_client.post(url, data)

    assert response.status_code == status.HTTP_201_CREATED
    assert Submission.objects.count() == 1

    submission = Submission.objects.get()
    assert submission.author == user
    assert submission.problem == problem
    assert submission.solution == data['solution']
    assert submission.status == Submission.Status.ACCEPTED

    queue = broker.queues.get('default').queue
    assert len(queue) == 1

    message = decode_message(queue[0])
    assert message['actor_name'] == 'evaluate_submission'
    assert message['kwargs']['submission_id'] == submission.id


@pytest.mark.django_db
def test_create_submission_unauthenticated(api_client, broker):
    problem = ProblemFactory()
    url = reverse('problem-submissions-list', kwargs={'problem_pk': problem.pk})
    data = {"solution": "code"}

    response = api_client.post(url, data)

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert Submission.objects.count() == 0
    assert len(broker.queues.get('default').queue) == 0


@pytest.mark.django_db
def test_create_submission_invalid_problem(api_client, broker):
    user = UserFactory()
    api_client.force_authenticate(user=user)

    url = reverse('problem-submissions-list', kwargs={'problem_pk': 99999})
    data = {"solution": "code"}

    response = api_client.post(url, data)

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert Submission.objects.count() == 0
    assert len(broker.queues.get('default').queue) == 0


@pytest.mark.django_db
def test_retrieve_submission_success(api_client):
    user = UserFactory()
    problem = ProblemFactory()
    submission = SubmissionFactory(author=user, problem=problem)
    api_client.force_authenticate(user=user)

    url = reverse('problem-submissions-detail', kwargs={
        'problem_pk': problem.pk,
        'pk': submission.pk
    })

    response = api_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data['id'] == submission.id
    assert response.data['solution'] == submission.solution


@pytest.mark.django_db
def test_retrieve_submission_not_found(api_client):
    user = UserFactory()
    problem = ProblemFactory()
    api_client.force_authenticate(user=user)

    url = reverse('problem-submissions-detail', kwargs={
        'problem_pk': problem.pk,
        'pk': 99999
    })

    response = api_client.get(url)

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_retrieve_submission_other_user(api_client):
    user = UserFactory()
    other_user = UserFactory()
    problem = ProblemFactory()
    submission = SubmissionFactory(author=other_user, problem=problem)

    api_client.force_authenticate(user=user)

    url = reverse('problem-submissions-detail', kwargs={
        'problem_pk': problem.pk,
        'pk': submission.pk
    })

    response = api_client.get(url)

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_retrieve_submission_wrong_problem(api_client):
    user = UserFactory()
    problem1 = ProblemFactory()
    problem2 = ProblemFactory()
    submission = SubmissionFactory(author=user, problem=problem1)

    api_client.force_authenticate(user=user)

    url = reverse('problem-submissions-detail', kwargs={
        'problem_pk': problem2.pk,
        'pk': submission.pk
    })

    response = api_client.get(url)

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_submission_pagination(api_client):
    user = UserFactory()
    problem = ProblemFactory()
    api_client.force_authenticate(user=user)

    submissions = SubmissionFactory.create_batch(7,
                                                 author=user,
                                                 problem=problem)
    expected_order = sorted(submissions, key=lambda s: s.id, reverse=True)

    url = reverse('problem-submissions-list',
                  kwargs={'problem_pk': problem.pk})

    with patch('submissions.pagination.SubmissionCursorPagination.page_size', 3):

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
