#!/usr/bin/env python3
"""
Alex AI Automated Security Validation Suite
Comprehensive automated testing to validate security implementations
"""

import os
import sys
import json
import time
import requests
import subprocess
import threading
from datetime import datetime
from typing import Dict, List, Any, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed

class AutomatedSecurityValidator:
    def __init__(self):
        self.test_results = []
        self.start_time = time.time()
        self.base_url = "http://localhost:3000"  # Adjust as needed
        self.test_data = self.initialize_test_data()
        
    def initialize_test_data(self) -> Dict[str, Any]:
        """Initialize test data for security validation"""
        return {
            "sql_injection_payloads": [
                "'; DROP TABLE users; --",
                "1' OR '1'='1",
                "1' UNION SELECT * FROM passwords --",
                "1'; INSERT INTO users VALUES ('hacker', 'password'); --",
                "1' AND (SELECT COUNT(*) FROM users) > 0 --"
            ],
            "xss_payloads": [
                "<script>alert('XSS')</script>",
                "<img src=x onerror=alert('XSS')>",
                "<svg onload=alert('XSS')>",
                "javascript:alert('XSS')",
                "<iframe src=javascript:alert('XSS')></iframe>"
            ],
            "authentication_test_users": [
                {"username": "testuser1", "email": "test1@example.com", "password": "TestPass123!"},
                {"username": "testuser2", "email": "test2@example.com", "password": "WeakPass"},
                {"username": "testuser3", "email": "test3@example.com", "password": "TestPass123!"}
            ],
            "sensitive_data_samples": [
                "My credit card is 4111-1111-1111-1111",
                "SSN: 123-45-6789",
                "Email: john.doe@example.com",
                "Phone: (555) 123-4567",
                "API_KEY=sk-1234567890abcdef"
            ],
            "api_endpoints": [
                "/api/auth/login",
                "/api/auth/register",
                "/api/users",
                "/api/data",
                "/api/security/status"
            ]
        }
    
    def run_comprehensive_validation(self) -> Dict[str, Any]:
        """Run comprehensive automated security validation"""
        print("🛡️  ALEX AI AUTOMATED SECURITY VALIDATION SUITE")
        print("=" * 60)
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Test 1: SQL Injection Prevention
        self.test_sql_injection_prevention()
        
        # Test 2: XSS Prevention
        self.test_xss_prevention()
        
        # Test 3: Authentication System
        self.test_authentication_system()
        
        # Test 4: Data Loss Prevention
        self.test_data_loss_prevention()
        
        # Test 5: API Security
        self.test_api_security()
        
        # Test 6: Rate Limiting
        self.test_rate_limiting()
        
        # Test 7: Security Headers
        self.test_security_headers()
        
        # Test 8: Input Validation
        self.test_input_validation()
        
        # Test 9: Session Management
        self.test_session_management()
        
        # Test 10: Error Handling
        self.test_error_handling()
        
        # Generate comprehensive report
        return self.generate_validation_report()
    
    def test_sql_injection_prevention(self):
        """Test SQL injection prevention with real payloads"""
        print("🔍 Testing SQL Injection Prevention...")
        
        test_results = {
            "test_name": "SQL Injection Prevention",
            "passed": 0,
            "failed": 0,
            "details": []
        }
        
        for payload in self.test_data["sql_injection_payloads"]:
            try:
                # Test with different endpoints
                for endpoint in ["/api/users", "/api/data", "/api/search"]:
                    response = self.make_request("POST", endpoint, {
                        "query": payload,
                        "id": payload,
                        "search": payload
                    })
                    
                    # Check if request was blocked or sanitized
                    if response.get("status_code") == 400 or "error" in response.get("body", "").lower():
                        test_results["passed"] += 1
                        test_results["details"].append(f"✅ Blocked SQL injection: {payload[:30]}...")
                    else:
                        test_results["failed"] += 1
                        test_results["details"].append(f"❌ Failed to block: {payload[:30]}...")
                        
            except Exception as e:
                test_results["failed"] += 1
                test_results["details"].append(f"❌ Error testing {payload[:30]}...: {str(e)}")
        
        self.test_results.append(test_results)
        print(f"   Results: {test_results['passed']} passed, {test_results['failed']} failed")
        print()
    
    def test_xss_prevention(self):
        """Test XSS prevention with real payloads"""
        print("🔍 Testing XSS Prevention...")
        
        test_results = {
            "test_name": "XSS Prevention",
            "passed": 0,
            "failed": 0,
            "details": []
        }
        
        for payload in self.test_data["xss_payloads"]:
            try:
                # Test with different endpoints
                for endpoint in ["/api/content", "/api/comments", "/api/profile"]:
                    response = self.make_request("POST", endpoint, {
                        "content": payload,
                        "comment": payload,
                        "description": payload
                    })
                    
                    # Check if XSS was sanitized
                    response_body = response.get("body", "")
                    if "<script>" not in response_body and "javascript:" not in response_body:
                        test_results["passed"] += 1
                        test_results["details"].append(f"✅ Sanitized XSS: {payload[:30]}...")
                    else:
                        test_results["failed"] += 1
                        test_results["details"].append(f"❌ XSS not sanitized: {payload[:30]}...")
                        
            except Exception as e:
                test_results["failed"] += 1
                test_results["details"].append(f"❌ Error testing {payload[:30]}...: {str(e)}")
        
        self.test_results.append(test_results)
        print(f"   Results: {test_results['passed']} passed, {test_results['failed']} failed")
        print()
    
    def test_authentication_system(self):
        """Test authentication system with real scenarios"""
        print("🔍 Testing Authentication System...")
        
        test_results = {
            "test_name": "Authentication System",
            "passed": 0,
            "failed": 0,
            "details": []
        }
        
        # Test user registration
        for user in self.test_data["authentication_test_users"]:
            try:
                response = self.make_request("POST", "/api/auth/register", user)
                
                if user["password"] == "WeakPass":
                    # Weak password should be rejected
                    if response.get("status_code") == 400:
                        test_results["passed"] += 1
                        test_results["details"].append(f"✅ Rejected weak password for {user['username']}")
                    else:
                        test_results["failed"] += 1
                        test_results["details"].append(f"❌ Accepted weak password for {user['username']}")
                else:
                    # Strong password should be accepted
                    if response.get("status_code") == 200:
                        test_results["passed"] += 1
                        test_results["details"].append(f"✅ Registered user {user['username']}")
                    else:
                        test_results["failed"] += 1
                        test_results["details"].append(f"❌ Failed to register {user['username']}")
                        
            except Exception as e:
                test_results["failed"] += 1
                test_results["details"].append(f"❌ Error testing {user['username']}: {str(e)}")
        
        # Test login attempts
        for user in self.test_data["authentication_test_users"]:
            try:
                response = self.make_request("POST", "/api/auth/login", {
                    "username": user["username"],
                    "password": user["password"]
                })
                
                if user["password"] == "WeakPass":
                    # Should fail due to weak password
                    if response.get("status_code") == 400:
                        test_results["passed"] += 1
                        test_results["details"].append(f"✅ Blocked weak password login for {user['username']}")
                    else:
                        test_results["failed"] += 1
                        test_results["details"].append(f"❌ Allowed weak password login for {user['username']}")
                else:
                    # Should succeed with strong password
                    if response.get("status_code") == 200:
                        test_results["passed"] += 1
                        test_results["details"].append(f"✅ Successful login for {user['username']}")
                    else:
                        test_results["failed"] += 1
                        test_results["details"].append(f"❌ Failed login for {user['username']}")
                        
            except Exception as e:
                test_results["failed"] += 1
                test_results["details"].append(f"❌ Error testing login for {user['username']}: {str(e)}")
        
        self.test_results.append(test_results)
        print(f"   Results: {test_results['passed']} passed, {test_results['failed']} failed")
        print()
    
    def test_data_loss_prevention(self):
        """Test data loss prevention with sensitive data"""
        print("🔍 Testing Data Loss Prevention...")
        
        test_results = {
            "test_name": "Data Loss Prevention",
            "passed": 0,
            "failed": 0,
            "details": []
        }
        
        for sensitive_data in self.test_data["sensitive_data_samples"]:
            try:
                # Test data submission
                response = self.make_request("POST", "/api/data", {
                    "content": sensitive_data,
                    "description": sensitive_data,
                    "notes": sensitive_data
                })
                
                # Check if sensitive data was detected and redacted
                response_body = response.get("body", "")
                if "REDACTED" in response_body or "MASKED" in response_body:
                    test_results["passed"] += 1
                    test_results["details"].append(f"✅ Detected and redacted sensitive data")
                else:
                    test_results["failed"] += 1
                    test_results["details"].append(f"❌ Failed to detect sensitive data: {sensitive_data[:30]}...")
                    
            except Exception as e:
                test_results["failed"] += 1
                test_results["details"].append(f"❌ Error testing sensitive data: {str(e)}")
        
        self.test_results.append(test_results)
        print(f"   Results: {test_results['passed']} passed, {test_results['failed']} failed")
        print()
    
    def test_api_security(self):
        """Test API security measures"""
        print("🔍 Testing API Security...")
        
        test_results = {
            "test_name": "API Security",
            "passed": 0,
            "failed": 0,
            "details": []
        }
        
        # Test JWT token validation
        try:
            # Test without token
            response = self.make_request("GET", "/api/users", {})
            if response.get("status_code") == 401:
                test_results["passed"] += 1
                test_results["details"].append("✅ Blocked request without JWT token")
            else:
                test_results["failed"] += 1
                test_results["details"].append("❌ Allowed request without JWT token")
        except Exception as e:
            test_results["failed"] += 1
            test_results["details"].append(f"❌ Error testing JWT validation: {str(e)}")
        
        # Test with invalid token
        try:
            response = self.make_request("GET", "/api/users", {}, headers={
                "Authorization": "Bearer invalid-token"
            })
            if response.get("status_code") == 401:
                test_results["passed"] += 1
                test_results["details"].append("✅ Blocked request with invalid JWT token")
            else:
                test_results["failed"] += 1
                test_results["details"].append("❌ Allowed request with invalid JWT token")
        except Exception as e:
            test_results["failed"] += 1
            test_results["details"].append(f"❌ Error testing invalid JWT: {str(e)}")
        
        self.test_results.append(test_results)
        print(f"   Results: {test_results['passed']} passed, {test_results['failed']} failed")
        print()
    
    def test_rate_limiting(self):
        """Test rate limiting functionality"""
        print("🔍 Testing Rate Limiting...")
        
        test_results = {
            "test_name": "Rate Limiting",
            "passed": 0,
            "failed": 0,
            "details": []
        }
        
        try:
            # Send multiple requests quickly
            success_count = 0
            blocked_count = 0
            
            for i in range(150):  # Exceed rate limit
                response = self.make_request("GET", "/api/status", {})
                if response.get("status_code") == 200:
                    success_count += 1
                elif response.get("status_code") == 429:
                    blocked_count += 1
                time.sleep(0.01)  # Small delay
            
            if blocked_count > 0:
                test_results["passed"] += 1
                test_results["details"].append(f"✅ Rate limiting working: {blocked_count} requests blocked")
            else:
                test_results["failed"] += 1
                test_results["details"].append("❌ Rate limiting not working")
                
        except Exception as e:
            test_results["failed"] += 1
            test_results["details"].append(f"❌ Error testing rate limiting: {str(e)}")
        
        self.test_results.append(test_results)
        print(f"   Results: {test_results['passed']} passed, {test_results['failed']} failed")
        print()
    
    def test_security_headers(self):
        """Test security headers"""
        print("🔍 Testing Security Headers...")
        
        test_results = {
            "test_name": "Security Headers",
            "passed": 0,
            "failed": 0,
            "details": []
        }
        
        required_headers = [
            "Content-Security-Policy",
            "X-Frame-Options",
            "X-Content-Type-Options",
            "X-XSS-Protection",
            "Strict-Transport-Security"
        ]
        
        try:
            response = self.make_request("GET", "/api/status", {})
            headers = response.get("headers", {})
            
            for header in required_headers:
                if header in headers:
                    test_results["passed"] += 1
                    test_results["details"].append(f"✅ {header} present")
                else:
                    test_results["failed"] += 1
                    test_results["details"].append(f"❌ {header} missing")
                    
        except Exception as e:
            test_results["failed"] += 1
            test_results["details"].append(f"❌ Error testing security headers: {str(e)}")
        
        self.test_results.append(test_results)
        print(f"   Results: {test_results['passed']} passed, {test_results['failed']} failed")
        print()
    
    def test_input_validation(self):
        """Test input validation"""
        print("🔍 Testing Input Validation...")
        
        test_results = {
            "test_name": "Input Validation",
            "passed": 0,
            "failed": 0,
            "details": []
        }
        
        invalid_inputs = [
            {"email": "invalid-email"},
            {"username": ""},
            {"password": "123"},
            {"age": "not-a-number"},
            {"id": -1}
        ]
        
        for invalid_input in invalid_inputs:
            try:
                response = self.make_request("POST", "/api/users", invalid_input)
                if response.get("status_code") == 400:
                    test_results["passed"] += 1
                    test_results["details"].append(f"✅ Rejected invalid input: {invalid_input}")
                else:
                    test_results["failed"] += 1
                    test_results["details"].append(f"❌ Accepted invalid input: {invalid_input}")
            except Exception as e:
                test_results["failed"] += 1
                test_results["details"].append(f"❌ Error testing input validation: {str(e)}")
        
        self.test_results.append(test_results)
        print(f"   Results: {test_results['passed']} passed, {test_results['failed']} failed")
        print()
    
    def test_session_management(self):
        """Test session management"""
        print("🔍 Testing Session Management...")
        
        test_results = {
            "test_name": "Session Management",
            "passed": 0,
            "failed": 0,
            "details": []
        }
        
        try:
            # Test session timeout
            response = self.make_request("GET", "/api/session", {})
            if "expires" in response.get("body", ""):
                test_results["passed"] += 1
                test_results["details"].append("✅ Session has expiration")
            else:
                test_results["failed"] += 1
                test_results["details"].append("❌ Session missing expiration")
                
        except Exception as e:
            test_results["failed"] += 1
            test_results["details"].append(f"❌ Error testing session management: {str(e)}")
        
        self.test_results.append(test_results)
        print(f"   Results: {test_results['passed']} passed, {test_results['failed']} failed")
        print()
    
    def test_error_handling(self):
        """Test error handling"""
        print("🔍 Testing Error Handling...")
        
        test_results = {
            "test_name": "Error Handling",
            "passed": 0,
            "failed": 0,
            "details": []
        }
        
        try:
            # Test 404 handling
            response = self.make_request("GET", "/api/nonexistent", {})
            if response.get("status_code") == 404:
                test_results["passed"] += 1
                test_results["details"].append("✅ Proper 404 handling")
            else:
                test_results["failed"] += 1
                test_results["details"].append("❌ Improper 404 handling")
                
        except Exception as e:
            test_results["failed"] += 1
            test_results["details"].append(f"❌ Error testing error handling: {str(e)}")
        
        self.test_results.append(test_results)
        print(f"   Results: {test_results['passed']} passed, {test_results['failed']} failed")
        print()
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> Dict[str, Any]:
        """Make HTTP request to test endpoint"""
        try:
            url = f"{self.base_url}{endpoint}"
            request_headers = {"Content-Type": "application/json"}
            if headers:
                request_headers.update(headers)
            
            if method.upper() == "GET":
                response = requests.get(url, headers=request_headers, timeout=10)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=request_headers, timeout=10)
            else:
                response = requests.request(method, url, json=data, headers=request_headers, timeout=10)
            
            return {
                "status_code": response.status_code,
                "headers": dict(response.headers),
                "body": response.text
            }
        except requests.exceptions.RequestException as e:
            return {
                "status_code": 0,
                "headers": {},
                "body": f"Request failed: {str(e)}"
            }
    
    def generate_validation_report(self) -> Dict[str, Any]:
        """Generate comprehensive validation report"""
        total_passed = sum(result["passed"] for result in self.test_results)
        total_failed = sum(result["failed"] for result in self.test_results)
        total_tests = total_passed + total_failed
        
        overall_score = (total_passed / total_tests * 100) if total_tests > 0 else 0
        
        end_time = time.time()
        duration = end_time - self.start_time
        
        # Determine overall status
        failed_tests = [result for result in self.test_results if result["failed"] > 0]
        overall_status = "PASS" if len(failed_tests) == 0 else "FAIL"
        
        # Generate recommendations
        recommendations = []
        if overall_score < 80:
            recommendations.append("Security validation score is below 80% - immediate action required")
        
        if failed_tests:
            recommendations.append(f"Failed tests: {', '.join([t['test_name'] for t in failed_tests])}")
        
        if overall_score < 60:
            recommendations.append("Critical security issues detected - system not production ready")
        elif overall_score < 80:
            recommendations.append("Security improvements needed before production deployment")
        else:
            recommendations.append("Security systems are functioning well - ready for production")
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "duration_seconds": round(duration, 2),
            "overall_status": overall_status,
            "overall_score": round(overall_score, 1),
            "total_tests": total_tests,
            "total_passed": total_passed,
            "total_failed": total_failed,
            "test_results": self.test_results,
            "recommendations": recommendations,
            "summary": f"Alex AI Security Validation: {overall_status} - {overall_score}% score ({total_passed}/{total_tests} tests passed)"
        }
        
        return report

def main():
    """Main function to run automated security validation"""
    validator = AutomatedSecurityValidator()
    
    try:
        report = validator.run_comprehensive_validation()
        
        # Print summary
        print("=" * 60)
        print("🛡️  ALEX AI SECURITY VALIDATION SUMMARY")
        print("=" * 60)
        print(f"Overall Status: {report['overall_status']}")
        print(f"Overall Score: {report['overall_score']}%")
        print(f"Tests Passed: {report['total_passed']}/{report['total_tests']}")
        print(f"Duration: {report['duration_seconds']} seconds")
        print()
        
        if report['recommendations']:
            print("📋 RECOMMENDATIONS:")
            for rec in report['recommendations']:
                print(f"   • {rec}")
            print()
        
        # Save report
        report_file = f"alex_ai_security_validation_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"📄 Detailed report saved to: {report_file}")
        
        # Return appropriate exit code
        return 0 if report['overall_status'] == 'PASS' else 1
        
    except Exception as e:
        print(f"❌ Security validation failed with error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
