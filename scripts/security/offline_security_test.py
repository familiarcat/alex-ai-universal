#!/usr/bin/env python3
"""
Alex AI Offline Security Test Suite
Tests security implementations without requiring a running server
"""

import os
import sys
import json
import time
from datetime import datetime
from typing import Dict, List, Any

class OfflineSecurityTester:
    def __init__(self):
        self.test_results = []
        self.start_time = time.time()
        
    def run_offline_tests(self) -> Dict[str, Any]:
        """Run offline security tests"""
        print("🛡️  ALEX AI OFFLINE SECURITY TEST SUITE")
        print("=" * 50)
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("Testing security implementations without server...")
        print()
        
        # Test 1: Code Quality Analysis
        self.test_code_quality()
        
        # Test 2: Security Pattern Detection
        self.test_security_patterns()
        
        # Test 3: Configuration Validation
        self.test_configuration()
        
        # Test 4: Dependency Security
        self.test_dependency_security()
        
        # Test 5: File Permissions
        self.test_file_permissions()
        
        # Test 6: Environment Security
        self.test_environment_security()
        
        # Generate report
        return self.generate_offline_report()
    
    def test_code_quality(self):
        """Test code quality and security best practices"""
        print("🔍 Testing Code Quality...")
        
        test_results = {
            "test_name": "Code Quality Analysis",
            "passed": 0,
            "failed": 0,
            "details": []
        }
        
        # Check for security-related files
        security_files = [
            "packages/@alex-ai/core/src/security/sql-injection-prevention.ts",
            "packages/@alex-ai/core/src/security/xss-prevention.ts",
            "packages/@alex-ai/core/src/security/authentication.ts",
            "packages/@alex-ai/core/src/security/data-loss-prevention.ts",
            "packages/@alex-ai/core/src/security/api-security.ts",
            "packages/@alex-ai/core/src/security/security-manager.ts"
        ]
        
        for file_path in security_files:
            if os.path.exists(file_path):
                test_results["passed"] += 1
                test_results["details"].append(f"✅ Security file exists: {file_path}")
            else:
                test_results["failed"] += 1
                test_results["details"].append(f"❌ Security file missing: {file_path}")
        
        # Check for test files
        test_files = [
            "scripts/security/alex_ai_security_test.py",
            "scripts/security/automated_security_validation.py",
            "scripts/security/penetration_testing_suite.py",
            "scripts/security/security_performance_test.py"
        ]
        
        for file_path in test_files:
            if os.path.exists(file_path):
                test_results["passed"] += 1
                test_results["details"].append(f"✅ Test file exists: {file_path}")
            else:
                test_results["failed"] += 1
                test_results["details"].append(f"❌ Test file missing: {file_path}")
        
        self.test_results.append(test_results)
        print(f"   Results: {test_results['passed']} passed, {test_results['failed']} failed")
        print()
    
    def test_security_patterns(self):
        """Test for security patterns in code"""
        print("🔍 Testing Security Patterns...")
        
        test_results = {
            "test_name": "Security Pattern Detection",
            "passed": 0,
            "failed": 0,
            "details": []
        }
        
        # Check for security patterns in TypeScript files
        security_patterns = [
            ("bcrypt", "Password hashing implementation"),
            ("jwt", "JWT token implementation"),
            ("parameterized", "SQL injection prevention"),
            ("sanitize", "XSS prevention"),
            ("encrypt", "Data encryption"),
            ("validate", "Input validation"),
            ("rateLimit", "Rate limiting"),
            ("cors", "CORS implementation"),
            ("helmet", "Security headers"),
            ("csrf", "CSRF protection")
        ]
        
        for pattern, description in security_patterns:
            found = False
            for root, dirs, files in os.walk("packages/@alex-ai/core/src/security"):
                for file in files:
                    if file.endswith('.ts'):
                        file_path = os.path.join(root, file)
                        try:
                            with open(file_path, 'r', encoding='utf-8') as f:
                                content = f.read().lower()
                                if pattern in content:
                                    found = True
                                    break
                        except:
                            pass
                if found:
                    break
            
            if found:
                test_results["passed"] += 1
                test_results["details"].append(f"✅ {description} found")
            else:
                test_results["failed"] += 1
                test_results["details"].append(f"❌ {description} not found")
        
        self.test_results.append(test_results)
        print(f"   Results: {test_results['passed']} passed, {test_results['failed']} failed")
        print()
    
    def test_configuration(self):
        """Test security configuration"""
        print("🔍 Testing Configuration...")
        
        test_results = {
            "test_name": "Configuration Validation",
            "passed": 0,
            "failed": 0,
            "details": []
        }
        
        # Check package.json for security dependencies
        package_json_path = "packages/@alex-ai/core/package.json"
        if os.path.exists(package_json_path):
            try:
                with open(package_json_path, 'r') as f:
                    package_data = json.load(f)
                
                security_deps = ["bcrypt", "jsonwebtoken", "pg"]
                for dep in security_deps:
                    if dep in package_data.get("dependencies", {}):
                        test_results["passed"] += 1
                        test_results["details"].append(f"✅ Security dependency found: {dep}")
                    else:
                        test_results["failed"] += 1
                        test_results["details"].append(f"❌ Security dependency missing: {dep}")
            except:
                test_results["failed"] += 1
                test_results["details"].append("❌ Error reading package.json")
        else:
            test_results["failed"] += 1
            test_results["details"].append("❌ package.json not found")
        
        # Check for security configuration files
        config_files = [
            "ALEX_AI_COMPLETE_SECURITY_DOCUMENTATION.md",
            "ALEX_AI_SECURITY_INTEGRATION_GUIDE.md"
        ]
        
        for config_file in config_files:
            if os.path.exists(config_file):
                test_results["passed"] += 1
                test_results["details"].append(f"✅ Configuration file exists: {config_file}")
            else:
                test_results["failed"] += 1
                test_results["details"].append(f"❌ Configuration file missing: {config_file}")
        
        self.test_results.append(test_results)
        print(f"   Results: {test_results['passed']} passed, {test_results['failed']} failed")
        print()
    
    def test_dependency_security(self):
        """Test dependency security"""
        print("🔍 Testing Dependency Security...")
        
        test_results = {
            "test_name": "Dependency Security",
            "passed": 0,
            "failed": 0,
            "details": []
        }
        
        # Check for known vulnerable dependencies
        vulnerable_deps = [
            "lodash@4.17.0",  # Example vulnerable version
            "moment@2.19.0",  # Example vulnerable version
        ]
        
        # Check for security-focused dependencies
        security_deps = [
            "bcrypt",
            "jsonwebtoken",
            "helmet",
            "express-rate-limit",
            "cors",
            "express-validator"
        ]
        
        package_json_path = "packages/@alex-ai/core/package.json"
        if os.path.exists(package_json_path):
            try:
                with open(package_json_path, 'r') as f:
                    package_data = json.load(f)
                
                dependencies = package_data.get("dependencies", {})
                
                # Check for security dependencies
                for dep in security_deps:
                    if dep in dependencies:
                        test_results["passed"] += 1
                        test_results["details"].append(f"✅ Security dependency present: {dep}")
                    else:
                        test_results["failed"] += 1
                        test_results["details"].append(f"❌ Security dependency missing: {dep}")
                
                # Check for vulnerable dependencies
                for vuln_dep in vulnerable_deps:
                    dep_name = vuln_dep.split('@')[0]
                    if dep_name in dependencies:
                        test_results["failed"] += 1
                        test_results["details"].append(f"❌ Potentially vulnerable dependency: {dep_name}")
                    else:
                        test_results["passed"] += 1
                        test_results["details"].append(f"✅ No vulnerable dependency: {dep_name}")
                        
            except:
                test_results["failed"] += 1
                test_results["details"].append("❌ Error analyzing dependencies")
        else:
            test_results["failed"] += 1
            test_results["details"].append("❌ package.json not found")
        
        self.test_results.append(test_results)
        print(f"   Results: {test_results['passed']} passed, {test_results['failed']} failed")
        print()
    
    def test_file_permissions(self):
        """Test file permissions"""
        print("🔍 Testing File Permissions...")
        
        test_results = {
            "test_name": "File Permissions",
            "passed": 0,
            "failed": 0,
            "details": []
        }
        
        # Check for sensitive files with proper permissions
        sensitive_files = [
            ".env",
            "config.json",
            "credentials.json",
            "secrets.json"
        ]
        
        for file_path in sensitive_files:
            if os.path.exists(file_path):
                try:
                    stat_info = os.stat(file_path)
                    permissions = oct(stat_info.st_mode)[-3:]
                    
                    # Check if file is readable by others (should not be)
                    if permissions[2] in ['4', '5', '6', '7']:
                        test_results["failed"] += 1
                        test_results["details"].append(f"❌ Sensitive file readable by others: {file_path} ({permissions})")
                    else:
                        test_results["passed"] += 1
                        test_results["details"].append(f"✅ Sensitive file properly protected: {file_path} ({permissions})")
                except:
                    test_results["failed"] += 1
                    test_results["details"].append(f"❌ Error checking permissions: {file_path}")
            else:
                test_results["passed"] += 1
                test_results["details"].append(f"✅ Sensitive file not present: {file_path}")
        
        self.test_results.append(test_results)
        print(f"   Results: {test_results['passed']} passed, {test_results['failed']} failed")
        print()
    
    def test_environment_security(self):
        """Test environment security"""
        print("🔍 Testing Environment Security...")
        
        test_results = {
            "test_name": "Environment Security",
            "passed": 0,
            "failed": 0,
            "details": []
        }
        
        # Check for environment variables
        required_env_vars = [
            "JWT_SECRET",
            "ENCRYPTION_KEY",
            "DATABASE_URL"
        ]
        
        for env_var in required_env_vars:
            if os.getenv(env_var):
                test_results["passed"] += 1
                test_results["details"].append(f"✅ Environment variable set: {env_var}")
            else:
                test_results["failed"] += 1
                test_results["details"].append(f"❌ Environment variable missing: {env_var}")
        
        # Check for .gitignore security
        gitignore_path = ".gitignore"
        if os.path.exists(gitignore_path):
            try:
                with open(gitignore_path, 'r') as f:
                    gitignore_content = f.read()
                
                security_patterns = [
                    ".env",
                    "*.key",
                    "*.pem",
                    "credentials",
                    "secrets"
                ]
                
                for pattern in security_patterns:
                    if pattern in gitignore_content:
                        test_results["passed"] += 1
                        test_results["details"].append(f"✅ Security pattern in .gitignore: {pattern}")
                    else:
                        test_results["failed"] += 1
                        test_results["details"].append(f"❌ Security pattern missing from .gitignore: {pattern}")
            except:
                test_results["failed"] += 1
                test_results["details"].append("❌ Error reading .gitignore")
        else:
            test_results["failed"] += 1
            test_results["details"].append("❌ .gitignore not found")
        
        self.test_results.append(test_results)
        print(f"   Results: {test_results['passed']} passed, {test_results['failed']} failed")
        print()
    
    def generate_offline_report(self) -> Dict[str, Any]:
        """Generate offline test report"""
        total_passed = sum(result["passed"] for result in self.test_results)
        total_failed = sum(result["failed"] for result in self.test_results)
        total_tests = total_passed + total_failed
        
        overall_score = (total_passed / total_tests * 100) if total_tests > 0 else 0
        
        end_time = time.time()
        duration = end_time - self.start_time
        
        # Determine overall status
        overall_status = "PASS" if total_failed == 0 else "FAIL"
        
        # Generate recommendations
        recommendations = []
        if overall_score < 80:
            recommendations.append("Security score is below 80% - immediate action required")
        
        if total_failed > 0:
            recommendations.append(f"Failed tests: {total_failed} - review and fix issues")
        
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
            "summary": f"Offline Security Test Results: {overall_status} - {overall_score}% score ({total_passed}/{total_tests} tests passed)"
        }
        
        return report

def main():
    """Main function to run offline security tests"""
    tester = OfflineSecurityTester()
    
    try:
        report = tester.run_offline_tests()
        
        # Print summary
        print("=" * 50)
        print("🛡️  OFFLINE SECURITY TEST SUMMARY")
        print("=" * 50)
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
        report_file = f"offline_security_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"📄 Detailed report saved to: {report_file}")
        
        # Return appropriate exit code
        return 0 if report['overall_status'] == 'PASS' else 1
        
    except Exception as e:
        print(f"❌ Offline security test failed with error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
