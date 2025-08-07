/**
 * AI Service Test API Endpoint
 * Tests the Magic Connector AI functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiServiceTester } from '@/lib/ai/ai-service-test';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Starting AI service tests...');
    
    const testResults = await aiServiceTester.runAllTests();
    
    return NextResponse.json({
      success: testResults.overall,
      message: testResults.overall 
        ? 'All AI services are working correctly' 
        : 'Some AI services have issues',
      results: testResults.results,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ AI service test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'AI service test failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { testType } = await request.json();
    
    console.log(`🔄 Running specific AI test: ${testType}`);
    
    let result;
    switch (testType) {
      case 'component-analysis':
        result = await aiServiceTester.testComponentAnalysis();
        break;
      case 'workflow-suggestions':
        result = await aiServiceTester.testWorkflowSuggestions();
        break;
      case 'ai-customization':
        result = await aiServiceTester.testAICustomization();
        break;
      default:
        throw new Error(`Unknown test type: ${testType}`);
    }
    
    return NextResponse.json({
      success: result.success,
      message: result.message,
      details: result.details,
      testType,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: `Test failed: ${error.message}`,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}