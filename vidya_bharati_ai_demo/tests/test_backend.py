"""Offline lesson planner API tests; no Gemini calls."""
import os
import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient
from pydantic import ValidationError
import main
from schemas import LessonPlan

class LessonPlannerTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(main.app)
        self.request = {'teacher_name': 'Swati', 'grade_level': '8', 'subject': 'Science',
                        'topic': 'Combustion', 'textbook_content': 'Combustion releases heat.'}

    def test_lesson_generation(self):
        plan = LessonPlan(learning_objectives=['Define combustion', 'Identify fuels', 'Explain heat'],
                          learning_outcomes=['Defines combustion', 'Names fuels', 'Describes heat'],
                          methodology=['Discuss fuel and oxygen'], teaching_learning_materials=['Textbook'],
                          activities=['Discuss examples'], assessment=['What is combustion?'], homework=['List fuels'])
        with patch('main.generate_structured', return_value=plan) as ai:
            response = self.client.post('/api/v1/lesson-plans/generate', json=self.request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['lesson_plan'], plan.model_dump())
        self.assertEqual(response.json()['metadata']['teacher_name'], 'Swati')
        self.assertIn(self.request['textbook_content'], ai.call_args.args[0])

    def test_blank_content_rejected_before_ai(self):
        self.request['textbook_content'] = '   '
        with patch('main.generate_structured') as ai:
            response = self.client.post('/api/v1/lesson-plans/generate', json=self.request)
        self.assertEqual(response.status_code, 422)
        ai.assert_not_called()

    def test_missing_configuration(self):
        with patch.dict(os.environ, {'GEMINI_API_KEY': '', 'GEMINI_MODEL': ''}):
            response = self.client.post('/api/v1/lesson-plans/generate', json=self.request)
        self.assertEqual(response.status_code, 503)

    def test_incomplete_plan_rejected(self):
        with self.assertRaises(ValidationError):
            LessonPlan(learning_objectives=['Only one objective'])

    def test_only_lesson_feature_exposed(self):
        paths = self.client.get('/openapi.json').json()['paths']
        self.assertEqual(set(paths), {'/health', '/api/v1/lesson-plans/generate'})
        self.assertEqual(self.client.get('/health').status_code, 200)

if __name__ == '__main__':
    unittest.main()
