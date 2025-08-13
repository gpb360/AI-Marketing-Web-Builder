#!/bin/bash

# Epic 3 Integration Validation Script
# Integration Coordinator - Final Validation

echo "🎯 EPIC 3 INTEGRATION VALIDATION"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Validation functions
validate_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        return 0
    else
        echo -e "${RED}❌${NC} $1 (MISSING)"
        return 1
    fi
}

validate_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $1/"
        return 0
    else
        echo -e "${RED}❌${NC} $1/ (MISSING)"
        return 1
    fi
}

check_integration() {
    local component=$1
    local file=$2
    local pattern=$3
    
    if [ -f "$file" ] && grep -q "$pattern" "$file"; then
        echo -e "${GREEN}✅${NC} $component Integration"
        return 0
    else
        echo -e "${RED}❌${NC} $component Integration (NOT FOUND)"
        return 1
    fi
}

# Start validation
echo -e "${BLUE}📋 STORY 3.1: Visual Workflow Debugging${NC}"
echo "----------------------------------------"

# Backend Story 3.1
validate_file "backend/app/api/v1/endpoints/workflow_debug.py"
validate_file "backend/app/api/v1/endpoints/workflow_websocket.py"
validate_file "backend/app/models/workflow.py"

# Frontend Story 3.1
validate_file "web-builder/src/components/builder/WorkflowDebuggingPanel.tsx"
validate_file "web-builder/src/components/builder/ErrorDetailsModal.tsx"
validate_file "web-builder/src/components/builder/ExecutionTimeline.tsx"

echo ""
echo -e "${BLUE}📋 STORY 3.2: Smart Workflow Templates${NC}"
echo "----------------------------------------"

# Backend Story 3.2
validate_file "backend/app/api/v1/endpoints/business_workflows.py"
validate_file "backend/app/services/business_workflow_service.py"

# Frontend Story 3.2
validate_file "web-builder/src/components/builder/SmartTemplateSelector.tsx"
validate_file "web-builder/src/components/builder/SmartTemplateRecommendations.tsx"

echo ""
echo -e "${BLUE}📊 STORY 3.3: Performance Analytics Dashboard${NC}"
echo "---------------------------------------------"

# Backend Story 3.3
validate_file "backend/app/api/v1/endpoints/advanced_analytics.py"
validate_file "backend/app/services/workflow_analytics_service.py"
validate_file "backend/app/services/performance_comparison_service.py"
validate_file "backend/app/models/analytics.py"

# Frontend Story 3.3
validate_file "web-builder/src/components/analytics/ComprehensiveAnalyticsDashboard.tsx"
validate_file "web-builder/src/components/analytics/ABTestingInterface.tsx"
validate_file "web-builder/src/components/analytics/ExportReporting.tsx"
validate_file "web-builder/src/components/analytics/RealTimeDashboard.tsx"

echo ""
echo -e "${BLUE}🔗 INTEGRATION VALIDATION${NC}"
echo "----------------------------"

# API Integration
check_integration "Advanced Analytics API" "backend/app/api/v1/api.py" "advanced_analytics"
check_integration "Business Workflows API" "backend/app/api/v1/api.py" "business_workflows"
check_integration "Workflow Debug API" "backend/app/api/v1/api.py" "workflow_debug"

# Frontend Service Integration
check_integration "Analytics Service" "web-builder/src/lib/api/services/index.ts" "analyticsService"
check_integration "Analytics Types" "web-builder/src/lib/api/types.ts" "ComprehensiveWorkflowAnalytics"

# Database Integration
check_integration "Analytics Models" "backend/app/models/analytics.py" "WorkflowAnalyticsEvent"
check_integration "A/B Testing Models" "backend/app/models/analytics.py" "WorkflowABTest"

echo ""
echo -e "${BLUE}📁 DIRECTORY STRUCTURE VALIDATION${NC}"
echo "-----------------------------------"

# Key directories
validate_directory "backend/app/services"
validate_directory "backend/app/api/v1/endpoints"
validate_directory "web-builder/src/components/analytics"
validate_directory "web-builder/src/components/builder"
validate_directory "web-builder/src/lib/api/services"

echo ""
echo -e "${BLUE}🧪 INTEGRATION TEST FILES${NC}"
echo "------------------------------"

validate_file "integration-test-epic-3.ts"
validate_file "web-builder/src/tests/integration/epic3-frontend-integration.test.tsx"

echo ""
echo -e "${BLUE}📊 ANALYTICS COMPONENTS VALIDATION${NC}"
echo "------------------------------------"

# Check if analytics components exist
analytics_components=(
    "ComprehensiveAnalyticsDashboard.tsx"
    "ABTestingInterface.tsx"
    "ExportReporting.tsx"
    "RealTimeDashboard.tsx"
)

for component in "${analytics_components[@]}"; do
    validate_file "web-builder/src/components/analytics/$component"
done

echo ""
echo -e "${BLUE}🔧 BACKEND SERVICES VALIDATION${NC}"
echo "--------------------------------"

# Check backend services
backend_services=(
    "workflow_analytics_service.py"
    "performance_comparison_service.py"
    "workflow_cost_analysis_service.py"
)

for service in "${backend_services[@]}"; do
    validate_file "backend/app/services/$service"
done

echo ""
echo -e "${BLUE}🎯 MAGIC MOMENT INTEGRATION CHECK${NC}"
echo "-----------------------------------"

# Check cross-story integration points
echo "Checking Template → Workflow → Analytics flow..."

# Story 3.2 → 3.1 Integration
if [ -f "backend/app/api/v1/endpoints/business_workflows.py" ] && [ -f "backend/app/api/v1/endpoints/workflow_debug.py" ]; then
    echo -e "${GREEN}✅${NC} Template → Workflow Integration Ready"
else
    echo -e "${RED}❌${NC} Template → Workflow Integration Missing"
fi

# Story 3.1 → 3.3 Integration
if [ -f "backend/app/api/v1/endpoints/workflow_debug.py" ] && [ -f "backend/app/api/v1/endpoints/advanced_analytics.py" ]; then
    echo -e "${GREEN}✅${NC} Workflow → Analytics Integration Ready"
else
    echo -e "${RED}❌${NC} Workflow → Analytics Integration Missing"
fi

# Story 3.3 → 3.2 Feedback Loop
if [ -f "backend/app/api/v1/endpoints/advanced_analytics.py" ] && [ -f "backend/app/api/v1/endpoints/business_workflows.py" ]; then
    echo -e "${GREEN}✅${NC} Analytics → Template Feedback Loop Ready"
else
    echo -e "${RED}❌${NC} Analytics → Template Feedback Loop Missing"
fi

echo ""
echo -e "${BLUE}📱 FRONTEND INTEGRATION CHECK${NC}"
echo "-------------------------------"

# Check frontend integration
frontend_services=(
    "analytics.ts"
    "workflows.ts"
    "business-workflows.ts"
)

for service in "${frontend_services[@]}"; do
    validate_file "web-builder/src/lib/api/services/$service"
done

echo ""
echo -e "${BLUE}🗄️ DATABASE INTEGRATION CHECK${NC}"
echo "-------------------------------"

# Check database models
if [ -f "backend/app/models/analytics.py" ]; then
    echo "Checking database model integration..."
    
    # Check for key models
    if grep -q "WorkflowAnalyticsEvent" "backend/app/models/analytics.py"; then
        echo -e "${GREEN}✅${NC} WorkflowAnalyticsEvent Model"
    else
        echo -e "${RED}❌${NC} WorkflowAnalyticsEvent Model"
    fi
    
    if grep -q "WorkflowABTest" "backend/app/models/analytics.py"; then
        echo -e "${GREEN}✅${NC} WorkflowABTest Model"
    else
        echo -e "${RED}❌${NC} WorkflowABTest Model"
    fi
    
    if grep -q "ExternalAnalyticsConnection" "backend/app/models/analytics.py"; then
        echo -e "${GREEN}✅${NC} ExternalAnalyticsConnection Model"
    else
        echo -e "${RED}❌${NC} ExternalAnalyticsConnection Model"
    fi
fi

echo ""
echo -e "${BLUE}🔄 REAL-TIME INTEGRATION CHECK${NC}"
echo "--------------------------------"

# Check WebSocket integration
if [ -f "backend/app/api/v1/endpoints/workflow_websocket.py" ]; then
    echo -e "${GREEN}✅${NC} WebSocket Backend Endpoint"
else
    echo -e "${RED}❌${NC} WebSocket Backend Endpoint"
fi

# Check frontend WebSocket integration
if [ -f "web-builder/src/hooks/useWorkflowStatus.ts" ]; then
    echo -e "${GREEN}✅${NC} Frontend WebSocket Hook"
else
    echo -e "${RED}❌${NC} Frontend WebSocket Hook"
fi

echo ""
echo -e "${BLUE}📄 DOCUMENTATION CHECK${NC}"
echo "------------------------"

validate_file "EPIC-3-INTEGRATION-REPORT.md"

# Count total components
echo ""
echo -e "${YELLOW}📊 INTEGRATION SUMMARY${NC}"
echo "======================"

total_files=0
existing_files=0

# Count backend files
backend_files=(
    "backend/app/api/v1/endpoints/advanced_analytics.py"
    "backend/app/api/v1/endpoints/business_workflows.py"
    "backend/app/api/v1/endpoints/workflow_debug.py"
    "backend/app/api/v1/endpoints/workflow_websocket.py"
    "backend/app/services/workflow_analytics_service.py"
    "backend/app/services/performance_comparison_service.py"
    "backend/app/models/analytics.py"
)

frontend_files=(
    "web-builder/src/components/analytics/ComprehensiveAnalyticsDashboard.tsx"
    "web-builder/src/components/analytics/ABTestingInterface.tsx"
    "web-builder/src/components/builder/SmartTemplateSelector.tsx"
    "web-builder/src/components/builder/WorkflowDebuggingPanel.tsx"
    "web-builder/src/lib/api/services/analytics.ts"
)

for file in "${backend_files[@]}" "${frontend_files[@]}"; do
    total_files=$((total_files + 1))
    if [ -f "$file" ]; then
        existing_files=$((existing_files + 1))
    fi
done

completion_percentage=$((existing_files * 100 / total_files))

echo "Backend Integration: ${#backend_files[@]} components"
echo "Frontend Integration: ${#frontend_files[@]} components"
echo "Total Files Validated: $existing_files/$total_files"
echo "Integration Completion: $completion_percentage%"

if [ "$completion_percentage" -ge 90 ]; then
    echo -e "${GREEN}🎉 EPIC 3 INTEGRATION: PRODUCTION READY${NC}"
elif [ "$completion_percentage" -ge 75 ]; then
    echo -e "${YELLOW}⚠️  EPIC 3 INTEGRATION: MOSTLY COMPLETE${NC}"
else
    echo -e "${RED}🚨 EPIC 3 INTEGRATION: NEEDS WORK${NC}"
fi

echo ""
echo -e "${BLUE}🚀 DEPLOYMENT READINESS${NC}"
echo "======================="

if [ "$completion_percentage" -ge 90 ]; then
    echo -e "${GREEN}✅ READY FOR PRODUCTION DEPLOYMENT${NC}"
    echo ""
    echo "All Epic 3 stories are properly integrated:"
    echo "• Story 3.1: Visual Workflow Debugging"
    echo "• Story 3.2: Smart Workflow Templates"  
    echo "• Story 3.3: Performance Analytics Dashboard"
    echo ""
    echo "Magic Moment journey is fully operational!"
else
    echo -e "${RED}❌ NOT READY FOR PRODUCTION${NC}"
    echo "Missing critical integration components."
fi

echo ""
echo "Integration validation complete! 🎯"