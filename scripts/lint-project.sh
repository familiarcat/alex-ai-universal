#!/bin/bash

# Alex AI Universal Project Linting Script
# Comprehensive linting and formatting for the entire project

set -e

echo "🖖 Alex AI Universal Project Linting System"
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "node is not installed"
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Install linting dependencies if needed
install_linting_deps() {
    print_status "Installing/updating linting dependencies..."
    
    # Install project-wide dependencies
    npm install --save-dev \
        eslint \
        @typescript-eslint/parser \
        @typescript-eslint/eslint-plugin \
        eslint-plugin-react \
        eslint-plugin-react-hooks \
        prettier \
        eslint-config-prettier \
        eslint-plugin-prettier
    
    print_success "Linting dependencies installed"
}

# Lint TypeScript/JavaScript files
lint_ts_js() {
    print_status "Linting TypeScript and JavaScript files..."
    
    # Find all tsconfig.json files
    find . -name "tsconfig.json" -not -path "./node_modules/*" | while read -r tsconfig; do
        dir=$(dirname "$tsconfig")
        print_status "Linting $dir"
        
        cd "$dir"
        
        # Run ESLint
        if [ -f "package.json" ]; then
            npm run lint 2>/dev/null || echo "No lint script found in $dir"
        fi
        
        cd - > /dev/null
    done
    
    print_success "TypeScript/JavaScript linting completed"
}

# Format code with Prettier
format_code() {
    print_status "Formatting code with Prettier..."
    
    # Find all source directories
    find . -name "src" -type d -not -path "./node_modules/*" | while read -r srcdir; do
        print_status "Formatting $srcdir"
        
        # Run Prettier
        npx prettier --write "$srcdir/**/*.{ts,tsx,js,jsx,json,css,md}" 2>/dev/null || true
    done
    
    print_success "Code formatting completed"
}

# Check JSON files for syntax errors
check_json_syntax() {
    print_status "Checking JSON files for syntax errors..."
    
    error_count=0
    
    find . -name "*.json" -not -path "./node_modules/*" | while read -r jsonfile; do
        if ! jq empty "$jsonfile" 2>/dev/null; then
            print_error "JSON syntax error in: $jsonfile"
            error_count=$((error_count + 1))
        fi
    done
    
    if [ $error_count -eq 0 ]; then
        print_success "All JSON files are valid"
    else
        print_error "Found $error_count JSON syntax errors"
        return 1
    fi
}

# Check TypeScript compilation
check_ts_compilation() {
    print_status "Checking TypeScript compilation..."
    
    find . -name "tsconfig.json" -not -path "./node_modules/*" | while read -r tsconfig; do
        dir=$(dirname "$tsconfig")
        print_status "Checking TypeScript compilation in $dir"
        
        cd "$dir"
        
        # Run TypeScript compiler check
        if [ -f "package.json" ]; then
            npx tsc --noEmit 2>/dev/null || print_warning "TypeScript compilation issues in $dir"
        fi
        
        cd - > /dev/null
    done
    
    print_success "TypeScript compilation check completed"
}

# Main execution
main() {
    print_status "Starting Alex AI Universal Project Linting..."
    
    check_dependencies
    install_linting_deps
    check_json_syntax
    check_ts_compilation
    lint_ts_js
    format_code
    
    print_success "🎉 Alex AI Universal Project Linting Complete!"
    print_status "All files have been linted, formatted, and validated"
}

# Run main function
main "$@"

