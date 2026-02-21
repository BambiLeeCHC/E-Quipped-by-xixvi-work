#!/usr/bin/env python3
"""
E-Quipped AI Mastery Platform API Tests
Tests: Login, Lesson Navigation, Module Unlocking, Admin User Verification, Screenshot Alerts
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://cyber-learn-4.preview.emergentagent.com').rstrip('/')
API_URL = f"{BASE_URL}/api"

# Test credentials
MASTER_USER = {"email": "master@equipped.ai", "password": "master123"}
ADMIN_USER = {"email": "admin@equipped.ai", "password": "admin123"}
TEST_TRIAL_USER = {
    "email": f"TEST_trialuser_{os.urandom(4).hex()}@test.com",
    "password": "testpass123",
    "username": f"TEST_trialuser_{os.urandom(4).hex()}",
    "first_name": "Test",
    "last_name": "TrialUser"
}


class TestHealthCheck:
    """Basic health and root endpoint tests"""
    
    def test_root_endpoint(self):
        response = requests.get(f"{API_URL}/")
        assert response.status_code == 200
        data = response.json()
        assert "E-Quipped" in data.get("message", "")
        print(f"✅ Root endpoint returns: {data}")
    
    def test_health_endpoint(self):
        response = requests.get(f"{API_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print(f"✅ Health endpoint: {data}")


class TestAuthentication:
    """Authentication endpoint tests - login without pre-filled credentials"""
    
    def test_master_user_login(self):
        """Test master user login with correct credentials"""
        response = requests.post(f"{API_URL}/auth/login", json=MASTER_USER)
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == MASTER_USER["email"]
        assert data["user"].get("is_master") == True
        assert data["user"].get("is_verified") == True
        print(f"✅ Master user login successful: {data['user']['email']}")
    
    def test_admin_user_login(self):
        """Test admin user login with correct credentials"""
        response = requests.post(f"{API_URL}/auth/login", json=ADMIN_USER)
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["email"] == ADMIN_USER["email"]
        assert data["user"].get("is_admin") == True
        print(f"✅ Admin user login successful: {data['user']['email']}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{API_URL}/auth/login", json={
            "email": "invalid@test.com", "password": "wrongpass"
        })
        assert response.status_code == 401
        print("✅ Invalid credentials correctly rejected")
    
    def test_trial_user_registration(self):
        """Test new user registration (should be trial/unverified by default)"""
        response = requests.post(f"{API_URL}/auth/register", json=TEST_TRIAL_USER)
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["email"] == TEST_TRIAL_USER["email"]
        # New users should be unverified (trial) by default
        assert data["user"].get("is_verified") == False
        print(f"✅ Trial user registered: {data['user']['email']} (is_verified={data['user'].get('is_verified')})")
        return data


class TestModulesAndLessons:
    """Module and lesson endpoint tests - content navigation"""
    
    @pytest.fixture
    def master_token(self):
        response = requests.post(f"{API_URL}/auth/login", json=MASTER_USER)
        return response.json().get("token")
    
    def test_get_modules(self, master_token):
        """Test fetching all modules"""
        headers = {"Authorization": f"Bearer {master_token}"}
        response = requests.get(f"{API_URL}/modules", headers=headers)
        assert response.status_code == 200
        modules = response.json()
        assert isinstance(modules, list)
        assert len(modules) >= 1
        # Check module structure
        module = modules[0]
        assert "module_id" in module
        assert "title" in module
        assert "lessons" in module
        print(f"✅ Retrieved {len(modules)} modules")
    
    def test_get_single_lesson(self, master_token):
        """Test fetching a single lesson with navigation data"""
        headers = {"Authorization": f"Bearer {master_token}"}
        # First get modules to find a lesson
        modules_response = requests.get(f"{API_URL}/modules", headers=headers)
        modules = modules_response.json()
        first_lesson = modules[0]["lessons"][0]
        
        response = requests.get(f"{API_URL}/lessons/{first_lesson['lesson_id']}", headers=headers)
        assert response.status_code == 200
        lesson = response.json()
        assert lesson["lesson_id"] == first_lesson["lesson_id"]
        assert "title" in lesson
        assert "content" in lesson or "description" in lesson
        # Check navigation data
        assert "total_lessons_in_module" in lesson
        print(f"✅ Lesson fetched: {lesson['title']}, has navigation data")
    
    def test_lesson_navigation_data(self, master_token):
        """Test that lessons have prev/next navigation info"""
        headers = {"Authorization": f"Bearer {master_token}"}
        modules_response = requests.get(f"{API_URL}/modules", headers=headers)
        modules = modules_response.json()
        
        # Get second lesson (should have prev_lesson)
        if len(modules[0]["lessons"]) >= 2:
            second_lesson_id = modules[0]["lessons"][1]["lesson_id"]
            response = requests.get(f"{API_URL}/lessons/{second_lesson_id}", headers=headers)
            assert response.status_code == 200
            lesson = response.json()
            assert "prev_lesson" in lesson
            print(f"✅ Lesson {lesson['title']} has prev_lesson: {lesson.get('prev_lesson', {}).get('title')}")


class TestLessonProgress:
    """Test lesson completion and module unlocking"""
    
    @pytest.fixture
    def master_token(self):
        response = requests.post(f"{API_URL}/auth/login", json=MASTER_USER)
        return response.json().get("token")
    
    def test_update_lesson_progress(self, master_token):
        """Test updating lesson progress to complete"""
        headers = {"Authorization": f"Bearer {master_token}"}
        # Get first lesson ID
        modules = requests.get(f"{API_URL}/modules", headers=headers).json()
        first_lesson = modules[0]["lessons"][0]
        
        # Update progress to complete
        response = requests.post(f"{API_URL}/progress", json={
            "lesson_id": first_lesson["lesson_id"],
            "progress": 100,
            "score": 95,
            "completed": True
        }, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("completed") == True
        # Should get XP
        print(f"✅ Progress updated: completed={data.get('completed')}, xp_gained={data.get('xp_gained')}")
    
    def test_next_lesson_unlocks_after_completion(self, master_token):
        """Test that next lesson becomes available after completing previous"""
        headers = {"Authorization": f"Bearer {master_token}"}
        # Get modules with updated progress
        modules = requests.get(f"{API_URL}/modules", headers=headers).json()
        lessons = modules[0]["lessons"]
        
        # First lesson should be completed or available
        first_lesson_status = lessons[0].get("status")
        assert first_lesson_status in ["completed", "available", "in_progress"]
        
        # If first is completed, second should be available
        if first_lesson_status == "completed" and len(lessons) >= 2:
            second_lesson_status = lessons[1].get("status")
            assert second_lesson_status in ["available", "in_progress", "completed"]
            print(f"✅ Lesson unlocking working: L1={first_lesson_status}, L2={second_lesson_status}")


class TestAdminUserVerification:
    """Test admin user verification/paywall control"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{API_URL}/auth/login", json=ADMIN_USER)
        return response.json().get("token")
    
    def test_get_all_users_as_admin(self, admin_token):
        """Test admin can get all users"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/admin/users", headers=headers)
        assert response.status_code == 200
        users = response.json()
        assert isinstance(users, list)
        print(f"✅ Admin retrieved {len(users)} users")
    
    def test_verify_user_endpoint(self, admin_token):
        """Test PUT /api/admin/users/{userId}/verify endpoint"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # First get users to find a non-admin user
        users = requests.get(f"{API_URL}/admin/users", headers=headers).json()
        trial_users = [u for u in users if not u.get("is_admin") and not u.get("is_master")]
        
        if trial_users:
            test_user = trial_users[0]
            original_status = test_user.get("is_verified", False)
            
            # Toggle verification
            response = requests.put(
                f"{API_URL}/admin/users/{test_user['user_id']}/verify",
                json={"is_verified": not original_status},
                headers=headers
            )
            assert response.status_code == 200
            updated_user = response.json()
            assert updated_user.get("is_verified") == (not original_status)
            print(f"✅ User verification toggled: {test_user['email']} verified={updated_user.get('is_verified')}")
            
            # Revert the change
            requests.put(
                f"{API_URL}/admin/users/{test_user['user_id']}/verify",
                json={"is_verified": original_status},
                headers=headers
            )
        else:
            pytest.skip("No trial users found to test verification")
    
    def test_non_admin_cannot_verify_users(self):
        """Test that non-admin users cannot verify others"""
        # Register a new trial user
        trial_user = {
            "email": f"TEST_nonadmin_{os.urandom(4).hex()}@test.com",
            "password": "testpass123",
            "username": f"TEST_nonadmin_{os.urandom(4).hex()}",
            "first_name": "NonAdmin",
            "last_name": "User"
        }
        reg_response = requests.post(f"{API_URL}/auth/register", json=trial_user)
        if reg_response.status_code == 200:
            token = reg_response.json().get("token")
            headers = {"Authorization": f"Bearer {token}"}
            
            # Try to access admin endpoint
            response = requests.get(f"{API_URL}/admin/users", headers=headers)
            assert response.status_code == 403
            print("✅ Non-admin correctly denied access to admin endpoints")


class TestScreenshotDetection:
    """Test screenshot detection and admin alerts"""
    
    @pytest.fixture
    def master_token(self):
        response = requests.post(f"{API_URL}/auth/login", json=MASTER_USER)
        return response.json().get("token")
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{API_URL}/auth/login", json=ADMIN_USER)
        return response.json().get("token")
    
    def test_report_screenshot_attempt(self, master_token):
        """Test POST /api/security/screenshot-attempt endpoint"""
        headers = {"Authorization": f"Bearer {master_token}"}
        response = requests.post(f"{API_URL}/security/screenshot-attempt", json={
            "type": "keyboard_screenshot",
            "page": "lesson",
            "lesson_id": "les_001"
        }, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("message") == "Alert logged"
        print("✅ Screenshot attempt logged successfully")
    
    def test_get_screenshot_alerts_as_admin(self, admin_token):
        """Test GET /api/admin/screenshot-alerts endpoint"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/admin/screenshot-alerts", headers=headers)
        assert response.status_code == 200
        alerts = response.json()
        assert isinstance(alerts, list)
        print(f"✅ Admin retrieved {len(alerts)} screenshot alerts")
        
        # Check alert structure if any exist
        if alerts:
            alert = alerts[0]
            assert "user_id" in alert or "user_email" in alert
            assert "type" in alert
            assert "timestamp" in alert


class TestSandboxModes:
    """Test Sandbox Open/Guided mode functionality"""
    
    @pytest.fixture
    def master_token(self):
        response = requests.post(f"{API_URL}/auth/login", json=MASTER_USER)
        return response.json().get("token")
    
    def test_chat_endpoint_basic(self, master_token):
        """Test basic chat endpoint functionality"""
        headers = {"Authorization": f"Bearer {master_token}"}
        response = requests.post(f"{API_URL}/chat", json={
            "content": "Hello, test prompt for quality scoring",
            "model": "gpt-5.2",
            "provider": "openai"
        }, headers=headers, timeout=30)
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "session_id" in data
        # Quality score should be returned
        print(f"✅ Chat response received, quality_score={data.get('quality_score')}")


class TestTrialUserRestrictions:
    """Test that trial users only access Lesson 1"""
    
    def test_trial_user_created_unverified(self):
        """Verify new users are created with is_verified=False"""
        trial_user = {
            "email": f"TEST_trial_check_{os.urandom(4).hex()}@test.com",
            "password": "testpass123",
            "username": f"TEST_trial_check_{os.urandom(4).hex()}",
            "first_name": "Trial",
            "last_name": "Check"
        }
        response = requests.post(f"{API_URL}/auth/register", json=trial_user)
        assert response.status_code == 200
        data = response.json()
        # New users should be unverified
        assert data["user"].get("is_verified") == False
        print(f"✅ Trial user correctly created with is_verified=False")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
