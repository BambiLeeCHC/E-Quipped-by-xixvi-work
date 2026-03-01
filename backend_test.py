#!/usr/bin/env python3
"""
E-Quipped Backend API Testing Script
Tests all the core functionality as requested in the review.
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BACKEND_URL = "https://gif-guide-modules.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@equipped.ai"
ADMIN_PASSWORD = "admin123"

class APITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        
    def log_test(self, test_name, success, details="", response_data=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        if response_data:
            result["response"] = response_data
        
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        
        if not success and response_data:
            print(f"  Response: {json.dumps(response_data, indent=2)}")
    
    def authenticate_admin(self):
        """Authenticate as admin user"""
        try:
            response = self.session.post(
                f"{self.base_url}/auth/login",
                json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("token")
                self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                self.log_test("Admin Authentication", True, f"Logged in as {ADMIN_EMAIL}")
                return True
            else:
                self.log_test("Admin Authentication", False, f"Status: {response.status_code}", response.json())
                return False
        except Exception as e:
            self.log_test("Admin Authentication", False, f"Error: {str(e)}")
            return False
    
    def test_modules_loading(self):
        """Test 1: GET /api/modules - Verify all 7 modules are loaded with 37 total lessons"""
        try:
            response = self.session.get(f"{self.base_url}/modules")
            
            if response.status_code == 200:
                modules = response.json()
                
                # Count modules
                module_count = len(modules)
                
                # Count total lessons
                total_lessons = sum(module.get("total_lessons", 0) for module in modules)
                
                if module_count == 7 and total_lessons == 37:
                    self.log_test("Modules Loading", True, f"Found {module_count} modules with {total_lessons} total lessons")
                    
                    # Log module details
                    for module in modules:
                        print(f"  📚 {module.get('title', 'Unknown')} - {module.get('total_lessons', 0)} lessons")
                    
                    return modules
                else:
                    self.log_test("Modules Loading", False, f"Expected 7 modules and 37 lessons, got {module_count} modules and {total_lessons} lessons", modules)
                    return None
            else:
                self.log_test("Modules Loading", False, f"Status: {response.status_code}", response.json())
                return None
        except Exception as e:
            self.log_test("Modules Loading", False, f"Error: {str(e)}")
            return None
    
    def test_lesson_retrieval(self):
        """Test 2: GET /api/lessons/les_001 - Verify lesson data structure"""
        try:
            response = self.session.get(f"{self.base_url}/lessons/les_001")
            
            if response.status_code == 200:
                lesson = response.json()
                
                # Check required fields
                required_fields = ["lesson_id", "title", "description", "content"]
                missing_fields = [field for field in required_fields if not lesson.get(field)]
                
                if not missing_fields:
                    # Check for sections/blocks
                    has_sections = bool(lesson.get("sections"))
                    sections_info = f"Has {len(lesson.get('sections', []))} sections" if has_sections else "No sections found"
                    
                    self.log_test("Lesson Retrieval", True, f"Lesson les_001 loaded successfully. {sections_info}")
                    
                    # Log lesson details
                    print(f"  📖 Title: {lesson.get('title')}")
                    print(f"  📝 Description: {lesson.get('description')[:100]}...")
                    print(f"  ⏱️  Estimated time: {lesson.get('estimated_minutes', 'Unknown')} minutes")
                    print(f"  🎯 XP reward: {lesson.get('xp_reward', 'Unknown')}")
                    
                    return lesson
                else:
                    self.log_test("Lesson Retrieval", False, f"Missing required fields: {missing_fields}", lesson)
                    return None
            else:
                self.log_test("Lesson Retrieval", False, f"Status: {response.status_code}", response.json())
                return None
        except Exception as e:
            self.log_test("Lesson Retrieval", False, f"Error: {str(e)}")
            return None
    
    def test_applied_learning_exercise(self):
        """Test 3: GET /api/lessons/les_001/exercise - Verify exercise data is returned"""
        try:
            response = self.session.get(f"{self.base_url}/lessons/les_001/exercise")
            
            if response.status_code == 200:
                exercise = response.json()
                
                # Check required fields
                required_fields = ["exercise_id", "lesson_id", "description"]
                missing_fields = [field for field in required_fields if not exercise.get(field)]
                
                if not missing_fields:
                    self.log_test("Applied Learning Exercise", True, f"Exercise loaded for les_001")
                    
                    # Log exercise details
                    print(f"  🎯 Exercise ID: {exercise.get('exercise_id')}")
                    print(f"  📝 Description: {exercise.get('description')}")
                    print(f"  ✅ Required elements: {len(exercise.get('required_elements', []))}")
                    print(f"  📊 Passing score: {exercise.get('passing_score', 'Unknown')}%")
                    
                    return exercise
                else:
                    self.log_test("Applied Learning Exercise", False, f"Missing required fields: {missing_fields}", exercise)
                    return None
            else:
                self.log_test("Applied Learning Exercise", False, f"Status: {response.status_code}", response.json())
                return None
        except Exception as e:
            self.log_test("Applied Learning Exercise", False, f"Error: {str(e)}")
            return None
    
    def test_prompt_evaluation(self):
        """Test 4: POST /api/lessons/les_001/evaluate-prompt - Check AI evaluation response"""
        try:
            # Create a sample prompt that should score well
            sample_prompt = """You are a senior marketing manager with 10 years of experience in B2B SaaS companies. 

Write a follow-up email to a potential client who attended our product demo yesterday. The client expressed interest in our enterprise features and mentioned they're evaluating solutions for their 500-person company.

Context:
- Recipient: Sarah Johnson, IT Director at TechCorp
- Demo went well, she asked specific questions about security and integrations
- Next step: She wants to discuss pricing and implementation timeline
- Tone: Professional but warm, building relationship

Constraints:
- Keep it under 200 words
- Include a clear call-to-action with 3 specific meeting time options
- Reference 2 specific points from the demo
- Suggest a 30-minute follow-up call"""

            payload = {
                "exercise_id": "ex_001",
                "lesson_id": "les_001", 
                "prompt": sample_prompt
            }
            
            response = self.session.post(
                f"{self.base_url}/lessons/les_001/evaluate-prompt",
                json=payload
            )
            
            if response.status_code == 200:
                evaluation = response.json()
                
                # Check required fields
                required_fields = ["score", "passed", "feedback"]
                missing_fields = [field for field in required_fields if field not in evaluation]
                
                if not missing_fields:
                    score = evaluation.get("score", 0)
                    passed = evaluation.get("passed", False)
                    
                    self.log_test("Prompt Evaluation", True, f"AI evaluation completed - Score: {score}/100, Passed: {passed}")
                    
                    # Log evaluation details
                    print(f"  📊 Score: {score}/100")
                    print(f"  ✅ Passed: {passed}")
                    print(f"  📝 Feedback: {evaluation.get('feedback', '')[:100]}...")
                    
                    return evaluation
                else:
                    self.log_test("Prompt Evaluation", False, f"Missing required fields: {missing_fields}", evaluation)
                    return None
            else:
                self.log_test("Prompt Evaluation", False, f"Status: {response.status_code}", response.json())
                return None
        except Exception as e:
            self.log_test("Prompt Evaluation", False, f"Error: {str(e)}")
            return None
    
    def test_quiz_questions(self):
        """Test 5a: GET /api/lessons/les_001/quiz - Verify quiz questions are returned (without correct answers)"""
        try:
            response = self.session.get(f"{self.base_url}/lessons/les_001/quiz")
            
            if response.status_code == 200:
                questions = response.json()
                
                if isinstance(questions, list) and len(questions) > 0:
                    # Verify questions don't include correct answers
                    has_correct_answers = any("correct_answer" in q for q in questions)
                    
                    if not has_correct_answers:
                        self.log_test("Quiz Questions", True, f"Found {len(questions)} quiz questions (correct answers properly hidden)")
                        
                        # Log question details
                        for i, q in enumerate(questions, 1):
                            print(f"  ❓ Question {i}: {q.get('question', 'Unknown')[:50]}...")
                            print(f"     Options: {len(q.get('options', []))}")
                        
                        return questions
                    else:
                        self.log_test("Quiz Questions", False, "Quiz questions include correct answers (security issue)", questions)
                        return None
                else:
                    self.log_test("Quiz Questions", False, f"Expected array of questions, got: {type(questions)}", questions)
                    return None
            else:
                self.log_test("Quiz Questions", False, f"Status: {response.status_code}", response.json())
                return None
        except Exception as e:
            self.log_test("Quiz Questions", False, f"Error: {str(e)}")
            return None
    
    def test_quiz_submission(self, questions):
        """Test 5b: POST /api/lessons/les_001/quiz - Check quiz result (score, feedback, passed)"""
        if not questions:
            self.log_test("Quiz Submission", False, "Cannot test quiz submission without questions")
            return None
            
        try:
            # Create sample answers (choose first option for all questions)
            answers = {}
            for q in questions:
                answers[q["question_id"]] = 0  # Choose first option
            
            payload = {
                "lesson_id": "les_001",
                "answers": answers
            }
            
            response = self.session.post(
                f"{self.base_url}/lessons/les_001/quiz",
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Check required fields
                required_fields = ["score", "passed", "feedback"]
                missing_fields = [field for field in required_fields if field not in result]
                
                if not missing_fields:
                    score = result.get("score", 0)
                    passed = result.get("passed", False)
                    total = result.get("total", 0)
                    
                    self.log_test("Quiz Submission", True, f"Quiz completed - Score: {score}%, Passed: {passed}")
                    
                    # Log quiz result details
                    print(f"  📊 Score: {score}% ({result.get('correct', 0)}/{total})")
                    print(f"  ✅ Passed: {passed}")
                    print(f"  📝 Feedback items: {len(result.get('feedback', []))}")
                    
                    return result
                else:
                    self.log_test("Quiz Submission", False, f"Missing required fields in response", result)
                    return None
            elif response.status_code == 403:
                # Need to complete applied learning first
                self.log_test("Quiz Submission", False, "Need to complete applied learning exercise first (expected behavior)", response.json())
                return None
            else:
                self.log_test("Quiz Submission", False, f"Status: {response.status_code}", response.json())
                return None
        except Exception as e:
            self.log_test("Quiz Submission", False, f"Error: {str(e)}")
            return None
    
    def test_lesson_status(self):
        """Test 6: GET /api/lessons/les_001/status - Verify status tracking works"""
        try:
            response = self.session.get(f"{self.base_url}/lessons/les_001/status")
            
            if response.status_code == 200:
                status = response.json()
                
                # Check expected fields
                expected_fields = ["applied_learning_completed", "quiz_completed", "completed"]
                missing_fields = [field for field in expected_fields if field not in status]
                
                if not missing_fields:
                    al_completed = status.get("applied_learning_completed", False)
                    quiz_completed = status.get("quiz_completed", False)
                    lesson_completed = status.get("completed", False)
                    
                    self.log_test("Lesson Status", True, f"Status tracking working - AL: {al_completed}, Quiz: {quiz_completed}, Complete: {lesson_completed}")
                    
                    # Log status details
                    print(f"  🎯 Applied Learning: {al_completed}")
                    print(f"  ❓ Quiz: {quiz_completed}")
                    print(f"  ✅ Lesson Complete: {lesson_completed}")
                    if status.get("score"):
                        print(f"  📊 Score: {status.get('score')}%")
                    
                    return status
                else:
                    self.log_test("Lesson Status", False, f"Missing expected fields: {missing_fields}", status)
                    return None
            else:
                self.log_test("Lesson Status", False, f"Status: {response.status_code}", response.json())
                return None
        except Exception as e:
            self.log_test("Lesson Status", False, f"Error: {str(e)}")
            return None
    
    def test_api_health(self):
        """Test API health endpoints"""
        try:
            # Test root endpoint
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                self.log_test("API Root", True, "Root endpoint accessible")
            else:
                self.log_test("API Root", False, f"Status: {response.status_code}")
            
            # Test health endpoint
            response = self.session.get(f"{self.base_url}/health")
            if response.status_code == 200:
                health_data = response.json()
                self.log_test("API Health", True, f"Health check passed: {health_data.get('status')}")
            else:
                self.log_test("API Health", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("API Health", False, f"Error: {str(e)}")
    
    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting E-Quipped Backend API Tests")
        print(f"🌐 Testing against: {BACKEND_URL}")
        print("=" * 60)
        
        # Test API health first
        self.test_api_health()
        
        # Authenticate as admin
        if not self.authenticate_admin():
            print("❌ Cannot proceed without authentication")
            return False
        
        # Test 1: Modules loading
        modules = self.test_modules_loading()
        
        # Test 2: Lesson retrieval  
        lesson = self.test_lesson_retrieval()
        
        # Test 3: Applied learning exercise
        exercise = self.test_applied_learning_exercise()
        
        # Test 4: Prompt evaluation
        evaluation = self.test_prompt_evaluation()
        
        # Test 5a: Quiz questions
        questions = self.test_quiz_questions()
        
        # Test 5b: Quiz submission
        quiz_result = self.test_quiz_submission(questions)
        
        # Test 6: Lesson status
        status = self.test_lesson_status()
        
        print("\n" + "=" * 60)
        self.print_summary()
        
        return True
    
    def print_summary(self):
        """Print test summary"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"📊 TEST SUMMARY")
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")

def main():
    """Main test runner"""
    tester = APITester(BACKEND_URL)
    tester.run_all_tests()
    
    # Return appropriate exit code
    failed_tests = sum(1 for result in tester.test_results if not result["success"])
    return 0 if failed_tests == 0 else 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)