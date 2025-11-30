#!/usr/bin/env python3
"""
Alex AI Security Performance Testing Suite
Test security systems under load and measure performance impact
"""

import os
import sys
import json
import time
import requests
import threading
import statistics
from datetime import datetime
from typing import Dict, List, Any, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed

class SecurityPerformanceTester:
    def __init__(self):
        self.test_results = []
        self.start_time = time.time()
        self.base_url = "http://localhost:3000"  # Adjust as needed
        self.performance_metrics = {}
        
    def run_performance_tests(self) -> Dict[str, Any]:
        """Run comprehensive security performance tests"""
        print("⚡ ALEX AI SECURITY PERFORMANCE TESTING SUITE")
        print("=" * 60)
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Test 1: Baseline Performance (No Security)
        self.test_baseline_performance()
        
        # Test 2: SQL Injection Prevention Performance
        self.test_sql_injection_performance()
        
        # Test 3: XSS Prevention Performance
        self.test_xss_prevention_performance()
        
        # Test 4: Authentication Performance
        self.test_authentication_performance()
        
        # Test 5: Data Loss Prevention Performance
        self.test_dlp_performance()
        
        # Test 6: API Security Performance
        self.test_api_security_performance()
        
        # Test 7: Rate Limiting Performance
        self.test_rate_limiting_performance()
        
        # Test 8: Load Testing with Security
        self.test_load_with_security()
        
        # Test 9: Memory Usage with Security
        self.test_memory_usage()
        
        # Test 10: Concurrent Security Operations
        self.test_concurrent_security()
        
        # Generate performance report
        return self.generate_performance_report()
    
    def test_baseline_performance(self):
        """Test baseline performance without security"""
        print("🔍 Testing Baseline Performance (No Security)...")
        
        test_results = {
            "test_name": "Baseline Performance",
            "requests_per_second": 0,
            "average_response_time": 0,
            "p95_response_time": 0,
            "p99_response_time": 0,
            "error_rate": 0,
            "details": []
        }
        
        try:
            # Test basic endpoint without security
            response_times = []
            errors = 0
            total_requests = 100
            
            start_time = time.time()
            
            for i in range(total_requests):
                try:
                    request_start = time.time()
                    response = requests.get(f"{self.base_url}/api/status", timeout=10)
                    request_end = time.time()
                    
                    response_times.append(request_end - request_start)
                    
                    if response.status_code != 200:
                        errors += 1
                        
                except Exception as e:
                    errors += 1
                    response_times.append(10.0)  # Timeout penalty
            
            end_time = time.time()
            total_time = end_time - start_time
            
            # Calculate metrics
            test_results["requests_per_second"] = total_requests / total_time
            test_results["average_response_time"] = statistics.mean(response_times)
            test_results["p95_response_time"] = self.calculate_percentile(response_times, 95)
            test_results["p99_response_time"] = self.calculate_percentile(response_times, 99)
            test_results["error_rate"] = (errors / total_requests) * 100
            
            test_results["details"].append(f"Total requests: {total_requests}")
            test_results["details"].append(f"Total time: {total_time:.2f}s")
            test_results["details"].append(f"Errors: {errors}")
            
        except Exception as e:
            test_results["details"].append(f"Error: {str(e)}")
        
        self.test_results.append(test_results)
        print(f"   RPS: {test_results['requests_per_second']:.2f}")
        print(f"   Avg Response Time: {test_results['average_response_time']:.3f}s")
        print(f"   Error Rate: {test_results['error_rate']:.2f}%")
        print()
    
    def test_sql_injection_performance(self):
        """Test SQL injection prevention performance"""
        print("🔍 Testing SQL Injection Prevention Performance...")
        
        test_results = {
            "test_name": "SQL Injection Prevention Performance",
            "requests_per_second": 0,
            "average_response_time": 0,
            "p95_response_time": 0,
            "p99_response_time": 0,
            "error_rate": 0,
            "details": []
        }
        
        try:
            # Test with SQL injection payloads
            sql_payloads = [
                "1' OR '1'='1",
                "1' UNION SELECT * FROM users--",
                "1'; DROP TABLE users; --",
                "1' AND (SELECT COUNT(*) FROM users) > 0--",
                "1'; WAITFOR DELAY '00:00:01'--"
            ]
            
            response_times = []
            errors = 0
            total_requests = 50
            
            start_time = time.time()
            
            for i in range(total_requests):
                payload = sql_payloads[i % len(sql_payloads)]
                try:
                    request_start = time.time()
                    response = requests.post(f"{self.base_url}/api/users", 
                                           json={"id": payload, "query": payload}, 
                                           timeout=10)
                    request_end = time.time()
                    
                    response_times.append(request_end - request_start)
                    
                    if response.status_code not in [200, 400, 403]:
                        errors += 1
                        
                except Exception as e:
                    errors += 1
                    response_times.append(10.0)
            
            end_time = time.time()
            total_time = end_time - start_time
            
            # Calculate metrics
            test_results["requests_per_second"] = total_requests / total_time
            test_results["average_response_time"] = statistics.mean(response_times)
            test_results["p95_response_time"] = self.calculate_percentile(response_times, 95)
            test_results["p99_response_time"] = self.calculate_percentile(response_times, 99)
            test_results["error_rate"] = (errors / total_requests) * 100
            
            test_results["details"].append(f"SQL injection payloads tested: {len(sql_payloads)}")
            test_results["details"].append(f"Total requests: {total_requests}")
            test_results["details"].append(f"Total time: {total_time:.2f}s")
            
        except Exception as e:
            test_results["details"].append(f"Error: {str(e)}")
        
        self.test_results.append(test_results)
        print(f"   RPS: {test_results['requests_per_second']:.2f}")
        print(f"   Avg Response Time: {test_results['average_response_time']:.3f}s")
        print(f"   Error Rate: {test_results['error_rate']:.2f}%")
        print()
    
    def test_xss_prevention_performance(self):
        """Test XSS prevention performance"""
        print("🔍 Testing XSS Prevention Performance...")
        
        test_results = {
            "test_name": "XSS Prevention Performance",
            "requests_per_second": 0,
            "average_response_time": 0,
            "p95_response_time": 0,
            "p99_response_time": 0,
            "error_rate": 0,
            "details": []
        }
        
        try:
            # Test with XSS payloads
            xss_payloads = [
                "<script>alert('XSS')</script>",
                "<img src=x onerror=alert('XSS')>",
                "<svg onload=alert('XSS')>",
                "javascript:alert('XSS')",
                "<iframe src=javascript:alert('XSS')></iframe>"
            ]
            
            response_times = []
            errors = 0
            total_requests = 50
            
            start_time = time.time()
            
            for i in range(total_requests):
                payload = xss_payloads[i % len(xss_payloads)]
                try:
                    request_start = time.time()
                    response = requests.post(f"{self.base_url}/api/content", 
                                           json={"content": payload, "comment": payload}, 
                                           timeout=10)
                    request_end = time.time()
                    
                    response_times.append(request_end - request_start)
                    
                    if response.status_code not in [200, 400, 403]:
                        errors += 1
                        
                except Exception as e:
                    errors += 1
                    response_times.append(10.0)
            
            end_time = time.time()
            total_time = end_time - start_time
            
            # Calculate metrics
            test_results["requests_per_second"] = total_requests / total_time
            test_results["average_response_time"] = statistics.mean(response_times)
            test_results["p95_response_time"] = self.calculate_percentile(response_times, 95)
            test_results["p99_response_time"] = self.calculate_percentile(response_times, 99)
            test_results["error_rate"] = (errors / total_requests) * 100
            
            test_results["details"].append(f"XSS payloads tested: {len(xss_payloads)}")
            test_results["details"].append(f"Total requests: {total_requests}")
            
        except Exception as e:
            test_results["details"].append(f"Error: {str(e)}")
        
        self.test_results.append(test_results)
        print(f"   RPS: {test_results['requests_per_second']:.2f}")
        print(f"   Avg Response Time: {test_results['average_response_time']:.3f}s")
        print(f"   Error Rate: {test_results['error_rate']:.2f}%")
        print()
    
    def test_authentication_performance(self):
        """Test authentication performance"""
        print("🔍 Testing Authentication Performance...")
        
        test_results = {
            "test_name": "Authentication Performance",
            "requests_per_second": 0,
            "average_response_time": 0,
            "p95_response_time": 0,
            "p99_response_time": 0,
            "error_rate": 0,
            "details": []
        }
        
        try:
            # Test authentication operations
            auth_operations = [
                {"username": "testuser1", "password": "TestPass123!"},
                {"username": "testuser2", "password": "TestPass123!"},
                {"username": "testuser3", "password": "TestPass123!"}
            ]
            
            response_times = []
            errors = 0
            total_requests = 30
            
            start_time = time.time()
            
            for i in range(total_requests):
                operation = auth_operations[i % len(auth_operations)]
                try:
                    request_start = time.time()
                    response = requests.post(f"{self.base_url}/api/auth/login", 
                                           json=operation, 
                                           timeout=10)
                    request_end = time.time()
                    
                    response_times.append(request_end - request_start)
                    
                    if response.status_code not in [200, 401, 400]:
                        errors += 1
                        
                except Exception as e:
                    errors += 1
                    response_times.append(10.0)
            
            end_time = time.time()
            total_time = end_time - start_time
            
            # Calculate metrics
            test_results["requests_per_second"] = total_requests / total_time
            test_results["average_response_time"] = statistics.mean(response_times)
            test_results["p95_response_time"] = self.calculate_percentile(response_times, 95)
            test_results["p99_response_time"] = self.calculate_percentile(response_times, 99)
            test_results["error_rate"] = (errors / total_requests) * 100
            
            test_results["details"].append(f"Authentication operations tested: {len(auth_operations)}")
            test_results["details"].append(f"Total requests: {total_requests}")
            
        except Exception as e:
            test_results["details"].append(f"Error: {str(e)}")
        
        self.test_results.append(test_results)
        print(f"   RPS: {test_results['requests_per_second']:.2f}")
        print(f"   Avg Response Time: {test_results['average_response_time']:.3f}s")
        print(f"   Error Rate: {test_results['error_rate']:.2f}%")
        print()
    
    def test_dlp_performance(self):
        """Test data loss prevention performance"""
        print("🔍 Testing Data Loss Prevention Performance...")
        
        test_results = {
            "test_name": "Data Loss Prevention Performance",
            "requests_per_second": 0,
            "average_response_time": 0,
            "p95_response_time": 0,
            "p99_response_time": 0,
            "error_rate": 0,
            "details": []
        }
        
        try:
            # Test with sensitive data
            sensitive_data = [
                "My credit card is 4111-1111-1111-1111",
                "SSN: 123-45-6789",
                "Email: john.doe@example.com",
                "Phone: (555) 123-4567",
                "API_KEY=sk-1234567890abcdef"
            ]
            
            response_times = []
            errors = 0
            total_requests = 50
            
            start_time = time.time()
            
            for i in range(total_requests):
                data = sensitive_data[i % len(sensitive_data)]
                try:
                    request_start = time.time()
                    response = requests.post(f"{self.base_url}/api/data", 
                                           json={"content": data, "description": data}, 
                                           timeout=10)
                    request_end = time.time()
                    
                    response_times.append(request_end - request_start)
                    
                    if response.status_code not in [200, 400, 403]:
                        errors += 1
                        
                except Exception as e:
                    errors += 1
                    response_times.append(10.0)
            
            end_time = time.time()
            total_time = end_time - start_time
            
            # Calculate metrics
            test_results["requests_per_second"] = total_requests / total_time
            test_results["average_response_time"] = statistics.mean(response_times)
            test_results["p95_response_time"] = self.calculate_percentile(response_times, 95)
            test_results["p99_response_time"] = self.calculate_percentile(response_times, 99)
            test_results["error_rate"] = (errors / total_requests) * 100
            
            test_results["details"].append(f"Sensitive data samples tested: {len(sensitive_data)}")
            test_results["details"].append(f"Total requests: {total_requests}")
            
        except Exception as e:
            test_results["details"].append(f"Error: {str(e)}")
        
        self.test_results.append(test_results)
        print(f"   RPS: {test_results['requests_per_second']:.2f}")
        print(f"   Avg Response Time: {test_results['average_response_time']:.3f}s")
        print(f"   Error Rate: {test_results['error_rate']:.2f}%")
        print()
    
    def test_api_security_performance(self):
        """Test API security performance"""
        print("🔍 Testing API Security Performance...")
        
        test_results = {
            "test_name": "API Security Performance",
            "requests_per_second": 0,
            "average_response_time": 0,
            "p95_response_time": 0,
            "p99_response_time": 0,
            "error_rate": 0,
            "details": []
        }
        
        try:
            # Test API security operations
            response_times = []
            errors = 0
            total_requests = 100
            
            start_time = time.time()
            
            for i in range(total_requests):
                try:
                    request_start = time.time()
                    response = requests.get(f"{self.base_url}/api/status", 
                                          headers={"Authorization": "Bearer test-token"}, 
                                          timeout=10)
                    request_end = time.time()
                    
                    response_times.append(request_end - request_start)
                    
                    if response.status_code not in [200, 401, 403]:
                        errors += 1
                        
                except Exception as e:
                    errors += 1
                    response_times.append(10.0)
            
            end_time = time.time()
            total_time = end_time - start_time
            
            # Calculate metrics
            test_results["requests_per_second"] = total_requests / total_time
            test_results["average_response_time"] = statistics.mean(response_times)
            test_results["p95_response_time"] = self.calculate_percentile(response_times, 95)
            test_results["p99_response_time"] = self.calculate_percentile(response_times, 99)
            test_results["error_rate"] = (errors / total_requests) * 100
            
            test_results["details"].append(f"Total requests: {total_requests}")
            test_results["details"].append(f"Total time: {total_time:.2f}s")
            
        except Exception as e:
            test_results["details"].append(f"Error: {str(e)}")
        
        self.test_results.append(test_results)
        print(f"   RPS: {test_results['requests_per_second']:.2f}")
        print(f"   Avg Response Time: {test_results['average_response_time']:.3f}s")
        print(f"   Error Rate: {test_results['error_rate']:.2f}%")
        print()
    
    def test_rate_limiting_performance(self):
        """Test rate limiting performance"""
        print("🔍 Testing Rate Limiting Performance...")
        
        test_results = {
            "test_name": "Rate Limiting Performance",
            "requests_per_second": 0,
            "average_response_time": 0,
            "p95_response_time": 0,
            "p99_response_time": 0,
            "error_rate": 0,
            "details": []
        }
        
        try:
            # Test rate limiting under load
            response_times = []
            errors = 0
            blocked_requests = 0
            total_requests = 200
            
            start_time = time.time()
            
            for i in range(total_requests):
                try:
                    request_start = time.time()
                    response = requests.get(f"{self.base_url}/api/status", timeout=10)
                    request_end = time.time()
                    
                    response_times.append(request_end - request_start)
                    
                    if response.status_code == 429:
                        blocked_requests += 1
                    elif response.status_code not in [200, 429]:
                        errors += 1
                        
                except Exception as e:
                    errors += 1
                    response_times.append(10.0)
            
            end_time = time.time()
            total_time = end_time - start_time
            
            # Calculate metrics
            test_results["requests_per_second"] = total_requests / total_time
            test_results["average_response_time"] = statistics.mean(response_times)
            test_results["p95_response_time"] = self.calculate_percentile(response_times, 95)
            test_results["p99_response_time"] = self.calculate_percentile(response_times, 99)
            test_results["error_rate"] = (errors / total_requests) * 100
            
            test_results["details"].append(f"Total requests: {total_requests}")
            test_results["details"].append(f"Blocked requests: {blocked_requests}")
            test_results["details"].append(f"Block rate: {(blocked_requests/total_requests)*100:.2f}%")
            
        except Exception as e:
            test_results["details"].append(f"Error: {str(e)}")
        
        self.test_results.append(test_results)
        print(f"   RPS: {test_results['requests_per_second']:.2f}")
        print(f"   Avg Response Time: {test_results['average_response_time']:.3f}s")
        print(f"   Block Rate: {(blocked_requests/total_requests)*100:.2f}%")
        print()
    
    def test_load_with_security(self):
        """Test system performance under load with security enabled"""
        print("🔍 Testing Load Performance with Security...")
        
        test_results = {
            "test_name": "Load Performance with Security",
            "requests_per_second": 0,
            "average_response_time": 0,
            "p95_response_time": 0,
            "p99_response_time": 0,
            "error_rate": 0,
            "details": []
        }
        
        try:
            # Test with concurrent requests
            def make_request():
                try:
                    start = time.time()
                    response = requests.get(f"{self.base_url}/api/status", timeout=10)
                    end = time.time()
                    return {
                        "response_time": end - start,
                        "status_code": response.status_code,
                        "success": response.status_code == 200
                    }
                except Exception as e:
                    return {
                        "response_time": 10.0,
                        "status_code": 0,
                        "success": False,
                        "error": str(e)
                    }
            
            # Run concurrent requests
            concurrent_requests = 50
            total_requests = 500
            
            response_times = []
            errors = 0
            successes = 0
            
            start_time = time.time()
            
            with ThreadPoolExecutor(max_workers=concurrent_requests) as executor:
                futures = [executor.submit(make_request) for _ in range(total_requests)]
                
                for future in as_completed(futures):
                    result = future.result()
                    response_times.append(result["response_time"])
                    
                    if result["success"]:
                        successes += 1
                    else:
                        errors += 1
            
            end_time = time.time()
            total_time = end_time - start_time
            
            # Calculate metrics
            test_results["requests_per_second"] = total_requests / total_time
            test_results["average_response_time"] = statistics.mean(response_times)
            test_results["p95_response_time"] = self.calculate_percentile(response_times, 95)
            test_results["p99_response_time"] = self.calculate_percentile(response_times, 99)
            test_results["error_rate"] = (errors / total_requests) * 100
            
            test_results["details"].append(f"Concurrent requests: {concurrent_requests}")
            test_results["details"].append(f"Total requests: {total_requests}")
            test_results["details"].append(f"Successes: {successes}")
            test_results["details"].append(f"Errors: {errors}")
            
        except Exception as e:
            test_results["details"].append(f"Error: {str(e)}")
        
        self.test_results.append(test_results)
        print(f"   RPS: {test_results['requests_per_second']:.2f}")
        print(f"   Avg Response Time: {test_results['average_response_time']:.3f}s")
        print(f"   Success Rate: {((total_requests-errors)/total_requests)*100:.2f}%")
        print()
    
    def test_memory_usage(self):
        """Test memory usage with security enabled"""
        print("🔍 Testing Memory Usage with Security...")
        
        test_results = {
            "test_name": "Memory Usage with Security",
            "memory_usage_mb": 0,
            "memory_growth_mb": 0,
            "details": []
        }
        
        try:
            import psutil
            import gc
            
            # Get initial memory usage
            process = psutil.Process()
            initial_memory = process.memory_info().rss / 1024 / 1024  # MB
            
            # Perform security operations
            for i in range(100):
                try:
                    response = requests.post(f"{self.base_url}/api/data", 
                                           json={"content": f"Test data {i}", "description": f"Test description {i}"}, 
                                           timeout=10)
                except:
                    pass
                
                # Force garbage collection every 10 iterations
                if i % 10 == 0:
                    gc.collect()
            
            # Get final memory usage
            final_memory = process.memory_info().rss / 1024 / 1024  # MB
            memory_growth = final_memory - initial_memory
            
            test_results["memory_usage_mb"] = final_memory
            test_results["memory_growth_mb"] = memory_growth
            
            test_results["details"].append(f"Initial memory: {initial_memory:.2f} MB")
            test_results["details"].append(f"Final memory: {final_memory:.2f} MB")
            test_results["details"].append(f"Memory growth: {memory_growth:.2f} MB")
            
        except ImportError:
            test_results["details"].append("psutil not available - memory testing skipped")
        except Exception as e:
            test_results["details"].append(f"Error: {str(e)}")
        
        self.test_results.append(test_results)
        print(f"   Memory Usage: {test_results['memory_usage_mb']:.2f} MB")
        print(f"   Memory Growth: {test_results['memory_growth_mb']:.2f} MB")
        print()
    
    def test_concurrent_security(self):
        """Test concurrent security operations"""
        print("🔍 Testing Concurrent Security Operations...")
        
        test_results = {
            "test_name": "Concurrent Security Operations",
            "requests_per_second": 0,
            "average_response_time": 0,
            "p95_response_time": 0,
            "p99_response_time": 0,
            "error_rate": 0,
            "details": []
        }
        
        try:
            def security_operation(operation_type, data):
                try:
                    start = time.time()
                    
                    if operation_type == "sql_injection":
                        response = requests.post(f"{self.base_url}/api/users", 
                                               json={"id": data, "query": data}, 
                                               timeout=10)
                    elif operation_type == "xss":
                        response = requests.post(f"{self.base_url}/api/content", 
                                               json={"content": data, "comment": data}, 
                                               timeout=10)
                    elif operation_type == "dlp":
                        response = requests.post(f"{self.base_url}/api/data", 
                                               json={"content": data, "description": data}, 
                                               timeout=10)
                    else:
                        response = requests.get(f"{self.base_url}/api/status", timeout=10)
                    
                    end = time.time()
                    return {
                        "response_time": end - start,
                        "status_code": response.status_code,
                        "success": response.status_code in [200, 400, 403]
                    }
                except Exception as e:
                    return {
                        "response_time": 10.0,
                        "status_code": 0,
                        "success": False,
                        "error": str(e)
                    }
            
            # Test concurrent security operations
            operations = [
                ("sql_injection", "1' OR '1'='1"),
                ("xss", "<script>alert('XSS')</script>"),
                ("dlp", "Credit card: 4111-1111-1111-1111"),
                ("auth", "testuser"),
                ("api", "status")
            ]
            
            response_times = []
            errors = 0
            total_requests = 100
            
            start_time = time.time()
            
            with ThreadPoolExecutor(max_workers=20) as executor:
                futures = []
                for i in range(total_requests):
                    operation_type, data = operations[i % len(operations)]
                    future = executor.submit(security_operation, operation_type, data)
                    futures.append(future)
                
                for future in as_completed(futures):
                    result = future.result()
                    response_times.append(result["response_time"])
                    
                    if not result["success"]:
                        errors += 1
            
            end_time = time.time()
            total_time = end_time - start_time
            
            # Calculate metrics
            test_results["requests_per_second"] = total_requests / total_time
            test_results["average_response_time"] = statistics.mean(response_times)
            test_results["p95_response_time"] = self.calculate_percentile(response_times, 95)
            test_results["p99_response_time"] = self.calculate_percentile(response_times, 99)
            test_results["error_rate"] = (errors / total_requests) * 100
            
            test_results["details"].append(f"Operation types tested: {len(operations)}")
            test_results["details"].append(f"Total requests: {total_requests}")
            test_results["details"].append(f"Concurrent workers: 20")
            
        except Exception as e:
            test_results["details"].append(f"Error: {str(e)}")
        
        self.test_results.append(test_results)
        print(f"   RPS: {test_results['requests_per_second']:.2f}")
        print(f"   Avg Response Time: {test_results['average_response_time']:.3f}s")
        print(f"   Error Rate: {test_results['error_rate']:.2f}%")
        print()
    
    def calculate_percentile(self, data: List[float], percentile: int) -> float:
        """Calculate percentile of response times"""
        if not data:
            return 0.0
        
        sorted_data = sorted(data)
        index = int((percentile / 100) * len(sorted_data))
        if index >= len(sorted_data):
            index = len(sorted_data) - 1
        
        return sorted_data[index]
    
    def generate_performance_report(self) -> Dict[str, Any]:
        """Generate comprehensive performance report"""
        end_time = time.time()
        duration = end_time - self.start_time
        
        # Calculate performance impact
        baseline = next((r for r in self.test_results if r["test_name"] == "Baseline Performance"), None)
        security_tests = [r for r in self.test_results if r["test_name"] != "Baseline Performance"]
        
        performance_impact = {}
        if baseline:
            for test in security_tests:
                if test["requests_per_second"] > 0 and baseline["requests_per_second"] > 0:
                    impact = ((baseline["requests_per_second"] - test["requests_per_second"]) / baseline["requests_per_second"]) * 100
                    performance_impact[test["test_name"]] = round(impact, 2)
        
        # Calculate overall metrics
        total_requests = sum(r.get("requests_per_second", 0) * duration for r in self.test_results)
        avg_response_time = statistics.mean([r.get("average_response_time", 0) for r in self.test_results if r.get("average_response_time", 0) > 0])
        avg_error_rate = statistics.mean([r.get("error_rate", 0) for r in self.test_results if r.get("error_rate", 0) >= 0])
        
        # Generate recommendations
        recommendations = []
        
        if avg_response_time > 1.0:
            recommendations.append("High response times detected - consider optimizing security algorithms")
        
        if avg_error_rate > 5.0:
            recommendations.append("High error rate detected - review error handling in security systems")
        
        if any(impact > 50 for impact in performance_impact.values()):
            recommendations.append("Significant performance impact detected - consider security optimizations")
        
        if avg_response_time < 0.1 and avg_error_rate < 1.0:
            recommendations.append("Excellent performance - security systems are well optimized")
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "duration_seconds": round(duration, 2),
            "total_requests": round(total_requests, 0),
            "average_response_time": round(avg_response_time, 3),
            "average_error_rate": round(avg_error_rate, 2),
            "performance_impact": performance_impact,
            "test_results": self.test_results,
            "recommendations": recommendations,
            "summary": f"Security Performance Test: {round(avg_response_time, 3)}s avg response time, {round(avg_error_rate, 2)}% error rate"
        }
        
        return report

def main():
    """Main function to run security performance tests"""
    tester = SecurityPerformanceTester()
    
    try:
        report = tester.run_performance_tests()
        
        # Print summary
        print("=" * 60)
        print("⚡ SECURITY PERFORMANCE TEST SUMMARY")
        print("=" * 60)
        print(f"Duration: {report['duration_seconds']} seconds")
        print(f"Total Requests: {report['total_requests']}")
        print(f"Average Response Time: {report['average_response_time']}s")
        print(f"Average Error Rate: {report['average_error_rate']}%")
        print()
        
        if report['performance_impact']:
            print("Performance Impact by Security System:")
            for system, impact in report['performance_impact'].items():
                print(f"  {system}: {impact}% slower")
            print()
        
        if report['recommendations']:
            print("📋 RECOMMENDATIONS:")
            for rec in report['recommendations']:
                print(f"   • {rec}")
            print()
        
        # Save report
        report_file = f"security_performance_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"📄 Detailed report saved to: {report_file}")
        
        return 0
        
    except Exception as e:
        print(f"❌ Performance testing failed with error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
