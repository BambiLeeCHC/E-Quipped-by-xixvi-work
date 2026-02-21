#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class EQuippedAPITester:
    def __init__(self, base_url="https://ai-tutor-pro-5.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user = None
        self.tests_run = 0
        self.tests_passed = 0
        self.session_id = None

    def log_test(self, name, success=True, message=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {message}")
        else:
            print(f"❌ {name} - FAILED {message}")
        return success

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        req_headers = {'Content-Type': 'application/json'}
        if self.token:
            req_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            req_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=req_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=req_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=req_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=req_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                return self.log_test(name, True, f"Status: {response.status_code}"), response.json() if response.text else {}
            else:
                return self.log_test(name, False, f"Expected {expected_status}, got {response.status_code} - {response.text[:200]}"), {}

        except Exception as e:
            return self.log_test(name, False, f"Error: {str(e)}"), {}

    def test_health_check(self):
        """Test basic health endpoints"""
        print("\n🏥 === HEALTH CHECK TESTS ===")
        
        # Test root endpoint
        success, _ = self.run_test("Root endpoint", "GET", "", 200)
        
        # Test health endpoint
        success, _ = self.run_test("Health endpoint", "GET", "health", 200)
        
        return success

    def test_authentication(self):
        """Test authentication endpoints"""
        print("\n🔐 === AUTHENTICATION TESTS ===")
        
        # Test login with admin credentials
        login_success, login_response = self.run_test(
            "Admin Login",
            "POST", 
            "auth/login",
            200,
            data={"email": "admin@equipped.ai", "password": "admin123"}
        )
        
        if login_success and 'token' in login_response:
            self.token = login_response['token']
            self.user = login_response.get('user', {})
            print(f"   ✅ Token acquired: {self.token[:20]}...")
            print(f"   ✅ User: {self.user.get('email', 'Unknown')}")
        
        # Test /me endpoint
        if self.token:
            me_success, me_response = self.run_test(
                "Get Current User (/me)",
                "GET",
                "auth/me", 
                200
            )
            if me_success and me_response.get('email'):
                print(f"   ✅ User authenticated: {me_response.get('email')}")
                return True
        
        return False

    def test_modules_endpoints(self):
        """Test module-related endpoints"""
        print("\n📚 === MODULES TESTS ===")
        
        # Get all modules
        modules_success, modules_response = self.run_test(
            "Get All Modules",
            "GET",
            "modules",
            200
        )
        
        if modules_success and isinstance(modules_response, list) and len(modules_response) > 0:
            print(f"   ✅ Found {len(modules_response)} modules")
            
            # Test individual module
            first_module = modules_response[0]
            if 'slug' in first_module:
                module_success, _ = self.run_test(
                    f"Get Module by Slug ({first_module['slug']})",
                    "GET",
                    f"modules/{first_module['slug']}",
                    200
                )
                
                # Check for lessons in module
                if 'lessons' in first_module and len(first_module['lessons']) > 0:
                    print(f"   ✅ Module has {len(first_module['lessons'])} lessons")
                    return True
                else:
                    print("   ⚠️ No lessons found in module")
            
        return modules_success

    def test_lessons_endpoint(self):
        """Test lesson endpoints"""
        print("\n📖 === LESSONS TESTS ===")
        
        # First get modules to find a lesson
        modules_success, modules_response = self.run_test(
            "Get Modules for Lesson Test",
            "GET",
            "modules",
            200
        )
        
        if modules_success and isinstance(modules_response, list):
            for module in modules_response:
                if 'lessons' in module and len(module['lessons']) > 0:
                    lesson_id = module['lessons'][0]['lesson_id']
                    lesson_success, lesson_response = self.run_test(
                        f"Get Lesson ({lesson_id})",
                        "GET",
                        f"lessons/{lesson_id}",
                        200
                    )
                    return lesson_success
        
        return False

    def test_ai_chat_functionality(self):
        """Test AI chat endpoints"""
        print("\n🤖 === AI CHAT TESTS ===")
        
        # Test chat with simple prompt
        chat_data = {
            "content": "Role: You are a helpful AI tutor. Task: Explain what machine learning is in simple terms. Context: For a beginner audience. Constraints: Keep it under 100 words.",
            "model": "gpt-5.2",
            "provider": "openai"
        }
        
        chat_success, chat_response = self.run_test(
            "AI Chat Message",
            "POST",
            "chat",
            200,
            data=chat_data
        )
        
        if chat_success and 'response' in chat_response:
            print(f"   ✅ AI Response: {chat_response['response'][:100]}...")
            if 'session_id' in chat_response:
                self.session_id = chat_response['session_id']
                print(f"   ✅ Session ID: {self.session_id}")
                
                # Test chat history
                history_success, _ = self.run_test(
                    "Get Chat History",
                    "GET",
                    f"chat/history/{self.session_id}",
                    200
                )
                return history_success
        
        return chat_success

    def test_progress_tracking(self):
        """Test progress tracking endpoints"""
        print("\n📊 === PROGRESS TESTS ===")
        
        # Get a lesson first
        modules_success, modules_response = self.run_test(
            "Get Modules for Progress Test",
            "GET", 
            "modules",
            200
        )
        
        if modules_success and isinstance(modules_response, list):
            for module in modules_response:
                if 'lessons' in module and len(module['lessons']) > 0:
                    lesson_id = module['lessons'][0]['lesson_id']
                    
                    # Update progress
                    progress_data = {
                        "lesson_id": lesson_id,
                        "progress": 50,
                        "score": 85,
                        "completed": False
                    }
                    
                    progress_success, progress_response = self.run_test(
                        "Update Lesson Progress",
                        "POST",
                        "progress",
                        200,
                        data=progress_data
                    )
                    return progress_success
        
        return False

    def test_admin_functionality(self):
        """Test admin endpoints"""
        print("\n👑 === ADMIN TESTS ===")
        
        if not self.user or not self.user.get('is_admin'):
            print("   ⚠️ Skipping admin tests - user is not admin")
            return True
        
        # Test analytics endpoint
        analytics_success, analytics_response = self.run_test(
            "Admin Analytics",
            "GET",
            "admin/analytics", 
            200
        )
        
        if analytics_success and isinstance(analytics_response, dict):
            expected_fields = ['total_users', 'active_users', 'completion_rates', 'sandbox_sessions']
            for field in expected_fields:
                if field in analytics_response:
                    print(f"   ✅ Analytics has {field}: {analytics_response[field]}")
                else:
                    print(f"   ⚠️ Missing analytics field: {field}")
        
        # Test users endpoint
        users_success, users_response = self.run_test(
            "Admin Get All Users",
            "GET",
            "admin/users",
            200
        )
        
        if users_success and isinstance(users_response, list):
            print(f"   ✅ Found {len(users_response)} total users")
        
        return analytics_success and users_success

    def test_password_recovery(self):
        """Test password recovery functionality"""
        print("\n🔓 === PASSWORD RECOVERY TESTS ===")
        
        recovery_data = {
            "email": "test@example.com",
            "method": "email"
        }
        
        recovery_success, recovery_response = self.run_test(
            "Password Recovery Request",
            "POST",
            "auth/recover",
            200,
            data=recovery_data
        )
        
        return recovery_success

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting E-Quipped AI Mastery Platform API Tests")
        print("=" * 60)
        
        # Run test suites in order
        tests = [
            ("Health Check", self.test_health_check),
            ("Authentication", self.test_authentication),
            ("Modules", self.test_modules_endpoints),
            ("Lessons", self.test_lessons_endpoint),
            ("AI Chat", self.test_ai_chat_functionality),
            ("Progress Tracking", self.test_progress_tracking),
            ("Admin Functionality", self.test_admin_functionality),
            ("Password Recovery", self.test_password_recovery)
        ]
        
        suite_results = []
        for test_name, test_func in tests:
            try:
                result = test_func()
                suite_results.append((test_name, result))
            except Exception as e:
                print(f"❌ {test_name} suite crashed: {str(e)}")
                suite_results.append((test_name, False))
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        for test_name, result in suite_results:
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"{test_name:.<30} {status}")
        
        print(f"\n🎯 Total Tests: {self.tests_run}")
        print(f"✅ Passed: {self.tests_passed}")
        print(f"❌ Failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Return overall success
        return self.tests_passed == self.tests_run

def main():
    tester = EQuippedAPITester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed! API is working correctly.")
        return 0
    else:
        print(f"\n⚠️ {tester.tests_run - tester.tests_passed} tests failed. Check logs above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())